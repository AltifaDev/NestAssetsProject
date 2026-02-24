# ✅ แก้ไขแล้ว: Admin ไม่เด้งไปหน้า Agent Login อีกต่อไป

## ปัญหาที่พบ

เมื่อ Admin logout หรือ token หมดอายุ → เด้งไปที่ `/agent/login` ❌

## สาเหตุ

มีการ hardcode redirect ไปที่ `/agent/login` ใน:
1. `api-client.ts` - ฟังก์ชัน logout
2. `admin/dashboard/page.tsx` - การตรวจสอบสิทธิ์

## การแก้ไข

### 1. แก้ api-client.ts ✅

เพิ่มการตรวจสอบ role ก่อน redirect:

```typescript
logout() {
  // ตรวจสอบว่าเป็น admin หรือ agent
  const user = this.getUser();
  const isAdmin = user?.role === 'admin';
  
  // Redirect ไปหน้าที่ถูกต้อง
  window.location.href = isAdmin ? '/admin/login' : '/agent/login';
}
```

### 2. แก้ admin/dashboard/page.tsx ✅

เปลี่ยน redirect จาก `/agent/login` → `/admin/login`:

```typescript
if (!currentUser || currentUser.role !== 'admin') {
    router.push('/admin/login');  // ← แก้ไขแล้ว
}
```

## ผลลัพธ์

### Admin ✅
```
Login → /admin/login
Dashboard → /admin/dashboard
Logout → /admin/login ✅
Token หมดอายุ → /admin/login ✅
```

### Agent ✅
```
Login → /agent/login
Dashboard → /agent/dashboard
Logout → /agent/login ✅
Token หมดอายุ → /agent/login ✅
```

## ทดสอบ

### ทดสอบ Admin
1. Login ที่ `/admin/login`
2. เข้า `/admin/dashboard`
3. คลิก Logout
4. ✅ ควรกลับไปที่ `/admin/login`

### ทดสอบ Agent
1. Login ที่ `/agent/login`
2. เข้า `/agent/dashboard`
3. คลิก Logout
4. ✅ ควรกลับไปที่ `/agent/login`

## สรุป

✅ **แก้ไขเสร็จสมบูรณ์**
- Admin และ Agent แยกกันชัดเจน
- ไม่ลิงก์หากันอีกต่อไป
- Logout ไปหน้าที่ถูกต้อง

---

**ไฟล์ที่แก้ไข**:
1. `apps/frontend/src/lib/api-client.ts`
2. `apps/frontend/src/app/[locale]/admin/dashboard/page.tsx`

**Status**: ✅ FIXED
