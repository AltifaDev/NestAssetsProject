# คู่มือการใช้งาน Agent & Admin Dashboard

## ภาพรวม

ระบบนี้มี 3 ประเภทผู้ใช้งาน:
1. **Agent** - เจ้าหน้าที่ขายอสังหาริมทรัพย์
2. **Admin** - ผู้ดูแลระบบ
3. **Investor** - นักลงทุน (ใช้ Dashboard แยกต่างหาก)

## โครงสร้างหน้าเพจ

### Agent Dashboard
- **URL**: `/[locale]/agent/dashboard`
- **หน้าที่สามารถเข้าถึง**:
  - Properties - จัดการประกาศอสังหาริมทรัพย์
  - Leads - จัดการลูกค้าและผู้สนใจ
  - Analytics - ดูสถิติการขาย
  - Profile - แก้ไขข้อมูลส่วนตัว

### Admin Dashboard
- **URL**: `/[locale]/admin/dashboard`
- **หน้าที่สามารถเข้าถึง**:
  - Overview - ภาพรวมระบบ
  - Agents - จัดการเจ้าหน้าที่
  - Properties - จัดการประกาศทั้งหมด
  - Reports - รายงานและสถิติ

## การ Login

### Agent Login
```
URL: /[locale]/agent/login
Email: agent@example.com
Password: [รหัสผ่านที่ตั้งไว้]
```

### Admin Login
```
URL: /[locale]/agent/login (ใช้ URL เดียวกัน)
Email: admin@example.com
Password: [รหัสผ่านที่ตั้งไว้]
Role: admin
```

## API Endpoints ที่ใช้

### Authentication
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/register` - สมัครสมาชิก
- `GET /api/auth/profile` - ดูข้อมูลผู้ใช้

### Agent Management
- `GET /api/agents` - ดูรายการ agents ทั้งหมด (Admin only)
- `GET /api/agents/:id` - ดูข้อมูล agent
- `POST /api/agents` - สร้าง agent ใหม่ (Admin only)
- `PATCH /api/agents/:id` - แก้ไขข้อมูล agent (Admin only)
- `PUT /api/agents/me` - แก้ไขข้อมูลตัวเอง (Agent)
- `DELETE /api/agents/:id` - ลบ agent (Admin only)

### Admin Dashboard
- `GET /api/admin/overview` - ภาพรวมระบบ
- `GET /api/admin/top-agents` - Top performing agents
- `GET /api/admin/top-properties` - Most viewed properties
- `GET /api/admin/activities` - Recent activities
- `GET /api/admin/reports/agent-performance` - Agent performance report

### Properties
- `GET /api/properties` - ดูรายการประกาศ
- `POST /api/properties` - สร้างประกาศใหม่
- `PATCH /api/properties/:id` - แก้ไขประกาศ
- `DELETE /api/properties/:id` - ลบประกาศ

### Media Upload
- `POST /api/media/upload` - อัพโหลดรูปภาพ

## การแก้ไขปัญหาที่พบบ่อย

### 1. ไม่สามารถ Login ได้
- ตรวจสอบว่า Backend ทำงานที่ `http://localhost:3001`
- ตรวจสอบ `.env` และ `.env.local` ว่าตั้งค่าถูกต้อง
- ตรวจสอบว่ามี user ในฐานข้อมูล Supabase

### 2. API ไม่ทำงาน
- ตรวจสอบว่า Backend ใช้ global prefix `/api`
- ตรวจสอบ CORS settings ใน Backend
- ตรวจสอบ JWT token ใน localStorage

### 3. รูปภาพไม่แสดง
- ตรวจสอบว่า Media service ทำงานปกติ
- ตรวจสอบ URL ของรูปภาพว่าถูกต้อง
- ตรวจสอบ CORS สำหรับ media files

### 4. Permission Denied
- ตรวจสอบ role ของ user (agent/admin)
- ตรวจสอบ JWT token ว่ายังไม่หมดอายุ
- ตรวจสอบ Guards และ Decorators ใน Backend

## การตั้งค่า Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
PORT=3001
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:3000
API_PREFIX=api
```

## Database Schema

### agents table
```sql
- id (uuid, primary key)
- email (text, unique)
- password_hash (text)
- name (text)
- phone (text)
- line_id (text)
- role (text: 'agent' | 'admin')
- bio (text)
- verified (boolean)
- status (text: 'active' | 'inactive')
- created_at (timestamp)
- updated_at (timestamp)
```

### properties table
```sql
- id (uuid, primary key)
- agent_id (uuid, foreign key -> agents.id)
- title (text)
- description (text)
- address (text)
- price (numeric)
- bedrooms (integer)
- bathrooms (integer)
- living_area (numeric)
- property_type (text)
- listing_type (text: 'sale' | 'rent')
- status (text: 'active' | 'sold' | 'deleted')
- views_count (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

### leads table
```sql
- id (uuid, primary key)
- agent_id (uuid, foreign key -> agents.id)
- property_id (uuid, foreign key -> properties.id)
- name (text)
- email (text)
- phone (text)
- status (text: 'new' | 'contacted' | 'qualified' | 'closed_won' | 'closed_lost')
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

## การสร้าง Admin User แรก

```sql
-- ใน Supabase SQL Editor
INSERT INTO agents (email, password_hash, name, role, verified, status)
VALUES (
  'admin@example.com',
  '$2b$10$YourHashedPasswordHere', -- ใช้ bcrypt hash
  'Admin User',
  'admin',
  true,
  'active'
);
```

หรือใช้ API:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password",
    "name": "Admin User",
    "role": "admin"
  }'
```

## การทดสอบ

### 1. ทดสอบ Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123"
  }'
```

### 2. ทดสอบ Get Profile
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. ทดสอบ Admin Endpoints
```bash
curl -X GET http://localhost:3001/api/admin/overview \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## Next Steps

1. ✅ สร้างหน้า Agent Dashboard
2. ✅ สร้างหน้า Admin Dashboard
3. ✅ แก้ไข API endpoints ให้ตรงกัน
4. ✅ อัพเดท Sidebar และ Header components
5. 🔄 เพิ่ม Agent Management UI สำหรับ Admin
6. 🔄 เพิ่ม Property Management UI
7. 🔄 เพิ่ม Leads CRM UI
8. 🔄 เพิ่ม Analytics Dashboard
9. 🔄 เพิ่ม Reports Generation

## Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ Console logs ใน Browser
2. ตรวจสอบ Backend logs
3. ตรวจสอบ Supabase logs
4. ตรวจสอบ Network tab ใน DevTools
