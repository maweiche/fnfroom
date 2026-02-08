-- ========================================
-- Press Box AI Rollback Script
-- Run this to undo the Press Box AI migration
-- ========================================
-- Usage: psql $DATABASE_URL -f scripts/rollback-press-box-ai.sql

BEGIN;

-- Step 1: Drop articles table (cascades to conversations)
DROP TABLE IF EXISTS "articles" CASCADE;

-- Step 2: Drop conversations table
DROP TABLE IF EXISTS "conversations" CASCADE;

-- Step 3: Remove writer_style_notes column from users
ALTER TABLE "users" DROP COLUMN IF EXISTS "writer_style_notes";

-- Step 4: Verify rollback
DO $$
BEGIN
    -- Check that tables are gone
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
        RAISE EXCEPTION 'Rollback failed: conversations table still exists';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'articles') THEN
        RAISE EXCEPTION 'Rollback failed: articles table still exists';
    END IF;

    -- Check that column is gone
    IF EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'writer_style_notes'
    ) THEN
        RAISE EXCEPTION 'Rollback failed: writer_style_notes column still exists';
    END IF;

    RAISE NOTICE 'Rollback completed successfully';
END $$;

COMMIT;
