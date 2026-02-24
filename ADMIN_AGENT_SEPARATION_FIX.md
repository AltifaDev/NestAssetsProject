# แก้ไข: แยก Admin และ Agent Login อย่างสมบูรณ์

## ปัญหาที่พบ

เมื่อ Admin logout หรือ token หมดอายุ จะถูก redirect ไปที่ `/agent/login` แทนที่จะเป็น `/admin/login`

## สาเหตุ

มีการ hardcode redirect ไปที่ `/agent/login` ใน 3 จุด:

1. ✅ **api-client.ts** - ฟังก์ชัน `logout()`
2. ✅ **admin/dashboard/page.tsx** - การตรวจสอบ authentication (2 จุด)

## การแก้ไข

### 1. แก้ไข api-client.ts ✅

**ก่อน**:
```typescript
logout() {
  this.token = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/agent/login';  // ← ปัญหา
  }
}
```

**หลัง**:
```typescript
logout() {
  this.token = null;
  if (typeof window !== 'undefined') {
    // ตรวจสอบ role ก่อน logout
    const user = this.getUser();
    const isAdmin = user?.role === 'admin';
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Redirect ไปหน้าที่ถูกต้อง
    window.location.href = isAdmin ? '/admin/login' : '/agent/login';
  }
}
```

### 2. แก้ไข admin/dashboard/page.tsx ✅

**ก่อน**:
```typescript
const currentUser = apiClient.getUser();
if (!currentUser || currentUser.role !== 'admin') {
    router.push('/agent/login');  // ← ปัญหา
    return;
}
```

**หลัง**:
```typescript
const currentUser = apiClient.getUser();
if (!currentUser || currentUser.role !== 'admin') {
    router.push('/admin/login');  // ← แก้ไขแล้ว
    return;
}
```

## ผลลัพธ์

### Admin Flow ✅
```
1. Login ที่ /admin/login
2. เข้า /admin/dashboard
3. Logout → กลับไปที่ /admin/login
4. Token หมดอายุ → redirect ไปที่ /admin/login
5. ไม่มีสิทธิ์ → redirect ไปที่ /admin/login
```

### Agent Flow ✅
```
1. Login ที่ /agent/login
2. เข้า /agent/dashboard หรือ /dashboard
3. Logout → กลับไปที่ /agent/login
4. Token หมดอายุ → redirect ไปที่ /agent/login
5. ไม่มีสิทธิ์ → redirect ไปที่ /agent/login
```

## การทดสอบ

### ทดสอบ Admin Logout
1. Login ที่ `/admin/login` ด้วย admin account
2. เข้า `/admin/dashboard`
3. คลิก Logout
4. ✅ ควร redirect ไปที่ `/admin/login`

### ทดสอบ Admin Token Expired
1. Login ที่ `/admin/login`
2. ลบ token ใน localStorage: `localStorage.removeItem('auth_token')`
3. Refresh หน้า `/admin/dashboard`
4. ✅ ควร redirect ไปที่ `/admin/login`

### ทดสอบ Admin Unauthorized
1. Login ที่ `/agent/login` ด้วย agent account
2. พยายามเข้า `/admin/dashboard` โดยตรง
3. ✅ ควร redirect ไปที่ `/admin/login`

### ทดสอบ Agent Logout
1. Login ที่ `/agent/login` ด้วย agent account
2. เข้า `/agent/dashboard`
3. คลิก Logout
4. ✅ ควร redirect ไปที่ `/agent/login`

## สรุปการเปลี่ยนแปลง

### ไฟล์ที่แก้ไข
1. ✅ `apps/frontend/src/lib/api-client.ts`
   - แก้ไขฟังก์ชัน `logout()` ให้ตรวจสอบ role

2. ✅ `apps/frontend/src/app/[locale]/admin/dashboard/page.tsx`
   - แก้ไข redirect จาก `/agent/login` → `/admin/login` (2 จุด)

### ไฟล์ที่ไม่ต้องแก้
- ❌ หน้า `/dashboard/*` - ใช้ `/agent/login` ถูกต้องแล้ว (สำหรับ agent)
- ❌ หน้า `/agent/dashboard` - ใช้ `/agent/login` ถูกต้องแล้ว
- ❌ Components (Footer, Navbar, AuthForm) - ลิงก์ไปหน้า agent login ถูกต้องแล้ว

## ตรวจสอบความถูกต้อง

### เปิด Browser Console แล้วทดสอบ

```javascript
// ดู user ปัจจุบัน
const user = JSON.parse(localStorage.getItem('auth_user'));
console.log('User:', user);
console.log('Role:', user?.role);

// ทดสอบ logout
// ถ้า role = 'admin' → ควรไปที่ /admin/login
// ถ้า role = 'agent' → ควรไปที่ /agent/login
```

## Flow Diagram

### Admin
```
┌─────────────────┐
│  /admin/login   │
└────────┬────────┘
         │ Login (role=admin)
         ▼
┌─────────────────┐
│ /admin/dashboard│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 Logout   Token Expired
    │         │
    └────┬────┘
         ▼
┌─────────────────┐
│  /admin/login   │ ← กลับมาที่นี่
└─────────────────┘
```

### Agent
```
┌─────────────────┐
│  /agent/login   │
└────────┬────────┘
         │ Login (role=agent)
         ▼
┌─────────────────┐
│ /agent/dashboard│
│ หรือ /dashboard │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 Logout   Token Expired
    │         │
    └────┬────┘
         ▼
┌─────────────────┐
│  /agent/login   │ ← กลับมาที่นี่
└─────────────────┘
```

## ข้อควรระวัง

1. **ไม่ควรแก้ไขหน้า `/dashboard/*`**
   - หน้าเหล่านี้เป็นของ Agent
   - ใช้ `/agent/login` ถูกต้องแล้ว

2. **ไม่ควรแก้ไข Components ทั่วไป**
   - Footer, Navbar, AuthForm
   - ลิงก์ไปหน้า `/agent/login` เป็นของ public
   - ถูกต้องแล้ว

3. **เฉพาะหน้า Admin เท่านั้น**
   - `/admin/login`
   - `/admin/dashboard`
   - ที่ต้องใช้ `/admin/login`

## สรุป

✅ **แก้ไขเสร็จสมบูรณ์**

- Admin logout → `/admin/login`
- Agent logout → `/agent/login`
- แยกกันชัดเจน ไม่ลิงก์หากันอีกต่อไป

---

**Status**: ✅ FIXED
**Date**: February 24, 2026
**Files Modified**: 2
