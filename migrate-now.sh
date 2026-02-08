#!/bin/bash
# Ultra-simple migration runner

# Temporarily comment out directUrl in schema
cp prisma/schema.prisma prisma/schema.prisma.backup
sed -i.tmp '/directUrl/s/^/  \/\/ /' prisma/schema.prisma

# Run migration
bunx prisma migrate deploy

# Restore schema
mv prisma/schema.prisma.backup prisma/schema.prisma
rm -f prisma/schema.prisma.tmp

echo ""
echo "Next: bunx prisma generate"
