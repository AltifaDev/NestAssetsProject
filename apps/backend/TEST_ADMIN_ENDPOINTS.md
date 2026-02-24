# Admin Endpoints Testing Guide

## Prerequisites
1. Backend server running on port 3001
2. Admin user created in database
3. Valid JWT token with admin role

## Create Admin User

### Option 1: Using Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to Table Editor → agents
3. Create new row:
   ```
   name: Admin User
   email: admin@example.com
   password_hash: (use bcrypt to hash password)
   role: admin
   status: active
   verified: true
   ```

### Option 2: Using SQL
```sql
-- Insert admin user (password: admin123)
INSERT INTO agents (name, email, password_hash, role, status, verified)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2b$10$YourHashedPasswordHere',
  'admin',
  'active',
  true
);
```

## Get Admin Token

### 1. Login as Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### 2. Save Token
```bash
export ADMIN_TOKEN="your_access_token_here"
```

## Test Admin Endpoints

### 1. System Overview
```bash
curl -X GET http://localhost:3001/api/admin/overview \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected Response:
```json
{
  "total_agents": 5,
  "total_properties": 12,
  "total_leads": 8,
  "active_agents": 4
}
```

### 2. Top Performing Agents
```bash
curl -X GET "http://localhost:3001/api/admin/top-agents?limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected Response:
```json
[
  {
    "id": "uuid",
    "name": "Agent Name",
    "closed_deals": 5,
    "total_properties": 10,
    "conversion_rate": 50.0
  }
]
```

### 3. Most Viewed Properties
```bash
curl -X GET "http://localhost:3001/api/admin/top-properties?limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected Response:
```json
[
  {
    "id": "uuid",
    "title": "Luxury Condo in Bangkok",
    "views": 150,
    "agent_name": "Agent Name",
    "price": 5000000
  }
]
```

### 4. Recent Activities
```bash
curl -X GET "http://localhost:3001/api/admin/activities?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected Response:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "action": "property_created",
    "entity_type": "property",
    "entity_id": "uuid",
    "metadata": {},
    "ip_address": "127.0.0.1",
    "created_at": "2024-02-24T12:00:00Z"
  }
]
```

### 5. Agent Performance Report
```bash
curl -X GET http://localhost:3001/api/admin/reports/agent-performance \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Expected Response:
```json
[
  {
    "agent_id": "uuid",
    "agent_name": "Agent Name",
    "total_properties": 10,
    "active_properties": 8,
    "total_leads": 15,
    "closed_deals": 5,
    "conversion_rate": 33.33,
    "total_views": 500,
    "avg_views_per_property": 50
  }
]
```

## Test Authorization

### 1. Test Without Token (Should Fail)
```bash
curl -X GET http://localhost:3001/api/admin/overview
```

Expected Response:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 2. Test With Agent Token (Should Fail)
```bash
# Login as regular agent
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123"
  }'

# Try to access admin endpoint
curl -X GET http://localhost:3001/api/admin/overview \
  -H "Authorization: Bearer $AGENT_TOKEN"
```

Expected Response:
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

## Frontend Integration Testing

### 1. Open Admin Dashboard
```
http://localhost:3000/admin/dashboard
```

### 2. Check Browser Console
- Should see successful API calls
- No 401/403 errors
- Data loading correctly

### 3. Test Each Tab
- **Overview**: System stats and activities load
- **Agents**: Agent list displays with actions
- **Properties**: Property list displays with actions
- **Reports**: Report cards display

### 4. Test Actions
- Click "Add New Agent" button
- Click "Edit" on an agent
- Click "Delete" on an agent (with confirmation)
- Click "View" on a property
- Click "Delete" on a property (with confirmation)

## Common Issues

### Issue 1: 401 Unauthorized
**Cause**: Token expired or invalid
**Solution**: 
- Re-login to get new token
- Check token format in Authorization header
- Verify token is stored in localStorage

### Issue 2: 403 Forbidden
**Cause**: User doesn't have admin role
**Solution**:
- Check user role in database
- Update role to 'admin' if needed
- Re-login after role change

### Issue 3: 404 Not Found
**Cause**: Endpoint doesn't exist or wrong URL
**Solution**:
- Verify backend is running on port 3001
- Check API prefix is `/api`
- Verify route in admin.controller.ts

### Issue 4: Empty Data
**Cause**: No data in database
**Solution**:
- Create test agents
- Create test properties
- Create test leads
- Check database connection

## Database Setup

### Create Activities Table
```sql
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES agents(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
```

### Sample Data
```sql
-- Insert sample activities
INSERT INTO activities (user_id, action, entity_type, entity_id, metadata)
SELECT 
  a.id,
  'property_created',
  'property',
  p.id,
  jsonb_build_object('property_title', p.title)
FROM agents a
CROSS JOIN properties p
LIMIT 10;
```

## Monitoring

### Check Backend Logs
```bash
# In backend directory
npm run start:dev
```

Look for:
- `[AdminController] GET /admin/overview`
- `[AdminService] Fetching system overview`
- Any error messages

### Check Database Queries
Enable query logging in Supabase:
1. Go to Supabase Dashboard
2. Navigate to Database → Query Performance
3. Monitor slow queries

## Performance Tips

1. **Add Indexes**
   - agents(status)
   - properties(status)
   - properties(views_count)
   - leads(status)
   - activities(created_at)

2. **Cache Results**
   - Use Redis for system overview
   - Cache for 5 minutes
   - Invalidate on data changes

3. **Optimize Queries**
   - Use COUNT(*) with filters
   - Avoid N+1 queries
   - Use database views for complex reports

## Next Steps

1. ✅ Admin endpoints working
2. ✅ Frontend integration complete
3. ✅ Authorization guards in place
4. 🔄 Add caching layer
5. 🔄 Add real-time updates
6. 🔄 Add export functionality
7. 🔄 Add advanced filtering
8. 🔄 Add pagination
