#!/usr/bin/env node

/**
 * สคริปต์สร้าง Admin User
 * วิธีใช้: node scripts/create-admin.js
 */

const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🔐 สร้าง Admin User สำหรับ Nest of Assets\n');
  console.log('=' .repeat(50));
  
  const name = await question('ชื่อ Admin (เช่น Admin User): ') || 'Admin User';
  const email = await question('Email (เช่น admin@example.com): ') || 'admin@example.com';
  const password = await question('รหัสผ่าน (เช่น admin123): ') || 'admin123';
  const phone = await question('เบอร์โทร (ไม่บังคับ): ') || null;
  
  console.log('\n⏳ กำลังสร้าง password hash...\n');
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  console.log('=' .repeat(50));
  console.log('\n✅ สร้าง Password Hash สำเร็จ!\n');
  console.log('📋 คัดลอก SQL ด้านล่างนี้ไปรันใน Supabase SQL Editor:\n');
  console.log('=' .repeat(50));
  console.log('\n');
  
  const sql = `-- สร้าง Admin User
INSERT INTO agents (name, email, password_hash, role, status, verified${phone ? ', phone' : ''})
VALUES (
  '${name.replace(/'/g, "''")}',
  '${email}',
  '${passwordHash}',
  'admin',
  'active',
  true${phone ? `,\n  '${phone}'` : ''}
);

-- ตรวจสอบว่าสร้างสำเร็จ
SELECT id, name, email, role, status, verified 
FROM agents 
WHERE email = '${email}';`;
  
  console.log(sql);
  console.log('\n');
  console.log('=' .repeat(50));
  console.log('\n📝 ข้อมูล Login:\n');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log('\n🌐 หลังจากรัน SQL แล้ว:\n');
  console.log('   1. ไปที่: http://localhost:3000/agent/login');
  console.log('   2. Login ด้วยข้อมูลข้างบน');
  console.log('   3. เข้าหน้า: http://localhost:3000/admin/dashboard');
  console.log('\n' + '=' .repeat(50) + '\n');
  
  rl.close();
}

main().catch(error => {
  console.error('❌ เกิดข้อผิดพลาด:', error.message);
  rl.close();
  process.exit(1);
});
