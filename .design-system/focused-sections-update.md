# Focused Sections Update

**Date**: 2026-02-10
**Changes**: Narrowed focus for College Corner and Beer Cooler sections

## What Changed

### 1. Beer Cooler - Now Triad Lacrosse Only 🥍

**Previous**: Multi-sport adult league coverage (basketball, softball, volleyball, flag football)

**Current**: Exclusive Triad Adult Lacrosse League coverage

**Changes Made**:
- ✅ Removed multi-sport filters
- ✅ Updated hero stats (8 teams, 48 games this season)
- ✅ Changed tagline to focus on Triad Lacrosse
- ✅ Replaced "Featured Leagues" with league standings table
- ✅ Sample content now features lacrosse games:
  - Stick City championship overtime thriller
  - Piedmont Attack playoff upset
  - Greensboro vs Winston rivalry game
- ✅ Added standings table with top 5 teams
- ✅ Location locked to "Greensboro-Winston-Salem"

**New Content Focus**:
- Triad Adult Lacrosse League games
- Championship coverage
- Player spotlights (former college players)
- Rivalry games (Greensboro Ground Balls vs Winston Warriors)
- League standings and statistics

### 2. College Corner - Basketball, Football, Lacrosse Only 🏀🏈🥍

**Previous**: Open to all college sports

**Current**: Three-sport focus (Basketball, Football, Lacrosse)

**Changes Made**:
- ✅ Removed "Division" filters (D1, D2, D3)
- ✅ Changed "Filter by:" to "Tracking:" for clarity
- ✅ Simplified to three sports only
- ✅ Added lacrosse example (Sarah Martinez at Johns Hopkins)
- ✅ Sample content spans all three sports

**Tracking**:
- Basketball (Duke, UNC, NC State, Wake Forest, etc.)
- Football (UNC, Duke, Wake Forest, App State, etc.)
- Lacrosse (Johns Hopkins, UNC, Duke, High Point, etc.)

### 3. Comical "Coming Soon" Popups ☕

**Previous**: Email links (`mailto:` URLs)

**Current**: Dialog popups with sarcastic messaging

**Implementation**:
```tsx
<ComingSoonDialog
  variant="beer-cooler" // or "college"
  trigger={<button>Submit Your Game</button>}
/>
```

**Beer Cooler Message**:
> **"Slow Down There, Champ"**
>
> We're not quite ready to immortalize your rec league exploits just yet. For now, why don't you grab a cold one and reflect on that game-winning shot you definitely made (we believe you, promise).

**College Corner Message**:
> **"Patience, Grasshopper"**
>
> We're still building out our college tracking database. In the meantime, feel free to sit quietly and contemplate whether that scholarship was really "basically a D1 offer." Character building, you know?

**Dialog Features**:
- Coffee cup icon (☕)
- Warm primary color styling
- Single "Got It, I'll Wait" button
- Centered, clean modal design

## Design Compliance

All changes maintain cinematic design system:

✅ **Spacing**: 4px grid aligned
✅ **Typography**: Space Grotesk headlines, Inter body, JetBrains Mono stats
✅ **Colors**: Sport-specific accents maintained
✅ **Animation**: Framer Motion 0.3s transitions
✅ **Responsive**: Mobile-first design
✅ **Tone**: Casual/sarcastic for both sections (appropriate for content type)

## File Changes

**New Files**:
- `/components/coming-soon-dialog.tsx` - Reusable sarcastic popup component
- `/components/ui/dialog.tsx` - shadcn dialog component
- `/components/ui/button.tsx` - shadcn button component

**Modified Files**:
- `/app/beer-cooler/page.tsx` - Focused on Triad Lacrosse, added standings
- `/app/beer-cooler/beer-cooler-hero.tsx` - Updated stats and tagline
- `/app/beer-cooler/beer-league-card.tsx` - Lacrosse-only types
- `/app/college/page.tsx` - Three sports only, lacrosse example added
- `/app/college/college-update-card.tsx` - Supports three sports

## Content Strategy

### Beer Cooler (Triad Lacrosse)

**Story Types**:
1. Championship games and playoff highlights
2. Rivalry matchups (Greensboro vs Winston)
3. Former college players dominating adult leagues
4. Upset victories and underdog stories
5. League standings and playoff brackets

**Team Names** (established):
- Stick City (champions)
- Gate City Shooters
- High Point Hawks
- Greensboro Ground Balls
- Winston Warriors
- Piedmont Attack

### College Corner (Basketball, Football, Lacrosse)

**Player Types**:
1. High-impact freshmen from NC schools
2. Former NC prep stars at any college
3. Breakout performances (career highs, awards)
4. Transfer portal success stories
5. All-conference and award winners

**Example Headlines**:
- "Former Charlotte Latin Star Drops 18 for Duke"
- "Wake Forest RB Rushes for 120 in Spring Game"
- "Green Hope Alum Records Hat Trick at Hopkins"

## Testing Status

- [x] Beer Cooler compiles without errors
- [x] College Corner compiles without errors
- [x] Coming Soon dialog works on both pages
- [x] TypeScript validation passes
- [x] Dev server serves both pages (200 responses)
- [x] Mobile responsive layouts work
- [x] Dialog animations smooth
- [ ] Test on actual mobile devices
- [ ] Gather user feedback on tone

## Next Steps

### Immediate
1. Create Sanity schemas for both sections
2. Add real Triad Lacrosse league data
3. Track initial set of NC college athletes
4. Design team logos for Triad Lacrosse teams

### Short-term
1. Working sport filters for College Corner
2. Interactive standings table for Beer Cooler
3. Player profile pages
4. Game recap templates

### Long-term
1. League partnership with Triad Lacrosse organizers
2. College athlete database (automated stats pulling?)
3. Weekly email digests for both sections
4. Social media integration

## Tone Guidelines

### Beer Cooler
- Casual, fun, slightly irreverent
- Celebrate rec league culture
- Acknowledge former athletes "still got it"
- Post-game social aspect (PG-rated)
- Example: "Weekend warriors become legends"

### College Corner
- Inspirational but not over-the-top
- Pride in NC prep athletes succeeding
- Acknowledge the "grind" to next level
- Slight sarcasm in non-content areas (dialogs)
- Example: "Making their mark at the next level"

## Dialog Customization

The `ComingSoonDialog` component supports three variants:

```tsx
// Default (generic)
<ComingSoonDialog variant="default" trigger={...} />

// Beer Cooler (rec league sarcasm)
<ComingSoonDialog variant="beer-cooler" trigger={...} />

// College Corner (recruiting sarcasm)
<ComingSoonDialog variant="college" trigger={...} />
```

Each variant has unique messaging matching the section's tone.

---

**Status**: ✅ Both sections focused and functional
**Dev Server**: http://localhost:3000
**Beer Cooler**: http://localhost:3000/beer-cooler (Triad Lacrosse only)
**College Corner**: http://localhost:3000/college (Basketball, Football, Lacrosse)
**TypeScript**: ✅ No errors
**Tone**: ✅ Comically sarcastic where appropriate
