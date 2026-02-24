# คู่มือความปลอดภัยระบบ Admin

## ปัญหาเดิม ❌

การใช้หน้า `/agent/login` สำหรับ Admin มีปัญหา:

1. **เข้าถึงได้ง่ายเกินไป** - URL เดียวกับ Agent ทั่วไป
2. **ไม่มีการป้องกัน Brute Force** - ลองรหัสผ่านได้ไม่จำกัด
3. **ไม่มี Rate Limiting** - ไม่จำกัดจำนวนครั้งที่พยายาม login
4. **ไม่มี Audit Log** - ไม่บันทึกการพยายามเข้าถึง
5. **ไม่มีคำเตือน** - ไม่มีข้อความเตือนว่าเป็นระบบ Admin

## วิธีแก้ไขใหม่ ✅

สร้างหน้า Admin Login แยกที่มีความปลอดภัยสูง

### URL ใหม่
```
http://localhost:3000/admin/login  ← สำหรับ Admin เท่านั้น
http://localhost:3000/agent/login  ← สำหรับ Agent ทั่วไป
```

---

## ฟีเจอร์ความปลอดภัย

### 1. 🔒 Brute Force Protection

**Frontend Protection**:
- จำกัด 3 ครั้งต่อ session
- ล็อคบัญชี 5 นาทีหลังพยายาม 3 ครั้ง
- แสดงจำนวนครั้งที่เหลือ

**Backend Protection** (พร้อมใช้งาน):
- จำกัด 5 ครั้งต่อ IP address
- ล็อค IP 5 นาทีหลังพยายาม 5 ครั้ง
- รีเซ็ตหลังผ่าน 15 นาที

### 2. 🛡️ Role Verification

```typescript
// ตรวจสอบ role ทันทีหลัง login
if (response.user.role !== 'admin') {
    // ปฏิเสธการเข้าถึง
    // Logout ทันที
    // บันทึก unauthorized attempt
}
```

### 3. 📝 Audit Logging

บันทึกทุกการพยายามเข้าถึง:
- ✅ Login สำเร็จ (email, timestamp)
- ❌ Login ไม่สำเร็จ (email, attempts, timestamp)
- ⛔ Unauthorized access (email, role, timestamp)

### 4. ⚠️ Security Warnings

แสดงคำเตือนชัดเจน:
- "ระบบจัดการแอดมิน - สำหรับผู้ดูแลระบบเท่านั้น"
- "การเข้าถึงโดยไม่ได้รับอนุญาตจะถูกบันทึกและดำเนินการตามกฎหมาย"

### 5. 🎨 Visual Indicators

- สีแดง/ส้ม (แทนสีน้ำเงิน) - บ่งบอกว่าเป็นระบบ Admin
- ไอคอน Shield - เน้นความปลอดภัย
- Banner เตือน - ชัดเจนว่าเป็นระบบ Admin

---

## การใช้งาน

### สำหรับ Admin

1. **เข้าหน้า Admin Login**
   ```
   http://localhost:3000/admin/login
   ```

2. **กรอกข้อมูล Admin**
   - Email: admin@example.com
   - Password: รหัสผ่าน Admin

3. **ระบบจะตรวจสอบ**:
   - ✅ Email และ Password ถูกต้อง
   - ✅ Role เป็น 'admin'
   - ✅ ไม่เกินจำนวนครั้งที่กำหนด

4. **เข้าสู่ Admin Dashboard**
   ```
   http://localhost:3000/admin/dashboard
   ```

### สำหรับ Agent

1. **เข้าหน้า Agent Login** (เหมือนเดิม)
   ```
   http://localhost:3000/agent/login
   ```

2. **กรอกข้อมูล Agent**
   - Email: agent@example.com
   - Password: รหัสผ่าน Agent

3. **เข้าสู่ Agent Dashboard**
   ```
   http://localhost:3000/agent/dashboard
   ```

---

## ความแตกต่าง

| Feature | Agent Login | Admin Login |
|---------|-------------|-------------|
| **URL** | `/agent/login` | `/admin/login` |
| **สี Theme** | น้ำเงิน | แดง/ส้ม |
| **ไอคอน** | User | Shield |
| **คำเตือน** | ไม่มี | มี (ชัดเจน) |
| **Brute Force** | ไม่มี | มี (3-5 ครั้ง) |
| **Role Check** | ไม่เข้มงวด | เข้มงวดมาก |
| **Audit Log** | พื้นฐาน | ละเอียด |
| **Lockout** | ไม่มี | 5 นาที |
| **Dashboard** | `/agent/dashboard` | `/admin/dashboard` |

---

## การป้องกันเพิ่มเติม (แนะนำ)

### 1. IP Whitelist (Production)

```typescript
// ใน admin-login.guard.ts
const ALLOWED_IPS = [
  '192.168.1.100',  // Office IP
  '10.0.0.50',      // VPN IP
];

if (!ALLOWED_IPS.includes(ip)) {
  throw new UnauthorizedException('Access denied from this IP');
}
```

### 2. Two-Factor Authentication (2FA)

```typescript
// เพิ่ม OTP verification
1. Login ด้วย email/password
2. ส่ง OTP ไปยัง email/phone
3. ยืนยัน OTP
4. เข้าสู่ระบบ
```

### 3. Session Timeout

```typescript
// Auto logout หลัง 30 นาทีไม่ได้ใช้งาน
const SESSION_TIMEOUT = 1800000; // 30 minutes
```

### 4. Strong Password Policy

```typescript
// บังคับใช้รหัสผ่านที่แข็งแรง
- ความยาวขั้นต่ำ 12 ตัวอักษร
- มีตัวพิมพ์ใหญ่และเล็ก
- มีตัวเลข
- มีอักขระพิเศษ
```

### 5. HTTPS Only

```nginx
# บังคับใช้ HTTPS
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

---

## ตรวจสอบความปลอดภัย

### 1. ทดสอบ Brute Force Protection

```bash
# พยายาม login 5 ครั้งด้วยรหัสผ่านผิด
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"wrong"}'
done

# ครั้งที่ 6 ควรถูกบล็อค
```

### 2. ทดสอบ Role Verification

```bash
# Login ด้วย Agent account
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@example.com","password":"password"}'

# พยายามเข้า Admin Dashboard
# ควรถูกปฏิเสธและ logout
```

### 3. ตรวจสอบ Audit Logs

```javascript
// ใน Browser Console
// ดู console.log ของการพยายาม login
```

---

## Best Practices

### สำหรับ Development

1. ✅ ใช้ Admin Login แยก (`/admin/login`)
2. ✅ ทดสอบ Brute Force Protection
3. ✅ ตรวจสอบ Audit Logs
4. ✅ ใช้รหัสผ่านง่ายๆ (admin123) ได้

### สำหรับ Production

1. ✅ เปิดใช้ HTTPS เท่านั้น
2. ✅ ตั้งรหัสผ่านที่แข็งแรง (12+ ตัวอักษร)
3. ✅ เปิดใช้ IP Whitelist
4. ✅ เพิ่ม 2FA
5. ✅ ตั้ง Session Timeout
6. ✅ บันทึก Audit Logs ลงฐานข้อมูล
7. ✅ ตั้ง Alert สำหรับ failed attempts
8. ✅ เปลี่ยนรหัสผ่านเป็นระยะ
9. ✅ ใช้ VPN สำหรับเข้าถึง Admin
10. ✅ ซ่อน URL `/admin/login` (ใช้ path ที่ไม่คาดเดา)

---

## Migration Guide

### ขั้นตอนการเปลี่ยนจาก Agent Login → Admin Login

1. **อัพเดทลิงก์ทั้งหมด**
   ```
   เดิม: /agent/login → ใหม่: /admin/login
   ```

2. **อัพเดทเอกสาร**
   - คู่มือการใช้งาน
   - วิดีโอสอนใช้งาน
   - Email แจ้งเตือน

3. **แจ้ง Admin ทุกคน**
   - URL ใหม่
   - ฟีเจอร์ความปลอดภัยใหม่
   - ข้อควรระวัง

4. **ทดสอบ**
   - Login สำเร็จ
   - Brute Force Protection
   - Role Verification
   - Audit Logging

---

## สรุป

### ก่อนแก้ไข ❌
```
Agent และ Admin ใช้หน้า login เดียวกัน
→ ไม่ปลอดภัย
→ เข้าถึงได้ง่าย
→ ไม่มีการป้องกัน
```

### หลังแก้ไข ✅
```
Admin มีหน้า login แยก
→ ปลอดภัยกว่า
→ มี Brute Force Protection
→ มี Role Verification
→ มี Audit Logging
→ มีคำเตือนชัดเจน
```

---

## ไฟล์ที่เกี่ยวข้อง

- **Frontend**: `apps/frontend/src/app/[locale]/admin/login/page.tsx`
- **Backend Guard**: `apps/backend/src/auth/guards/admin-login.guard.ts`
- **DTO**: `apps/backend/src/auth/dto/admin-login.dto.ts`
- **คู่มือ**: `ADMIN_SECURITY_GUIDE_TH.md`

---

**ตอนนี้ระบบ Admin มีความปลอดภัยมากขึ้นแล้ว! 🔒**
