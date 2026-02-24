import { Exclude } from 'class-transformer';

export class AgentEntity {
  id: string;
  email: string;
  
  @Exclude()
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

  constructor(partial: Partial<AgentEntity>) {
    Object.assign(this, partial);
  }
}
