# Quick Start Guide - Admin Dashboard

## Access Admin Dashboard

### 1. Start Services
```bash
# Backend (if not running)
cd apps/backend
npm run start:dev

# Frontend (if not running)
cd apps/frontend
npm run dev
```

### 2. Create Admin User

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to Table Editor → agents
3. Click "Insert row"
4. Fill in:
   - name: `Admin User`
   - email: `admin@example.com`
   - password_hash: Use bcrypt to hash your password
   - role: `admin`
   - status: `active`
   - verified: `true`

**Option B: Using SQL**
```sql
-- In Supabase SQL Editor
INSERT INTO agents (name, email, password_hash, role, status, verified)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2b$10$YourBcryptHashedPasswordHere',
  'admin',
  'active',
  true
);
```

**Generate Password Hash** (Node.js):
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('your_password', 10);
console.log(hash);
```

### 3. Login
1. Open browser: `http://localhost:3000/agent/login`
2. Enter admin credentials:
   - Email: `admin@example.com`
   - Password: `your_password`
3. Click "Login"

### 4. Navigate to Admin Dashboard
After login, go to: `http://localhost:3000/admin/dashboard`

## Dashboard Overview

### Overview Tab
- **System Status**: Database, API Server, Security, Uptime
- **Resource Stats**: Agents, Properties, Leads counts
- **Recent Activities**: Latest system actions

### Agents Tab
- View all agents
- Add new agent
- Edit agent details
- Delete agent

### Properties Tab
- View all properties
- View property details
- Delete property

### Reports Tab
- Agent Performance Reports
- Property Analytics
- System Logs
- Database Backup

## Quick Actions

### View System Status
1. Go to Overview tab
2. Check green pulse indicators (online status)
3. Review resource statistics

### Manage Agents
1. Go to Agents tab
2. Click "Add New Agent" to create
3. Click edit icon to modify
4. Click delete icon to remove (with confirmation)

### Manage Properties
1. Go to Properties tab
2. Click eye icon to view details
3. Click delete icon to remove (with confirmation)

### Generate Reports
1. Go to Reports tab
2. Click "Generate Report" on desired report type
3. View or download report

## API Endpoints

All admin endpoints require authentication:

```bash
# Set your token
export TOKEN="your_jwt_token_here"

# System Overview
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/overview

# Recent Activities
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/activities?limit=10

# Top Agents
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/top-agents?limit=5

# Top Properties
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/top-properties?limit=5

# Agent Performance Report
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/reports/agent-performance
```

## Troubleshooting

### Can't Access Dashboard
**Problem**: Redirected to login page
**Solution**: 
- Verify you're logged in
- Check user role is 'admin' in database
- Clear browser cache and re-login

### 401 Unauthorized Error
**Problem**: API calls failing with 401
**Solution**:
- Token expired - re-login
- Check token in localStorage
- Verify Authorization header format

### 403 Forbidden Error
**Problem**: API calls failing with 403
**Solution**:
- User doesn't have admin role
- Update role in database to 'admin'
- Re-login after role change

### Data Not Loading
**Problem**: Empty tables or stats
**Solution**:
- Check backend is running (port 3001)
- Verify database connection
- Check browser console for errors
- Ensure data exists in database

### Backend Not Running
**Problem**: Connection refused errors
**Solution**:
```bash
cd apps/backend
npm run start:dev
```

### Frontend Not Running
**Problem**: Can't access localhost:3000
**Solution**:
```bash
cd apps/frontend
npm run dev
```

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Quick search (if implemented)
- `Esc` - Close modals
- `Tab` - Navigate between tabs

## Security Notes

1. **Admin Access**: Only users with role='admin' can access
2. **Token Expiry**: JWT tokens expire after 24 hours
3. **Password Security**: Always use strong passwords
4. **Audit Logging**: All actions are logged in activities table
5. **IP Tracking**: IP addresses recorded for security

## Best Practices

1. **Regular Monitoring**: Check Overview tab daily
2. **Agent Management**: Review agent list weekly
3. **Property Oversight**: Monitor property status regularly
4. **Activity Review**: Check recent activities for suspicious actions
5. **Backup**: Schedule regular database backups
6. **Updates**: Keep system and dependencies updated

## Support

For issues or questions:
1. Check documentation in `/apps/frontend/ADMIN_DASHBOARD_GUIDE.md`
2. Review API testing guide in `/apps/backend/TEST_ADMIN_ENDPOINTS.md`
3. Check backend logs for errors
4. Review browser console for frontend errors

## URLs Reference

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Agent Login**: http://localhost:3000/agent/login
- **Supabase Dashboard**: https://app.supabase.com

## Status Check

Verify everything is working:

```bash
# Check backend
curl http://localhost:3001/api/health

# Check if admin user exists
# (In Supabase SQL Editor)
SELECT id, name, email, role FROM agents WHERE role = 'admin';

# Check activities table
SELECT COUNT(*) FROM activities;
```

---

**Quick Start Complete!** 🎉

You're now ready to use the Admin Dashboard for backend management.
