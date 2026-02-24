import { Test, TestingModule } from '@nestjs/testing';
import { AgentsService } from './agents.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ValidationException } from '../common/exceptions/validation.exception';
import { NotFoundException } from '../common/exceptions/not-found.exception';

describe('AgentsService', () => {
  let service: AgentsService;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAgent', () => {
    it('should create agent with valid data', async () => {
      const createAgentDto: CreateAgentDto = {
        email: 'newagent@example.com',
        password: 'Password123',
        name: 'New Agent',
        phone: '1234567890',
        line_id: 'line123',
        role: 'agent',
        bio: 'Test bio',
      };

      const mockAgent = {
        id: '123',
        email: createAgentDto.email,
        name: createAgentDto.name,
        phone: createAgentDto.phone,
        line_id: createAgentDto.line_id,
        role: createAgentDto.role,
        bio: createAgentDto.bio,
        verified: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock email uniqueness check - no existing user
      mockSupabaseClient.single.mockResolvedValueOnce({ data: null, error: null });
      // Mock agent creation
      mockSupabaseClient.single.mockResolvedValueOnce({ data: mockAgent, error: null });

      const result = await service.createAgent(createAgentDto);

      expect(result).toEqual(mockAgent);
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should throw ValidationException when email already exists', async () => {
      const createAgentDto: CreateAgentDto = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Existing Agent',
      };

      // Mock email already exists
      mockSupabaseClient.single.mockResolvedValueOnce({ data: { id: '123' }, error: null });

      await expect(service.createAgent(createAgentDto)).rejects.toThrow(
        'Validation failed',
      );
    });
  });

  describe('getAllAgents', () => {
    it('should return all agents with profile information', async () => {
      const mockAgents = [
        {
          id: '1',
          email: 'agent1@example.com',
          name: 'Agent 1',
          phone: '1111111111',
          role: 'agent',
          verified: true,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          email: 'agent2@example.com',
          name: 'Agent 2',
          phone: '2222222222',
          role: 'admin',
          verified: true,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSupabaseClient.order.mockResolvedValueOnce({ data: mockAgents, error: null });

      const result = await service.getAllAgents();

      expect(result).toEqual(mockAgents);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no agents exist', async () => {
      mockSupabaseClient.order.mockResolvedValueOnce({ data: [], error: null });

      const result = await service.getAllAgents();

      expect(result).toEqual([]);
    });
  });

  describe('getAgentById', () => {
    it('should return agent by id', async () => {
      const agentId = '123';
      const mockAgent = {
        id: agentId,
        email: 'agent@example.com',
        name: 'Agent',
        phone: '1234567890',
        role: 'agent',
        bio: 'Test bio',
        verified: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabaseClient.single.mockResolvedValueOnce({ data: mockAgent, error: null });

      const result = await service.getAgentById(agentId);

      expect(result).toEqual(mockAgent);
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should throw NotFoundException when agent not found', async () => {
      const agentId = 'non-existent';

      mockSupabaseClient.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      await expect(service.getAgentById(agentId)).rejects.toThrow(
        'Agent not found',
      );
    });
  });

  describe('updateAgent', () => {
    it('should update agent with valid data', async () => {
      const agentId = '123';
      const updateAgentDto: UpdateAgentDto = {
        name: 'Updated Name',
        phone: '9876543210',
        bio: 'Updated bio',
      };

      const mockUpdatedAgent = {
        id: agentId,
        email: 'agent@example.com',
        name: updateAgentDto.name,
        phone: updateAgentDto.phone,
        bio: updateAgentDto.bio,
        role: 'agent',
        verified: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock agent exists check
      mockSupabaseClient.single.mockResolvedValueOnce({ data: { id: agentId }, error: null });
      // Mock update
      mockSupabaseClient.single.mockResolvedValueOnce({ data: mockUpdatedAgent, error: null });

      const result = await service.updateAgent(agentId, updateAgentDto);

      expect(result).toEqual(mockUpdatedAgent);
      expect(result.name).toBe(updateAgentDto.name);
      expect(result.phone).toBe(updateAgentDto.phone);
    });

    it('should throw NotFoundException when agent not found', async () => {
      const agentId = 'non-existent';
      const updateAgentDto: UpdateAgentDto = {
        name: 'Updated Name',
      };

      mockSupabaseClient.single.mockResolvedValueOnce({ data: null, error: null });

      await expect(
        service.updateAgent(agentId, updateAgentDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ValidationException when updating to existing email', async () => {
      const agentId = '123';
      const updateAgentDto: UpdateAgentDto = {
        email: 'existing@example.com',
      };

      // Mock agent exists
      mockSupabaseClient.single.mockResolvedValueOnce({ data: { id: agentId }, error: null });
      // Mock email already exists for different agent
      mockSupabaseClient.single.mockResolvedValueOnce({ data: { id: '456' }, error: null });

      await expect(
        service.updateAgent(agentId, updateAgentDto),
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('deleteAgent', () => {
    it('should soft delete agent by setting status to inactive', async () => {
      const agentId = '123';

      // Mock agent exists - need to return the chain properly
      const mockChain = {
        single: jest.fn().mockResolvedValueOnce({ data: { id: agentId }, error: null }),
      };
      mockSupabaseClient.eq.mockReturnValueOnce(mockChain);
      
      // Mock soft delete
      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValueOnce({ data: null, error: null }),
      };
      mockSupabaseClient.update.mockReturnValueOnce(mockUpdateChain);

      await service.deleteAgent(agentId);

      expect(mockSupabaseService.getClient).toHaveBeenCalled();
    });

    it('should throw NotFoundException when agent not found', async () => {
      const agentId = 'non-existent';

      const mockChain = {
        single: jest.fn().mockResolvedValueOnce({ data: null, error: null }),
      };
      mockSupabaseClient.eq.mockReturnValueOnce(mockChain);

      await expect(service.deleteAgent(agentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateOwnProfile', () => {
    it('should update own profile with restricted fields only', async () => {
      const userId = '123';
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Name',
        phone: '9876543210',
        bio: 'Updated bio',
        line_id: 'newline123',
      };

      const mockUpdatedAgent = {
        id: userId,
        email: 'agent@example.com',
        name: updateProfileDto.name,
        phone: updateProfileDto.phone,
        bio: updateProfileDto.bio,
        line_id: updateProfileDto.line_id,
        role: 'agent',
        verified: true,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock agent exists - need proper chain
      const mockExistsChain = {
        single: jest.fn().mockResolvedValueOnce({ data: { id: userId }, error: null }),
      };
      mockSupabaseClient.eq.mockReturnValueOnce(mockExistsChain);
      
      // Mock update - need proper chain
      const mockUpdateEqChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({ data: mockUpdatedAgent, error: null }),
      };
      const mockUpdateChain = {
        eq: jest.fn().mockReturnValueOnce(mockUpdateEqChain),
      };
      mockSupabaseClient.update.mockReturnValueOnce(mockUpdateChain);

      const result = await service.updateOwnProfile(userId, updateProfileDto);

      expect(result).toEqual(mockUpdatedAgent);
      expect(result.name).toBe(updateProfileDto.name);
      expect(result.phone).toBe(updateProfileDto.phone);
      expect(result.bio).toBe(updateProfileDto.bio);
      expect(result.line_id).toBe(updateProfileDto.line_id);
    });

    it('should throw NotFoundException when agent not found', async () => {
      const userId = 'non-existent';
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Name',
      };

      const mockChain = {
        single: jest.fn().mockResolvedValueOnce({ data: null, error: null }),
      };
      mockSupabaseClient.eq.mockReturnValueOnce(mockChain);

      await expect(
        service.updateOwnProfile(userId, updateProfileDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
