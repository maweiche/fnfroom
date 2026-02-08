#!/usr/bin/env bun
/**
 * Test script to verify database and auth setup
 * Usage: bun scripts/test-setup.ts
 */

import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../lib/auth';

async function testDatabase() {
  console.log('🧪 Testing database connection...');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test schema
    const userCount = await prisma.user.count();
    console.log(`✅ Database schema valid (${userCount} users)`);

    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

async function testAuth() {
  console.log('\n🔐 Testing authentication system...');

  try {
    // Test password hashing
    const password = 'test-password-123';
    const hash = await hashPassword(password);
    console.log('✅ Password hashing works');

    // Test password verification
    const isValid = await verifyPassword(password, hash);
    if (!isValid) throw new Error('Password verification failed');
    console.log('✅ Password verification works');

    // Test JWT generation
    const token = await generateToken({
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'COACH',
    });
    console.log('✅ JWT token generation works');

    // Test JWT verification
    const payload = await verifyToken(token);
    if (!payload || payload.userId !== 'test-user-id') {
      throw new Error('JWT verification failed');
    }
    console.log('✅ JWT token verification works');

    return true;
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return false;
  }
}

async function testSanityConfig() {
  console.log('\n📦 Testing Sanity configuration...');

  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    const apiToken = process.env.SANITY_API_TOKEN;

    if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID not set');
    if (!dataset) throw new Error('NEXT_PUBLIC_SANITY_DATASET not set');

    console.log(`✅ Sanity project ID: ${projectId}`);
    console.log(`✅ Sanity dataset: ${dataset}`);
    console.log(`${apiToken ? '✅' : '⚠️'} Sanity API token ${apiToken ? 'configured' : 'not configured (required for uploads)'}`);

    return true;
  } catch (error) {
    console.error('❌ Sanity config test failed:', error);
    return false;
  }
}

async function testClaudeAPI() {
  console.log('\n🤖 Testing Claude API configuration...');

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.log('⚠️  ANTHROPIC_API_KEY not configured');
      console.log('   Get your API key from: https://console.anthropic.com/');
      return false;
    }

    if (apiKey === 'your_anthropic_api_key_here') {
      console.log('⚠️  ANTHROPIC_API_KEY needs to be updated');
      console.log('   Replace placeholder with real API key');
      return false;
    }

    console.log('✅ Claude API key configured');
    return true;
  } catch (error) {
    console.error('❌ Claude API test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🏀 FNFR ScoreSnap - Setup Verification\n');
  console.log('='.repeat(50));

  const results = await Promise.all([
    testDatabase(),
    testAuth(),
    testSanityConfig(),
    testClaudeAPI(),
  ]);

  console.log('\n' + '='.repeat(50));

  const allPassed = results.every(r => r);
  if (allPassed) {
    console.log('\n✅ All tests passed! Setup is complete.\n');
    console.log('Next steps:');
    console.log('1. Update .env.local with real ANTHROPIC_API_KEY');
    console.log('2. Update .env.local with SANITY_API_TOKEN (if not set)');
    console.log('3. Create admin user: bun scripts/create-user.ts');
    console.log('4. Start development server: bun run dev\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please fix issues above.\n');
    process.exit(1);
  }
}

main();
