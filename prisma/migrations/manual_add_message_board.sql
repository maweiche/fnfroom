-- Message Board: BoardPost + BoardReply tables
-- Run this in Supabase SQL Editor

CREATE TABLE "board_posts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "board_replies" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "post_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_replies_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "board_posts_author_id_idx" ON "board_posts"("author_id");
CREATE INDEX "board_posts_created_at_idx" ON "board_posts"("created_at");
CREATE INDEX "board_replies_post_id_created_at_idx" ON "board_replies"("post_id", "created_at");
CREATE INDEX "board_replies_author_id_idx" ON "board_replies"("author_id");

-- Foreign keys
ALTER TABLE "board_posts" ADD CONSTRAINT "board_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "board_replies" ADD CONSTRAINT "board_replies_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "board_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "board_replies" ADD CONSTRAINT "board_replies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- Community Message Board
-- ========================================

-- Add display_name and banned_at to users
ALTER TABLE "users" ADD COLUMN "display_name" VARCHAR(30);
ALTER TABLE "users" ADD COLUMN "banned_at" TIMESTAMP(3);

-- Community Categories
CREATE TABLE "community_categories" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sport" VARCHAR(50),
    "sort_order" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "community_categories_slug_key" ON "community_categories"("slug");
CREATE INDEX "community_categories_sort_order_idx" ON "community_categories"("sort_order");

-- Community Threads
CREATE TABLE "community_threads" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INT NOT NULL DEFAULT 0,
    "post_count" INT NOT NULL DEFAULT 0,
    "last_post_at" TIMESTAMP(3),
    "last_post_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_threads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "community_threads_category_pinned_last_post_idx" ON "community_threads"("category_id", "pinned" DESC, "last_post_at" DESC);
CREATE INDEX "community_threads_author_id_idx" ON "community_threads"("author_id");
CREATE INDEX "community_threads_deleted_at_idx" ON "community_threads"("deleted_at");

ALTER TABLE "community_threads" ADD CONSTRAINT "community_threads_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "community_threads" ADD CONSTRAINT "community_threads_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "community_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Community Replies
CREATE TABLE "community_replies" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "body" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "edited_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_replies_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "community_replies_thread_id_created_at_idx" ON "community_replies"("thread_id", "created_at");
CREATE INDEX "community_replies_author_id_idx" ON "community_replies"("author_id");
CREATE INDEX "community_replies_deleted_at_idx" ON "community_replies"("deleted_at");

ALTER TABLE "community_replies" ADD CONSTRAINT "community_replies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "community_replies" ADD CONSTRAINT "community_replies_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "community_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed categories
INSERT INTO "community_categories" ("name", "slug", "description", "sport", "sort_order") VALUES
    ('Basketball', 'basketball', 'NC high school basketball discussion', 'basketball', 1),
    ('Football', 'football', 'NC high school football discussion', 'football', 2),
    ('Lacrosse', 'lacrosse', 'NC high school lacrosse discussion', 'lacrosse', 3),
    ('Recruiting', 'recruiting', 'Recruiting news, offers, and commitments', NULL, 4),
    ('General', 'general', 'Off-topic and general sports talk', NULL, 5);
