#!/usr/bin/env bun
/**
 * Press Box AI Migration Script
 *
 * This script applies the Press Box AI database migration.
 * Run with: bun scripts/migrate-press-box-ai.ts
 *
 * What it does:
 * 1. Adds writer_style_notes column to users table
 * 2. Creates conversations table
 * 3. Creates articles table
 * 4. Sets up all foreign keys and indexes
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const MIGRATION_PATH = resolve(__dirname, '../prisma/migrations/20260208153305_add_press_box_ai');
const SQL_FILE = resolve(MIGRATION_PATH, 'migration.sql');

console.log('🚀 Press Box AI Migration');
console.log('==========================\n');

// Check if migration file exists
if (!existsSync(SQL_FILE)) {
  console.error('❌ Migration file not found:', SQL_FILE);
  process.exit(1);
}

// Read migration SQL
const sql = readFileSync(SQL_FILE, 'utf-8');
console.log('📄 Migration file loaded');
console.log('   Location:', SQL_FILE);
console.log('   Size:', sql.length, 'bytes\n');

// Confirm with user
console.log('This migration will:');
console.log('  1. Add writer_style_notes column to users table');
console.log('  2. Create conversations table with indexes');
console.log('  3. Create articles table with indexes');
console.log('  4. Set up foreign key relationships\n');

console.log('⚠️  Make sure you have a database backup before proceeding!\n');

// Check for environment variables
if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  console.error('❌ DATABASE_URL or DIRECT_URL environment variable not set');
  console.error('   Set one of these in your .env.local file\n');
  process.exit(1);
}

try {
  console.log('🔄 Running Prisma migrate deploy...\n');

  // Load .env.local explicitly for the child process
  const envFile = resolve(__dirname, '../.env.local');
  if (!existsSync(envFile)) {
    console.error('❌ .env.local not found');
    process.exit(1);
  }

  // Read and parse .env.local
  const envContent = readFileSync(envFile, 'utf-8');
  const envVars = Object.fromEntries(
    envContent
      .split('\n')
      .filter(line => line && !line.startsWith('#') && line.includes('='))
      .map(line => {
        const [key, ...valueParts] = line.split('=');
        return [key.trim(), valueParts.join('=').trim().replace(/^["']|["']$/g, '')];
      })
  );

  // Run Prisma migrate with explicit environment
  execSync('bunx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, ...envVars },
  });

  console.log('\n✅ Migration completed successfully!');
  console.log('\nNext steps:');
  console.log('  1. Run: bunx prisma generate');
  console.log('  2. Verify tables: psql $DATABASE_URL -c "\\dt"');
  console.log('  3. Test a query: bun scripts/test-press-box-setup.ts\n');

} catch (error) {
  console.error('\n❌ Migration failed!');
  console.error('Error:', error instanceof Error ? error.message : error);
  console.log('\nRollback instructions:');
  console.log('  bun scripts/rollback-press-box-ai.ts\n');
  process.exit(1);
}
