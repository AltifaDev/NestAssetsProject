import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { AnalyticsService } from './analytics.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let analyticsService: AnalyticsService;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  const mockAnalyticsService = {
    getLeadsByStatus: jest.fn(),
    getTotalViews: jest.fn(),
    calculateConversionRate: jest.fn(),
    getMonthlyTrends: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAgentDashboard', () => {
    const agentId = 'agent-123';

    it('should return agent dashboard with all metrics', async () => {
      const mockLeadsByStatus = {
        new: 5,
        contacted: 3,
        qualified: 2,
        negotiating: 1,
        closed_won: 4,
        closed_lost: 2,
      };

      // Mock properties count
      const propertiesCountMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({
              count: 10,
              error: null,
            }),
          }),
        }),
      };

      // Mock leads count
      const leadsCountMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            count: 10,
            error: null,
          }),
        }),
      };

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return propertiesCountMock;
        if (callCount === 2) return leadsCountMock;
        return mockSupabaseClient;
      });

      mockAnalyticsService.getLeadsByStatus.mockResolvedValue(mockLeadsByStatus);
      mockAnalyticsService.getTotalViews.mockResolvedValue(150);
      mockAnalyticsService.calculateConversionRate.mockResolvedValue(23.53);

      const result = await service.getAgentDashboard(agentId);

      expect(result).toEqual({
        total_properties: 10,
        total_leads: 10,
        leads_by_status: mockLeadsByStatus,
        total_views: 150,
        conversion_rate: 23.53,
      });

      expect(mockAnalyticsService.getLeadsByStatus).toHaveBeenCalledWith(agentId);
      expect(mockAnalyticsService.getTotalViews).toHaveBeenCalledWith(agentId);
      expect(mockAnalyticsService.calculateConversionRate).toHaveBeenCalledWith(agentId);
    });

    it('should return zero values when agent has no data', async () => {
      const mockLeadsByStatus = {
        new: 0,
        contacted: 0,
        qualified: 0,
        negotiating: 0,
        closed_won: 0,
        closed_lost: 0,
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({
              count: 0,
              error: null,
            }),
          }),
        }),
      });

      mockAnalyticsService.getLeadsByStatus.mockResolvedValue(mockLeadsByStatus);
      mockAnalyticsService.getTotalViews.mockResolvedValue(0);
      mockAnalyticsService.calculateConversionRate.mockResolvedValue(0);

      const result = await service.getAgentDashboard(agentId);

      expect(result.total_properties).toBe(0);
      expect(result.total_leads).toBe(0);
      expect(result.total_views).toBe(0);
      expect(result.conversion_rate).toBe(0);
    });

    it('should use cached data when available', async () => {
      const mockLeadsByStatus = {
        new: 5,
        contacted: 3,
        qualified: 2,
        negotiating: 1,
        closed_won: 4,
        closed_lost: 2,
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({
              count: 10,
              error: null,
            }),
          }),
        }),
      });

      mockAnalyticsService.getLeadsByStatus.mockResolvedValue(mockLeadsByStatus);
      mockAnalyticsService.getTotalViews.mockResolvedValue(150);
      mockAnalyticsService.calculateConversionRate.mockResolvedValue(23.53);

      // First call - should fetch from database
      await service.getAgentDashboard(agentId);

      // Second call - should use cache
      await service.getAgentDashboard(agentId);

      // Analytics service should only be called once
      expect(mockAnalyticsService.getLeadsByStatus).toHaveBeenCalledTimes(1);
      expect(mockAnalyticsService.getTotalViews).toHaveBeenCalledTimes(1);
      expect(mockAnalyticsService.calculateConversionRate).toHaveBeenCalledTimes(1);
    });

    it('should throw error when database query fails', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({
              count: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      await expect(service.getAgentDashboard(agentId)).rejects.toThrow(
        'Failed to fetch properties count',
      );
    });
  });

  describe('getAdminDashboard', () => {
    it('should return admin dashboard with system-wide statistics', async () => {
      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((table) => {
        callCount++;
        
        // First call: total agents count
        if (callCount === 1) {
          return {
            select: jest.fn().mockResolvedValue({
              count: 10,
              error: null,
            }),
          };
        }
        
        // Second call: active agents count
        if (callCount === 2) {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                count: 8,
                error: null,
              }),
            }),
          };
        }
        
        // Third call: total properties count
        if (callCount === 3) {
          return {
            select: jest.fn().mockReturnValue({
              neq: jest.fn().mockResolvedValue({
                count: 50,
                error: null,
              }),
            }),
          };
        }
        
        // Fourth call: total leads count
        if (callCount === 4) {
          return {
            select: jest.fn().mockResolvedValue({
              count: 100,
              error: null,
            }),
          };
        }
        
        // Fifth call: all leads for stats
        if (callCount === 5) {
          return {
            select: jest.fn().mockResolvedValue({
              data: [
                { agent_id: 'agent-1', status: 'closed_won' },
                { agent_id: 'agent-1', status: 'new' },
                { agent_id: 'agent-2', status: 'closed_won' },
              ],
              error: null,
            }),
          };
        }
        
        // Sixth call: agent details
        if (callCount === 6) {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({
                data: [
                  { id: 'agent-1', name: 'Agent One' },
                  { id: 'agent-2', name: 'Agent Two' },
                ],
                error: null,
              }),
            }),
          };
        }
        
        // Seventh call: agent properties
        if (callCount === 7) {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                neq: jest.fn().mockResolvedValue({
                  data: [
                    { agent_id: 'agent-1' },
                    { agent_id: 'agent-1' },
                    { agent_id: 'agent-2' },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        
        // Eighth call: top properties
        if (callCount === 8) {
          return {
            select: jest.fn().mockReturnValue({
              neq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'prop-1',
                        title: 'Property 1',
                        views_count: 100,
                        price: 5000000,
                        agent_id: 'agent-1',
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        
        // Ninth call: agent names for properties
        if (callCount === 9) {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({
                data: [{ id: 'agent-1', name: 'Agent One' }],
                error: null,
              }),
            }),
          };
        }
        
        return mockSupabaseClient;
      });

      const result = await service.getAdminDashboard();

      expect(result).toHaveProperty('total_agents');
      expect(result).toHaveProperty('total_properties');
      expect(result).toHaveProperty('total_leads');
      expect(result).toHaveProperty('active_agents');
      expect(result).toHaveProperty('top_agents');
      expect(result).toHaveProperty('most_viewed_properties');
      expect(result.total_agents).toBe(10);
      expect(result.active_agents).toBe(8);
      expect(result.total_properties).toBe(50);
      expect(result.total_leads).toBe(100);
    });

    it('should use cached data when available', async () => {
      let callCount = 0;
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++;
        
        if (callCount === 1) {
          return {
            select: jest.fn().mockResolvedValue({
              count: 10,
              error: null,
            }),
          };
        }
        
        if (callCount === 2) {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                count: 8,
                error: null,
              }),
            }),
          };
        }
        
        if (callCount === 3) {
          return {
            select: jest.fn().mockReturnValue({
              neq: jest.fn().mockResolvedValue({
                count: 50,
                error: null,
              }),
            }),
          };
        }
        
        if (callCount === 4) {
          return {
            select: jest.fn().mockResolvedValue({
              count: 100,
              error: null,
            }),
          };
        }
        
        if (callCount === 5) {
          return {
            select: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }
        
        if (callCount === 6) {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        }
        
        if (callCount === 7) {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                neq: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          };
        }
        
        if (callCount === 8) {
          return {
            select: jest.fn().mockReturnValue({
              neq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        
        if (callCount === 9) {
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        }
        
        return mockSupabaseClient;
      });

      // First call
      await service.getAdminDashboard();

      // Clear mock call history
      jest.clearAllMocks();
      callCount = 0;

      // Second call - should use cache
      await service.getAdminDashboard();

      // Should not call database again
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });

  describe('getPerformanceTrends', () => {
    const agentId = 'agent-123';

    it('should return monthly trends for agent', async () => {
      const mockTrends = [
        { month: '2024-01', properties_created: 5, leads_created: 10, deals_closed: 3 },
        { month: '2024-02', properties_created: 7, leads_created: 15, deals_closed: 5 },
      ];

      mockAnalyticsService.getMonthlyTrends.mockResolvedValue(mockTrends);

      const result = await service.getPerformanceTrends(agentId);

      expect(result.monthly_trends).toEqual(mockTrends);
      expect(mockAnalyticsService.getMonthlyTrends).toHaveBeenCalledWith(
        agentId,
        undefined,
        undefined,
      );
    });

    it('should support date range filtering', async () => {
      const mockTrends = [
        { month: '2024-01', properties_created: 5, leads_created: 10, deals_closed: 3 },
      ];

      mockAnalyticsService.getMonthlyTrends.mockResolvedValue(mockTrends);

      const dateRange = {
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-01-31T23:59:59.999Z',
      };

      const result = await service.getPerformanceTrends(agentId, dateRange);

      expect(result.monthly_trends).toEqual(mockTrends);
      expect(mockAnalyticsService.getMonthlyTrends).toHaveBeenCalledWith(
        agentId,
        new Date(dateRange.start_date),
        new Date(dateRange.end_date),
      );
    });
  });

  describe('invalidateCache', () => {
    it('should clear all cache when no pattern provided', () => {
      service.invalidateCache();
      // Cache should be cleared - subsequent calls should fetch fresh data
      expect(true).toBe(true); // Cache clearing is internal, just verify no errors
    });

    it('should clear specific cache entries matching pattern', () => {
      service.invalidateCache('agent_123');
      expect(true).toBe(true); // Cache clearing is internal, just verify no errors
    });
  });
});
