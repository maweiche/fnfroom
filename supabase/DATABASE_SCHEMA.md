# Complete Database Schema

Full schema for NC High School Sports database including games, schools, players, stats, and rankings.

## Tables Overview

| Table | Purpose | Records |
|-------|---------|---------|
| `schools` | NC high school directory | Schools in NC |
| `school_aliases` | Alternative names for school matching | Multiple per school |
| `games` | Game results and schedules | Historical + upcoming games |
| `players` | Individual athletes (MaxPreps) | Players with stats |
| `player_stats` | Player statistics by season | Stats per player/sport/season |
| `team_rankings` | Team rankings (MaxPreps) | Rankings by sport/season |

## Entity Relationship Diagram

```
schools
  ├─→ school_aliases (many)
  ├─→ games (as home_team, many)
  ├─→ games (as away_team, many)
  ├─→ players (many)
  └─→ team_rankings (many)

players
  └─→ player_stats (many)
```

---

## Table: `schools`

Core directory of NC high schools.

### Schema

```sql
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,           -- Internal key: 'grimsley', 'smith'
  name TEXT NOT NULL,                 -- Full name: 'Grimsley High School'
  city TEXT,                          -- 'Greensboro'
  classification TEXT,                 -- '1A', '2A', '3A', '4A', 'NCISAA 1A'
  conference TEXT,                    -- Conference name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Example Data

```json
{
  "id": "uuid",
  "key": "grimsley",
  "name": "Grimsley High School",
  "city": "Greensboro",
  "classification": "4A",
  "conference": "Piedmont Triad 3A/4A",
  "created_at": "2026-02-08T10:00:00Z",
  "updated_at": "2026-02-08T10:00:00Z"
}
```

---

## Table: `school_aliases`

Alternative names for fuzzy school matching.

### Schema

```sql
CREATE TABLE school_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, alias)
);
```

### Example Data

```json
{
  "id": "uuid",
  "school_id": "uuid-of-grimsley",
  "alias": "Grimsley",
  "created_at": "2026-02-08T10:00:00Z"
}
```

---

## Table: `games`

Game results and schedules for all sports.

### Schema

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  sport TEXT NOT NULL,                -- 'Basketball', 'Lacrosse', 'Football', etc.
  home_team_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  away_team_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  home_score INTEGER,                 -- NULL for scheduled games
  away_score INTEGER,                 -- NULL for scheduled games
  status TEXT,                        -- 'Final', 'In Progress', 'Scheduled'
  source TEXT,                        -- 'MaxPreps', 'ScoreBook Live', etc.
  gender TEXT,                        -- 'Boys', 'Girls', NULL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_game UNIQUE(date, home_team_id, away_team_id, sport, gender)
);
```

### Indexes

```sql
CREATE INDEX idx_games_date ON games(date DESC);
CREATE INDEX idx_games_home_team ON games(home_team_id);
CREATE INDEX idx_games_away_team ON games(away_team_id);
CREATE INDEX idx_games_source ON games(source);
CREATE INDEX idx_games_sport ON games(sport);
```

### Example Data

```json
{
  "id": "uuid",
  "date": "2026-02-08",
  "sport": "Basketball",
  "home_team_id": "uuid-of-grimsley",
  "away_team_id": "uuid-of-smith",
  "home_score": 65,
  "away_score": 58,
  "status": "Final",
  "source": "ScoreBook Live",
  "gender": "Boys",
  "created_at": "2026-02-08T20:00:00Z",
  "updated_at": "2026-02-08T20:00:00Z"
}
```

---

## Table: `players`

Individual athletes from MaxPreps.

### Schema

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  maxpreps_profile_url TEXT,          -- Unique MaxPreps URL
  maxpreps_school_name TEXT,          -- School name from MaxPreps
  city TEXT,
  state TEXT,                         -- 'NC', 'SC', etc.
  position TEXT,                      -- 'G', 'M, A', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_maxpreps_player UNIQUE(maxpreps_profile_url)
);
```

### Indexes

```sql
CREATE INDEX idx_players_school ON players(school_id);
CREATE INDEX idx_players_state ON players(state);
CREATE INDEX idx_players_last_name ON players(last_name);
```

### Example Data

```json
{
  "id": "uuid",
  "first_name": "Rylan",
  "last_name": "Connors",
  "school_id": "uuid-of-school",
  "maxpreps_profile_url": "/ca/bellflower/st-john-bosco-braves/athletes/...",
  "maxpreps_school_name": "St. John Bosco",
  "city": "Bellflower",
  "state": "CA",
  "position": "M, A",
  "created_at": "2026-02-10T10:00:00Z",
  "updated_at": "2026-02-10T10:00:00Z"
}
```

---

## Table: `player_stats`

Statistics for individual players by sport and season.

### Schema

```sql
CREATE TABLE player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,                -- 'lacrosse', 'basketball', etc.
  season TEXT NOT NULL,               -- '24-25', '25-26', etc.
  stat_type TEXT NOT NULL,            -- 'goals', 'points', 'rebounds', etc.
  value NUMERIC NOT NULL,             -- Primary stat value
  per_game_value NUMERIC,             -- Per game average
  games_played INTEGER,
  national_rank INTEGER,              -- National ranking
  state_rank INTEGER,                 -- State ranking

  -- Basketball-specific fields
  field_goals_made INTEGER,
  field_goal_attempts INTEGER,
  field_goal_percentage NUMERIC,
  three_point_made INTEGER,
  three_point_percentage NUMERIC,
  free_throws_made INTEGER,
  free_throw_percentage NUMERIC,

  source TEXT DEFAULT 'maxpreps',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_player_stat UNIQUE(player_id, sport, season, stat_type, source)
);
```

### Indexes

```sql
CREATE INDEX idx_player_stats_player ON player_stats(player_id);
CREATE INDEX idx_player_stats_sport_season ON player_stats(sport, season);
CREATE INDEX idx_player_stats_stat_type ON player_stats(stat_type);
CREATE INDEX idx_player_stats_rank ON player_stats(national_rank);
```

### Stat Types by Sport

**Lacrosse:**
- `goals` - Total goals scored
- `assists` - Total assists
- `faceoff_percentage` - Face-off win percentage
- `save_percentage` - Save percentage (goalies)

**Basketball:**
- `points` - Total points (includes shooting percentages)
- `rebounds` - Total rebounds
- `assists` - Total assists
- `steals` - Total steals
- `blocks` - Total blocks

### Example Data

```json
{
  "id": "uuid",
  "player_id": "uuid-of-player",
  "sport": "lacrosse",
  "season": "24-25",
  "stat_type": "goals",
  "value": 109,
  "per_game_value": 5.7,
  "games_played": 19,
  "national_rank": 1,
  "state_rank": null,
  "source": "maxpreps",
  "created_at": "2026-02-10T10:00:00Z",
  "updated_at": "2026-02-10T10:00:00Z"
}
```

**Basketball with shooting stats:**

```json
{
  "id": "uuid",
  "player_id": "uuid-of-player",
  "sport": "basketball",
  "season": "24-25",
  "stat_type": "points",
  "value": 960,
  "per_game_value": 33.1,
  "games_played": 29,
  "national_rank": 1,
  "state_rank": 1,
  "field_goals_made": 350,
  "field_goal_attempts": 700,
  "field_goal_percentage": 50.0,
  "three_point_made": 100,
  "three_point_percentage": 38.5,
  "free_throws_made": 160,
  "free_throw_percentage": 85.0,
  "source": "maxpreps",
  "created_at": "2026-02-10T10:00:00Z",
  "updated_at": "2026-02-10T10:00:00Z"
}
```

---

## Table: `team_rankings`

Team rankings by sport and season.

### Schema

```sql
CREATE TABLE team_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  maxpreps_school_id TEXT,            -- MaxPreps internal ID
  maxpreps_school_name TEXT NOT NULL,
  sport TEXT NOT NULL,                -- 'basketball', 'lacrosse', etc.
  season TEXT NOT NULL,               -- '24-25', '25-26'
  rank INTEGER NOT NULL,
  rating NUMERIC,                     -- MaxPreps rating
  strength NUMERIC,                   -- Strength metric
  wins INTEGER,
  losses INTEGER,
  ties INTEGER DEFAULT 0,
  movement TEXT,                      -- '+2', '-1', 'NEW', ''
  state TEXT DEFAULT 'NC',
  last_updated TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'maxpreps',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_team_ranking UNIQUE(maxpreps_school_id, sport, season, source)
);
```

### Indexes

```sql
CREATE INDEX idx_team_rankings_school ON team_rankings(school_id);
CREATE INDEX idx_team_rankings_sport_season ON team_rankings(sport, season);
CREATE INDEX idx_team_rankings_rank ON team_rankings(rank);
```

### Example Data

```json
{
  "id": "uuid",
  "school_id": "uuid-of-school",
  "maxpreps_school_id": "abc123",
  "maxpreps_school_name": "Concord Academy (Concord, NC)",
  "sport": "basketball",
  "season": "24-25",
  "rank": 1,
  "rating": 33.02,
  "strength": 17.6435,
  "wins": 25,
  "losses": 2,
  "ties": 0,
  "movement": "+2",
  "state": "NC",
  "last_updated": "2026-02-09T02:04:51Z",
  "source": "maxpreps",
  "created_at": "2026-02-10T10:00:00Z",
  "updated_at": "2026-02-10T10:00:00Z"
}
```

---

## Views

### `games_with_schools`

Games with school names instead of IDs.

```sql
CREATE VIEW games_with_schools AS
SELECT
  g.id,
  g.date,
  g.sport,
  g.gender,
  home.name AS home_team,
  home.city AS home_city,
  home.classification AS home_classification,
  g.home_score,
  away.name AS away_team,
  away.city AS away_city,
  away.classification AS away_classification,
  g.away_score,
  g.status,
  g.source,
  g.created_at
FROM games g
LEFT JOIN schools home ON g.home_team_id = home.id
LEFT JOIN schools away ON g.away_team_id = away.id;
```

### `school_stats`

Aggregated statistics per school.

```sql
CREATE VIEW school_stats AS
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
WHERE g.status = 'Final'
GROUP BY s.id, s.name, s.classification, s.conference;
```

### `players_with_stats`

Players with their statistics.

```sql
CREATE VIEW players_with_stats AS
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
```

### `rankings_with_schools`

Team rankings with school info.

```sql
CREATE VIEW rankings_with_schools AS
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
```

---

## Common API Queries

### 1. Get Recent Games

```sql
SELECT * FROM games_with_schools
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC, sport;
```

### 2. Get School Profile

```sql
-- Basic info
SELECT * FROM schools WHERE key = 'grimsley';

-- With stats
SELECT * FROM school_stats WHERE id = (SELECT id FROM schools WHERE key = 'grimsley');

-- Recent games
SELECT * FROM games_with_schools
WHERE home_team = 'Grimsley High School' OR away_team = 'Grimsley High School'
ORDER BY date DESC
LIMIT 10;
```

### 3. Get Top Players by Sport

```sql
-- Top lacrosse scorers in NC
SELECT
  first_name || ' ' || last_name as name,
  maxpreps_school_name as school,
  value as goals,
  per_game_value as gpg,
  games_played as gp,
  national_rank
FROM players p
JOIN player_stats ps ON p.id = ps.player_id
WHERE ps.sport = 'lacrosse'
  AND ps.stat_type = 'goals'
  AND p.state = 'NC'
ORDER BY ps.value DESC
LIMIT 20;
```

### 4. Get Team Rankings

```sql
SELECT
  rank,
  maxpreps_school_name as school,
  wins || '-' || losses as record,
  rating,
  movement,
  last_updated
FROM team_rankings
WHERE sport = 'basketball'
  AND season = '24-25'
  AND state = 'NC'
ORDER BY rank
LIMIT 25;
```

### 5. Get All Stats for a Player

```sql
SELECT
  ps.sport,
  ps.season,
  ps.stat_type,
  ps.value,
  ps.per_game_value,
  ps.games_played,
  ps.national_rank
FROM players p
JOIN player_stats ps ON p.id = ps.player_id
WHERE p.first_name = 'Rylan' AND p.last_name = 'Connors'
ORDER BY ps.sport, ps.stat_type;
```

### 6. Search Players

```sql
SELECT
  p.first_name || ' ' || p.last_name as name,
  p.maxpreps_school_name as school,
  p.position,
  p.city,
  p.state,
  COUNT(ps.id) as num_stats
FROM players p
LEFT JOIN player_stats ps ON p.id = ps.player_id
WHERE p.last_name ILIKE '%smith%'
GROUP BY p.id, p.first_name, p.last_name, p.maxpreps_school_name, p.position, p.city, p.state
ORDER BY p.last_name, p.first_name;
```

### 7. Get Upcoming Games

```sql
SELECT * FROM games_with_schools
WHERE date >= CURRENT_DATE
  AND status = 'Scheduled'
ORDER BY date, sport;
```

### 8. Get School's Players

```sql
SELECT
  p.first_name || ' ' || p.last_name as player,
  ps.sport,
  ps.stat_type,
  ps.value,
  ps.per_game_value,
  ps.national_rank
FROM players p
JOIN player_stats ps ON p.id = ps.player_id
WHERE p.maxpreps_school_name ILIKE '%Cardinal Gibbons%'
ORDER BY ps.sport, ps.value DESC;
```

---

## REST API Endpoints (Supabase)

### Games

```javascript
// Get recent games
const { data } = await supabase
  .from('games_with_schools')
  .select('*')
  .gte('date', '2026-02-01')
  .order('date', { ascending: false });

// Get games by sport
const { data } = await supabase
  .from('games_with_schools')
  .select('*')
  .eq('sport', 'Basketball')
  .eq('gender', 'Boys')
  .order('date', { ascending: false });
```

### Schools

```javascript
// Get all schools
const { data } = await supabase
  .from('schools')
  .select('*')
  .order('name');

// Get school with stats
const { data } = await supabase
  .from('school_stats')
  .select('*')
  .eq('name', 'Grimsley High School')
  .single();
```

### Players

```javascript
// Get top scorers
const { data } = await supabase
  .from('players_with_stats')
  .select('*')
  .eq('sport', 'lacrosse')
  .eq('stat_type', 'goals')
  .eq('state', 'NC')
  .order('value', { ascending: false })
  .limit(20);

// Search players
const { data } = await supabase
  .from('players')
  .select('*, player_stats(*)')
  .ilike('last_name', '%smith%')
  .order('last_name');
```

### Rankings

```javascript
// Get basketball rankings
const { data } = await supabase
  .from('rankings_with_schools')
  .select('*')
  .eq('sport', 'basketball')
  .eq('season', '24-25')
  .eq('state', 'NC')
  .order('rank');
```

---

## TypeScript Types

```typescript
export interface School {
  id: string;
  key: string;
  name: string;
  city: string | null;
  classification: string | null;
  conference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  date: string;
  sport: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
  source: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameWithSchools {
  id: string;
  date: string;
  sport: string;
  gender: string | null;
  home_team: string;
  home_city: string;
  home_classification: string;
  home_score: number | null;
  away_team: string;
  away_city: string;
  away_classification: string;
  away_score: number | null;
  status: string;
  source: string;
  created_at: string;
}

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  school_id: string | null;
  maxpreps_profile_url: string | null;
  maxpreps_school_name: string | null;
  city: string | null;
  state: string | null;
  position: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerStats {
  id: string;
  player_id: string;
  sport: string;
  season: string;
  stat_type: string;
  value: number;
  per_game_value: number | null;
  games_played: number | null;
  national_rank: number | null;
  state_rank: number | null;
  field_goals_made: number | null;
  field_goal_attempts: number | null;
  field_goal_percentage: number | null;
  three_point_made: number | null;
  three_point_percentage: number | null;
  free_throws_made: number | null;
  free_throw_percentage: number | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface TeamRanking {
  id: string;
  school_id: string | null;
  maxpreps_school_id: string | null;
  maxpreps_school_name: string;
  sport: string;
  season: string;
  rank: number;
  rating: number | null;
  strength: number | null;
  wins: number;
  losses: number;
  ties: number;
  movement: string | null;
  state: string;
  last_updated: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerWithStats extends Player {
  full_name: string;
  matched_school_name: string | null;
  classification: string | null;
  conference: string | null;
  sport: string;
  season: string;
  stat_type: string;
  value: number;
  per_game_value: number | null;
  games_played: number | null;
  national_rank: number | null;
  state_rank: number | null;
}

export interface RankingWithSchool extends TeamRanking {
  matched_school_name: string | null;
  city: string | null;
  classification: string | null;
  conference: string | null;
}
```

---

## Data Sources

- **Schools**: Manual entry, NCHSAA
- **Games**: ScoreBook Live, MaxPreps, GreensboroSports.com
- **Players**: MaxPreps
- **Player Stats**: MaxPreps
- **Team Rankings**: MaxPreps

## Update Frequency

- Games: Daily (via scheduled pipeline)
- Player Stats: Weekly (run `fetch_maxpreps.py`)
- Team Rankings: Weekly (run `fetch_maxpreps.py`)
- Schools: As needed (manual updates)
