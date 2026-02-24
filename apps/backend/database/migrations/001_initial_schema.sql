-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  line_id VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'agent', -- 'agent' | 'admin'
  bio TEXT,
  verified BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'inactive'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create media table (must be created before properties for foreign key)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'image' | 'document'
  uploaded_by UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  related_to VARCHAR(50), -- 'property' | 'agent'
  related_id UUID,
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'deleted'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(15, 2) NOT NULL,
  property_type VARCHAR(50) NOT NULL, -- 'house' | 'condo' | 'land' | 'commercial'
  location VARCHAR(500) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area DECIMAL(10, 2), -- in square meters
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'sold' | 'deleted'
  thumbnail_id UUID REFERENCES media(id) ON DELETE SET NULL,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new', -- 'new' | 'contacted' | 'qualified' | 'negotiating' | 'closed_won' | 'closed_lost'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create properties_images junction table
CREATE TABLE IF NOT EXISTS properties_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  tag VARCHAR(100), -- 'exterior' | 'interior' | 'kitchen' | 'bedroom' | 'bathroom'
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, media_id)
);

-- Create properties_nearby_places table
CREATE TABLE IF NOT EXISTS properties_nearby_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'school' | 'hospital' | 'mall' | 'transport'
  distance DECIMAL(10, 2), -- in kilometers
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create activities table (Audit Log)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'property_created' | 'lead_updated' | 'agent_registered'
  entity_type VARCHAR(50), -- 'property' | 'lead' | 'agent'
  entity_id UUID,
  metadata JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for agents table
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Create indexes for properties table
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);

-- Create indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Create indexes for media table
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_related_id ON media(related_id);

-- Create indexes for properties_images table
CREATE INDEX IF NOT EXISTS idx_properties_images_property_id ON properties_images(property_id);
CREATE INDEX IF NOT EXISTS idx_properties_images_media_id ON properties_images(media_id);

-- Create indexes for properties_nearby_places table
CREATE INDEX IF NOT EXISTS idx_nearby_places_property_id ON properties_nearby_places(property_id);

-- Create indexes for activities table
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
