-- ========================================
-- Press Box AI Migration
-- Adds writer functionality to existing User model
-- Adds Conversation and Article tables
-- ========================================

-- Step 1: Add Press Box AI field to users table
ALTER TABLE "users" ADD COLUMN "writer_style_notes" TEXT;

-- Step 2: Create conversations table
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "sport" TEXT NOT NULL DEFAULT 'football',
    "home_team" TEXT NOT NULL,
    "away_team" TEXT NOT NULL,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "game_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "transcript" JSONB NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create articles table
CREATE TABLE "articles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "headline" TEXT NOT NULL,
    "body_markdown" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "edit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create indexes for conversations
CREATE INDEX "conversations_user_id_created_at_idx" ON "conversations"("user_id", "created_at");
CREATE INDEX "conversations_completed_idx" ON "conversations"("completed");
CREATE INDEX "conversations_sport_game_date_idx" ON "conversations"("sport", "game_date");

-- Step 5: Create indexes for articles
CREATE INDEX "articles_user_id_created_at_idx" ON "articles"("user_id", "created_at");
CREATE INDEX "articles_conversation_id_idx" ON "articles"("conversation_id");
CREATE INDEX "articles_published_idx" ON "articles"("published");

-- Step 6: Add foreign key constraints
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "articles" ADD CONSTRAINT "articles_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "articles" ADD CONSTRAINT "articles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Add comments for documentation
COMMENT ON TABLE "conversations" IS 'Press Box AI: Voice interview sessions with writers about games';
COMMENT ON TABLE "articles" IS 'Press Box AI: Generated article drafts from conversations';
COMMENT ON COLUMN "users"."writer_style_notes" IS 'Press Box AI: Optional style guide for article generation (e.g., "Short sentences, light on stats")';
