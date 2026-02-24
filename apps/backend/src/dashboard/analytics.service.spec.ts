import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLeadsByStatus', () => {
    const agentId = 'agent-123';

    it('should return leads grouped by status', async () => {
      const mockLeads = [
        { status: 'new' },
        { status: 'new' },
        { status: 'contacted' },
        { status: 'qualified' },
        { status: 'negotiating' },
        { status: 'closed_won' },
        { status: 'closed_won' },
        { status: 'closed_lost' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockLeads,
            error: null,
          }),
        }),
      });

      const result = await service.getLeadsByStatus(agentId);

      expect(result).toEqual({
        new: 2,
        contacted: 1,
        qualified: 1,
        negotiating: 1,
        closed_won: 2,
        closed_lost: 1,
      });
    });

    it('should return zero counts when agent has no leads', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await service.getLeadsByStatus(agentId);

      expect(result).toEqual({
        new: 0,
        contacted: 0,
        qualified: 0,
        negotiating: 0,
        closed_won: 0,
        closed_lost: 0,
      });
    });

    it('should throw error when database query fails', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      await expect(service.getLeadsByStatus(agentId)).rejects.toThrow(
        'Failed to fetch leads by status',
      );
    });
  });

  describe('getTotalViews', () => {
    const agentId = 'agent-123';

    it('should return sum of all property views', async () => {
      const mockProperties = [
        { views_count: 50 },
        { views_count: 30 },
        { views_count: 20 },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({
              data: mockProperties,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getTotalViews(agentId);

      expect(result).toBe(100);
    });

    it('should return zero when agent has no properties', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getTotalViews(agentId);

      expect(result).toBe(0);
    });

    it('should handle null views_count values', async () => {
      const mockProperties = [
        { views_count: 50 },
        { views_count: null },
        { views_count: 20 },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({
              data: mockProperties,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getTotalViews(agentId);

      expect(result).toBe(70);
    });
  });

  describe('calculateConversionRate', () => {
    const agentId = 'agent-123';

    it('should calculate conversion rate correctly', async () => {
      const mockLeads = [
        { status: 'new' },
        { status: 'contacted' },
        { status: 'closed_won' },
        { status: 'closed_won' },
        { status: 'closed_lost' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockLeads,
            error: null,
          }),
        }),
      });

      const result = await service.calculateConversionRate(agentId);

      expect(result).toBe(40); // 2 out of 5 = 40%
    });

    it('should return zero when agent has no leads', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await service.calculateConversionRate(agentId);

      expect(result).toBe(0);
    });

    it('should return zero when no leads are closed_won', async () => {
      const mockLeads = [
        { status: 'new' },
        { status: 'contacted' },
        { status: 'closed_lost' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockLeads,
            error: null,
          }),
        }),
      });

      const result = await service.calculateConversionRate(agentId);

      expect(result).toBe(0);
    });

    it('should return 100 when all leads are closed_won', async () => {
      const mockLeads = [
        { status: 'closed_won' },
        { status: 'closed_won' },
        { status: 'closed_won' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockLeads,
            error: null,
          }),
        }),
      });

      const result = await service.calculateConversionRate(agentId);

      expect(result).toBe(100);
    });
  });

  describe('getMonthlyTrends', () => {
    const agentId = 'agent-123';

    it('should return monthly trends for last 12 months by default', async () => {
      const mockProperties = [
        { created_at: '2024-01-15T10:00:00Z' },
        { created_at: '2024-01-20T10:00:00Z' },
        { created_at: '2024-02-10T10:00:00Z' },
      ];

      const mockLeads = [
        { created_at: '2024-01-15T10:00:00Z', status: 'new' },
        { created_at: '2024-01-20T10:00:00Z', status: 'closed_won' },
        { created_at: '2024-02-10T10:00:00Z', status: 'contacted' },
      ];

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'properties') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockResolvedValue({
                    data: mockProperties,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'leads') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockResolvedValue({
                    data: mockLeads,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return mockSupabaseClient;
      });

      const result = await service.getMonthlyTrends(agentId);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('month');
      expect(result[0]).toHaveProperty('properties_created');
      expect(result[0]).toHaveProperty('leads_created');
      expect(result[0]).toHaveProperty('deals_closed');
    });

    it('should support custom date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-03-31');

      mockSupabaseClient.from.mockImplementation((table) => {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        };
      });

      const result = await service.getMonthlyTrends(agentId, startDate, endDate);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(3); // Jan, Feb, Mar
    });

    it('should count deals_closed correctly', async () => {
      const mockProperties = [];
      const mockLeads = [
        { created_at: '2024-01-15T10:00:00Z', status: 'closed_won' },
        { created_at: '2024-01-20T10:00:00Z', status: 'closed_won' },
        { created_at: '2024-01-25T10:00:00Z', status: 'new' },
      ];

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'properties') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockResolvedValue({
                    data: mockProperties,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'leads') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  lte: jest.fn().mockResolvedValue({
                    data: mockLeads,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return mockSupabaseClient;
      });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const result = await service.getMonthlyTrends(agentId, startDate, endDate);

      expect(result.length).toBeGreaterThan(0);
      const jan2024 = result.find((trend) => trend.month === '2024-01');
      expect(jan2024).toBeDefined();
      expect(jan2024?.deals_closed).toBe(2);
      expect(jan2024?.leads_created).toBe(3);
    });
  });

  describe('getSystemWideLeadsByStatus', () => {
    it('should return system-wide leads grouped by status', async () => {
      const mockLeads = [
        { status: 'new' },
        { status: 'new' },
        { status: 'new' },
        { status: 'contacted' },
        { status: 'qualified' },
        { status: 'closed_won' },
        { status: 'closed_won' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockLeads,
          error: null,
        }),
      });

      const result = await service.getSystemWideLeadsByStatus();

      expect(result).toEqual({
        new: 3,
        contacted: 1,
        qualified: 1,
        negotiating: 0,
        closed_won: 2,
        closed_lost: 0,
      });
    });

    it('should return zero counts when no leads exist', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const result = await service.getSystemWideLeadsByStatus();

      expect(result).toEqual({
        new: 0,
        contacted: 0,
        qualified: 0,
        negotiating: 0,
        closed_won: 0,
        closed_lost: 0,
      });
    });
  });
});
