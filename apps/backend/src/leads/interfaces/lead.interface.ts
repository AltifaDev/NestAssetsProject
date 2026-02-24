export interface Lead {
  id: string;
  agent_id: string;
  property_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  status: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
