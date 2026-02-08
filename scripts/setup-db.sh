#!/bin/bash

# Script to set up local PostgreSQL database for ScoreSnap

echo "🗄️  Setting up PostgreSQL database for FNFR ScoreSnap..."

# Database configuration
DB_NAME="fnfroom"
DB_USER="postgres"  # Change if your PostgreSQL user is different

# Check if database exists
if psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "✅ Database '$DB_NAME' already exists"
else
    echo "📦 Creating database '$DB_NAME'..."
    createdb -U $DB_USER $DB_NAME
    echo "✅ Database created successfully"
fi

# Update .env.local with connection string
echo ""
echo "📝 Your DATABASE_URL should be:"
echo "DATABASE_URL=\"postgresql://$DB_USER@localhost:5432/$DB_NAME?schema=public\""
echo ""
echo "⚠️  Make sure to update your .env.local file with the correct DATABASE_URL"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your database URL"
echo "2. Run: bunx prisma generate"
echo "3. Run: bunx prisma migrate dev --name init"
