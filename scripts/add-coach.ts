#!/usr/bin/env bun
/**
 * Quick script to add a coach with a temporary password
 * Usage: bun scripts/add-coach.ts <email> <name> <schoolName>
 */

import { createUser } from '../lib/auth';

const TEMP_PASSWORD = 'TempPass123!'; // Coaches must change this on first login

async function main() {
  const [email, name, schoolName] = process.argv.slice(2);

  if (!email || !name) {
    console.error('Usage: bun scripts/add-coach.ts <email> <name> [schoolName]');
    console.error('');
    console.error('Example:');
    console.error('  bun scripts/add-coach.ts coach@school.com "John Smith" "Central High"');
    console.error('');
    console.error(`Temporary password for all coaches: ${TEMP_PASSWORD}`);
    console.error('Coaches can change their password after first login at /change-password');
    process.exit(1);
  }

  console.log('🏀 Adding new coach to ScoreSnap\n');

  try {
    const user = await createUser({
      email: email.toLowerCase(),
      password: TEMP_PASSWORD,
      name,
      role: 'COACH',
      schoolName: schoolName || null,
      primarySport: 'BASKETBALL',
    });

    console.log('✅ Coach added successfully!\n');
    console.log('Login Credentials:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Temporary Password: ${TEMP_PASSWORD}`);
    console.log(`  Name: ${user.name}`);
    if (user.schoolName) console.log(`  School: ${user.schoolName}`);
    console.log(`  Verified: ${user.verifiedAt ? 'Yes' : 'No (requires admin verification)'}`);
    console.log('');
    console.log('⚠️  Important:');
    console.log('  1. Share these credentials securely with the coach');
    console.log('  2. Ask them to change password at /change-password after first login');
    console.log('  3. Verify their account if needed (set verifiedAt in database)');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error adding coach:', error);
    process.exit(1);
  }
}

main();
