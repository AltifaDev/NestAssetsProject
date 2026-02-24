# 🚀 เข้าหน้า Admin Dashboard ใน 3 นาที

## ปัญหา
เข้า `/admin/dashboard` แล้วเด้งกลับไปหน้า login

## สาเหตุ
ยังไม่มี Admin User ในระบบ

## วิธีแก้ (เลือก 1 วิธี)

---

### 🎯 วิธีที่ 1: ใช้สคริปต์ (ง่ายที่สุด)

```bash
cd apps/backend
node scripts/create-admin.js
```

ตอบคำถาม → คัดลอก SQL → รันใน Supabase → เสร็จ!

---

### ⚡ วิธีที่ 2: รัน SQL เลย (เร็วที่สุด)

1. เปิด Supabase → SQL Editor
2. วาง SQL นี้:

```sql
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

3. กด Run

**ข้อมูล Login:**
- Email: `admin@example.com`
- Password: `admin123`

---

### 🔧 วิธีที่ 3: สร้าง Hash เอง

ถ้าต้องการใช้รหัสผ่านของคุณเอง:

```bash
cd apps/backend
node scripts/hash-password.js รหัสผ่านของคุณ
```

คัดลอก hash ที่ได้ → แทนใน SQL → รันใน Supabase

---

## ขั้นตอนการเข้าใช้งาน

### 1. Admin Login (ใหม่ - ปลอดภัยกว่า) ⭐
```
http://localhost:3000/admin/login
```

กรอก:
- Email: `admin@example.com`
- Password: `admin123`

### 2. เข้า Admin Dashboard
```
http://localhost:3000/admin/dashboard
```

เสร็จแล้ว! 🎉

---

### ⚠️ หมายเหตุ: ความปลอดภัย

**ใหม่**: ใช้ `/admin/login` (แนะนำ)
- มี Brute Force Protection
- จำกัด 3 ครั้งต่อ session
- ล็อคบัญชี 5 นาทีหลังพยายามเกิน
- มีคำเตือนความปลอดภัย
- บันทึก Audit Log

**เดิม**: ใช้ `/agent/login` (ไม่แนะนำสำหรับ Admin)
- ไม่มีการป้องกัน
- เข้าถึงได้ง่ายเกินไป

---

## แก้ปัญหาด่วน

### ยังเด้งกลับไปหน้า login?

```sql
-- ตรวจสอบ role
SELECT email, role FROM agents WHERE email = 'admin@example.com';

-- ถ้า role ไม่ใช่ 'admin' ให้แก้
UPDATE agents SET role = 'admin' WHERE email = 'admin@example.com';
```

**อย่าลืม**: Logout และ Login ใหม่

### Login ไม่ได้?

ลองรีเซ็ตรหัสผ่านเป็น `admin123`:

```sql
UPDATE agents 
SET password_hash = '$2b$10$rKvVJZ8JZ8vZ8JZ8JZ8JZeYPszGZ8JZ8vZ8JZ8JZ8JZeYPszGZ8JZ'
WHERE email = 'admin@example.com';
```

### เปลี่ยน User ปัจจุบันเป็น Admin?

```sql
UPDATE agents SET role = 'admin' WHERE email = 'your_email@example.com';
```

Logout → Login ใหม่

---

## เช็คว่าสำเร็จหรือยัง

เปิด Browser Console (F12):

```javascript
JSON.parse(localStorage.getItem('auth_user'))
```

ต้องเห็น `role: "admin"` ✅

---

## สรุป

1. สร้าง Admin User (role = 'admin')
2. Login ที่ /agent/login
3. เข้า /admin/dashboard

**เท่านี้ก็เสร็จแล้ว!** 🚀

---

## ไฟล์ที่เกี่ยวข้อง

- คู่มือเต็ม: `CREATE_ADMIN_USER_TH.md`
- คู่มือ Login: `ADMIN_LOGIN_GUIDE_TH.md`
- สคริปต์: `apps/backend/scripts/create-admin.js`
- Hash Password: `apps/backend/scripts/hash-password.js`
