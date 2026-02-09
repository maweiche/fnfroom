# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

---

## Project Architecture

### Overview
Friday Night Film Room is a regional sports news outlet covering North Carolina high school basketball, football, and lacrosse. The site includes three main features:
1. **Editorial Content**: Articles, videos, rankings, and recruiting coverage powered by Sanity CMS
2. **ScoreSnap**: AI-powered score upload system where coaches submit game photos that are extracted via Claude Vision API
3. **Press Box AI**: Voice-to-article platform where coaches speak game recaps that are transformed into articles via Claude

### Tech Stack
- **Framework**: Next.js 16 (App Router with Turbopack)
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **CMS**: Sanity for articles, videos, rankings
- **Styling**: Tailwind CSS with custom design system
- **Auth**: JWT with bcrypt (see `lib/auth.ts`)
- **AI**: Anthropic Claude SDK for vision extraction and article generation
- **Video**: Mux for video hosting

### Development Commands

```bash
# Start Next.js dev server with Turbopack
bun dev

# Build for production
bun run build
bun start

# Type checking
bun run typecheck

# Linting
bun run lint

# Database migrations
bunx prisma migrate dev
bunx prisma studio  # Database GUI
bunx prisma generate  # Regenerate client
```

### Key Directories

- `app/` - Next.js App Router pages and API routes
  - `app/api/auth/` - Authentication endpoints (login, change password)
  - `app/api/submissions/` - ScoreSnap game submission API
  - `app/api/pressbox/` - Press Box AI conversation and article generation
  - `app/scoresnap/` - ScoreSnap UI for coaches
  - `app/pressbox/` - Press Box AI UI for writers
  - `app/studio/` - Sanity Studio embedded route
- `components/` - Reusable React components
  - `components/pressbox/` - Press Box AI specific components
- `lib/` - Shared utilities
  - `lib/auth.ts` - JWT authentication utilities
  - `lib/prisma.ts` - Prisma client singleton
  - `lib/utils.ts` - Sport types, color mappings, date formatting
  - `lib/sanity-upload.ts` - Sanity CDN upload utilities
- `prisma/` - Database schema and migrations
- `sanity/` - Sanity CMS configuration
  - `sanity/config.ts` - Sanity project configuration
  - `sanity/schemas/` - Content type schemas (article, video, player, etc.)

### Architecture Patterns

#### Database Layer (Prisma + PostgreSQL)
- **7 Models**: User, Submission, Game, ValidationError, EditHistory, Conversation, Article
- Game data maps to existing Supabase `schools` and `games` tables
- JWT authentication with role-based access (ADMIN, COACH, WRITER)
- All models use UUID primary keys with `@db.Uuid` type
- Timestamps use `@map("snake_case")` for database column names

#### Authentication Flow
1. Login via `/api/auth/login` returns JWT token
2. Protected routes extract token from `Authorization: Bearer <token>` header
3. Use `getUserFromToken()` helper to validate and fetch user data
4. Role checks: `isAdmin()`, `isVerifiedCoach()` helpers in `lib/auth.ts`

#### AI Integrations
1. **Claude Vision (ScoreSnap)**: Extracts game data from photos
   - Input: Uploaded image → Sanity CDN
   - Process: Claude Vision API analyzes scoreboard
   - Output: Structured JSON (teams, scores, quarter scores, player stats)
   - See `app/api/submissions/` for implementation

2. **Claude Conversation (Press Box AI)**: Converts voice to articles
   - Input: Voice transcription → conversation transcript
   - Process: Multi-turn Claude conversation for game details
   - Output: Markdown article with headline
   - See `app/api/pressbox/` for implementation

#### Content Management (Sanity)
- Embedded Sanity Studio at `/studio`
- Content types: article, video, player, staff, ranking
- Mux integration for video uploads
- Image optimization via `next-sanity` and `@sanity/image-url`

### Design System

The design system is fully documented in `.design-system/system.md`. Key principles:

#### Colors
- **Sport-specific accents**: Basketball (orange), Football (green), Lacrosse (blue)
- **Brand primary**: `#94d873` (meadow green)
- **Dark navy header**: `#1a1d29`
- All colors defined as CSS variables in `app/globals.css`

#### Typography
- **Display**: Space Grotesk (700-800 weight) for headlines
- **Body**: Inter (400-500 weight) for content
- **Data**: JetBrains Mono with `tabular-nums` for scores/stats

#### Spacing
- 4px base grid: 4, 8, 12, 16, 24, 32, 48, 64px
- Mobile-first: Start with mobile padding, scale up with `md:` and `lg:`
- **Never use `sm:` breakpoint** to maintain consistency

#### Components
- Use `SportTag` component for consistent sport branding
- Card-based layouts with subtle shadows (`shadow-card`)
- Editorial two-column layouts for articles
- Dense table layouts for rankings and stats

### API Routes Convention

All API routes return JSON and follow this pattern:

```typescript
// Success
return Response.json({ data: result });

// Error
return Response.json({ error: "Message" }, { status: 400 });

// Protected routes - extract and validate user
const authHeader = request.headers.get("authorization");
const token = getTokenFromHeader(authHeader);
const user = token ? await getUserFromToken(token) : null;
if (!user) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `ANTHROPIC_API_KEY` - Claude API key
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Sanity dataset (usually "production")
- `SANITY_API_TOKEN` - Sanity write token for uploads

### Performance Targets
- Lighthouse Performance: ≥90 on mobile
- LCP: <2.5 seconds
- FID: <100ms
- CLS: <0.1

### Prisma Workflow

When modifying the database schema:

```bash
# 1. Edit prisma/schema.prisma
# 2. Create and apply migration
bunx prisma migrate dev --name descriptive_migration_name

# 3. Regenerate Prisma client (if not auto-generated)
bunx prisma generate

# 4. View data in Prisma Studio
bunx prisma studio
```

### Sanity Workflow

The Sanity Studio is embedded at `/studio`. To modify schemas:

1. Edit files in `sanity/schemas/`
2. Studio hot-reloads automatically in development
3. Deploy schema changes: schemas are part of the codebase, no separate deploy needed

### ScoreSnap Data Flow

1. Coach uploads image → `/api/submissions/create` → Sanity CDN
2. Background process: Claude Vision analyzes → structured JSON
3. Coach reviews/edits on `/scoresnap/[id]` page
4. Submit → creates Game record in `games` table
5. Edit history tracked in `edit_history` table

### Press Box AI Data Flow

1. Writer starts conversation → `/api/pressbox/conversation/create`
2. Multi-turn interview → transcript stored as JSON
3. Generate article → `/api/pressbox/article/generate`
4. Writer edits → saves to `articles` table
5. Publish → exports to Sanity CMS (future feature)
