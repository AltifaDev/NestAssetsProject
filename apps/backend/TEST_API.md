# การทดสอบ API Endpoints

## ปัญหาที่พบ

จาก error logs:
```
[Nest] 45773  - 02/24/2026, 12:17:40 PM   ERROR [GlobalExceptionFilter] GET /properties - Status: 404
[Nest] 45773  - 02/24/2026, 12:18:36 PM   ERROR [GlobalExceptionFilter] POST /auth/login - Status: 404
```

**สาเหตุ**: Frontend เรียก API โดยไม่มี prefix `/api`

## การแก้ไข

✅ แก้ไข `apps/frontend/src/lib/api-client.ts` ให้ใช้ prefix `/api` ทั้งหมด:
- `/auth/login` → `/api/auth/login`
- `/properties` → `/api/properties`
- `/media/upload` → `/api/media/upload`

## การทดสอบ API

### 1. ตรวจสอบว่า Backend ทำงาน

```bash
# ตรวจสอบว่า Backend กำลังทำงาน
curl http://localhost:3001/api/health

# ควรได้ response:
# {"status":"ok","timestamp":"..."}
```

### 2. ทดสอบ Login

```bash
# ทดสอบ login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nestofassets.com",
    "password": "admin123"
  }'

# ควรได้ response:
# {
#   "access_token": "eyJhbGc...",
#   "user": {
#     "id": "...",
#     "email": "admin@nestofassets.com",
#     "name": "System Administrator",
#     "role": "admin"
#   }
# }
```

### 3. ทดสอบ Get Properties (ต้องมี token)

```bash
# เก็บ token จาก login response
TOKEN="your_access_token_here"

# ทดสอบ get properties
curl -X GET http://localhost:3001/api/properties \
  -H "Authorization: Bearer $TOKEN"

# ควรได้ response:
# [
#   {
#     "id": "...",
#     "title": "...",
#     "price": 5000000,
#     ...
#   }
# ]
```

### 4. ทดสอบ Admin Endpoints

```bash
# ต้องใช้ admin token
ADMIN_TOKEN="your_admin_token_here"

# Get system overview
curl -X GET http://localhost:3001/api/admin/overview \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get top agents
curl -X GET http://localhost:3001/api/admin/top-agents?limit=5 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get top properties
curl -X GET http://localhost:3001/api/admin/top-properties?limit=5 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Swagger Documentation

เปิด Swagger UI เพื่อดู API documentation และทดสอบ:

```
http://localhost:3001/api/docs
```

## ตรวจสอบ Routes ที่ Backend รองรับ

Backend ควรมี routes ดังนี้:

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Agents
- `GET /api/agents` (Admin only)
- `POST /api/agents` (Admin only)
- `GET /api/agents/me`
- `PUT /api/agents/me`
- `GET /api/agents/:id`
- `PUT /api/agents/:id` (Admin only)
- `DELETE /api/agents/:id` (Admin only)

### Properties
- `GET /api/properties`
- `POST /api/properties`
- `GET /api/properties/:id`
- `PUT /api/properties/:id`
- `DELETE /api/properties/:id`

### Admin
- `GET /api/admin/overview`
- `GET /api/admin/top-agents`
- `GET /api/admin/top-properties`
- `GET /api/admin/activities`
- `GET /api/admin/reports/agent-performance`

### Media
- `POST /api/media/upload`

### Health
- `GET /api/health`

## การแก้ปัญหา

### ปัญหา: 404 Not Found

**สาเหตุที่เป็นไปได้**:
1. Backend ไม่ได้ทำงาน
2. Port ไม่ถูกต้อง (ควรเป็น 3001)
3. API prefix ไม่ถูกต้อง
4. Route ไม่ได้ register ใน module

**วิธีแก้**:
```bash
# 1. ตรวจสอบว่า Backend ทำงาน
ps aux | grep nest

# 2. ตรวจสอบ port
netstat -an | grep 3001

# 3. Restart Backend
cd apps/backend
npm run start:dev

# 4. ตรวจสอบ logs
tail -f apps/backend/logs/app.log
```

### ปัญหา: 401 Unauthorized

**สาเหตุ**: Token หมดอายุหรือไม่ถูกต้อง

**วิธีแก้**:
1. Login ใหม่เพื่อรับ token ใหม่
2. ตรวจสอบว่า token ถูกส่งใน header
3. ตรวจสอบ JWT_SECRET ใน .env

### ปัญหา: 403 Forbidden

**สาเหตุ**: User ไม่มีสิทธิ์เข้าถึง endpoint

**วิธีแก้**:
1. ตรวจสอบ role ของ user (agent/admin)
2. ตรวจสอบว่า endpoint ต้องการ role อะไร
3. ใช้ admin account สำหรับ admin endpoints

### ปัญหา: CORS Error

**สาเหตุ**: Backend ไม่อนุญาตให้ Frontend เรียก API

**วิธีแก้**:
```env
# ใน apps/backend/.env
CORS_ORIGIN=http://localhost:3000
```

## ตัวอย่างการใช้งานใน Frontend

```typescript
import { apiClient } from '@/lib/api-client';

// Login
const loginUser = async () => {
  try {
    const response = await apiClient.login('admin@example.com', 'admin123');
    console.log('Login success:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Get Properties
const getProperties = async () => {
  try {
    const response = await apiClient.getProperties();
    console.log('Properties:', response.docs);
  } catch (error) {
    console.error('Failed to get properties:', error);
  }
};

// Get Profile
const getProfile = async () => {
  try {
    const profile = await apiClient.getProfile();
    console.log('Profile:', profile);
  } catch (error) {
    console.error('Failed to get profile:', error);
  }
};
```

## สรุป

✅ แก้ไข API client ให้ใช้ prefix `/api` แล้ว
✅ ตรวจสอบ Backend routes แล้ว
✅ สร้างคู่มือทดสอบ API

**Next Steps**:
1. Restart Frontend (`npm run dev`)
2. ทดสอบ login ใหม่
3. ตรวจสอบ Network tab ใน DevTools
4. ตรวจสอบว่า API calls ใช้ `/api` prefix แล้ว
