#!/usr/bin/env bun
/**
 * Verify a coach account so they can log in
 * Usage: bun scripts/verify-coach.ts <email>
 */

import { prisma } from '../lib/prisma';

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: bun scripts/verify-coach.ts <email>');
    console.error('Example: bun scripts/verify-coach.ts test@coach.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { verifiedAt: new Date() },
      select: {
        email: true,
        name: true,
        verifiedAt: true,
      },
    });

    console.log('✅ Coach verified successfully!');
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Verified At: ${user.verifiedAt}`);
    console.log('');
    console.log('They can now log in at /login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
