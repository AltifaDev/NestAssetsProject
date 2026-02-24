export interface SystemOverview {
  total_agents: number;
  total_properties: number;
  total_leads: number;
  active_agents: number;
}

export interface AgentPerformance {
  id: string;
  name: string;
  closed_deals: number;
  total_properties: number;
  conversion_rate: number;
}

export interface PropertyStats {
  id: string;
  title: string;
  views: number;
  agent_name: string;
  price: number;
}

export interface Activity {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: any;
  ip_address?: string;
  created_at: Date;
}

export interface AgentPerformanceReport {
  agent_id: string;
  agent_name: string;
  total_properties: number;
  total_leads: number;
  closed_deals: number;
  conversion_rate: number;
}
