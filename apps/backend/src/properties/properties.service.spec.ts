import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { SupabaseService } from '../supabase/supabase.service';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFilters } from './dto/property-filters.dto';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
    rpc: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProperty', () => {
    const userId = 'test-user-id';
    const createPropertyDto: CreatePropertyDto = {
      title: 'Test Property',
      description: 'Test Description',
      price: 1000000,
      property_type: 'house',
      location: 'Test Location',
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
    };

    it('should create a property successfully', async () => {
      const expectedProperty = {
        id: 'test-property-id',
        ...createPropertyDto,
        agent_id: userId,
        status: 'active',
        views_count: 0,
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: expectedProperty,
        error: null,
      });

      const result = await service.createProperty(userId, createPropertyDto);

      expect(result).toEqual(expectedProperty);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('properties');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          ...createPropertyDto,
          agent_id: userId,
          status: 'active',
          views_count: 0,
        }),
      ]);
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      const invalidDto = { ...createPropertyDto, title: '' };

      await expect(service.createProperty(userId, invalidDto as CreatePropertyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.createProperty(userId, createPropertyDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getProperties', () => {
    const userId = 'test-user-id';
    const filters: PropertyFilters = {
      page: 1,
      limit: 20,
    };

    it('should return paginated properties for agent (only their own)', async () => {
      const mockProperties = [
        { id: '1', title: 'Property 1', agent_id: userId },
        { id: '2', title: 'Property 2', agent_id: userId },
      ];

      // Mock the query chain properly
      const mockQuery = {
        data: mockProperties,
        error: null,
        count: 2,
      };

      mockSupabaseClient.range.mockResolvedValue(mockQuery);

      const result = await service.getProperties(userId, 'agent', filters);

      expect(result.data).toBeDefined();
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('agent_id', userId);
    });

    it('should return all properties for admin', async () => {
      const mockProperties = [
        { id: '1', title: 'Property 1', agent_id: 'agent-1' },
        { id: '2', title: 'Property 2', agent_id: 'agent-2' },
      ];

      const mockQuery = {
        data: mockProperties,
        error: null,
        count: 2,
      };

      mockSupabaseClient.range.mockResolvedValue(mockQuery);

      await service.getProperties(userId, 'admin', filters);

      // Admin should NOT have agent_id filter
      expect(mockSupabaseClient.eq).not.toHaveBeenCalledWith('agent_id', expect.anything());
    });

    it('should apply filters correctly', async () => {
      const filtersWithOptions: PropertyFilters = {
        ...filters,
        property_type: 'house',
        min_price: 500000,
        max_price: 2000000,
        location: 'Bangkok',
        bedrooms: 3,
      };

      const mockQuery = {
        data: [],
        error: null,
        count: 0,
      };

      mockSupabaseClient.range.mockResolvedValue(mockQuery);

      await service.getProperties(userId, 'agent', filtersWithOptions);

      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('property_type', 'house');
      expect(mockSupabaseClient.gte).toHaveBeenCalledWith('price', 500000);
      expect(mockSupabaseClient.lte).toHaveBeenCalledWith('price', 2000000);
      expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('location', '%Bangkok%');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('bedrooms', 3);
    });

    it('should handle keyword search', async () => {
      const filtersWithKeyword: PropertyFilters = {
        ...filters,
        keyword: 'luxury',
      };

      const mockQuery = {
        data: [],
        error: null,
        count: 0,
      };

      mockSupabaseClient.range.mockResolvedValue(mockQuery);

      await service.getProperties(userId, 'agent', filtersWithKeyword);

      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        expect.stringContaining('luxury'),
      );
    });
  });

  describe('updateProperty', () => {
    const propertyId = 'test-property-id';
    const userId = 'test-user-id';
    const updateDto: UpdatePropertyDto = {
      title: 'Updated Title',
      price: 1500000,
    };

    it('should update property successfully when user is owner', async () => {
      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: { agent_id: userId },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: propertyId, ...updateDto },
          error: null,
        });

      const result = await service.updateProperty(propertyId, userId, 'agent', updateDto);

      expect(result).toEqual({ id: propertyId, ...updateDto });
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateDto);
    });

    it('should throw BadRequestException when user is not owner', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { agent_id: 'different-user-id' },
        error: null,
      });

      await expect(service.updateProperty(propertyId, userId, 'agent', updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow admin to update any property', async () => {
      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: { agent_id: 'different-user-id' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: propertyId, ...updateDto },
          error: null,
        });

      const result = await service.updateProperty(propertyId, userId, 'admin', updateDto);

      expect(result).toEqual({ id: propertyId, ...updateDto });
    });

    it('should throw NotFoundException when property does not exist', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(service.updateProperty(propertyId, userId, 'agent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProperty', () => {
    const propertyId = 'test-property-id';
    const userId = 'test-user-id';

    it('should soft delete property successfully when user is owner', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { agent_id: userId },
        error: null,
      });

      // Mock the update chain
      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      mockSupabaseClient.update.mockReturnValue(mockUpdateChain);

      const result = await service.deleteProperty(propertyId, userId, 'agent');

      expect(result).toEqual({ message: 'Property deleted successfully' });
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ status: 'deleted' });
    });

    it('should throw BadRequestException when user is not owner', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { agent_id: 'different-user-id' },
        error: null,
      });

      await expect(service.deleteProperty(propertyId, userId, 'agent')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow admin to delete any property', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: { agent_id: 'different-user-id' },
        error: null,
      });

      // Mock the update chain
      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      mockSupabaseClient.update.mockReturnValue(mockUpdateChain);

      const result = await service.deleteProperty(propertyId, userId, 'admin');

      expect(result).toEqual({ message: 'Property deleted successfully' });
    });
  });

  describe('getPropertyById', () => {
    const propertyId = 'test-property-id';

    it('should return property by id and increment views', async () => {
      const mockProperty = {
        id: propertyId,
        title: 'Test Property',
        views_count: 5,
      };

      mockSupabaseClient.rpc.mockResolvedValue({ error: null });
      mockSupabaseClient.single.mockResolvedValue({
        data: mockProperty,
        error: null,
      });

      const result = await service.getPropertyById(propertyId);

      expect(result).toEqual(mockProperty);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('increment_property_views', {
        property_id: propertyId,
      });
    });

    it('should return property without incrementing views when specified', async () => {
      const mockProperty = {
        id: propertyId,
        title: 'Test Property',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockProperty,
        error: null,
      });

      const result = await service.getPropertyById(propertyId, false);

      expect(result).toEqual(mockProperty);
      expect(mockSupabaseClient.rpc).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when property does not exist', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(service.getPropertyById(propertyId)).rejects.toThrow(NotFoundException);
    });
  });
});
