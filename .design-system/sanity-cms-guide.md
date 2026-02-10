# Sanity CMS Guide - College Corner & Beer Cooler

**Date**: 2026-02-10
**Purpose**: Guide for managing College Corner and Beer Cooler content via Sanity Studio

## Quick Start

1. **Access Sanity Studio**: Navigate to http://localhost:3000/studio
2. **Sign in** with your Sanity account
3. **Create content** using the new document types below

## New Content Types

### 1. College Corner Update

**Document Type**: `College Corner Update`

Use this to add updates about NC prep athletes performing at the college level.

**Required Fields**:
- **Player Name**: Full name (e.g., "Jordan Williams")
- **Slug**: Auto-generates from player name
- **Sport**: Basketball, Football, or Lacrosse
- **Position**: Player position (e.g., "PG", "RB", "M")
- **High School**: NC high school they attended
- **Class Year**: Graduation year (e.g., "2024")
- **College/University**: Current college (e.g., "Duke University")
- **Division**: Division I, II, III, NAIA, or NJCAA
- **Update Text**: Brief description (max 250 chars)
  - Example: "Scored career-high 18 points in victory over Virginia"
- **Game Stats**: Formatted stat line (e.g., "18 PTS, 5 AST, 3 REB")
- **Game Date**: Date of the performance
- **Publish Date**: When to publish this update

**Optional Fields**:
- **Featured Update**: Toggle ON to display prominently
- **Photo**: Upload game/player photo
  - Alternative Text (for accessibility)
  - Photographer Credit

**Example Entry**:
```
Player Name: Jordan Williams
Sport: Basketball
Position: PG
High School: Charlotte Latin
Class Year: 2024
College: Duke University
Division: Division I
Update Text: Scored career-high 18 points in victory over Virginia
Game Stats: 18 PTS, 5 AST, 3 REB
Game Date: 2026-02-08
Featured: No
```

### 2. Beer Cooler Game Recap

**Document Type**: `Beer Cooler Game Recap`

Use this to add Triad Adult Lacrosse League game recaps.

**Required Fields**:
- **Headline**: Game title/headline
  - Example: "Stick City Clinches Championship with Overtime Thriller"
- **Slug**: Auto-generates from headline
- **League**: Pre-filled as "Triad Adult Lacrosse League"
- **Sport**: Pre-filled as "lacrosse"
- **Location**: Game location (e.g., "Greensboro, NC")
- **Game Recap**: Brief summary (2-3 sentences, max 300 chars)
- **Game Stats**: Formatted stat line (e.g., "12-11 (OT) • Thompson: 5 G, 2 A")
- **Game Date**: Date of the game
- **Publish Date**: When to publish this recap

**Optional Fields**:
- **Featured Game**: Toggle ON to display as featured story
- **Photo**: Upload game photo
  - Alternative Text
  - Photographer Credit
- **Home Team**: Team name (for standings tracking)
- **Away Team**: Team name (for standings tracking)
- **Home Score**: Final score (for standings tracking)
- **Away Score**: Final score (for standings tracking)

**Example Entry**:
```
Headline: Stick City Clinches Championship with Overtime Thriller
Location: Greensboro, NC
Game Recap: Stick City completed their championship run with a dramatic 12-11 overtime victory over the Gate City Shooters. Former Wake Forest midfielder Jake Thompson scored the golden goal 2:47 into OT, capping off a 5-goal performance.
Game Stats: 12-11 (OT) • Thompson: 5 G, 2 A
Game Date: 2026-02-08
Featured: Yes
Home Team: Stick City
Away Team: Gate City Shooters
Home Score: 12
Away Score: 11
```

## Workflow Tips

### College Corner

**Content Strategy**:
1. Track 10-15 key NC prep athletes per sport
2. Add updates after big games (career highs, awards, upsets)
3. Feature 1-2 updates per week
4. Mix sports (don't do all basketball in one week)

**Photo Guidelines**:
- Use action shots when possible
- College game photos preferred
- High school throwback photos OK
- Minimum 1200x800px
- Request permission for social media photos

### Beer Cooler

**Content Strategy**:
1. Cover all playoff games
2. Feature 1-2 regular season games per week
3. Prioritize rivalry games and upsets
4. Highlight former college players

**Photo Guidelines**:
- Adult league game photos
- Team photos OK
- Beer/social photos OK (keep it PG)
- Minimum 1200x800px

## Publishing Workflow

1. **Draft**: Create and save content
2. **Preview**: Check how it looks on the page
3. **Publish**: Set publish date and publish
4. **Update**: Edit anytime, changes are live immediately

## Standings Management

**Location**: `/data/triad-lacrosse-standings.ts`

The league standings table is NOT managed in Sanity (it's code-based for easier updates).

**To Update Standings**:

1. Open `/data/triad-lacrosse-standings.ts`
2. Update the `STANDINGS` array:
   ```typescript
   {
     rank: 1,
     team: "Stick City",
     wins: 10,  // Update wins
     losses: 2, // Update losses
     gf: 142,   // Goals For
     ga: 98,    // Goals Against
   }
   ```
3. Update `CURRENT_SEASON` if needed (e.g., "Playoffs", "Championship")
4. Save the file - changes appear immediately

**Adding New Teams**:
```typescript
{
  rank: 9,
  team: "New Team Name",
  wins: 0,
  losses: 0,
  gf: 0,
  ga: 0,
}
```

Keep rank numbers sequential (1, 2, 3, etc.)

## Content Display

### College Corner Page (`/college`)

**Data Source**: Pulls from Sanity CMS (once implemented)

**Display Logic**:
- Featured updates show in hero section
- Recent updates in grid (3 columns desktop)
- Sorted by game date (newest first)
- Filter by sport

### Beer Cooler Page (`/beer-cooler`)

**Data Sources**:
- Game recaps: Sanity CMS (once implemented)
- Standings: `/data/triad-lacrosse-standings.ts` (code)

**Display Logic**:
- Featured game shows in spotlight section
- Recent games in grid (3 columns desktop)
- Sorted by game date (newest first)
- Standings table shows all teams

## Next Steps

### Immediate (Connect to Pages)

Create API routes to fetch from Sanity:

1. **College Corner API** (`/api/college-updates`):
   ```typescript
   // Fetch latest college updates
   const updates = await sanityClient.fetch(
     `*[_type == "collegeUpdate"] | order(gameDate desc) [0...20]`
   );
   ```

2. **Beer Cooler API** (`/api/beer-cooler-games`):
   ```typescript
   // Fetch latest game recaps
   const games = await sanityClient.fetch(
     `*[_type == "beerCoolerGame"] | order(gameDate desc) [0...20]`
   );
   ```

3. **Update Pages** to use real data instead of sample data

### Short-term

1. **Image optimization**: Use Next.js Image with Sanity CDN
2. **Search/Filter**: Add working sport filters
3. **Pagination**: Add "Load More" or pagination
4. **RSS Feeds**: Auto-generate feeds for both sections

### Long-term

1. **Automated stats pulling**: Integration with college stats APIs
2. **Email newsletters**: Weekly digests
3. **Social media**: Auto-post to Twitter/Instagram
4. **Player profiles**: Link college updates to player records

## Sanity Studio Organization

Your studio now has these sections:

```
📁 Content Types
├── Article (main site articles)
├── Video (highlight videos)
├── Player (recruiting profiles)
├── Rankings (team rankings)
├── Staff Member (staff bios)
├── 🆕 College Corner Update
└── 🆕 Beer Cooler Game Recap
```

## Common Tasks

### Task: Add a college update

1. Go to `/studio`
2. Click "College Corner Update" → "Create"
3. Fill in all required fields
4. Upload photo (optional)
5. Toggle "Featured" if this should be prominent
6. Click "Publish"

### Task: Add a game recap

1. Go to `/studio`
2. Click "Beer Cooler Game Recap" → "Create"
3. Fill in all required fields
4. Add team/score info for standings tracking
5. Toggle "Featured" for spotlight display
6. Click "Publish"

### Task: Update standings

1. Open `/data/triad-lacrosse-standings.ts` in your code editor
2. Find the team in the STANDINGS array
3. Update wins, losses, gf (goals for), ga (goals against)
4. Save file
5. Refresh Beer Cooler page - changes appear immediately

### Task: Feature different content

1. Go to `/studio`
2. Find the document you want to feature
3. Toggle "Featured" ON
4. Toggle "Featured" OFF on the old featured item
5. Only 1-2 items should be featured at a time

## Tips & Best Practices

### Writing Good Updates

**College Corner**:
- ✅ "Scored career-high 18 points in victory over Virginia"
- ❌ "Had a good game today"

**Beer Cooler**:
- ✅ "Former Wake Forest midfielder Jake Thompson scored the golden goal 2:47 into OT"
- ❌ "Thompson scored the game winner"

### Photo Selection

- Action shots > posed photos
- Landscape orientation preferred (16:9)
- Faces clearly visible
- Good lighting
- High resolution (min 1200px wide)

### Stat Formatting

**Basketball**: "18 PTS, 5 AST, 3 REB"
**Football**: "120 YDS, 2 TD" or "245 YDS, 2 TD, 1 INT"
**Lacrosse**: "5 G, 2 A" or "18 SV, .692 SV%"

Keep it concise - only the most impressive stats.

---

**Questions?** Check the Sanity documentation or reach out to the dev team.

**Live Studio**: http://localhost:3000/studio
