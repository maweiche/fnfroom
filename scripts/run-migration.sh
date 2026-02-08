#!/bin/bash
# Simple migration runner that loads .env.local and runs migration

set -e

echo "🚀 Press Box AI Migration"
echo "=========================="
echo ""

# Load environment variables from .env.local
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
  echo "✅ Loaded .env.local"
else
  echo "❌ .env.local not found"
  exit 1
fi

# Check if DATABASE_URL or DIRECT_URL is set
if [ -z "$DATABASE_URL" ] && [ -z "$DIRECT_URL" ]; then
  echo "❌ Neither DATABASE_URL nor DIRECT_URL is set"
  exit 1
fi

# Use DATABASE_URL (pooler) for migrations to avoid paused database issues
DB_URL="$DATABASE_URL"

echo "📄 Running migration SQL via connection pooler..."
echo ""

# Run the migration
psql "$DB_URL" -f prisma/migrations/20260208153305_add_press_box_ai/migration.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo ""
  echo "Next steps:"
  echo "  1. bunx prisma generate"
  echo "  2. bun scripts/test-press-box-setup.ts"
  echo ""
else
  echo ""
  echo "❌ Migration failed!"
  echo "Check error messages above"
  exit 1
fi
