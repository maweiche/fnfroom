#!/bin/bash
# Simplest possible migration - temporarily disable DIRECT_URL and use Prisma

set -e

echo "🚀 Press Box AI Migration (Simple Method)"
echo "=========================================="
echo ""

# Backup .env.local
cp .env.local .env.local.backup
echo "✅ Backed up .env.local to .env.local.backup"

# Set DIRECT_URL to use pooler (same as DATABASE_URL) to avoid paused database
DATABASE_URL_VALUE=$(grep "^DATABASE_URL=" .env.local | cut -d '=' -f 2-)
sed -i.tmp "s|^DIRECT_URL=.*|DIRECT_URL=$DATABASE_URL_VALUE|" .env.local
echo "✅ Temporarily set DIRECT_URL to use connection pooler"
echo ""

echo "📄 Running Prisma migrate deploy..."
bunx prisma migrate deploy

# Restore original .env.local
mv .env.local.backup .env.local
rm -f .env.local.tmp
echo ""
echo "✅ Restored .env.local"
echo ""

echo "✅ Migration completed!"
echo ""
echo "Next steps:"
echo "  1. bunx prisma generate"
echo "  2. bun scripts/test-press-box-setup.ts"
echo ""
