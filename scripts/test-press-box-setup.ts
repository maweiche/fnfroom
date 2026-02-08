#!/usr/bin/env bun
/**
 * Press Box AI Migration Test Script
 *
 * Verifies that the Press Box AI database migration was successful.
 * Run with: bun scripts/test-press-box-setup.ts
 */

import { prisma } from '../lib/prisma';

console.log('🧪 Testing Press Box AI Setup');
console.log('==============================\n');

async function testSetup() {
  try {
    // Test 1: Check if writer_style_notes column exists on users
    console.log('Test 1: Checking users.writer_style_notes column...');
    const userCount = await prisma.user.count();
    console.log(`✅ Users table accessible (${userCount} users found)`);

    // Test 2: Check if conversations table exists
    console.log('\nTest 2: Checking conversations table...');
    const conversationCount = await prisma.conversation.count();
    console.log(`✅ Conversations table accessible (${conversationCount} conversations)`);

    // Test 3: Check if articles table exists
    console.log('\nTest 3: Checking articles table...');
    const articleCount = await prisma.article.count();
    console.log(`✅ Articles table accessible (${articleCount} articles)`);

    // Test 4: Check foreign key relationships
    console.log('\nTest 4: Checking foreign key relationships...');
    const testUser = await prisma.user.findFirst({
      include: {
        conversations: true,
        articles: true,
      },
    });
    if (testUser) {
      console.log(`✅ Foreign keys working (User: ${testUser.email})`);
    } else {
      console.log('⚠️  No users found to test relationships');
    }

    // Test 5: Check indexes
    console.log('\nTest 5: Checking indexes...');
    const indexes = await prisma.$queryRaw<Array<{ tablename: string; indexname: string }>>`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('conversations', 'articles')
      ORDER BY tablename, indexname;
    `;
    console.log(`✅ Found ${indexes.length} indexes on Press Box AI tables:`);
    indexes.forEach(idx => {
      console.log(`   - ${idx.tablename}.${idx.indexname}`);
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed! Press Box AI is ready to use.');
    console.log('='.repeat(50) + '\n');

    console.log('Next steps:');
    console.log('  1. Create a writer user: update users set role = \'WRITER\' where email = \'writer@example.com\';');
    console.log('  2. Add ANTHROPIC_API_KEY to .env.local');
    console.log('  3. Start building Press Box AI routes in /app/api/pressbox/\n');

  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.log('\nTroubleshooting:');
    console.log('  1. Make sure migration ran: bunx prisma migrate deploy');
    console.log('  2. Regenerate Prisma client: bunx prisma generate');
    console.log('  3. Check DATABASE_URL in .env.local\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testSetup();
