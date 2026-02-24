import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilters } from './dto/property-filters.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Properties')
@ApiBearerAuth('JWT-auth')
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @Get()
    @ApiOperation({ summary: 'Get all properties', description: 'Retrieve properties with filtering and pagination. Agents see only their own properties, admins see all.' })
    @ApiResponse({ status: 200, description: 'Properties retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getAll(@CurrentUser() user: any, @Query() filters: PropertyFilters) {
        return this.propertiesService.getProperties(user.id, user.role, filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get property by ID', description: 'Retrieve detailed information about a specific property' })
    @ApiParam({ name: 'id', description: 'Property UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Property not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getOne(@Param('id') id: string) {
        return this.propertiesService.getPropertyById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create property', description: 'Create a new property listing. Property is automatically associated with the authenticated agent.' })
    @ApiBody({ type: CreatePropertyDto })
    @ApiResponse({ status: 201, description: 'Property created successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async create(@CurrentUser() user: any, @Body() createPropertyDto: CreatePropertyDto) {
        return this.propertiesService.createProperty(user.id, createPropertyDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update property', description: 'Update an existing property. Agents can only update their own properties.' })
    @ApiParam({ name: 'id', description: 'Property UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiBody({ type: UpdatePropertyDto })
    @ApiResponse({ status: 200, description: 'Property updated successfully' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 403, description: 'Forbidden - not property owner' })
    @ApiResponse({ status: 404, description: 'Property not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async update(@Param('id') id: string, @CurrentUser() user: any, @Body() updatePropertyDto: UpdatePropertyDto) {
        return this.propertiesService.updateProperty(id, user.id, user.role, updatePropertyDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete property', description: 'Soft delete a property (sets status to deleted). Agents can only delete their own properties.' })
    @ApiParam({ name: 'id', description: 'Property UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({ status: 200, description: 'Property deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - not property owner' })
    @ApiResponse({ status: 404, description: 'Property not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.propertiesService.deleteProperty(id, user.id, user.role);
    }
}
