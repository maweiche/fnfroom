-- ScoreSnap Integration for Supabase
-- Adds ScoreSnap tables and enhances existing games table
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- ENHANCE EXISTING GAMES TABLE
-- ==============================================
-- Add ScoreSnap fields to existing games table for detailed game data
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS submission_id UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS quarter_scores JSONB,  -- [[Q1_home, Q1_away], [Q2_home, Q2_away], ...]
  ADD COLUMN IF NOT EXISTS overtime BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS game_data JSONB,  -- Complete player stats from AI extraction
  ADD COLUMN IF NOT EXISTS editable_until TIMESTAMP WITH TIME ZONE,  -- 48-hour edit window
  ADD COLUMN IF NOT EXISTS approved_by UUID,  -- References users.id
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;  -- Soft delete

-- Add ScoreSnap-specific indexes
CREATE INDEX IF NOT EXISTS idx_games_submission_id ON games(submission_id);
CREATE INDEX IF NOT EXISTS idx_games_editable_until ON games(editable_until);
CREATE INDEX IF NOT EXISTS idx_games_deleted_at ON games(deleted_at);
CREATE INDEX IF NOT EXISTS idx_games_sport_date ON games(sport, date);

-- ==============================================
-- USERS TABLE (Coaches and Admins)
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'COACH',  -- 'ADMIN' or 'COACH'

  -- Coach-specific fields
  school_name TEXT,
  primary_sport TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,  -- Admin approval timestamp

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE  -- Soft delete
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_school_name ON users(school_name);
CREATE INDEX IF NOT EXISTS idx_users_verified_at ON users(verified_at);

COMMENT ON TABLE users IS 'ScoreSnap: Coach and admin authentication';

-- ==============================================
-- SUBMISSIONS TABLE (Upload Workflow)
-- ==============================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  sport TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',  -- 'DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED'

  -- Image storage (Sanity CDN URLs)
  image_url TEXT NOT NULL,
  image_asset_id TEXT,  -- Sanity asset ID

  -- AI extraction response
  raw_ai_response JSONB,  -- Full Claude response
  processing_time_ms INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_sport ON submissions(sport);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

COMMENT ON TABLE submissions IS 'ScoreSnap: Image upload and AI extraction workflow';

-- ==============================================
-- VALIDATION ERRORS TABLE (AI Quality Tracking)
-- ==============================================
CREATE TABLE IF NOT EXISTS validation_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL,

  error_code TEXT NOT NULL,  -- 'POINTS_MISMATCH', 'FOULS_EXCEED_MAX', etc.
  error_message TEXT NOT NULL,
  field_path TEXT,  -- e.g., 'homeTeam.players[3].points'

  -- Coach override
  overridden BOOLEAN DEFAULT false,
  override_reason TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_validation_errors_submission_id ON validation_errors(submission_id);
CREATE INDEX IF NOT EXISTS idx_validation_errors_error_code ON validation_errors(error_code);
CREATE INDEX IF NOT EXISTS idx_validation_errors_created_at ON validation_errors(created_at);

COMMENT ON TABLE validation_errors IS 'ScoreSnap: Track AI extraction validation errors';

-- ==============================================
-- EDIT HISTORY TABLE (Field-Level Changes)
-- ==============================================
CREATE TABLE IF NOT EXISTS edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  edited_by UUID NOT NULL,  -- User ID
  edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  field_path TEXT NOT NULL,  -- e.g., 'homeTeam.players[0].points'
  old_value TEXT,
  new_value TEXT
);

CREATE INDEX IF NOT EXISTS idx_edit_history_game_id ON edit_history(game_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_edited_at ON edit_history(edited_at);
CREATE INDEX IF NOT EXISTS idx_edit_history_field_path ON edit_history(field_path);

COMMENT ON TABLE edit_history IS 'ScoreSnap: Track manual edits to game data for AI improvement';

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_history ENABLE ROW LEVEL SECURITY;

-- Users: Public read (for coach directory), authenticated write
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON users
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Submissions: Public read, authenticated write
CREATE POLICY "Enable read access for all users" ON submissions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON submissions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON submissions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Validation errors: Public read (for transparency)
CREATE POLICY "Enable read access for all users" ON validation_errors
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON validation_errors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Edit history: Public read (for transparency)
CREATE POLICY "Enable read access for all users" ON edit_history
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON edit_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==============================================
-- USEFUL VIEWS
-- ==============================================

-- ScoreSnap submissions with user info
CREATE OR REPLACE VIEW scoresnap_submissions_with_users AS
SELECT
  s.id,
  s.sport,
  s.status,
  s.image_url,
  s.processing_time_ms,
  s.created_at,
  u.name AS coach_name,
  u.email AS coach_email,
  u.school_name
FROM submissions s
JOIN users u ON s.user_id = u.id;

COMMENT ON VIEW scoresnap_submissions_with_users IS 'ScoreSnap submissions with coach information';

-- Games with ScoreSnap enrichment
CREATE OR REPLACE VIEW games_with_scoresnap_data AS
SELECT
  g.id,
  g.date,
  g.sport,
  g.gender,
  home.name AS home_team,
  g.home_score,
  away.name AS away_team,
  g.away_score,
  g.status,
  g.source,
  -- ScoreSnap enrichment
  g.submission_id,
  g.quarter_scores,
  g.overtime,
  g.game_data,
  g.editable_until,
  CASE
    WHEN g.game_data IS NOT NULL THEN true
    ELSE false
  END AS has_detailed_stats
FROM games g
LEFT JOIN schools home ON g.home_team_id = home.id
LEFT JOIN schools away ON g.away_team_id = away.id
WHERE g.deleted_at IS NULL;

COMMENT ON VIEW games_with_scoresnap_data IS 'Games with ScoreSnap detailed player stats';
