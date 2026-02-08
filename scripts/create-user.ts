#!/usr/bin/env bun
/**
 * Admin script to create user accounts
 * Usage: bun scripts/create-user.ts
 */

import { createUser, type Role } from '../lib/auth';

async function promptUser(): Promise<{
  email: string;
  password: string;
  name: string;
  role: Role;
  schoolName?: string;
  primarySport?: string;
}> {
  console.log('🏀 FNFR ScoreSnap - Create User Account\n');

  // Simple prompts using Bun's stdin
  const stdin = process.stdin;
  const stdout = process.stdout;

  function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      stdout.write(prompt);
      stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });
  }

  const email = await question('Email: ');
  const password = await question('Password: ');
  const name = await question('Full Name: ');
  const roleInput = await question('Role (ADMIN/COACH) [COACH]: ');
  const role = (roleInput.toUpperCase() || 'COACH') as Role;

  let schoolName: string | undefined;
  let primarySport: string | undefined;

  if (role === 'COACH') {
    schoolName = await question('School Name: ');
    primarySport = await question('Primary Sport (BASKETBALL/FOOTBALL) [BASKETBALL]: ');
    primarySport = primarySport.toUpperCase() || 'BASKETBALL';
  }

  return { email, password, name, role, schoolName, primarySport };
}

async function main() {
  try {
    // Enable terminal raw mode for input
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    const userData = await promptUser();

    console.log('\n⏳ Creating user account...\n');

    const user = await createUser(userData);

    console.log('✅ User created successfully!\n');
    console.log('User Details:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    if (user.schoolName) console.log(`  School: ${user.schoolName}`);
    if (user.primarySport) console.log(`  Sport: ${user.primarySport}`);
    console.log(`  Verified: ${user.verifiedAt ? 'Yes' : 'No (pending admin approval)'}`);
    console.log(`  Created: ${user.createdAt.toISOString()}\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating user:', error);
    process.exit(1);
  }
}

main();
