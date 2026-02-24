# Admin Dashboard Guide

## Overview
The Admin Dashboard (`/admin/dashboard`) is a comprehensive backend management interface designed specifically for system administrators to monitor and manage the entire application.

## Key Features

### 1. System Administration Focus
Unlike the agent dashboard which focuses on property and lead management, the admin dashboard provides:
- Backend system monitoring
- Database health checks
- API server status
- Security monitoring
- System uptime tracking

### 2. Four Main Tabs

#### Overview Tab
**Purpose**: Real-time system monitoring and health status

**Features**:
- System Status Cards:
  - Database (Supabase PostgreSQL) - Connection status
  - API Server (NestJS Backend) - Running status
  - Security (JWT Authentication) - Active status
  - Uptime - 30-day uptime percentage

- Resource Statistics:
  - Total Agents count
  - Active Agents count
  - Total Properties count
  - Total Leads count
  - Agent Activity Rate percentage

- Recent System Activities:
  - Real-time activity log
  - Shows user actions, entity types, and timestamps
  - Fetched from `/api/admin/activities` endpoint

#### Agents Tab
**Purpose**: Complete agent management and administration

**Features**:
- Full agent list with details:
  - Agent name with avatar
  - Email address
  - Role (agent/admin)
  - Status (active/inactive)
  - Verification status
  - Created date

- Actions:
  - Add New Agent button
  - Edit agent details
  - Delete agent (with confirmation)

- Data Source: `/api/agents` endpoint

#### Properties Tab
**Purpose**: Property oversight and management

**Features**:
- Property list with:
  - Property title
  - Price (in Thai Baht)
  - Status (active/pending/sold)
  - View count
  - Agent ID

- Actions:
  - View property details
  - Delete property (with confirmation)

- Data Source: `/api/properties` endpoint

#### Reports Tab
**Purpose**: System reporting and analytics

**Features**:
- Agent Performance Reports
- Property Analytics
- System Logs viewer
- Database Backup management

## Backend API Integration

### Admin Endpoints Used

1. **GET /api/admin/overview**
   - Returns system overview statistics
   - Response: `{ total_agents, total_properties, total_leads, active_agents }`

2. **GET /api/admin/activities?limit=10**
   - Returns recent system activities
   - Response: Array of activity objects

3. **GET /api/agents**
   - Returns all agents
   - Requires admin authentication

4. **GET /api/properties**
   - Returns all properties
   - Requires admin authentication

5. **DELETE /api/agents/:id**
   - Deletes an agent
   - Requires admin authentication

6. **DELETE /api/properties/:id**
   - Deletes a property
   - Requires admin authentication

### Authentication
- All admin endpoints require JWT Bearer token
- User must have `role: 'admin'`
- Token stored in `localStorage.getItem('auth_token')`
- Unauthorized users redirected to `/agent/login`

## Component Architecture

### Main Component
- **File**: `apps/frontend/src/app/[locale]/admin/dashboard/page.tsx`
- **Type**: Client-side component (`"use client"`)
- **State Management**: React hooks (useState, useEffect)

### Sidebar Integration
- Uses controlled mode Sidebar component
- Props: `activeTab`, `onTabChange`, `userRole="admin"`
- Admin-specific menu items

### UI Components
- **StatCard**: System status indicators with color coding
- **ResourceCard**: Resource statistics display
- **Table**: Data tables for agents and properties

## Styling
- Tailwind CSS with dark theme
- Gradient background: `from-slate-950 via-slate-900 to-slate-950`
- Consistent color scheme:
  - Blue: Database/Primary actions
  - Green: Active/Success states
  - Purple: Security features
  - Orange: Performance metrics
  - Red: Delete/Warning actions

## Access Control

### Route Protection
```typescript
useEffect(() => {
    const checkAuth = async () => {
        const currentUser = apiClient.getUser();
        if (!currentUser || currentUser.role !== 'admin') {
            router.push('/agent/login');
            return;
        }
        // Load dashboard data
    };
    checkAuth();
}, [router]);
```

### Role-Based Features
- Only users with `role: 'admin'` can access
- Admin-specific menu items in Sidebar
- Full CRUD operations on agents and properties

## Data Flow

1. **Initial Load**:
   - Check authentication
   - Verify admin role
   - Load overview data
   - Load agents list
   - Load properties list
   - Load recent activities

2. **Tab Navigation**:
   - State-based tab switching
   - Data persists across tabs
   - No page reload

3. **CRUD Operations**:
   - Delete actions with confirmation
   - Optimistic UI updates
   - Error handling with alerts

## Differences from Agent Dashboard

| Feature | Admin Dashboard | Agent Dashboard |
|---------|----------------|-----------------|
| Focus | Backend/System Management | Property & Lead Management |
| Access | Admin role only | Agent role |
| System Monitoring | ✅ Yes | ❌ No |
| Agent Management | ✅ Full CRUD | ❌ No |
| Property Management | ✅ View/Delete all | ✅ Own properties only |
| Lead Management | ❌ No | ✅ Yes |
| Analytics | 📊 System-wide | 📊 Personal |
| Reports | 📄 System reports | 📄 Personal reports |

## Future Enhancements

### Planned Features
1. **System Logs Viewer**
   - Real-time log streaming
   - Filter by severity
   - Search functionality

2. **Database Backup Management**
   - Schedule backups
   - Download backups
   - Restore from backup

3. **Advanced Analytics**
   - System performance graphs
   - Resource usage charts
   - User activity heatmaps

4. **Agent Performance Reports**
   - Detailed metrics
   - Export to PDF/CSV
   - Comparison views

5. **Property Analytics**
   - View trends
   - Popular locations
   - Price analysis

6. **Notification System**
   - System alerts
   - Performance warnings
   - Security notifications

## Testing

### Manual Testing Steps
1. Login as admin user
2. Navigate to `/admin/dashboard`
3. Verify all tabs load correctly
4. Check system status indicators
5. Test agent CRUD operations
6. Test property view/delete
7. Verify authentication guards

### API Testing
```bash
# Test admin overview
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/overview

# Test activities
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/activities?limit=10
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if token is valid
   - Verify token in localStorage
   - Re-login if expired

2. **403 Forbidden**
   - User doesn't have admin role
   - Check user role in database
   - Contact system administrator

3. **Data Not Loading**
   - Check backend is running (port 3001)
   - Verify API endpoints are accessible
   - Check browser console for errors

4. **Redirect to Login**
   - Token expired or invalid
   - User not authenticated
   - Clear localStorage and re-login

## File Structure
```
apps/frontend/src/
├── app/[locale]/admin/dashboard/
│   └── page.tsx                    # Main admin dashboard
├── components/app/
│   ├── Header.tsx                  # Top navigation
│   └── Sidebar.tsx                 # Dual-mode sidebar
└── lib/
    └── api-client.ts               # API client with auth
```

## Related Documentation
- [Backend API Documentation](../../../backend/TEST_API.md)
- [Agent Dashboard Guide](./AGENT_ADMIN_GUIDE.md)
- [Sidebar Component Guide](./DASHBOARD_PAGES_GUIDE.md)
- [Authentication Guide](../../../backend/SETUP_ADMIN.md)
