# Friday Night Film Room

Regional sports news covering North Carolina high school basketball, football, and lacrosse.

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Package Manager**: Bun
- **TypeScript**: Full type safety

## Design System

This project follows the **Precision & Density** design direction optimized for sports editorial content. The design system is documented in `.design-system/system.md`.

### Key Design Principles

- **Information-dense** layouts for news content
- **Mobile-first** responsive design (audience reads at games)
- **Sport-specific** color coding (Basketball: orange, Football: green, Lacrosse: blue)
- **Professional** typography hierarchy using Inter + JetBrains Mono
- **Credible** appearance for credential committee requirements

### Brand Colors

- **Primary**: #94d873 (brand green)
- **Basketball**: #E67E22 (orange)
- **Football**: #27AE60 (green)
- **Lacrosse**: #2980B9 (blue)
- **Navy Header**: #1a1d29 (dark navy)

## Getting Started

### Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
bun run build
bun start
```

### Type Check

```bash
bun run typecheck
```

### Lint

```bash
bun run lint
```

## Project Structure

```
fnfroom/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with nav & footer
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles & CSS variables
├── components/            # Reusable components
│   ├── navigation.tsx    # Sticky header navigation
│   ├── footer.tsx        # Site footer
│   └── sport-tag.tsx     # Sport badge component
├── lib/                   # Utility functions
│   └── utils.ts          # cn() helper, type definitions
├── .design-system/        # Design system documentation
│   └── system.md         # Full design system spec
└── public/                # Static assets
```

## Next Steps

### Phase 1: CMS Setup (Priority)
- [ ] Set up Sanity CMS project
- [ ] Define content schemas (Article, Video, Player, Rankings, Staff)
- [ ] Seed initial test content
- [ ] Configure Sanity Studio

### Phase 2: Core Components
- [ ] Article Card component
- [ ] Video Card component
- [ ] Player Card component
- [ ] Hero Article section
- [ ] Rankings Table component

### Phase 3: Page Templates
- [ ] Article page template (`/[sport]/[slug]`)
- [ ] Sport hub pages (`/basketball`, `/football`, `/lacrosse`)
- [ ] Rankings pages (`/rankings`, `/rankings/[sport]`)
- [ ] Video hub (`/video`)

### Phase 4: Advanced Features
- [ ] Recruiting board (`/recruiting`, `/recruiting/[slug]`)
- [ ] Staff pages (`/staff`, `/staff/[slug]`)
- [ ] About page (`/about`)
- [ ] Contact page (`/contact`)
- [ ] Search functionality

### Phase 5: Polish
- [ ] Newsletter integration (Resend or ConvertKit)
- [ ] SEO optimization (JSON-LD, meta tags, sitemaps)
- [ ] Performance optimization (image optimization, lazy loading)
- [ ] Analytics setup (PostHog or GA4)

## Development Guidelines

### Mobile-First Responsive
Always start with mobile styles, then scale up:

```tsx
// ✅ Correct
<div className="p-4 md:p-6 lg:p-8">

// ❌ Wrong
<div className="p-8 sm:p-4">
```

Never use the `sm:` breakpoint to avoid inconsistencies.

### Sport Tag Usage
Use the `SportTag` component for consistent sport branding:

```tsx
import { SportTag } from "@/components/sport-tag";

<SportTag sport="basketball" />
<SportTag sport="football" />
<SportTag sport="lacrosse" />
```

### Typography
- **Headlines**: 600-700 weight, tight leading
- **Body**: 400-500 weight, readable line height
- **Data/Stats**: Use `font-mono` and `tabular-nums` classes

### Spacing
All spacing follows a 4px grid: 4, 8, 12, 16, 24, 32, 48, 64px

## Performance Targets

- **Lighthouse Performance**: ≥90 on mobile
- **LCP**: <2.5 seconds
- **FID**: <100ms
- **CLS**: <0.1

## License

© 2026 Friday Night Film Room. All rights reserved.
