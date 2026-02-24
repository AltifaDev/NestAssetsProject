import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  const mockAdminService = {
    getSystemOverview: jest.fn(),
    getTopPerformingAgents: jest.fn(),
    getMostViewedProperties: jest.fn(),
    getRecentActivities: jest.fn(),
    getAgentPerformanceReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSystemOverview', () => {
    it('should return system overview', async () => {
      const mockOverview = {
        total_agents: 10,
        total_properties: 50,
        total_leads: 100,
        active_agents: 8,
      };

      mockAdminService.getSystemOverview.mockResolvedValue(mockOverview);

      const result = await controller.getSystemOverview();

      expect(result).toEqual(mockOverview);
      expect(mockAdminService.getSystemOverview).toHaveBeenCalled();
    });
  });

  describe('getTopPerformingAgents', () => {
    it('should return top performing agents with default limit', async () => {
      const mockAgents = [
        {
          id: 'agent1',
          name: 'Agent One',
          closed_deals: 10,
          total_properties: 20,
          conversion_rate: 50,
        },
      ];

      mockAdminService.getTopPerformingAgents.mockResolvedValue(mockAgents);

      const result = await controller.getTopPerformingAgents();

      expect(result).toEqual(mockAgents);
      expect(mockAdminService.getTopPerformingAgents).toHaveBeenCalledWith(10);
    });

    it('should return top performing agents with custom limit', async () => {
      const mockAgents = [
        {
          id: 'agent1',
          name: 'Agent One',
          closed_deals: 10,
          total_properties: 20,
          conversion_rate: 50,
        },
      ];

      mockAdminService.getTopPerformingAgents.mockResolvedValue(mockAgents);

      const result = await controller.getTopPerformingAgents(5);

      expect(result).toEqual(mockAgents);
      expect(mockAdminService.getTopPerformingAgents).toHaveBeenCalledWith(5);
    });
  });

  describe('getMostViewedProperties', () => {
    it('should return most viewed properties with default limit', async () => {
      const mockProperties = [
        {
          id: 'prop1',
          title: 'Property 1',
          views: 100,
          agent_name: 'Agent One',
          price: 5000000,
        },
      ];

      mockAdminService.getMostViewedProperties.mockResolvedValue(mockProperties);

      const result = await controller.getMostViewedProperties();

      expect(result).toEqual(mockProperties);
      expect(mockAdminService.getMostViewedProperties).toHaveBeenCalledWith(10);
    });

    it('should return most viewed properties with custom limit', async () => {
      const mockProperties = [
        {
          id: 'prop1',
          title: 'Property 1',
          views: 100,
          agent_name: 'Agent One',
          price: 5000000,
        },
      ];

      mockAdminService.getMostViewedProperties.mockResolvedValue(mockProperties);

      const result = await controller.getMostViewedProperties(20);

      expect(result).toEqual(mockProperties);
      expect(mockAdminService.getMostViewedProperties).toHaveBeenCalledWith(20);
    });
  });

  describe('getRecentActivities', () => {
    it('should return recent activities with default limit', async () => {
      const mockActivities = [
        {
          id: 'act1',
          user_id: 'user1',
          action: 'property_created',
          entity_type: 'property',
          entity_id: 'prop1',
          created_at: new Date(),
        },
      ];

      mockAdminService.getRecentActivities.mockResolvedValue(mockActivities);

      const result = await controller.getRecentActivities();

      expect(result).toEqual(mockActivities);
      expect(mockAdminService.getRecentActivities).toHaveBeenCalledWith(50);
    });

    it('should return recent activities with custom limit', async () => {
      const mockActivities = [
        {
          id: 'act1',
          user_id: 'user1',
          action: 'property_created',
          entity_type: 'property',
          entity_id: 'prop1',
          created_at: new Date(),
        },
      ];

      mockAdminService.getRecentActivities.mockResolvedValue(mockActivities);

      const result = await controller.getRecentActivities(100);

      expect(result).toEqual(mockActivities);
      expect(mockAdminService.getRecentActivities).toHaveBeenCalledWith(100);
    });
  });

  describe('getAgentPerformanceReport', () => {
    it('should return agent performance report', async () => {
      const mockReport = [
        {
          agent_id: 'agent1',
          agent_name: 'Agent One',
          total_properties: 10,
          total_leads: 20,
          closed_deals: 5,
          conversion_rate: 25,
        },
      ];

      mockAdminService.getAgentPerformanceReport.mockResolvedValue(mockReport);

      const result = await controller.getAgentPerformanceReport();

      expect(result).toEqual(mockReport);
      expect(mockAdminService.getAgentPerformanceReport).toHaveBeenCalled();
    });
  });
});
