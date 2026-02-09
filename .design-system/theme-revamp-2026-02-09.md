# Theme Revamp: Cinematic Friday Night Lights

**Date**: 2026-02-09
**Direction**: Dark-first cinematic sports aesthetic inspired by logo

## Overview

Revamped entire color palette to match the logo's vintage film aesthetic with warm stadium spotlights, deep charcoal backgrounds, and dramatic golden accents. The new theme emphasizes a Friday night under-the-lights feel with film noir sports journalism vibes.

## Key Changes

### Design Direction
- **Before**: Light-first with green brand color (#94d873), ESPN-style bright sports colors
- **After**: Dark-first with warm spotlight gold (#D4A574), cinematic warm palette, stadium lighting aesthetic

### Primary Brand Colors
| Element | Before | After | Reasoning |
|---------|--------|-------|-----------|
| Primary accent | #94d873 (meadow green) | #E6BC6A (true golden spotlight) | Matches logo's golden projector lighting (adjusted from brassy to pure gold) |
| Background (dark) | #272729 (neutral charcoal) | #1D1A10 (warm deep charcoal) | Adds warmth, matches logo background |
| Text on dark | #fbfbfa (off-white) | #F7EED9 (warm cream) | Softer, more cinematic than pure white |
| Default mode | Light primary | Dark primary | Logo aesthetic is nighttime/stadium |

### Sport Colors (Warmer, Deeper)
| Sport | Before | After | Change |
|-------|--------|-------|--------|
| Basketball | #E67E22 (bright orange) | #D97B34 (deep burnt orange) | Warmer, more dramatic |
| Football | #27AE60 (bright green) | #2d5a3d (deep forest green) | Darker, cinematic |
| Lacrosse | #2980B9 (bright blue) | #1e3a5f (deep navy) | Sophisticated, muted |

### New Color Tokens
```css
--spotlight-gold: #E6BC6A  /* Main cinematic accent - true golden (not brassy) */
--warm-cream: #F7EED9      /* Text on dark backgrounds */
--film-gray: #8a8a8a       /* Neutral elements (camera aesthetic) */
--charcoal-black: #1D1A10  /* Deep warm charcoal */
```

**Color Refinement (2026-02-09 update)**: Adjusted gold from brassy orange-gold (#D4A574, hue 32°) to true golden yellow (#E6BC6A, hue 42°) for more classic precious metal appearance.

### Card Backgrounds
- **Removed**: card-mint, card-peach, card-sky (too bright/cool)
- **Added**: card-gold, card-rust, card-forest (warm cinematic tints)

### Shadows & Depth
- **Light mode**: Warm subtle shadows using charcoal tint
- **Dark mode**: Spotlight glow effects with golden ambient lighting
- **New utilities**: `glow-spotlight`, `glow-hero` for dramatic hero sections

### Typography
- **Headlines**: Increased from 700 to 800 weight for dramatic contrast
- **Reasoning**: Matches logo's bold condensed typography, creates cinematic impact

## Files Modified

### Core System Files
1. `.design-system/system.md` - Updated design direction, color tokens, depth strategy
2. `app/globals.css` - Rewrote all CSS variables for light and dark modes
3. `tailwind.config.ts` - Updated color mappings and shadow utilities

### Component Updates
1. `components/navigation.tsx` - Changed default theme from "light" to "dark"
2. `components/footer.tsx` - Updated from `navy-header` to `charcoal-black`, text to `warm-cream`

## Usage Patterns

### Hero Sections with Spotlight
```tsx
<section className="bg-charcoal-black text-warm-cream shadow-glow-hero">
  <h1 className="text-spotlight-gold font-display font-extrabold">
    Friday Night Highlights
  </h1>
</section>
```

### Cards with Warm Glow (Dark Mode)
```tsx
<Card className="bg-card hover:shadow-card-hover transition-shadow">
  {/* Automatically gets warm spotlight glow in dark mode */}
</Card>
```

### Prominent Gold CTAs
```tsx
<Button className="bg-primary text-charcoal-black font-medium hover:opacity-90">
  Subscribe Now
</Button>
```

### Tinted Card Variants
```tsx
<Card className="bg-card-gold">   {/* Warm gold tint */}
<Card className="bg-card-rust">   {/* Burnt orange tint */}
<Card className="bg-card-forest"> {/* Dark green tint */}
```

## Dark Mode as Primary

The new theme makes dark mode the **hero experience**:
- Default theme is now dark (changed in Navigation component)
- Color palette optimized for dark-first display
- Light mode still available but dark is the primary aesthetic
- Matches the logo's nighttime stadium/film aesthetic

## Migration Notes

### Automatic Updates
All existing components using Tailwind utilities will automatically pick up new colors:
- `bg-primary` now uses spotlight gold
- `text-foreground` uses warm cream on dark backgrounds
- Sport tags automatically use deeper, warmer colors
- Shadows automatically get warm glow in dark mode

### Manual Updates Needed
Components that hardcode hex values need updating:
- Replace `#94d873` with `hsl(var(--primary))`
- Replace `#1a1d29` with `hsl(var(--charcoal-black))`
- Replace `#fbfbfa` on dark with `hsl(var(--warm-cream))`

### Design System Compliance
Run `/design-engineer audit` to find:
- Hardcoded hex values
- Components not using warm palette
- Missing spotlight effects on hero sections

## Visual Impact

### Before (Green/Bright)
- Light backgrounds with bright sport colors
- Green brand accent throughout
- Standard ESPN-style sports site
- Generic editorial feel

### After (Gold/Cinematic)
- Dark warm backgrounds with spotlight accents
- Golden dramatic lighting
- Friday night stadium atmosphere
- Distinctive film noir sports journalism

## Next Steps

1. **Test dark mode thoroughly** - Now the primary experience
2. **Update hero sections** - Add `glow-hero` shadows for drama
3. **Review all CTAs** - Ensure using prominent gold (`bg-primary`)
4. **Update article pages** - Test readability with warm cream text
5. **Photo treatments** - Consider warm overlays to match aesthetic

## Brand Alignment

The new theme directly aligns with the logo's visual language:
- ✅ Warm golden spotlight effect
- ✅ Deep charcoal backgrounds
- ✅ Vintage film camera aesthetic
- ✅ Friday night under-the-lights feel
- ✅ Athletic yet nostalgic
- ✅ Authoritative sports journalism
