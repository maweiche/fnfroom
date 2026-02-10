# Design System: Friday Night Film Room

**Created**: 2026-02-07
**Last Updated**: 2026-02-09
**Direction**: Cinematic Sports Authority (Friday Night Lights)

## Design Direction

### Core Personality
Cinematic sports journalism under the lights. Warm stadium spotlights meet vintage film aesthetic. Athletic, authoritative, nostalgic. Think Friday night stadium atmosphere with film noir sports photography.

### Color Foundation
Deep charcoal black (#1a1612) primary background, warm spotlight gold (#D4A574) for drama, cream highlights (#F5E6D3) for text. Cinematic depth through warm tones and dramatic contrast.

### Mode Preference
**Dark-first design** (primary experience matching logo's nighttime stadium aesthetic), light mode available for article reading. Dark mode is the hero experience.

### Accent Strategy
Warm cinematic palette:
- **Primary brand**: #D4A574 (warm spotlight gold, used prominently for CTAs, hero moments, key actions)
- **Basketball**: #D97B34 (deep burnt orange, warmer than previous)
- **Football**: #2d5a3d (deep forest green, darker and more cinematic)
- **Lacrosse**: #1e3a5f (deep navy blue, less bright, more sophisticated)

### Layout Approach
Dense card grids, editorial two-column layouts, table-heavy (rankings/stats), mobile-first responsive.

### Typography System
- **Display**: Space Grotesk (800 weight) for headlines — Bold, athletic, dramatic contrast with body text. Matches logo's condensed bold typography
- **Body**: Inter (400 weight) for article text — Maximum contrast with headlines, highly readable
- **Emphasis**: Inter (500 weight) for labels, navigation, UI elements
- **Data**: JetBrains Mono (tabular numerals) for stats, scores, rankings
- **Warm text colors**: Use cream tones (#F5E6D3) for text on dark backgrounds instead of pure white

### Depth Strategy
**Cinematic spotlight shadows** — Dark mode uses warm glow effects to simulate stadium lighting. Light mode uses subtle warm shadows. Cards lift with golden spotlight glow on hover. Hero sections get dramatic spotlight effects. Tables and data use subtle borders for clean information density.

### Background Texture
**Carbon fiber pattern (dark mode only)** — Athletic high-performance aesthetic with diagonal woven texture. Adds depth and sophistication without interfering with content readability. Light mode uses subtle gradient for clean reading experience.

## Design Tokens

### Core Colors
| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--background` | #fbfbfa | #1D1A10 | Page background (light off-white / dark warm charcoal) |
| `--foreground` | #171717 | #F7EED9 | Primary text (dark / warm cream) |
| `--primary` | #E6BC6A | #E6BC6A | True golden spotlight (used prominently) |
| `--primary-dark` | #99863D | #99863D | Darker gold for contrast needs |
| `--primary-light` | #F7EED9 | #453B1C | Cream highlight / dark gold tint |
| `--secondary` | #595959 | #b8a898 | Secondary text (warm gray tones) |
| `--muted` | #737373 | #8a7d6f | Muted text, placeholders (warm neutrals) |
| `--card` | #ffffff | #242118 | Card backgrounds (white / dark warm charcoal) |
| `--border` | #e6e6e6 | #3d3830 | Neutral borders (warm-tinted) |

### Sport-Specific Colors (Cinematic Palette)
| Variable | Hex | Usage |
|----------|-----|-------|
| `--basketball` | #D97B34 | Deep burnt orange (warmer, more dramatic) |
| `--football` | #2d5a3d | Deep forest green (darker, cinematic) |
| `--lacrosse` | #1e3a5f | Deep navy blue (sophisticated, muted) |

### Semantic Colors
| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--success` | #7a9b5f | #6b8a50 | Muted olive green for wins |
| `--error` | #d9534f | #d9534f | Warm red for losses |
| `--warning` | #D97B34 | #D97B34 | Warm orange warnings |
| `--info` | #5a7a9e | #7a9abe | Muted blue for info |
| `--charcoal-black` | #1a1612 | #1a1612 | Deep charcoal (site header, dark sections) |

### Custom Brand Accents
| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--spotlight-gold` | #E6BC6A | #E6BC6A | Main accent (true golden spotlight) |
| `--warm-cream` | #F7EED9 | #F7EED9 | Highlights on dark backgrounds |
| `--film-gray` | #8a8a8a | #8a8a8a | Neutral elements (camera equipment aesthetic) |
| `--charcoal` | #1D1A10 | #1D1A10 | Brand dark accent |
| `--pearl` | #fbfbfa | #33300E | Brand light accent |

### Tinted Card Backgrounds (Warm Palette)
| Variable | Value | Usage |
|----------|-------|-------|
| `--card-gold` | #FBF9F0 (light) / #453B1C (dark) | Warm gold-tinted cards |
| `--card-rust` | #faf3ed (light) / #3d2e28 (dark) | Burnt orange-tinted cards |
| `--card-forest` | #f2f5f3 (light) / #26332a (dark) | Dark green-tinted cards |

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

### Shadows (Cinematic Warm Glow)
```css
/* Light mode - subtle warm shadows */
--shadow-sm: 0 1px 2px 0 rgba(26, 22, 18, 0.08);
--shadow-md: 0 4px 8px -2px rgba(26, 22, 18, 0.12), 0 2px 4px -1px rgba(26, 22, 18, 0.08);
--shadow-lg: 0 10px 20px -5px rgba(26, 22, 18, 0.15), 0 4px 8px -2px rgba(26, 22, 18, 0.1);

/* Dark mode - spotlight glow effects */
--shadow-warm: 0 4px 12px rgba(212, 165, 116, 0.15);
--glow-spotlight: 0 0 24px rgba(212, 165, 116, 0.25), 0 0 48px rgba(212, 165, 116, 0.1);
--glow-hero: 0 8px 32px rgba(212, 165, 116, 0.3);
```

## Carbon Fiber Texture Utilities

Apply to elements for athletic depth and texture:

### Body Background (Automatic)
- **Dark mode**: Full carbon fiber weave pattern
- **Light mode**: Subtle gradient background

### Utility Classes
```tsx
// Strong carbon fiber texture
<div className="carbon-fiber-bg">

// Subtle carbon fiber (less prominent)
<div className="carbon-fiber-subtle">

// Card-specific carbon fiber with blend mode
<Card className="carbon-fiber-card">
```

**Usage Notes**:
- Carbon fiber auto-applies to body in dark mode
- Use utilities sparingly on hero sections or feature cards
- Don't apply to content-heavy reading areas (articles)
- Works best on dark backgrounds

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
<section className="relative aspect-[4/3] w-full">
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
- **Aspect ratio**: 4:3 (matches uploaded image dimensions of 1000×750px)
- **Image dimensions**: Request at 1000×750px to prevent cropping
- Gradient overlay: Bottom-heavy for text readability
- Typography: 48px mobile, 56px desktop headline
- Padding: 24px mobile, 32px desktop

### Logo Component
```tsx
import { Logo } from '@/components/logo';

// Header variant - Optimized for navigation
<Logo variant="header" width={200} height={50} />

// Full variant - For footer, login pages, hero sections
<Logo variant="full" width={280} height={70} />

// With custom link
<Logo variant="header" href="/" />

// Footer usage (white logo on dark)
<Logo variant="full" className="brightness-0 invert" />
```
- Files: `/public/fnfr-logo-header.png`, `/public/fnfr-logo.png`
- Header dimensions: 200-240px width, 50-60px height
- Full dimensions: 280-320px width, 70-80px height
- Always use priority loading for above-the-fold logos
- Footer: Apply `brightness-0 invert` for white logo on dark backgrounds

### Navigation
```tsx
<nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-20 md:h-24">
      <Logo variant="header" width={200} height={50} />
      <div className="flex items-center gap-1">
        {/* Desktop: Sport links always visible */}
        <Link href="/basketball">Basketball</Link>
        <Link href="/football">Football</Link>
        <Link href="/lacrosse">Lacrosse</Link>

        {/* Desktop: Dropdown menus for grouped content */}
        <DropdownMenu>
          <DropdownMenuTrigger>Content</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Video</DropdownMenuItem>
            <DropdownMenuItem>Rankings</DropdownMenuItem>
            <DropdownMenuItem>Recruiting</DropdownMenuItem>
            <DropdownMenuItem>College Corner</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>More</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Staff</DropdownMenuItem>
            <DropdownMenuItem>FAQ</DropdownMenuItem>
            <DropdownMenuItem>ScoreSnap</DropdownMenuItem>
            <DropdownMenuItem>Press Box AI</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <MenuButton />
      </div>
    </div>
  </div>
</nav>
```
- Background: Semi-transparent with backdrop blur
- Height: 80px mobile, 96px desktop
- Sticky positioning for persistent header
- Logo: Header variant, responsive sizing
- Border bottom: Subtle separator
- **Desktop**: Sport links always visible, grouped content in dropdowns
- **Mobile**: Fullscreen menu with sectioned groups (Coverage, More)

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
- [x] College Corner page
- [x] Beer Cooler page (Adult League coverage)

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
