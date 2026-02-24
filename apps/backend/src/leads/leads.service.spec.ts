import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { SupabaseService } from '../supabase/supabase.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateLeadDto, UpdateLeadStatusDto, LeadStatus, LeadFiltersDto } from './dto';

describe('LeadsService', () => {
  let service: LeadsService;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLead', () => {
    it('should create a lead with valid data', async () => {
      const agentId = 'agent-123';
      const createLeadDto: CreateLeadDto = {
        property_id: 'property-123',
        customer_name: 'John Doe',
        customer_phone: '1234567890',
        customer_email: 'john@example.com',
        notes: 'Initial contact',
      };

      const mockLead = {
        id: 'lead-123',
        agent_id: agentId,
        ...createLeadDto,
        status: 'new',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockLead,
        error: null,
      });

      const result = await service.createLead(agentId, createLeadDto);

      expect(result).toEqual(mockLead);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith({
        agent_id: agentId,
        property_id: createLeadDto.property_id,
        customer_name: createLeadDto.customer_name,
        customer_phone: createLeadDto.customer_phone,
        customer_email: createLeadDto.customer_email,
        notes: createLeadDto.notes,
        status: 'new',
      });
    });

    it('should throw error when database insert fails', async () => {
      const agentId = 'agent-123';
      const createLeadDto: CreateLeadDto = {
        property_id: 'property-123',
        customer_name: 'John Doe',
        customer_phone: '1234567890',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.createLead(agentId, createLeadDto)).rejects.toThrow(
        'Failed to create lead: Database error',
      );
    });
  });

  describe('getLeads', () => {
    it('should return only agent leads for non-admin users', async () => {
      const userId = 'agent-123';
      const role = 'agent';
      const mockLeads = [
        {
          id: 'lead-1',
          agent_id: userId,
          customer_name: 'John Doe',
          status: 'new',
        },
        {
          id: 'lead-2',
          agent_id: userId,
          customer_name: 'Jane Smith',
          status: 'contacted',
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockLeads,
          error: null,
        }),
      });

      const result = await service.getLeads(userId, role);

      expect(result).toEqual(mockLeads);
    });

    it('should return all leads for admin users', async () => {
      const userId = 'admin-123';
      const role = 'admin';
      const mockLeads = [
        { id: 'lead-1', agent_id: 'agent-1', customer_name: 'John Doe' },
        { id: 'lead-2', agent_id: 'agent-2', customer_name: 'Jane Smith' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockLeads,
          error: null,
        }),
      });

      const result = await service.getLeads(userId, role);

      expect(result).toEqual(mockLeads);
    });

    it('should apply status filter when provided', async () => {
      const userId = 'agent-123';
      const role = 'agent';
      const filters: LeadFiltersDto = { status: LeadStatus.CONTACTED };

      const mockLeads = [
        { id: 'lead-1', agent_id: userId, status: 'contacted' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockLeads,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await service.getLeads(userId, role, filters);

      expect(result).toEqual(mockLeads);
      expect(mockQuery.eq).toHaveBeenCalledWith('status', filters.status);
    });

    it('should apply property_id filter when provided', async () => {
      const userId = 'agent-123';
      const role = 'agent';
      const filters: LeadFiltersDto = { property_id: 'property-123' };

      const mockLeads = [
        { id: 'lead-1', agent_id: userId, property_id: 'property-123' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockLeads,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await service.getLeads(userId, role, filters);

      expect(result).toEqual(mockLeads);
      expect(mockQuery.eq).toHaveBeenCalledWith('property_id', filters.property_id);
    });

    it('should apply date range filters when provided', async () => {
      const userId = 'agent-123';
      const role = 'agent';
      const filters: LeadFiltersDto = {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };

      const mockLeads = [{ id: 'lead-1', agent_id: userId }];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockLeads,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockQuery);

      const result = await service.getLeads(userId, role, filters);

      expect(result).toEqual(mockLeads);
      expect(mockQuery.gte).toHaveBeenCalledWith('created_at', filters.start_date);
      expect(mockQuery.lte).toHaveBeenCalledWith('created_at', filters.end_date);
    });
  });

  describe('getLeadById', () => {
    it('should return lead with property details', async () => {
      const leadId = 'lead-123';
      const mockLead = {
        id: leadId,
        agent_id: 'agent-123',
        customer_name: 'John Doe',
        properties: {
          id: 'property-123',
          title: 'Beautiful House',
          price: 5000000,
        },
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockLead,
          error: null,
        }),
      });

      const result = await service.getLeadById(leadId);

      expect(result).toEqual(mockLead);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('leads');
    });

    it('should throw NotFoundException when lead not found', async () => {
      const leadId = 'non-existent';

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      await expect(service.getLeadById(leadId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLeadStatus', () => {
    it('should update lead status for owner', async () => {
      const leadId = 'lead-123';
      const userId = 'agent-123';
      const role = 'agent';
      const updateDto: UpdateLeadStatusDto = { status: LeadStatus.CONTACTED };

      const mockLead = {
        id: leadId,
        agent_id: userId,
        status: 'new',
      };

      const mockUpdatedLead = {
        ...mockLead,
        status: updateDto.status,
      };

      // Mock getLeadById
      jest.spyOn(service, 'getLeadById').mockResolvedValue(mockLead as any);

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedLead,
          error: null,
        }),
      });

      const result = await service.updateLeadStatus(leadId, userId, role, updateDto);

      expect(result).toEqual(mockUpdatedLead);
    });

    it('should allow admin to update any lead status', async () => {
      const leadId = 'lead-123';
      const userId = 'admin-123';
      const role = 'admin';
      const updateDto: UpdateLeadStatusDto = { status: LeadStatus.CLOSED_WON };

      const mockLead = {
        id: leadId,
        agent_id: 'different-agent',
        status: 'negotiating',
      };

      const mockUpdatedLead = {
        ...mockLead,
        status: updateDto.status,
      };

      jest.spyOn(service, 'getLeadById').mockResolvedValue(mockLead as any);

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedLead,
          error: null,
        }),
      });

      const result = await service.updateLeadStatus(leadId, userId, role, updateDto);

      expect(result).toEqual(mockUpdatedLead);
    });

    it('should throw ForbiddenException when non-owner agent tries to update', async () => {
      const leadId = 'lead-123';
      const userId = 'agent-456';
      const role = 'agent';
      const updateDto: UpdateLeadStatusDto = { status: LeadStatus.CONTACTED };

      const mockLead = {
        id: leadId,
        agent_id: 'agent-123',
        status: 'new',
      };

      jest.spyOn(service, 'getLeadById').mockResolvedValue(mockLead as any);

      await expect(
        service.updateLeadStatus(leadId, userId, role, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addLeadNote', () => {
    it('should append note to existing notes', async () => {
      const leadId = 'lead-123';
      const userId = 'agent-123';
      const role = 'agent';
      const note = 'Customer called back';

      const mockLead = {
        id: leadId,
        agent_id: userId,
        notes: '[2024-01-01T00:00:00.000Z] Initial contact',
      };

      const mockUpdatedLead = {
        ...mockLead,
        notes: `[2024-01-01T00:00:00.000Z] Initial contact\n[2024-01-15T00:00:00.000Z] ${note}`,
      };

      jest.spyOn(service, 'getLeadById').mockResolvedValue(mockLead as any);

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedLead,
          error: null,
        }),
      });

      const result = await service.addLeadNote(leadId, userId, role, note);

      expect(result.notes).toContain(note);
    });

    it('should create first note when notes is null', async () => {
      const leadId = 'lead-123';
      const userId = 'agent-123';
      const role = 'agent';
      const note = 'First note';

      const mockLead = {
        id: leadId,
        agent_id: userId,
        notes: null,
      };

      const mockUpdatedLead = {
        ...mockLead,
        notes: `[2024-01-15T00:00:00.000Z] ${note}`,
      };

      jest.spyOn(service, 'getLeadById').mockResolvedValue(mockLead as any);

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedLead,
          error: null,
        }),
      });

      const result = await service.addLeadNote(leadId, userId, role, note);

      expect(result.notes).toContain(note);
    });

    it('should throw ForbiddenException when non-owner tries to add note', async () => {
      const leadId = 'lead-123';
      const userId = 'agent-456';
      const role = 'agent';
      const note = 'Unauthorized note';

      const mockLead = {
        id: leadId,
        agent_id: 'agent-123',
        notes: null,
      };

      jest.spyOn(service, 'getLeadById').mockResolvedValue(mockLead as any);

      await expect(
        service.addLeadNote(leadId, userId, role, note),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to add note to any lead', async () => {
      const leadId = 'lead-123';
      const userId = 'admin-123';
      const role = 'admin';
      const note = 'Admin note';

      const mockLead = {
        id: leadId,
        agent_id: 'agent-123',
        notes: null,
      };

      const mockUpdatedLead = {
        ...mockLead,
        notes: `[2024-01-15T00:00:00.000Z] ${note}`,
      };

      jest.spyOn(service, 'getLeadById').mockResolvedValue(mockLead as any);

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedLead,
          error: null,
        }),
      });

      const result = await service.addLeadNote(leadId, userId, role, note);

      expect(result.notes).toContain(note);
    });
  });
});
