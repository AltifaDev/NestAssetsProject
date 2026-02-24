import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LeadsByStatus, MonthlyTrend } from './interfaces/dashboard.interface';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getLeadsByStatus(agentId: string): Promise<LeadsByStatus> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('leads')
      .select('status')
      .eq('agent_id', agentId);

    if (error) {
      this.logger.error('Error fetching leads by status:', error);
      throw new Error('Failed to fetch leads by status');
    }

    const leadsByStatus: LeadsByStatus = {
      new: 0,
      contacted: 0,
      qualified: 0,
      negotiating: 0,
      closed_won: 0,
      closed_lost: 0,
    };

    data.forEach((lead) => {
      if (lead.status in leadsByStatus) {
        leadsByStatus[lead.status]++;
      }
    });

    return leadsByStatus;
  }

  async getTotalViews(agentId: string): Promise<number> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('properties')
      .select('views_count')
      .eq('agent_id', agentId)
      .neq('status', 'deleted');

    if (error) {
      this.logger.error('Error fetching total views:', error);
      throw new Error('Failed to fetch total views');
    }

    return data.reduce((sum, property) => sum + (property.views_count || 0), 0);
  }

  async calculateConversionRate(agentId: string): Promise<number> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('leads')
      .select('status')
      .eq('agent_id', agentId);

    if (error) {
      this.logger.error('Error calculating conversion rate:', error);
      throw new Error('Failed to calculate conversion rate');
    }

    if (data.length === 0) {
      return 0;
    }

    const closedWon = data.filter((lead) => lead.status === 'closed_won').length;
    return (closedWon / data.length) * 100;
  }

  async getMonthlyTrends(
    agentId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<MonthlyTrend[]> {
    const client = this.supabaseService.getClient();

    // Default to last 12 months if no date range provided
    const end = endDate || new Date();
    const start = startDate || new Date(end.getFullYear(), end.getMonth() - 11, 1);

    // Fetch properties created
    const { data: properties, error: propError } = await client
      .from('properties')
      .select('created_at')
      .eq('agent_id', agentId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    if (propError) {
      this.logger.error('Error fetching properties for trends:', propError);
      throw new Error('Failed to fetch properties trends');
    }

    // Fetch leads created
    const { data: leads, error: leadsError } = await client
      .from('leads')
      .select('created_at, status')
      .eq('agent_id', agentId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    if (leadsError) {
      this.logger.error('Error fetching leads for trends:', leadsError);
      throw new Error('Failed to fetch leads trends');
    }

    // Group by month
    const monthlyData = new Map<string, MonthlyTrend>();

    // Initialize all months in range
    const current = new Date(start);
    while (current <= end) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(monthKey, {
        month: monthKey,
        properties_created: 0,
        leads_created: 0,
        deals_closed: 0,
      });
      current.setMonth(current.getMonth() + 1);
    }

    // Count properties
    properties.forEach((property) => {
      const date = new Date(property.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const trend = monthlyData.get(monthKey);
      if (trend) {
        trend.properties_created++;
      }
    });

    // Count leads and deals
    leads.forEach((lead) => {
      const date = new Date(lead.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const trend = monthlyData.get(monthKey);
      if (trend) {
        trend.leads_created++;
        if (lead.status === 'closed_won') {
          trend.deals_closed++;
        }
      }
    });

    return Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));
  }

  async getSystemWideLeadsByStatus(): Promise<LeadsByStatus> {
    const client = this.supabaseService.getClient();

    const { data, error } = await client.from('leads').select('status');

    if (error) {
      this.logger.error('Error fetching system-wide leads by status:', error);
      throw new Error('Failed to fetch system-wide leads by status');
    }

    const leadsByStatus: LeadsByStatus = {
      new: 0,
      contacted: 0,
      qualified: 0,
      negotiating: 0,
      closed_won: 0,
      closed_lost: 0,
    };

    data.forEach((lead) => {
      if (lead.status in leadsByStatus) {
        leadsByStatus[lead.status]++;
      }
    });

    return leadsByStatus;
  }
}
