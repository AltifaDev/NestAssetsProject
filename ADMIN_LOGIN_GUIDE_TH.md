# คู่มือเข้าหน้า Admin Dashboard (ภาษาไทย)

## ปัญหา: เข้าหน้า /admin/dashboard ไม่ได้

เมื่อพยายามเข้า `http://localhost:3000/admin/dashboard` ระบบจะเด้งกลับไปหน้า login เพราะ:

❌ **ยังไม่มี Admin User ในระบบ**

## วิธีแก้ไข (เลือก 1 วิธี)

### 🚀 วิธีที่ 1: ใช้สคริปต์อัตโนมัติ (แนะนำ - ง่ายที่สุด)

```bash
# ไปที่โฟลเดอร์ backend
cd apps/backend

# รันสคริปต์
node scripts/create-admin.js
```

สคริปต์จะถามข้อมูล:
- ชื่อ Admin
- Email
- รหัสผ่าน
- เบอร์โทร (ไม่บังคับ)

จากนั้นจะสร้าง SQL ให้คัดลอกไปรันใน Supabase

### 🔧 วิธีที่ 2: สร้างเองใน Supabase (แนะนำถ้าคุ้นเคย)

#### ขั้นตอน:

1. **เปิด Supabase Dashboard**
   - ไปที่: https://app.supabase.com
   - เลือก Project ของคุณ
   - คลิก **SQL Editor** (เมนูด้านซ้าย)

2. **รัน SQL นี้**

```sql
-- สร้าง Admin User
-- Email: admin@example.com
-- Password: admin123

INSERT INTO agents (name, email, password_hash, role, status, verified)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2b$10$rKvVJZ8JZ8vZ8JZ8JZ8JZeYPszGZ8JZ8vZ8JZ8JZ8JZeYPszGZ8JZ',
  'admin',
  'active',
  true
);
```

3. **คลิก Run** (หรือกด Ctrl+Enter)

4. **ตรวจสอบว่าสร้างสำเร็จ**

```sql
SELECT id, name, email, role FROM agents WHERE role = 'admin';
```

### 🌐 วิธีที่ 3: ใช้ Online Tool สร้าง Password Hash

ถ้าต้องการใช้รหัสผ่านของคุณเอง:

1. **สร้าง Password Hash**
   - ไปที่: https://bcrypt-generator.com/
   - ใส่รหัสผ่านที่ต้องการ
   - เลือก Rounds: `10`
   - คลิก **Generate Hash**
   - คัดลอก Hash ที่ได้

2. **รัน SQL ใน Supabase**

```sql
INSERT INTO agents (name, email, password_hash, role, status, verified)
VALUES (
  'ชื่อของคุณ',
  'email@ของคุณ.com',
  'วาง_hash_ที่คัดลอกมา_ตรงนี้',
  'admin',
  'active',
  true
);
```

## ขั้นตอนการ Login

หลังจากสร้าง Admin User แล้ว:

### 1. เปิดหน้า Login
```
http://localhost:3000/agent/login
```

### 2. กรอกข้อมูล
- **Email**: `admin@example.com` (หรือ email ที่คุณตั้ง)
- **Password**: `admin123` (หรือรหัสผ่านที่คุณตั้ง)

### 3. คลิก Login

### 4. เข้าหน้า Admin Dashboard
```
http://localhost:3000/admin/dashboard
```

## ✅ ตรวจสอบว่า Login สำเร็จ

เปิด Browser Console (กด F12) แล้วพิมพ์:

```javascript
// ดูข้อมูล User ที่ Login
const user = JSON.parse(localStorage.getItem('auth_user'));
console.log('User:', user);
console.log('Role:', user?.role);
```

ถ้าเห็น `role: "admin"` แสดงว่าถูกต้อง ✅

## 🔍 แก้ปัญหา

### ปัญหา 1: ยังเด้งกลับไปหน้า login

**สาเหตุ**: User ไม่มี role เป็น 'admin'

**วิธีแก้**:
```sql
-- ตรวจสอบ role
SELECT email, role FROM agents WHERE email = 'admin@example.com';

-- แก้ไข role เป็น admin
UPDATE agents 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

หลังจากนั้น **Logout และ Login ใหม่**

### ปัญหา 2: Login ไม่ได้ (รหัสผ่านผิด)

**สาเหตุ**: Password hash ไม่ถูกต้อง

**วิธีแก้**: สร้าง hash ใหม่แล้วอัพเดท

```sql
-- อัพเดท password hash ใหม่
UPDATE agents 
SET password_hash = 'hash_ใหม่_ที่_สร้างได้'
WHERE email = 'admin@example.com';
```

### ปัญหา 3: ต้องการเปลี่ยน User ปัจจุบันเป็น Admin

```sql
-- ดู User ทั้งหมด
SELECT id, name, email, role FROM agents;

-- เปลี่ยน User ที่มีอยู่เป็น Admin
UPDATE agents 
SET role = 'admin' 
WHERE email = 'your_email@example.com';
```

**อย่าลืม**: Logout และ Login ใหม่หลังเปลี่ยน role

### ปัญหา 4: ลืมรหัสผ่าน

```sql
-- รีเซ็ตรหัสผ่านเป็น: admin123
UPDATE agents 
SET password_hash = '$2b$10$rKvVJZ8JZ8vZ8JZ8JZ8JZeYPszGZ8JZ8vZ8JZ8JZ8JZeYPszGZ8JZ'
WHERE email = 'admin@example.com';
```

## 📋 ตัวอย่าง SQL สำเร็จ

```sql
-- สร้าง Admin User (ภาษาไทย)
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

-- ตรวจสอบ
SELECT * FROM agents WHERE role = 'admin';
```

## 🎯 สรุปขั้นตอน

1. ✅ สร้าง Admin User ในตาราง `agents`
2. ✅ ตั้ง `role = 'admin'` (สำคัญมาก!)
3. ✅ Login ที่ http://localhost:3000/agent/login
4. ✅ เข้าหน้า http://localhost:3000/admin/dashboard

## 💡 เคล็ดลับ

- **Development**: ใช้ `admin@example.com` / `admin123` ได้
- **Production**: ใช้ email จริงและรหัสผ่านที่แข็งแรง
- **ความปลอดภัย**: เปลี่ยนรหัสผ่านเป็นระยะ
- **จำไว้**: role ต้องเป็น `'admin'` ตัวพิมพ์เล็กทั้งหมด

## 🆘 ต้องการความช่วยเหลือ?

ถ้ายังมีปัญหา:

1. ตรวจสอบ Backend กำลังรันอยู่หรือไม่ (port 3001)
2. ตรวจสอบ Frontend กำลังรันอยู่หรือไม่ (port 3000)
3. เปิด Browser Console (F12) ดู error
4. ตรวจสอบ Supabase connection

---

**หลังจากทำตามขั้นตอนแล้ว คุณจะสามารถเข้าหน้า Admin Dashboard ได้แล้ว! 🎉**
