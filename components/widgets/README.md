# Widgets Directory

This directory contains third-party embeds and external widget components for the Friday Night Film Room site.

## ScoreStream Widget

High school sports score widget powered by ScoreStream.

### Usage

```tsx
import { ScoreStreamWidget } from "@/components/widgets";

<ScoreStreamWidget />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `widgetType` | string | `"horzScoreboard"` | ScoreStream widget type |
| `userWidgetId` | string | `"68041"` | ScoreStream user widget ID |
| `className` | string | `""` | Additional CSS classes |

### Customization

The widget automatically:
- Loads the ScoreStream embed script
- Applies responsive container sizing
- Matches the site's design system with borders and spacing
- Uses CSS variables for theme consistency

### Adding New Widgets

When adding new third-party widgets to this directory:

1. **Create a new component file** following the naming pattern: `widget-name.tsx`
2. **Use client-side rendering** with `"use client"` directive if needed
3. **Handle script loading** properly with `useEffect` and cleanup
4. **Apply design system principles**:
   - Mobile-first responsive design
   - Use CSS variables for colors
   - 4px grid spacing
   - Consistent borders and shadows
5. **Export from index.ts** for clean imports
6. **Document props and usage** in this README

### Design System Integration

All widgets should:
- Use `bg-card` for backgrounds
- Use `border-border` for borders
- Follow container max-width patterns
- Respect mobile padding: `px-4 py-3 md:py-4`
- Be fully responsive with mobile-first approach
