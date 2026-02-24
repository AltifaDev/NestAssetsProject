# 🔧 คู่มือแก้ไขปัญหา 404 Not Found

## ปัญหาที่พบ

```
[Nest] ERROR [GlobalExceptionFilter] GET /properties - Status: 404
[Nest] ERROR [GlobalExceptionFilter] POST /auth/login - Status: 404
```

## ✅ สิ่งที่แก้ไขแล้ว

### 1. แก้ไข API Client
ไฟล์: `apps/frontend/src/lib/api-client.ts`

เปลี่ยนจาก:
```typescript
await this.request('/auth/login', ...)      // ❌ ผิด
await this.request('/properties', ...)      // ❌ ผิด
```

เป็น:
```typescript
await this.request('/api/auth/login', ...)  // ✅ ถูกต้อง
await this.request('/api/properties', ...)  // ✅ ถูกต้อง
```

### 2. Endpoints ที่แก้ไขแล้ว

- ✅ `/auth/login` → `/api/auth/login`
- ✅ `/auth/profile` → `/api/auth/profile`
- ✅ `/properties` → `/api/properties`
- ✅ `/properties/:id` → `/api/properties/:id`
- ✅ `/properties/:id/increment-views` → `/api/properties/:id/increment-views`
- ✅ `/media/upload` → `/api/media/upload`

## 🚀 วิธีทดสอบ

### Step 1: Restart Frontend

```bash
# หยุด Frontend (Ctrl+C)
# จากนั้นเริ่มใหม่
cd apps/frontend
npm run dev
```

### Step 2: ตรวจสอบ Backend

```bash
# ตรวจสอบว่า Backend ทำงานอยู่
curl http://localhost:3001/api/health

# ถ้าไม่ทำงาน ให้เริ่ม Backend
cd apps/backend
npm run start:dev
```

### Step 3: ทดสอบ Login

เปิด Browser และไปที่:
```
http://localhost:3000/th/agent/login
```

ใส่ข้อมูล:
- Email: `admin@nestofassets.com`
- Password: `admin123`

### Step 4: ตรวจสอบ Network Tab

1. เปิด DevTools (F12)
2. ไปที่ tab "Network"
3. กด Login
4. ดู request ที่ส่งไป ควรเป็น:
   ```
   POST http://localhost:3001/api/auth/login
   ```
   ไม่ใช่:
   ```
   POST http://localhost:3001/auth/login  ❌
   ```

## 🔍 การตรวจสอบเพิ่มเติม

### ตรวจสอบว่า Backend ทำงาน

```bash
# วิธีที่ 1: ตรวจสอบ process
ps aux | grep node | grep nest

# วิธีที่ 2: ตรวจสอบ port
lsof -i :3001

# วิธีที่ 3: ทดสอบ API
curl http://localhost:3001/api/health
```

### ตรวจสอบ Environment Variables

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend** (`apps/backend/.env`):
```env
PORT=3001
API_PREFIX=api
CORS_ORIGIN=http://localhost:3000
```

### ตรวจสอบ Swagger Documentation

เปิด browser:
```
http://localhost:3001/api/docs
```

ควรเห็น API documentation พร้อม endpoints ทั้งหมด

## 📝 Checklist

- [ ] แก้ไข `api-client.ts` แล้ว (ทำแล้ว ✅)
- [ ] Restart Frontend
- [ ] ตรวจสอบ Backend ทำงาน
- [ ] ทดสอบ Login
- [ ] ตรวจสอบ Network tab
- [ ] ตรวจสอบว่าไม่มี error 404

## 🎯 Expected Results

หลังจากแก้ไขแล้ว:

### ✅ Login สำเร็จ
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@nestofassets.com",
    "name": "System Administrator",
    "role": "admin"
  }
}
```

### ✅ Get Properties สำเร็จ
```json
[
  {
    "id": "uuid",
    "title": "Luxury Condo in Sukhumvit",
    "price": 5000000,
    "bedrooms": 2,
    "bathrooms": 2,
    ...
  }
]
```

### ✅ ไม่มี Error 404
Console ไม่ควรมี error:
```
❌ GET /properties - Status: 404
❌ POST /auth/login - Status: 404
```

## 🆘 ถ้ายังมีปัญหา

### ปัญหา: ยังได้ 404 อยู่

1. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete
   - เลือก "Cached images and files"
   - Clear data

2. **Hard refresh**:
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

3. **ตรวจสอบว่าใช้ไฟล์ที่แก้ไขแล้ว**:
   ```bash
   # ใน apps/frontend/src/lib/api-client.ts
   grep "'/api/auth/login'" apps/frontend/src/lib/api-client.ts
   # ควรเจอบรรทัดที่มี '/api/auth/login'
   ```

### ปัญหา: Backend ไม่ทำงาน

```bash
# Kill process ที่ใช้ port 3001
lsof -ti:3001 | xargs kill -9

# เริ่ม Backend ใหม่
cd apps/backend
npm run start:dev
```

### ปัญหา: CORS Error

ตรวจสอบ `apps/backend/.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

และ restart Backend

## 📞 Support

หากยังมีปัญหา ให้ตรวจสอบ:

1. **Backend logs**:
   ```bash
   cd apps/backend
   npm run start:dev
   # ดู logs ที่แสดง
   ```

2. **Frontend console**:
   - เปิด DevTools (F12)
   - ดู Console tab
   - ดู Network tab

3. **Database connection**:
   - ตรวจสอบ Supabase URL และ Key
   - ตรวจสอบว่าเชื่อมต่อได้

## ✨ สรุป

การแก้ไขหลัก:
1. ✅ เพิ่ม `/api` prefix ใน API client
2. ✅ สร้างคู่มือทดสอบ
3. 🔄 Restart Frontend เพื่อใช้โค้ดใหม่

หลังจาก restart Frontend แล้ว ระบบควรทำงานได้ปกติ! 🎉
