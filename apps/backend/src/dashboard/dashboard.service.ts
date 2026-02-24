import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AnalyticsService } from './analytics.service';
import { AgentDashboard, AdminDashboard } from './interfaces/dashboard.interface';
import { DateRangeDto } from './dto/date-range.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private dashboardCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async getAgentDashboard(
    agentId: string,
    dateRange?: DateRangeDto,
  ): Promise<AgentDashboard> {
    const cacheKey = `agent_${agentId}_${JSON.stringify(dateRange || {})}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      this.logger.debug(`Returning cached dashboard for agent ${agentId}`);
      return cached;
    }

    const client = this.supabaseService.getClient();

    // Get total properties count
    const { count: totalProperties, error: propError } = await client
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .neq('status', 'deleted');

    if (propError) {
      this.logger.error('Error fetching properties count:', propError);
      throw new Error('Failed to fetch properties count');
    }

    // Get total leads count
    const { count: totalLeads, error: leadsError } = await client
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId);

    if (leadsError) {
      this.logger.error('Error fetching leads count:', leadsError);
      throw new Error('Failed to fetch leads count');
    }

    // Get leads by status
    const leadsByStatus = await this.analyticsService.getLeadsByStatus(agentId);

    // Get total views
    const totalViews = await this.analyticsService.getTotalViews(agentId);

    // Calculate conversion rate
    const conversionRate = await this.analyticsService.calculateConversionRate(agentId);

    const dashboard: AgentDashboard = {
      total_properties: totalProperties || 0,
      total_leads: totalLeads || 0,
      leads_by_status: leadsByStatus,
      total_views: totalViews,
      conversion_rate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
    };

    this.setCachedData(cacheKey, dashboard);
    return dashboard;
  }

  async getAdminDashboard(): Promise<AdminDashboard> {
    const cacheKey = 'admin_dashboard';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached admin dashboard');
      return cached;
    }

    const client = this.supabaseService.getClient();

    // Get total agents count
    const { count: totalAgents, error: agentsError } = await client
      .from('agents')
      .select('*', { count: 'exact', head: true });

    if (agentsError) {
      this.logger.error('Error fetching agents count:', agentsError);
      throw new Error('Failed to fetch agents count');
    }

    // Get active agents count
    const { count: activeAgents, error: activeError } = await client
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeError) {
      this.logger.error('Error fetching active agents count:', activeError);
      throw new Error('Failed to fetch active agents count');
    }

    // Get total properties count
    const { count: totalProperties, error: propError } = await client
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'deleted');

    if (propError) {
      this.logger.error('Error fetching properties count:', propError);
      throw new Error('Failed to fetch properties count');
    }

    // Get total leads count
    const { count: totalLeads, error: leadsError } = await client
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (leadsError) {
      this.logger.error('Error fetching leads count:', leadsError);
      throw new Error('Failed to fetch leads count');
    }

    // Get top agents (by closed deals)
    const { data: allLeads, error: allLeadsError } = await client
      .from('leads')
      .select('agent_id, status');

    if (allLeadsError) {
      this.logger.error('Error fetching all leads:', allLeadsError);
      throw new Error('Failed to fetch all leads');
    }

    // Group leads by agent and count closed deals
    const agentStats = new Map<string, { closed_deals: number; total_leads: number }>();
    allLeads.forEach((lead) => {
      const stats = agentStats.get(lead.agent_id) || { closed_deals: 0, total_leads: 0 };
      stats.total_leads++;
      if (lead.status === 'closed_won') {
        stats.closed_deals++;
      }
      agentStats.set(lead.agent_id, stats);
    });

    // Get agent details for top performers
    const topAgentIds = Array.from(agentStats.entries())
      .sort((a, b) => b[1].closed_deals - a[1].closed_deals)
      .slice(0, 5)
      .map(([id]) => id);

    const { data: agentDetails, error: agentDetailsError } = await client
      .from('agents')
      .select('id, name')
      .in('id', topAgentIds);

    if (agentDetailsError) {
      this.logger.error('Error fetching agent details:', agentDetailsError);
      throw new Error('Failed to fetch agent details');
    }

    // Get property counts for top agents
    const { data: agentProperties, error: agentPropError } = await client
      .from('properties')
      .select('agent_id')
      .in('agent_id', topAgentIds)
      .neq('status', 'deleted');

    if (agentPropError) {
      this.logger.error('Error fetching agent properties:', agentPropError);
      throw new Error('Failed to fetch agent properties');
    }

    const propertyCounts = new Map<string, number>();
    agentProperties.forEach((prop) => {
      propertyCounts.set(prop.agent_id, (propertyCounts.get(prop.agent_id) || 0) + 1);
    });

    const topAgents = agentDetails.map((agent) => {
      const stats = agentStats.get(agent.id) || { closed_deals: 0, total_leads: 0 };
      const conversionRate =
        stats.total_leads > 0 ? (stats.closed_deals / stats.total_leads) * 100 : 0;
      return {
        id: agent.id,
        name: agent.name,
        closed_deals: stats.closed_deals,
        total_properties: propertyCounts.get(agent.id) || 0,
        conversion_rate: Math.round(conversionRate * 100) / 100,
      };
    });

    // Get most viewed properties
    const { data: topProperties, error: topPropError } = await client
      .from('properties')
      .select('id, title, views_count, price, agent_id')
      .neq('status', 'deleted')
      .order('views_count', { ascending: false })
      .limit(5);

    if (topPropError) {
      this.logger.error('Error fetching top properties:', topPropError);
      throw new Error('Failed to fetch top properties');
    }

    // Get agent names for top properties
    const propertyAgentIds = topProperties.map((prop) => prop.agent_id);
    const { data: propertyAgents, error: propertyAgentsError } = await client
      .from('agents')
      .select('id, name')
      .in('id', propertyAgentIds);

    if (propertyAgentsError) {
      this.logger.error('Error fetching property agents:', propertyAgentsError);
      throw new Error('Failed to fetch property agents');
    }

    const agentNameMap = new Map(propertyAgents.map((agent) => [agent.id, agent.name]));

    const mostViewedProperties = topProperties.map((prop) => ({
      id: prop.id,
      title: prop.title,
      views: prop.views_count || 0,
      agent_name: agentNameMap.get(prop.agent_id) || 'Unknown',
      price: prop.price,
    }));

    const dashboard: AdminDashboard = {
      total_agents: totalAgents || 0,
      total_properties: totalProperties || 0,
      total_leads: totalLeads || 0,
      active_agents: activeAgents || 0,
      top_agents: topAgents,
      most_viewed_properties: mostViewedProperties,
    };

    this.setCachedData(cacheKey, dashboard);
    return dashboard;
  }

  async getPerformanceTrends(
    agentId: string,
    dateRange?: DateRangeDto,
  ): Promise<{ monthly_trends: any[] }> {
    const startDate = dateRange?.start_date ? new Date(dateRange.start_date) : undefined;
    const endDate = dateRange?.end_date ? new Date(dateRange.end_date) : undefined;

    const monthlyTrends = await this.analyticsService.getMonthlyTrends(
      agentId,
      startDate,
      endDate,
    );

    return { monthly_trends: monthlyTrends };
  }

  invalidateCache(pattern?: string) {
    if (pattern) {
      // Invalidate specific cache entries matching pattern
      for (const key of this.dashboardCache.keys()) {
        if (key.includes(pattern)) {
          this.dashboardCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.dashboardCache.clear();
    }
    this.logger.debug(`Cache invalidated${pattern ? ` for pattern: ${pattern}` : ''}`);
  }

  private getCachedData(key: string): any | null {
    const cached = this.dashboardCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      this.dashboardCache.delete(key);
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.dashboardCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}
