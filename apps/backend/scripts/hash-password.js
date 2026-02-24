#!/usr/bin/env node

/**
 * สคริปต์สร้าง Password Hash ด้วย bcrypt
 * วิธีใช้: node scripts/hash-password.js รหัสผ่านของคุณ
 */

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.log('\n❌ กรุณาระบุรหัสผ่าน\n');
  console.log('วิธีใช้: node scripts/hash-password.js รหัสผ่านของคุณ\n');
  console.log('ตัวอย่าง: node scripts/hash-password.js admin123\n');
  process.exit(1);
}

console.log('\n⏳ กำลังสร้าง hash...\n');

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('✅ สร้าง hash สำเร็จ!\n');
    console.log('=' .repeat(60));
    console.log('\n📋 Password Hash:\n');
    console.log(hash);
    console.log('\n' + '=' .repeat(60));
    console.log('\n💡 คัดลอก hash ข้างบนไปใช้ใน SQL:\n');
    console.log(`INSERT INTO agents (name, email, password_hash, role, status, verified)`);
    console.log(`VALUES (`);
    console.log(`  'Admin User',`);
    console.log(`  'admin@example.com',`);
    console.log(`  '${hash}',`);
    console.log(`  'admin',`);
    console.log(`  'active',`);
    console.log(`  true`);
    console.log(`);\n`);
    console.log('=' .repeat(60) + '\n');
  })
  .catch(error => {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  });
