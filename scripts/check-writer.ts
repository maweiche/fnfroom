#!/usr/bin/env bun
/**
 * Check if the writer test account exists
 */
import { prisma } from '../lib/prisma';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'maweiche@gmail.com' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      verifiedAt: true,
    },
  });

  if (!user) {
    console.log('❌ Writer user NOT found');
    console.log('Run: bun scripts/create-writer.ts');
  } else {
    console.log('✅ Writer user found:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Verified:', user.verifiedAt ? 'Yes' : 'No');
  }

  await prisma.$disconnect();
}

main();
