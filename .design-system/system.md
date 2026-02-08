# Design System: Friday Night Film Room

**Created**: 2026-02-07
**Last Updated**: 2026-02-07
**Direction**: Precision & Credibility (Sports Editorial Authority)

## Design Direction

### Core Personality
Professional sports news outlet. Information-dense, credible, editorial polish with sports energy. Think ESPN local meets Linear's precision.

### Color Foundation
Dark navy header (#1a1d29), clean white/light gray content backgrounds (#ffffff, #f8f9fa), bold sport-specific accents.

### Mode Preference
Light primary (optimized for article reading), dark mode full support for night reading.

### Accent Strategy
Four-color system:
- **Primary brand**: #94d873 (brand green, used for CTAs and primary actions)
- **Basketball**: #E67E22 (orange, sport tag and basketball-specific UI)
- **Football**: #27AE60 (green, sport tag and football-specific UI)
- **Lacrosse**: #2980B9 (blue, sport tag and lacrosse-specific UI)

### Layout Approach
Dense card grids, editorial two-column layouts, table-heavy (rankings/stats), mobile-first responsive.

### Typography System
- **Display**: Inter (600-700 weight) for headlines — strong, news-oriented
- **Body**: Inter (400-500 weight) for article text — highly readable
- **Data**: JetBrains Mono (tabular numerals) for stats, scores, rankings

### Depth Strategy
**Subtle shadows on cards** — Gentle lift for content cards (articles, videos, players) to create hierarchy. Borders for tables and data displays. Matches ESPN/MaxPreps pattern while maintaining clean information density.

## Design Tokens

### Core Colors
| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--background` | #fbfbfa | #272729 | Page background (slight warmth/cool) |
| `--foreground` | #171717 | #fbfbfa | Primary text |
| `--primary` | #94d873 | #94d873 | Brand accent, CTAs |
| `--primary-dark` | #003d00 | #306332 | Primary text on primary bg |
| `--primary-light` | #e1f8d8 | #2d4a25 | Subtle green backgrounds |
| `--secondary` | #212121 | #f0f0f0 | Secondary text |
| `--muted` | #737373 | #a6a6a6 | Muted text, placeholders |
| `--card` | #ffffff | #333333 | Card backgrounds (elevated) |
| `--border` | #e6e6e6 | #404040 | Neutral borders |

### Sport-Specific Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--basketball` | #E67E22 | Basketball sport tags, accents |
| `--football` | #27AE60 | Football sport tags, accents |
| `--lacrosse` | #2980B9 | Lacrosse sport tags, accents |

### Semantic Colors
| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--success` | #83c961 | #4c7a4c | Success states, wins |
| `--error` | #f7604c | #ffb3b3 | Error states, losses |
| `--warning` | #f78535 | #f7c6a0 | Warning states |
| `--info` | #4864d2 | #c2d4e6 | Info, links |
| `--navy-header` | #1a1d29 | #212121 | Site header background |

### Custom Brand Accents
| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--cloud-gray` | #f1f0ee | #333333 | Soft backgrounds |
| `--charcoal` | #212121 | #212121 | Brand dark accent |
| `--meadow` | #94d873 | #94d873 | Brand green accent |
| `--pearl` | #fbfbfa | #404040 | Brand light accent |

### Tinted Card Backgrounds
| Variable | Value | Usage |
|----------|-------|-------|
| `--card-mint` | #f5fdf2 (light) / #26332a (dark) | Green-tinted cards |
| `--card-peach` | #fff5f0 (light) / #3d2e28 (dark) | Warm accent cards |
| `--card-sky` | #f0f7ff (light) / #26303d (dark) | Blue-tinted cards |

### Spacing Scale
Base: 4px grid
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `base`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

Mobile: 16px padding, 12px gaps
Desktop: 24px padding, 16px gaps
Section spacing: 32-48px mobile, 48-64px desktop

### Border Radius
Sharp system: 4-8px (editorial precision)
- **Small elements**: 4px (tags, badges)
- **Cards**: 8px (article cards, video cards)
- **Images**: 8px (thumbnails)
- **Modals**: 8px

### Typography Scale
- `xs`: 11px (metadata, captions)
- `sm`: 12px (labels, dates)
- `base`: 14px (body text, UI)
- `lg`: 16px (emphasized body)
- `xl`: 18px (subheadings)
- `2xl`: 24px (section headers)
- `3xl`: 32px (page titles)
- `4xl`: 48px (hero headlines)
- `5xl`: 56px (featured article headlines)

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

## Component Patterns

### Article Card
```tsx
<Card className="overflow-hidden rounded-lg bg-card-bg shadow-md hover:shadow-lg transition-shadow duration-200">
  <Image className="w-full aspect-video object-cover" />
  <div className="p-4">
    <SportTag sport="basketball" />
    <h3 className="text-lg font-semibold line-clamp-2 mt-2">Headline</h3>
    <div className="flex items-center gap-2 mt-3 text-sm text-secondary">
      <span>Author Name</span>
      <span>•</span>
      <time>Feb 7, 2026</time>
    </div>
  </div>
</Card>
```
- Aspect ratio: 16:9 for featured images
- Padding: 16px
- Hover: Lift shadow (md → lg)
- Typography: 18px headline (line-clamp-2), 14px metadata
- Grid: 3 columns desktop, 2 tablet, 1 mobile

### Sport Tag Component
```tsx
<Badge className="bg-basketball text-white text-xs font-medium px-2 py-1 rounded">
  Basketball
</Badge>
```
- Size: 11px text, 8px vertical padding, 12px horizontal padding
- Colors: Use sport-specific variables
- Border radius: 4px (sharp)
- Always uppercase text

### Hero Article
```tsx
<section className="relative h-[500px] md:h-[600px]">
  <Image className="absolute inset-0 object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
  <div className="absolute bottom-0 p-6 md:p-8 text-white">
    <SportTag sport="basketball" />
    <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">Headline</h1>
    <div className="flex items-center gap-3 mt-4">
      <Avatar />
      <span className="font-medium">Author</span>
      <span>•</span>
      <time>Date</time>
    </div>
  </div>
</section>
```
- Height: 500px mobile, 600px desktop
- Gradient overlay: Bottom-heavy for text readability
- Typography: 48px mobile, 56px desktop headline
- Padding: 24px mobile, 32px desktop

### Navigation
```tsx
<nav className="sticky top-0 z-50 bg-navy-header border-b border-border/10">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <Logo />
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white">
        <Link>Basketball</Link>
        <Link>Football</Link>
        <Link>Lacrosse</Link>
        <Link>Video</Link>
        <Link>Rankings</Link>
        <Link>Recruiting</Link>
      </div>
      <SearchIcon />
    </div>
  </div>
</nav>
```
- Background: Navy (#1a1d29)
- Height: 64px
- Text: White, 14px, 500 weight
- Sticky positioning
- Border bottom: Subtle white/10 opacity

### Rankings Table
```tsx
<Table className="w-full border-collapse">
  <TableHeader className="bg-muted/10 border-b-2 border-border">
    <TableRow className="text-xs uppercase tracking-wide font-semibold text-secondary">
      <TableHead>Rank</TableHead>
      <TableHead>Team</TableHead>
      <TableHead>Record</TableHead>
      <TableHead>Trend</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody className="font-mono tabular-nums text-sm">
    <TableRow className="border-b border-border hover:bg-muted/5">
      <TableCell className="font-bold">1</TableCell>
      <TableCell className="font-sans">Team Name</TableCell>
      <TableCell>12-2</TableCell>
      <TableCell>↑</TableCell>
    </TableRow>
  </TableBody>
</Table>
```
- Headers: 11px uppercase, semibold, secondary color
- Data: 14px, monospace for numbers, sans for team names
- Row hover: Subtle background
- Borders: Horizontal only, clean separation
- Trend arrows: Use Unicode or icons (↑ ↓ —)

### Player Card (Recruiting)
```tsx
<Card className="p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <div className="flex gap-4">
    <Avatar size="lg" className="rounded-full w-16 h-16" />
    <div className="flex-1">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-base">Player Name</h3>
          <p className="text-sm text-secondary">School Name</p>
        </div>
        <SportTag sport="basketball" />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        <div>
          <span className="text-muted block">Class</span>
          <span className="font-mono font-semibold">2027</span>
        </div>
        <div>
          <span className="text-muted block">Pos</span>
          <span className="font-semibold">PG</span>
        </div>
        <div>
          <span className="text-muted block">PPG</span>
          <span className="font-mono font-semibold">18.5</span>
        </div>
      </div>
    </div>
  </div>
</Card>
```
- Avatar: 64px circle (player photo)
- Layout: Horizontal on all sizes
- Stats: Monospace, tabular numerals
- Compact: Maximum information density

### Newsletter Signup
```tsx
<div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
  <h3 className="font-semibold text-lg">Get NC prep sports news in your inbox</h3>
  <form className="flex gap-2 mt-4">
    <Input type="email" placeholder="your@email.com" className="flex-1" />
    <Button className="bg-primary text-primary-dark font-medium">Subscribe</Button>
  </form>
</div>
```
- Background: Tinted primary color (10% opacity)
- Border: Primary color (20% opacity)
- Single-field form with button
- Button: Primary brand color

## Validation Rules

### Enabled Checks
- spacing: true
- colors: true
- typography: true
- responsive: true
- depth: true

### Severity Levels
- spacing violations: error
- hardcoded colors: error
- generic fonts for headlines: warning
- missing responsive: error
- depth inconsistency: warning

### Auto-Fix
Enabled: true

### Skip Files
- "*.test.tsx"
- "*.stories.tsx"
- ".next/**"

## Component Inventory

### To Build (Phase Priority)
**Phase 1: Foundation**
- [ ] Global CSS variables
- [ ] Navigation component
- [ ] Footer component
- [ ] Sport Tag component
- [ ] Layout wrapper

**Phase 2: Content Components**
- [ ] Article Card component
- [ ] Hero Article section
- [ ] Player Card component
- [ ] Video Card component

**Phase 3: Data Components**
- [ ] Rankings Table
- [ ] Stats display
- [ ] Author byline component

**Phase 4: Pages**
- [ ] Homepage
- [ ] Article page template
- [ ] Sport hub pages
- [ ] Rankings pages
- [ ] Recruiting board
- [ ] Staff pages

## Notes

### Mobile-First Requirements
This audience reads on phones at games. Every component MUST:
- Start with mobile styles (no `sm:` breakpoint)
- Use touch-friendly targets (44px minimum)
- Optimize images for mobile bandwidth
- Lazy-load video embeds

### Credential Credibility
Design must support professional appearance:
- Clean typography hierarchy
- Proper attribution (author cards, photo credits)
- Professional staff pages
- Editorial structure clarity

### Performance Targets
- Lighthouse: ≥90 mobile
- LCP: <2.5s
- CLS: <0.1
- Use Next.js Image optimization everywhere
- Lazy-load video embeds
