import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AgentPerformanceReport } from './interfaces/admin.interface';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async generateAgentPerformanceReport(): Promise<AgentPerformanceReport[]> {
    const client = this.supabaseService.getClient();

    // Get all agents
    const { data: agents, error: agentsError } = await client
      .from('agents')
      .select('id, name')
      .eq('status', 'active');

    if (agentsError) {
      this.logger.error('Error fetching agents:', agentsError);
      throw new Error('Failed to fetch agents');
    }

    const reports: AgentPerformanceReport[] = [];

    for (const agent of agents) {
      // Get total properties
      const { count: totalProperties, error: propError } = await client
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent.id)
        .neq('status', 'deleted');

      if (propError) {
        this.logger.error(`Error fetching properties for agent ${agent.id}:`, propError);
        continue;
      }

      // Get leads data
      const { data: leads, error: leadsError } = await client
        .from('leads')
        .select('status')
        .eq('agent_id', agent.id);

      if (leadsError) {
        this.logger.error(`Error fetching leads for agent ${agent.id}:`, leadsError);
        continue;
      }

      const totalLeads = leads.length;
      const closedDeals = leads.filter((lead) => lead.status === 'closed_won').length;
      const conversionRate = totalLeads > 0 ? (closedDeals / totalLeads) * 100 : 0;

      reports.push({
        agent_id: agent.id,
        agent_name: agent.name,
        total_properties: totalProperties || 0,
        total_leads: totalLeads,
        closed_deals: closedDeals,
        conversion_rate: Math.round(conversionRate * 100) / 100,
      });
    }

    return reports;
  }
}
