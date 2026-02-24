# วิธีสร้าง Admin User เพื่อเข้าหน้า /admin/dashboard

## ปัญหา
เมื่อพยายามเข้าหน้า `/admin/dashboard` ระบบจะเด้งกลับไปหน้า login เพราะ:
- ยังไม่ได้ Login หรือ
- User ที่ Login ไม่มี `role = 'admin'`

## วิธีแก้ไข

### ขั้นตอนที่ 1: เข้า Supabase Dashboard

1. เปิดเบราว์เซอร์ไปที่: https://app.supabase.com
2. เลือก Project ของคุณ
3. ไปที่เมนู **Table Editor** (ด้านซ้าย)
4. เลือกตาราง **agents**

### ขั้นตอนที่ 2: สร้าง Admin User

#### วิธีที่ 1: ใช้ UI (ง่ายที่สุด)

1. คลิกปุ่ม **Insert row** (มุมบนขวา)
2. กรอกข้อมูลดังนี้:

```
name:          Admin User
email:         admin@example.com
password_hash: (ดูวิธีสร้างด้านล่าง)
role:          admin          ⚠️ สำคัญมาก!
status:        active
verified:      true
phone:         (ไม่บังคับ)
line_id:       (ไม่บังคับ)
bio:           (ไม่บังคับ)
```

3. คลิก **Save**

#### วิธีที่ 2: ใช้ SQL Editor (แนะนำ)

1. ไปที่เมนู **SQL Editor** (ด้านซ้าย)
2. คลิก **New query**
3. วางโค้ดนี้:

```sql
-- สร้าง Admin User
-- รหัสผ่าน: admin123
INSERT INTO agents (name, email, password_hash, role, status, verified)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2b$10$YPszGZ8JZ8vZ8JZ8JZ8JZeYPszGZ8JZ8vZ8JZ8JZ8JZeYPszGZ8JZ',
  'admin',
  'active',
  true
);
```

4. คลิก **Run** (หรือกด Ctrl+Enter)

### ขั้นตอนที่ 3: สร้าง Password Hash

เนื่องจากรหัสผ่านต้องเข้ารหัสด้วย bcrypt ให้ทำตามนี้:

#### วิธีที่ 1: ใช้ Online Tool (ง่ายที่สุด)

1. ไปที่: https://bcrypt-generator.com/
2. ใส่รหัสผ่านที่ต้องการ เช่น `admin123`
3. เลือก Rounds: `10`
4. คลิก **Generate Hash**
5. คัดลอก Hash ที่ได้มาใส่ในช่อง `password_hash`

#### วิธีที่ 2: ใช้ Node.js

```bash
# ติดตั้ง bcrypt
npm install bcrypt

# สร้างไฟล์ hash-password.js
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

คัดลอก Hash ที่ได้มาใช้

#### วิธีที่ 3: ใช้ Backend API (แนะนำ)

ถ้ามี endpoint สำหรับ register:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**หมายเหตุ**: ต้องแก้ไข role เป็น 'admin' ในฐานข้อมูลหลังจาก register

### ขั้นตอนที่ 4: ตรวจสอบว่าสร้างสำเร็จ

ใน Supabase SQL Editor รันคำสั่ง:

```sql
SELECT id, name, email, role, status, verified 
FROM agents 
WHERE role = 'admin';
```

ควรเห็นข้อมูล Admin User ที่สร้างไว้

### ขั้นตอนที่ 5: Login เป็น Admin

1. เปิดเบราว์เซอร์ไปที่: http://localhost:3000/agent/login
2. กรอกข้อมูล:
   - Email: `admin@example.com`
   - Password: `admin123` (หรือรหัสผ่านที่คุณตั้งไว้)
3. คลิก **Login**

### ขั้นตอนที่ 6: เข้าหน้า Admin Dashboard

หลังจาก Login สำเร็จ:

1. พิมพ์ URL: http://localhost:3000/admin/dashboard
2. หรือแก้ไข URL จาก `/agent/dashboard` เป็น `/admin/dashboard`

ตอนนี้คุณควรเห็นหน้า Admin Dashboard แล้ว! 🎉

## ตรวจสอบปัญหา

### ปัญหา 1: ยังเด้งกลับไปหน้า login

**สาเหตุ**: Role ไม่ใช่ 'admin'

**วิธีแก้**:
```sql
-- ตรวจสอบ role ของ user
SELECT email, role FROM agents WHERE email = 'admin@example.com';

-- ถ้า role ไม่ใช่ 'admin' ให้แก้ไข
UPDATE agents 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### ปัญหา 2: Login ไม่ได้

**สาเหตุ**: Password hash ไม่ถูกต้อง

**วิธีแก้**: สร้าง hash ใหม่ด้วยวิธีที่ 1 หรือ 2 ข้างบน แล้วอัพเดท:

```sql
UPDATE agents 
SET password_hash = 'hash_ใหม่_ที่_สร้างได้'
WHERE email = 'admin@example.com';
```

### ปัญหา 3: ตรวจสอบว่า Login แล้วหรือยัง

เปิด Browser Console (F12) แล้วพิมพ์:

```javascript
// ดู Token
console.log(localStorage.getItem('auth_token'));

// ดูข้อมูล User
console.log(JSON.parse(localStorage.getItem('auth_user')));
```

ถ้าเห็น `role: "admin"` แสดงว่าถูกต้อง

### ปัญหา 4: ต้องการเปลี่ยน User ปัจจุบันเป็น Admin

```sql
-- ดู User ทั้งหมด
SELECT id, name, email, role FROM agents;

-- เปลี่ยน role เป็น admin
UPDATE agents 
SET role = 'admin' 
WHERE email = 'your_email@example.com';
```

หลังจากนั้น Logout และ Login ใหม่

## ตัวอย่าง SQL สำเร็จ

```sql
-- สร้าง Admin User พร้อม password: admin123
INSERT INTO agents (name, email, password_hash, role, status, verified, phone)
VALUES (
  'ผู้ดูแลระบบ',
  'admin@nestofassets.com',
  '$2b$10$rKvVJZ8JZ8vZ8JZ8JZ8JZeYPszGZ8JZ8vZ8JZ8JZ8JZeYPszGZ8JZ',
  'admin',
  'active',
  true,
  '0812345678'
);

-- ตรวจสอบว่าสร้างสำเร็จ
SELECT * FROM agents WHERE role = 'admin';
```

## เคล็ดลับ

1. **ใช้ Email ที่จำง่าย**: เช่น `admin@example.com` หรือ `admin@nestofassets.com`
2. **ใช้รหัสผ่านที่จำง่าย**: สำหรับ development ใช้ `admin123` ได้
3. **เก็บข้อมูล Login**: จดไว้ในที่ปลอดภัย
4. **Production**: ใช้รหัสผ่านที่แข็งแรงและเปลี่ยนเป็นระยะ

## สรุป

1. ✅ สร้าง Admin User ในตาราง `agents` ด้วย `role = 'admin'`
2. ✅ สร้าง Password Hash ด้วย bcrypt
3. ✅ Login ที่ http://localhost:3000/agent/login
4. ✅ เข้าหน้า http://localhost:3000/admin/dashboard

ตอนนี้คุณสามารถเข้าหน้า Admin Dashboard ได้แล้ว! 🎉
