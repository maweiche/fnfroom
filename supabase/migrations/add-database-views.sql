-- Additional database views for complete schema integration
-- Based on DATABASE_SCHEMA.md specifications

-- ========================================
-- school_stats view: Aggregated statistics per school
-- ========================================
CREATE OR REPLACE VIEW school_stats AS
SELECT
  s.id,
  s.name,
  s.classification,
  s.conference,
  COUNT(DISTINCT g.id) AS games_played,
  SUM(CASE
    WHEN g.home_team_id = s.id AND g.home_score > g.away_score THEN 1
    WHEN g.away_team_id = s.id AND g.away_score > g.home_score THEN 1
    ELSE 0
  END) AS wins,
  SUM(CASE
    WHEN g.home_team_id = s.id AND g.home_score < g.away_score THEN 1
    WHEN g.away_team_id = s.id AND g.away_score < g.home_score THEN 1
    ELSE 0
  END) AS losses,
  ROUND(AVG(CASE
    WHEN g.home_team_id = s.id THEN g.home_score
    WHEN g.away_team_id = s.id THEN g.away_score
  END), 1) AS avg_points_scored,
  ROUND(AVG(CASE
    WHEN g.home_team_id = s.id THEN g.away_score
    WHEN g.away_team_id = s.id THEN g.home_score
  END), 1) AS avg_points_allowed
FROM schools s
LEFT JOIN games g ON (g.home_team_id = s.id OR g.away_team_id = s.id)
WHERE g.status = 'Final' AND g.deleted_at IS NULL
GROUP BY s.id, s.name, s.classification, s.conference;

COMMENT ON VIEW school_stats IS 'Aggregated statistics for each school across all games';

-- ========================================
-- players_with_stats view: Players with their statistics
-- ========================================
CREATE OR REPLACE VIEW players_with_stats AS
SELECT
  p.id,
  p.first_name,
  p.last_name,
  p.first_name || ' ' || p.last_name AS full_name,
  p.city,
  p.state,
  p.position,
  p.maxpreps_school_name,
  s.name AS matched_school_name,
  s.classification,
  s.conference,
  ps.sport,
  ps.season,
  ps.stat_type,
  ps.value,
  ps.per_game_value,
  ps.games_played,
  ps.national_rank,
  ps.state_rank
FROM players p
LEFT JOIN schools s ON p.school_id = s.id
LEFT JOIN player_stats ps ON p.id = ps.player_id;

COMMENT ON VIEW players_with_stats IS 'Players with full statistics and school information';

-- ========================================
-- rankings_with_schools view: Team rankings with school info
-- ========================================
CREATE OR REPLACE VIEW rankings_with_schools AS
SELECT
  tr.id,
  tr.rank,
  tr.maxpreps_school_name,
  s.name AS matched_school_name,
  s.city,
  s.classification,
  s.conference,
  tr.sport,
  tr.season,
  tr.rating,
  tr.strength,
  tr.wins,
  tr.losses,
  tr.ties,
  tr.movement,
  tr.last_updated
FROM team_rankings tr
LEFT JOIN schools s ON tr.school_id = s.id
ORDER BY tr.rank;

COMMENT ON VIEW rankings_with_schools IS 'Team rankings with matched school information';
