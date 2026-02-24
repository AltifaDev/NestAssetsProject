import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  SystemOverview,
  AgentPerformance,
  PropertyStats,
  Activity,
} from './interfaces/admin.interface';
import { ReportService } from './report.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly reportService: ReportService,
  ) {}

  async getSystemOverview(): Promise<SystemOverview> {
    const client = this.supabaseService.getClient();

    // Get total agents
    const { count: totalAgents, error: agentsError } = await client
      .from('agents')
      .select('*', { count: 'exact', head: true });

    if (agentsError) {
      this.logger.error('Error fetching agents count:', agentsError);
      throw new Error('Failed to fetch agents count');
    }

    // Get active agents
    const { count: activeAgents, error: activeError } = await client
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeError) {
      this.logger.error('Error fetching active agents count:', activeError);
      throw new Error('Failed to fetch active agents count');
    }

    // Get total properties
    const { count: totalProperties, error: propError } = await client
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'deleted');

    if (propError) {
      this.logger.error('Error fetching properties count:', propError);
      throw new Error('Failed to fetch properties count');
    }

    // Get total leads
    const { count: totalLeads, error: leadsError } = await client
      .from('leads')
      .select('*', { count: 'exact', head: true });

    if (leadsError) {
      this.logger.error('Error fetching leads count:', leadsError);
      throw new Error('Failed to fetch leads count');
    }

    return {
      total_agents: totalAgents || 0,
      total_properties: totalProperties || 0,
      total_leads: totalLeads || 0,
      active_agents: activeAgents || 0,
    };
  }

  async getTopPerformingAgents(limit: number = 10): Promise<AgentPerformance[]> {
    const client = this.supabaseService.getClient();

    // Get all leads grouped by agent
    const { data: allLeads, error: leadsError } = await client
      .from('leads')
      .select('agent_id, status');

    if (leadsError) {
      this.logger.error('Error fetching leads:', leadsError);
      throw new Error('Failed to fetch leads');
    }

    // Group by agent and count closed deals
    const agentStats = new Map<string, { closed_deals: number; total_leads: number }>();
    allLeads.forEach((lead) => {
      const stats = agentStats.get(lead.agent_id) || { closed_deals: 0, total_leads: 0 };
      stats.total_leads++;
      if (lead.status === 'closed_won') {
        stats.closed_deals++;
      }
      agentStats.set(lead.agent_id, stats);
    });

    // Sort by closed deals and get top performers
    const topAgentIds = Array.from(agentStats.entries())
      .sort((a, b) => b[1].closed_deals - a[1].closed_deals)
      .slice(0, limit)
      .map(([id]) => id);

    if (topAgentIds.length === 0) {
      return [];
    }

    // Get agent details
    const { data: agents, error: agentsError } = await client
      .from('agents')
      .select('id, name')
      .in('id', topAgentIds);

    if (agentsError) {
      this.logger.error('Error fetching agent details:', agentsError);
      throw new Error('Failed to fetch agent details');
    }

    // Get property counts
    const { data: properties, error: propError } = await client
      .from('properties')
      .select('agent_id')
      .in('agent_id', topAgentIds)
      .neq('status', 'deleted');

    if (propError) {
      this.logger.error('Error fetching properties:', propError);
      throw new Error('Failed to fetch properties');
    }

    const propertyCounts = new Map<string, number>();
    properties.forEach((prop) => {
      propertyCounts.set(prop.agent_id, (propertyCounts.get(prop.agent_id) || 0) + 1);
    });

    // Build result
    const result: AgentPerformance[] = agents.map((agent) => {
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

    // Sort by closed deals descending
    return result.sort((a, b) => b.closed_deals - a.closed_deals);
  }

  async getMostViewedProperties(limit: number = 10): Promise<PropertyStats[]> {
    const client = this.supabaseService.getClient();

    // Get top properties by views
    const { data: properties, error: propError } = await client
      .from('properties')
      .select('id, title, views_count, price, agent_id')
      .neq('status', 'deleted')
      .order('views_count', { ascending: false })
      .limit(limit);

    if (propError) {
      this.logger.error('Error fetching top properties:', propError);
      throw new Error('Failed to fetch top properties');
    }

    if (properties.length === 0) {
      return [];
    }

    // Get agent names
    const agentIds = properties.map((prop) => prop.agent_id);
    const { data: agents, error: agentsError } = await client
      .from('agents')
      .select('id, name')
      .in('id', agentIds);

    if (agentsError) {
      this.logger.error('Error fetching agents:', agentsError);
      throw new Error('Failed to fetch agents');
    }

    const agentNameMap = new Map(agents.map((agent) => [agent.id, agent.name]));

    return properties.map((prop) => ({
      id: prop.id,
      title: prop.title,
      views: prop.views_count || 0,
      agent_name: agentNameMap.get(prop.agent_id) || 'Unknown',
      price: prop.price,
    }));
  }

  async getRecentActivities(limit: number = 50): Promise<Activity[]> {
    const client = this.supabaseService.getClient();

    const { data: activities, error } = await client
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error('Error fetching activities:', error);
      throw new Error('Failed to fetch activities');
    }

    return activities || [];
  }

  async logActivity(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: any,
    ipAddress?: string,
  ): Promise<void> {
    const client = this.supabaseService.getClient();

    const { error } = await client.from('activities').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      ip_address: ipAddress,
    });

    if (error) {
      this.logger.error('Error logging activity:', error);
      // Don't throw error for logging failures
    }
  }

  async getAgentPerformanceReport() {
    return this.reportService.generateAgentPerformanceReport();
  }
}
