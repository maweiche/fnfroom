# Supabase Integration Setup

## Overview
ScoreSnap now uses your Supabase PostgreSQL database instead of local PostgreSQL. This integrates ScoreSnap's AI-powered score extraction directly into your stats data pipeline.

## Benefits
- ✅ Single source of truth for all game data
- ✅ Extracted stats automatically available for your data pipeline
- ✅ Production-ready database with backups
- ✅ Real-time capabilities built-in
- ✅ Easy deployment

## Setup Steps

### 1. Get Your Supabase Connection Strings

Go to your Supabase project dashboard:
1. Click **Settings** → **Database**
2. Find **Connection string** section
3. Copy the **Connection pooling** URL (recommended for serverless)
4. Also copy the **Direct connection** URL (for migrations)

Your URLs will look like:
```
# Connection pooling (for app)
postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection (for migrations)
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 2. Update .env.local

Replace your local PostgreSQL URLs with Supabase:

```bash
# Replace the DATABASE_URL with Supabase connection pooling URL
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Add direct connection for migrations
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"
```

**Important:** Replace `[password]` with your actual database password!

### 3. Run the Supabase Migration

Open your Supabase SQL Editor and run the migration:

```bash
# Copy the contents of this file:
supabase/migrations/add-scoresnap-tables.sql
```

This will:
- ✅ Enhance your existing `games` table with ScoreSnap fields
- ✅ Create `users`, `submissions`, `validation_errors`, `edit_history` tables
- ✅ Add proper indexes for performance
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create useful views for queries

### 4. Generate Prisma Client

```bash
bunx prisma generate
```

This regenerates the Prisma Client with your Supabase schema.

### 5. Verify Setup

Run the test script to verify everything works:

```bash
bun scripts/test-setup.ts
```

You should see:
- ✅ Database connection successful (to Supabase)
- ✅ All authentication tests passing
- ✅ Sanity and Claude API configured

## Schema Changes

### Enhanced Games Table

Your existing `games` table now has additional ScoreSnap fields:

| Field | Type | Description |
|-------|------|-------------|
| `submission_id` | UUID | Links to ScoreSnap submission |
| `quarter_scores` | JSONB | Quarter-by-quarter breakdown |
| `overtime` | BOOLEAN | Was there overtime? |
| `game_data` | JSONB | **Full player stats from AI extraction** |
| `editable_until` | TIMESTAMP | 48-hour edit window |
| `approved_by` | UUID | Coach who approved the submission |
| `deleted_at` | TIMESTAMP | Soft delete |

### New Tables

**users** - Coach authentication
- email, password_hash, name, role, school_name, verified_at

**submissions** - Upload workflow
- user_id, sport, status, image_url, raw_ai_response

**validation_errors** - AI quality tracking
- submission_id, error_code, error_message, field_path

**edit_history** - Manual corrections
- game_id, edited_by, field_path, old_value, new_value

## Data Flow

```
1. Coach uploads scorebook image
   ↓
2. Stored in Sanity CDN (Submission created)
   ↓
3. Claude Vision AI extracts data
   ↓
4. Validation runs (ValidationError if issues)
   ↓
5. Coach reviews/edits in confirmation view
   ↓
6. Approved → Creates/updates Game record
   ↓
7. Game data available in your stats pipeline!
```

## Useful Queries

### Games with ScoreSnap enrichment
```sql
SELECT * FROM games_with_scoresnap_data
WHERE has_detailed_stats = true
ORDER BY date DESC
LIMIT 10;
```

### ScoreSnap submissions
```sql
SELECT * FROM scoresnap_submissions_with_users
WHERE status = 'COMPLETED'
ORDER BY created_at DESC;
```

### Find games with detailed player stats
```sql
SELECT
  date,
  home_team,
  away_team,
  home_score,
  away_score,
  game_data->'homeTeam'->'players' as home_players,
  game_data->'awayTeam'->'players' as away_players
FROM games_with_scoresnap_data
WHERE game_data IS NOT NULL;
```

## School Matching (Future Enhancement)

Currently, ScoreSnap stores team names as text strings for simplicity. In the future, you can:

1. Uncomment the `School` model in `prisma/schema.prisma`
2. Implement school name matching using your `school_aliases` table
3. Link games to school IDs for better data integrity

For MVP, text team names work great and keep it simple!

## Troubleshooting

### "relation does not exist" error
Make sure you ran the SQL migration in Supabase SQL Editor.

### Connection timeout
- Check your DATABASE_URL is using the pooler URL (port 6543)
- Verify your IP is allowed in Supabase Network Restrictions
- Check your database password is correct

### Prisma Client errors
```bash
# Regenerate Prisma Client
bunx prisma generate

# Check schema is in sync
bunx prisma db pull
```

## Next Steps

1. ✅ Verify Supabase connection works
2. ✅ Create your first admin user: `bun scripts/create-user.ts`
3. ✅ Ready for Week 2: AI Extraction Pipeline!

Your ScoreSnap data now lives in Supabase and automatically feeds your stats pipeline. 🎉
