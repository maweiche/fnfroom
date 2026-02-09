# Carbon Fiber Texture Addition

**Date**: 2026-02-09
**Feature**: Athletic background texture for depth

## Overview

Added carbon fiber woven pattern to background for athletic high-performance aesthetic. The texture simulates real carbon fiber material with diagonal weave pattern, adding depth and sophistication to the dark mode experience.

## Implementation

### Automatic Background (Dark Mode)
The body element automatically gets carbon fiber texture in dark mode:

```css
/* Multi-layer carbon fiber weave */
- Diagonal 45° weave pattern
- Diagonal -45° crosshatch weave
- Subtle horizontal texture lines
- Base gradient for depth variation
```

**Pattern specs**:
- 12x12px repeating tile
- 3 layers of gradients for realistic weave
- Subtle opacity (0.15-0.4) for non-intrusive texture
- Warm charcoal base (#1D1A10)

### Light Mode
Light mode maintains clean aesthetic with subtle gradient (no carbon fiber):
- Top: #fbfbfa (off-white)
- Bottom: #f8f8f6 (warm white)

## Utility Classes

Three utility classes for applying carbon fiber to specific elements:

### 1. `carbon-fiber-bg` (Strong)
```tsx
<section className="carbon-fiber-bg bg-charcoal-black">
  {/* Hero section with prominent texture */}
</section>
```
- 12x12px pattern
- Higher opacity (0.25-0.3)
- Best for: Hero sections, feature cards, callout boxes

### 2. `carbon-fiber-subtle` (Light)
```tsx
<Card className="carbon-fiber-subtle">
  {/* Card with gentle texture */}
</Card>
```
- 16x16px pattern (larger, less dense)
- Lower opacity (0.12-0.15)
- Best for: Content cards, sidebars, secondary sections

### 3. `carbon-fiber-card` (Dark Mode Only)
```tsx
<Card className="carbon-fiber-card">
  {/* Card with integrated carbon fiber + blend mode */}
</Card>
```
- 10x10px dense pattern
- Multiply blend mode
- Semi-transparent background
- Best for: Stats cards, game cards, featured content

## Usage Guidelines

### ✅ Do Use Carbon Fiber
- Page backgrounds (automatic in dark mode)
- Hero sections
- Feature cards
- Navigation backgrounds
- Stats/metrics cards
- Call-to-action sections

### ❌ Don't Use Carbon Fiber
- Article reading areas (interferes with readability)
- Form inputs
- Text-heavy content sections
- Over multiple nested elements (causes visual clutter)

## Athletic Aesthetic Reasoning

Carbon fiber chosen because:
- **Athletic**: Used in sports equipment (helmets, racing, protective gear)
- **High-performance**: Associated with speed, precision, technology
- **Premium**: Luxury sports material aesthetic
- **Texture**: Adds depth without color distraction
- **Subtle**: Doesn't compete with content or golden accents

## Visual Impact

### Before
- Flat dark background
- No depth or texture
- Minimal visual interest

### After
- Woven diagonal pattern
- Athletic material aesthetic
- Premium high-performance feel
- Depth without distraction
- Matches logo's cinematic production quality

## Performance Notes

- Pure CSS implementation (no images)
- Lightweight (4 gradient layers)
- No HTTP requests
- Scales perfectly at any resolution
- No GPU overhead (simple repeating gradients)

## Browser Support

Works in all modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

Uses standard CSS gradients with full support.

## Customization

To adjust texture intensity, modify opacity values in `globals.css`:

```css
/* Current: Medium intensity */
rgba(0, 0, 0, 0.4)  /* Make texture more prominent */
rgba(0, 0, 0, 0.15) /* Make texture more subtle */
```

To change pattern size:
```css
/* Current: 12px x 12px */
background-size: 12px 12px;

/* Larger weave: 16px x 16px */
/* Tighter weave: 8px x 8px */
```
