-- Add college tracking fields to players table
-- For tracking NC high school athletes playing at the college level

ALTER TABLE players
ADD COLUMN IF NOT EXISTS college_name TEXT,
ADD COLUMN IF NOT EXISTS college_division TEXT,
ADD COLUMN IF NOT EXISTS college_class_year TEXT;

-- Add index for college name lookups
CREATE INDEX IF NOT EXISTS idx_players_college_name ON players(college_name) WHERE college_name IS NOT NULL;

COMMENT ON COLUMN players.college_name IS 'Name of college/university if player is at college level';
COMMENT ON COLUMN players.college_division IS 'Division level (Division I, II, III, NAIA, NJCAA)';
COMMENT ON COLUMN players.college_class_year IS 'High school graduating class year (e.g., 2024)';
