# Sanity CMS Setup Guide

## Quick Start

1. **Create a Sanity Project** (if you haven't already):
   ```bash
   bunx sanity init --project-id YOUR_PROJECT_ID --dataset production
   ```

2. **Copy environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Fill in your Sanity credentials** in `.env.local`:
   - Get your Project ID from https://sanity.io/manage
   - Set dataset to `production` (or create a `staging` dataset)

4. **Access Sanity Studio**:
   - Start dev server: `bun dev`
   - Navigate to: http://localhost:3001/studio
   - Log in with your Sanity account

## Content Schemas

### Article
The main content type for news articles, game recaps, player spotlights, etc.

**Required fields:**
- Title
- Slug (auto-generated from title)
- Sport (basketball, football, lacrosse)
- Publish Date
- Author (reference to Staff Member)

**Optional fields:**
- Category (game-recap, preview, etc.)
- Featured (boolean - shows in hero)
- Featured Image (with alt text and photographer credit)
- Excerpt (for cards)
- Body (rich text with images)
- Tags
- SEO Description

### Staff Member
Authors, contributors, photographers, and videographers.

**Required fields:**
- Name
- Slug
- Role (editor-in-chief, staff-writer, etc.)

**Optional fields:**
- Photo
- Short Bio (for cards)
- Full Bio (for profile page)
- Email
- Website
- Social Links (Twitter, Instagram, LinkedIn)
- Active status (hide without deleting)

## Studio Features

### Vision Plugin
Test GROQ queries in real-time at `/studio/vision`

### Structure Tool
Custom content organization (can be configured in `sanity/config.ts`)

## Adding More Schemas

To add Video, Player, or Rankings schemas:

1. Create schema file in `sanity/schemas/`
2. Import in `sanity/schemas/index.ts`
3. Add TypeScript types in `lib/sanity.types.ts`

## Deployment

Deploy Studio to Sanity's cloud:
```bash
bunx sanity deploy
```

This gives you a hosted Studio at `your-project.sanity.studio`
