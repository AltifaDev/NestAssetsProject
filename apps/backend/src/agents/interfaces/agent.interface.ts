export interface Agent {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  phone?: string;
  line_id?: string;
  role: string;
  bio?: string;
  verified: boolean;
  status: string;
  created_at: Date;
  updated_at: Date;
}
