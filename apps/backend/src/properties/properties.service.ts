import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilters } from './dto/property-filters.dto';
import { Property } from './interfaces/property.interface';
import { PaginatedResult } from './interfaces/paginated-result.interface';

@Injectable()
export class PropertiesService {
    private readonly logger = new Logger(PropertiesService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async getAllProperties() {
        try {
            const client = this.supabaseService.getClient();
            const { data, error } = await client
                .from('properties')
                .select(`
                    *,
                    agent:agents (
                        id,
                        name,
                        role,
                        phone,
                        email,
                        lineId:line_id,
                        verified,
                        bio,
                        photo:media (
                            url
                        )
                    ),
                    images:properties_images (
                        image:media (
                            url
                        ),
                        tag,
                        caption
                    ),
                    thumbnail:media (
                        url
                    ),
                    nearby_places:properties_nearby_places (
                        *
                    )
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) {
                this.logger.error(`Error fetching properties: ${error.message}`);
                throw new InternalServerErrorException('Failed to fetch properties from database');
            }

            return data;
        } catch (err) {
            this.logger.error(`Unexpected error: ${err.message}`);
            throw new InternalServerErrorException('An unexpected error occurred while fetching properties');
        }
    }

    async getProperties(userId: string, userRole: string, filters: PropertyFilters): Promise<PaginatedResult<Property>> {
        try {
            const client = this.supabaseService.getClient();
            
            // Set default values for pagination
            const page = filters.page || 1;
            const limit = Math.min(filters.limit || 20, 100); // Max 100 items per page
            const offset = (page - 1) * limit;

            // Build query
            let query = client
                .from('properties')
                .select(`
                    *,
                    agent:agents (
                        id,
                        name,
                        role,
                        phone,
                        email,
                        lineId:line_id,
                        verified,
                        bio
                    ),
                    images:properties_images (
                        image:media (
                            url
                        ),
                        tag,
                        caption
                    ),
                    thumbnail:media (
                        url
                    ),
                    nearby_places:properties_nearby_places (
                        *
                    )
                `, { count: 'exact' });

            // Role-based filtering: Agents see only their own properties, Admins see all
            if (userRole !== 'admin') {
                query = query.eq('agent_id', userId);
            }

            // Apply filters
            if (filters.property_type) {
                query = query.eq('property_type', filters.property_type);
            }

            if (filters.status) {
                query = query.eq('status', filters.status);
            } else {
                // Default to active properties only
                query = query.eq('status', 'active');
            }

            if (filters.min_price !== undefined) {
                query = query.gte('price', filters.min_price);
            }

            if (filters.max_price !== undefined) {
                query = query.lte('price', filters.max_price);
            }

            if (filters.location) {
                query = query.ilike('location', `%${filters.location}%`);
            }

            if (filters.bedrooms !== undefined) {
                query = query.eq('bedrooms', filters.bedrooms);
            }

            if (filters.bathrooms !== undefined) {
                query = query.eq('bathrooms', filters.bathrooms);
            }

            // Keyword search across title, description, and location
            if (filters.keyword) {
                query = query.or(`title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%,location.ilike.%${filters.keyword}%`);
            }

            // Sorting
            if (filters.sort === 'price_asc') {
                query = query.order('price', { ascending: true });
            } else if (filters.sort === 'price_desc') {
                query = query.order('price', { ascending: false });
            } else {
                // Default sort by created_at descending
                query = query.order('created_at', { ascending: false });
            }

            // Apply pagination
            query = query.range(offset, offset + limit - 1);

            const { data, error, count } = await query;

            if (error) {
                this.logger.error(`Error fetching properties: ${error.message}`);
                throw new InternalServerErrorException('Failed to fetch properties from database');
            }

            const total = count || 0;
            const totalPages = Math.ceil(total / limit);

            return {
                data: data || [],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        } catch (err) {
            if (err instanceof InternalServerErrorException) {
                throw err;
            }
            this.logger.error(`Unexpected error: ${err.message}`);
            throw new InternalServerErrorException('An unexpected error occurred while fetching properties');
        }
    }

    async getPropertyById(id: string, incrementViews: boolean = true): Promise<Property> {
        try {
            const client = this.supabaseService.getClient();

            // Increment views_count if requested
            if (incrementViews) {
                await client.rpc('increment_property_views', { property_id: id });
            }

            const { data, error } = await client
                .from('properties')
                .select(`
                    *,
                    agent:agents (
                        id,
                        name,
                        role,
                        phone,
                        email,
                        lineId:line_id,
                        verified,
                        bio
                    ),
                    images:properties_images (
                        image:media (
                            url
                        ),
                        tag,
                        caption,
                        display_order
                    ),
                    thumbnail:media (
                        url
                    ),
                    nearby_places:properties_nearby_places (
                        *
                    )
                `)
                .eq('id', id)
                .single();

            if (error || !data) {
                this.logger.error(`Error fetching property by ID: ${error?.message || 'Property not found'}`);
                throw new NotFoundException(`Property with ID ${id} not found`);
            }

            return data;
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Unexpected error: ${err.message}`);
            throw new InternalServerErrorException('An unexpected error occurred while fetching the property');
        }
    }

    async createProperty(userId: string, createPropertyDto: CreatePropertyDto): Promise<Property> {
        try {
            // Validate required fields
            if (!createPropertyDto.title || !createPropertyDto.price || !createPropertyDto.property_type || !createPropertyDto.location) {
                throw new BadRequestException('Missing required fields: title, price, property_type, and location are required');
            }

            const client = this.supabaseService.getClient();
            
            // Auto-associate property with agent_id from JWT token
            const propertyData = {
                ...createPropertyDto,
                agent_id: userId,
                status: 'active',
                views_count: 0,
            };

            const { data, error } = await client
                .from('properties')
                .insert([propertyData])
                .select()
                .single();

            if (error) {
                this.logger.error(`Error creating property: ${error.message}`);
                throw new InternalServerErrorException('Failed to create property in database');
            }

            return data;
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            this.logger.error(`Unexpected error: ${err.message}`);
            throw new InternalServerErrorException('An unexpected error occurred while creating the property');
        }
    }

    async updateProperty(id: string, userId: string, userRole: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
        try {
            const client = this.supabaseService.getClient();

            // First, check if property exists and verify ownership
            const { data: existingProperty, error: fetchError } = await client
                .from('properties')
                .select('agent_id')
                .eq('id', id)
                .single();

            if (fetchError || !existingProperty) {
                throw new NotFoundException(`Property with ID ${id} not found`);
            }

            // Verify ownership (unless user is admin)
            if (userRole !== 'admin' && existingProperty.agent_id !== userId) {
                throw new BadRequestException('You do not have permission to update this property');
            }

            const { data, error } = await client
                .from('properties')
                .update(updatePropertyDto)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                this.logger.error(`Error updating property: ${error.message}`);
                throw new InternalServerErrorException('Failed to update property in database');
            }

            return data;
        } catch (err) {
            if (err instanceof NotFoundException || err instanceof BadRequestException) {
                throw err;
            }
            this.logger.error(`Unexpected error: ${err.message}`);
            throw new InternalServerErrorException('An unexpected error occurred while updating the property');
        }
    }

    async deleteProperty(id: string, userId: string, userRole: string): Promise<{ message: string }> {
        try {
            const client = this.supabaseService.getClient();

            // First, check if property exists and verify ownership
            const { data: existingProperty, error: fetchError } = await client
                .from('properties')
                .select('agent_id')
                .eq('id', id)
                .single();

            if (fetchError || !existingProperty) {
                throw new NotFoundException(`Property with ID ${id} not found`);
            }

            // Verify ownership (unless user is admin)
            if (userRole !== 'admin' && existingProperty.agent_id !== userId) {
                throw new BadRequestException('You do not have permission to delete this property');
            }

            // Soft delete: set status to 'deleted' instead of removing from database
            const { error } = await client
                .from('properties')
                .update({ status: 'deleted' })
                .eq('id', id);

            if (error) {
                this.logger.error(`Error deleting property: ${error.message}`);
                throw new InternalServerErrorException('Failed to delete property from database');
            }

            return { message: 'Property deleted successfully' };
        } catch (err) {
            if (err instanceof NotFoundException || err instanceof BadRequestException) {
                throw err;
            }
            this.logger.error(`Unexpected error: ${err.message}`);
            throw new InternalServerErrorException('An unexpected error occurred while deleting the property');
        }
    }
}
