-- Create games_with_schools view for Games of the Week feature
-- This view joins games with school information to provide team names, cities, and classifications

CREATE OR REPLACE VIEW games_with_schools AS
SELECT
  g.id,
  g.date,
  g.sport,
  g.gender,
  g.status,
  g.source,
  g.home_score,
  g.away_score,

  -- Home team information
  home.name AS home_team,
  home.city AS home_city,
  home.classification AS home_classification,

  -- Away team information
  away.name AS away_team,
  away.city AS away_city,
  away.classification AS away_classification,

  -- ScoreSnap enrichment
  g.submission_id,
  g.quarter_scores,
  g.overtime,
  g.game_data,
  g.editable_until,
  g.created_at,
  g.updated_at
FROM games g
LEFT JOIN schools home ON g.home_team_id = home.id
LEFT JOIN schools away ON g.away_team_id = away.id
WHERE g.deleted_at IS NULL;

COMMENT ON VIEW games_with_schools IS 'Games with complete school information for schedules and rankings';
