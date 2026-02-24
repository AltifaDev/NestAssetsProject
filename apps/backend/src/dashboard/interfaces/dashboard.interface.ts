export interface LeadsByStatus {
  new: number;
  contacted: number;
  qualified: number;
  negotiating: number;
  closed_won: number;
  closed_lost: number;
}

export interface MonthlyTrend {
  month: string;
  properties_created: number;
  leads_created: number;
  deals_closed: number;
}

export interface AgentDashboard {
  total_properties: number;
  total_leads: number;
  leads_by_status: LeadsByStatus;
  total_views: number;
  conversion_rate: number;
  monthly_trends?: MonthlyTrend[];
}

export interface TopAgent {
  id: string;
  name: string;
  closed_deals: number;
  total_properties: number;
  conversion_rate: number;
}

export interface TopProperty {
  id: string;
  title: string;
  views: number;
  agent_name: string;
  price: number;
}

export interface AdminDashboard {
  total_agents: number;
  total_properties: number;
  total_leads: number;
  active_agents: number;
  top_agents: TopAgent[];
  most_viewed_properties: TopProperty[];
}
