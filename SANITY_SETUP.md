# Sanity CMS Setup Instructions

Follow these steps to connect your Friday Night Film Room site to Sanity CMS.

## Step 1: Create a Sanity Account

1. Visit https://www.sanity.io/
2. Sign up for a free account (supports 100k documents, 5GB assets)

## Step 2: Create a New Project

1. Go to https://sanity.io/manage
2. Click "Create new project"
3. Name it "Friday Night Film Room"
4. Select a region closest to you
5. Choose "Production" dataset
6. Copy your **Project ID**

## Step 3: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
   ```

## Step 4: Access Sanity Studio

1. Start your dev server:
   ```bash
   bun dev
   ```

2. Navigate to http://localhost:3001/studio

3. You'll be prompted to add this URL to your Sanity project's CORS origins
   - Click the link to authorize
   - Add `http://localhost:3001` to allowed origins

4. Log in with your Sanity account

## Step 5: Create Your First Content

### Create a Staff Member (Required First)

1. In Sanity Studio, click "Staff Member" in the left sidebar
2. Click "Create new staff member"
3. Fill in:
   - **Name**: Your name
   - **Slug**: Auto-generated from name
   - **Role**: Select your role (e.g., Editor-in-Chief)
   - **Photo**: Upload a headshot (optional but recommended)
   - **Short Bio**: One-line description (50-100 chars)
   - **Active**: Check this box
4. Click "Publish"

### Create Your First Article

1. Click "Article" in the left sidebar
2. Click "Create new article"
3. Fill in the required fields:
   - **Title**: "Welcome to Friday Night Film Room"
   - **Slug**: Click "Generate" to auto-create from title
   - **Sport**: Select Basketball, Football, or Lacrosse
   - **Publish Date**: Today's date
   - **Author**: Select the staff member you just created
   - **Featured Image**: Upload a photo (1920×1080 recommended)
     - Add alt text (required for SEO)
     - Add photographer credit (optional)
   - **Body**: Write your article content
     - Use the rich text editor for formatting
     - Add images inline with captions
4. Optional fields:
   - **Featured**: Check this to show in homepage hero
   - **Category**: game-recap, preview, player-spotlight, etc.
   - **Excerpt**: Custom summary for cards (or auto-generated from body)
   - **Tags**: Add hashtags for categorization
5. Click "Publish"

## Step 6: View Your Content

1. Refresh your homepage at http://localhost:3001
2. Your article should appear in the "Latest Articles" grid
3. If you marked it as "Featured", it will show in the hero section
4. Click on the article to view the full page

## Content Tips

### Images
- **Featured images**: 1920×1080 (16:9 aspect ratio)
- **Author photos**: 512×512 (square)
- **Inline images**: 1200px wide minimum
- Always add alt text for accessibility and SEO

### Articles
- **Headlines**: Keep under 70 characters for best display
- **Excerpts**: 120-160 characters work well for cards
- **Body**: Use H2 and H3 headings to break up long content
- **Tags**: Use consistent tags (e.g., "game-recap", "recruiting-2027")

### Featured Articles
- Only ONE article should be marked as "featured" at a time
- The most recent featured article appears in the homepage hero
- Uncheck "featured" on old articles when featuring new ones

## Deploying Sanity Studio

When you're ready to deploy, you can host Studio on Sanity's cloud:

```bash
bunx sanity deploy
```

This creates a hosted Studio at `your-project.sanity.studio` that your team can access anywhere.

## Next Steps

- Create more staff members for contributors
- Publish articles across all three sports
- Add photographer credits to build contributor portfolios
- Set up CORS origins for your production domain when deploying

## Troubleshooting

**"Missing environment variable" error**
- Make sure `.env.local` exists and has your project ID
- Restart the dev server after adding env variables

**CORS error in Studio**
- Go to https://sanity.io/manage
- Select your project
- Go to Settings → API → CORS Origins
- Add `http://localhost:3001` (or your domain)

**Images not loading**
- Check that your Sanity project ID is correct in `.env.local`
- Verify images have alt text (required field)
- Check Next.js console for specific image errors

## Support

Need help? Check:
- Sanity docs: https://www.sanity.io/docs
- Next.js + Sanity guide: https://www.sanity.io/plugins/next-sanity
- Project README: `/sanity/README.md`
