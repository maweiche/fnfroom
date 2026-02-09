#!/usr/bin/env bun
/**
 * Test writer authentication
 */
import { authenticateUser } from '../lib/auth';

async function main() {
  console.log('Testing writer authentication...\n');

  try {
    const result = await authenticateUser('maweiche@gmail.com', 'writer123');

    if (!result) {
      console.log('❌ Authentication failed - invalid credentials');
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('User:', result.user);
    console.log('\nToken (first 50 chars):', result.token.substring(0, 50) + '...');

    // Test the token
    const { getUserFromToken } = await import('../lib/auth');
    const userFromToken = await getUserFromToken(result.token);

    if (userFromToken) {
      console.log('\n✅ Token is valid');
      console.log('User from token:', userFromToken.email, userFromToken.role);
    } else {
      console.log('\n❌ Token is invalid');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
