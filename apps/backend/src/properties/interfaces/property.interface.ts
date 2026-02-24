export interface Property {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  price: number;
  property_type: 'house' | 'condo' | 'land' | 'commercial';
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  status: 'active' | 'sold' | 'deleted';
  thumbnail_id?: string;
  views_count: number;
  created_at: Date;
  updated_at: Date;
}
