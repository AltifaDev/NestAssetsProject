# การตั้งค่า Admin User และ Database

## 1. สร้าง Admin User แรก

### วิธีที่ 1: ใช้ SQL ใน Supabase

```sql
-- สร้าง admin user ด้วย bcrypt hashed password
-- Password: admin123 (เปลี่ยนตามต้องการ)
INSERT INTO agents (
  id,
  email,
  password_hash,
  name,
  phone,
  role,
  verified,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@nestofassets.com',
  '$2b$10$rQJ5qKvHKZGXhKZGXhKZGe7YvGXhKZGXhKZGXhKZGXhKZGXhKZGXh', -- admin123
  'System Administrator',
  '+66812345678',
  'admin',
  true,
  'active',
  NOW(),
  NOW()
);
```

### วิธีที่ 2: ใช้ API Register

```bash
# สร้าง admin ผ่าน API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nestofassets.com",
    "password": "admin123",
    "name": "System Administrator",
    "phone": "+66812345678",
    "role": "admin"
  }'
```

## 2. สร้าง Agent Users สำหรับทดสอบ

```sql
-- Agent 1
INSERT INTO agents (
  id,
  email,
  password_hash,
  name,
  phone,
  line_id,
  role,
  bio,
  verified,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'agent1@nestofassets.com',
  '$2b$10$rQJ5qKvHKZGXhKZGXhKZGe7YvGXhKZGXhKZGXhKZGXhKZGXhKZGXh', -- agent123
  'John Smith',
  '+66891234567',
  '@johnsmith',
  'agent',
  'Luxury property specialist in Bangkok',
  true,
  'active',
  NOW(),
  NOW()
);

-- Agent 2
INSERT INTO agents (
  id,
  email,
  password_hash,
  name,
  phone,
  line_id,
  role,
  bio,
  verified,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'agent2@nestofassets.com',
  '$2b$10$rQJ5qKvHKZGXhKZGXhKZGe7YvGXhKZGXhKZGXhKZGXhKZGXhKZGXh', -- agent123
  'Sarah Johnson',
  '+66892345678',
  '@sarahjohnson',
  'agent',
  'Condo and apartment expert',
  true,
  'active',
  NOW(),
  NOW()
);
```

## 3. ตรวจสอบ Database Schema

### agents table
```sql
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  line_id TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'admin')),
  bio TEXT,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
```

### activities table (สำหรับ Admin Dashboard)
```sql
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
```

## 4. ตั้งค่า Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy: Agents can read their own data
CREATE POLICY "Agents can read own data"
  ON agents FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admins can read all agents
CREATE POLICY "Admins can read all agents"
  ON agents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update all agents
CREATE POLICY "Admins can update all agents"
  ON agents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Agents can update their own data (limited fields)
CREATE POLICY "Agents can update own data"
  ON agents FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM agents WHERE id = auth.uid())
  );
```

## 5. สร้าง Functions สำหรับ Admin Dashboard

```sql
-- Function: Get agent performance stats
CREATE OR REPLACE FUNCTION get_agent_performance(agent_uuid UUID)
RETURNS TABLE (
  total_properties BIGINT,
  total_leads BIGINT,
  closed_deals BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT p.id) as total_properties,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT CASE WHEN l.status = 'closed_won' THEN l.id END) as closed_deals,
    CASE
      WHEN COUNT(DISTINCT l.id) > 0 THEN
        ROUND(
          (COUNT(DISTINCT CASE WHEN l.status = 'closed_won' THEN l.id END)::NUMERIC /
          COUNT(DISTINCT l.id)::NUMERIC) * 100,
          2
        )
      ELSE 0
    END as conversion_rate
  FROM agents a
  LEFT JOIN properties p ON p.agent_id = a.id AND p.status != 'deleted'
  LEFT JOIN leads l ON l.agent_id = a.id
  WHERE a.id = agent_uuid
  GROUP BY a.id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get system overview
CREATE OR REPLACE FUNCTION get_system_overview()
RETURNS TABLE (
  total_agents BIGINT,
  active_agents BIGINT,
  total_properties BIGINT,
  total_leads BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT a.id) as total_agents,
    COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) as active_agents,
    COUNT(DISTINCT p.id) as total_properties,
    COUNT(DISTINCT l.id) as total_leads
  FROM agents a
  LEFT JOIN properties p ON p.status != 'deleted'
  LEFT JOIN leads l ON true;
END;
$$ LANGUAGE plpgsql;
```

## 6. ทดสอบการทำงาน

### ทดสอบ Admin Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nestofassets.com",
    "password": "admin123"
  }'
```

### ทดสอบ Admin Dashboard
```bash
# Get system overview
curl -X GET http://localhost:3001/api/admin/overview \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get top agents
curl -X GET http://localhost:3001/api/admin/top-agents?limit=5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get top properties
curl -X GET http://localhost:3001/api/admin/top-properties?limit=5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### ทดสอบ Agent Management
```bash
# Get all agents (Admin only)
curl -X GET http://localhost:3001/api/agents \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create new agent (Admin only)
curl -X POST http://localhost:3001/api/agents \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newagent@example.com",
    "password": "password123",
    "name": "New Agent",
    "phone": "+66893456789",
    "role": "agent"
  }'

# Update agent (Admin only)
curl -X PUT http://localhost:3001/api/agents/AGENT_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "verified": true
  }'
```

## 7. การสร้าง Password Hash

หากต้องการสร้าง password hash ใหม่:

```javascript
// ใช้ใน Node.js
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

hashPassword('your-password');
```

หรือใช้ online tool: https://bcrypt-generator.com/

## 8. Troubleshooting

### ปัญหา: ไม่สามารถ login ได้
```sql
-- ตรวจสอบว่ามี user อยู่
SELECT id, email, role, status FROM agents WHERE email = 'admin@nestofassets.com';

-- ตรวจสอบ password hash
SELECT password_hash FROM agents WHERE email = 'admin@nestofassets.com';
```

### ปัญหา: Permission denied
```sql
-- ตรวจสอบ role
SELECT id, email, role FROM agents WHERE email = 'admin@nestofassets.com';

-- อัพเดท role เป็น admin
UPDATE agents SET role = 'admin' WHERE email = 'admin@nestofassets.com';
```

### ปัญหา: RLS blocking queries
```sql
-- ปิด RLS ชั่วคราวเพื่อทดสอบ
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;

-- เปิด RLS กลับ
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
```

## 9. Default Credentials สำหรับทดสอบ

```
Admin:
Email: admin@nestofassets.com
Password: admin123

Agent 1:
Email: agent1@nestofassets.com
Password: agent123

Agent 2:
Email: agent2@nestofassets.com
Password: agent123
```

**⚠️ สำคัญ: เปลี่ยนรหัสผ่านเหล่านี้ก่อนใช้งานจริง!**
