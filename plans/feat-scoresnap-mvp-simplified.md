# ScoreSnap MVP: Simplified Implementation Plan
## Basketball-Only AI Score Submission (2-3 Weeks)

| Field | Detail |
|-------|--------|
| **Plan ID** | feat-scoresnap-mvp-simplified |
| **Version** | 2.0 (Post-Review Simplified) |
| **Date** | February 8, 2026 |
| **Status** | Ready for Implementation |
| **Complexity** | Medium (Simplified from High) |
| **Estimated Effort** | 2-3 weeks |

---

## Executive Summary

**What Changed from Original Plan:**
- Reduced from 15 database models to **5 core models** (67% reduction)
- Basketball only (football deferred to Phase 2)
- Simple manual authentication (no NextAuth, no OAuth)
- Sanity CDN for images (no Cloudflare R2 setup)
- Removed: multi-image support, PWA offline, dashboard, roster management, social graphics
- Added: Comprehensive error handling, retry logic, validation rules (from Kieran's review)

**Timeline:** 2-3 weeks to launch with 10-20 beta coaches

---

## Architecture Decisions (Post-Review)

### ✅ Validated Decisions
- **PostgreSQL** - For data pipeline and stats querying (Sanity stays for blog content)
- **Basketball Only** - Validate AI extraction accuracy before expanding to other sports
- **Simple Auth** - Manual admin account creation for 10-20 beta coaches
- **Sanity CDN** - Use existing image infrastructure (already paying for it)

### ❌ Deferred to Phase 2+
- Football support → After basketball validation
- NextAuth/OAuth → After beta proves demand
- Multi-image capture → After single-image perfection
- Coach dashboard → After 25+ active coaches
- Social graphics → After retention validation
- PWA offline → After online flow is rock-solid

---

## Database Schema (Simplified: 5 Models)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  COACH
}

enum SubmissionStatus {
  DRAFT
  PROCESSING
  COMPLETED
  FAILED
}

// ========================================
// MODEL 1: User (Authentication)
// ========================================
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   // bcrypt hash
  name          String
  role          Role     @default(COACH)

  // Coach-specific fields (denormalized for simplicity)
  schoolName    String?  // e.g., "Greensboro Day School"
  primarySport  String?  // e.g., "BASKETBALL"
  verifiedAt    DateTime? // Admin approval timestamp

  // Relations
  submissions   Submission[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime? // Soft delete

  @@index([email])
  @@index([role])
  @@index([schoolName])
  @@index([verifiedAt])
}

// ========================================
// MODEL 2: Submission (Upload Session)
// ========================================
model Submission {
  id            String           @id @default(cuid())
  userId        String
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  sport         String           // "BASKETBALL", "FOOTBALL", etc.
  status        SubmissionStatus @default(DRAFT)

  // Image storage (Sanity CDN URLs)
  imageUrl      String           // Primary scorebook image URL from Sanity
  imageAssetId  String?          // Sanity asset ID for reference

  // AI extraction (full JSON response from Claude)
  rawAiResponse Json?            // Store entire Claude response
  processingTimeMs Int?          // How long extraction took

  // Relations
  game          Game?            // One submission → one game (when approved)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([sport])
  @@index([createdAt])
}

// ========================================
// MODEL 3: Game (Approved Game Data)
// ========================================
model Game {
  id              String   @id @default(cuid())
  submissionId    String   @unique
  submission      Submission @relation(fields: [submissionId], references: [id], onDelete: Restrict)

  // Core game info
  sport           String   // "BASKETBALL"
  date            DateTime

  // Teams (denormalized as strings for MVP)
  homeTeamName    String
  awayTeamName    String

  // Scores
  homeScore       Int
  awayScore       Int
  quarterScores   Json?    // [[Q1_home, Q1_away], [Q2_home, Q2_away], ...]
  overtime        Boolean  @default(false)

  // Full game data (player stats as JSON)
  gameData        Json     // Complete structured data from AI extraction

  // Edit window
  editableUntil   DateTime // createdAt + 48 hours

  // Metadata
  location        String?
  approvedBy      String   // User ID who approved submission

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime? // Soft delete only

  @@unique([homeTeamName, awayTeamName, date]) // Duplicate detection
  @@index([sport])
  @@index([date])
  @@index([sport, date]) // Scoreboard query: "Show all basketball games today"
  @@index([homeTeamName])
  @@index([awayTeamName])
  @@index([editableUntil]) // Cleanup job: games past edit window
  @@index([deletedAt])
}

// ========================================
// MODEL 4: ValidationError (AI Quality Tracking)
// ========================================
model ValidationError {
  id              String   @id @default(cuid())
  submissionId    String

  errorCode       String   // "POINTS_MISMATCH", "FOULS_EXCEED_MAX", etc.
  errorMessage    String
  fieldPath       String?  // e.g., "homeTeam.players[3].points"

  // Coach override
  overridden      Boolean  @default(false)
  overrideReason  String?

  createdAt       DateTime @default(now())

  @@index([submissionId])
  @@index([errorCode])
  @@index([createdAt])
}

// ========================================
// MODEL 5: EditHistory (Field-Level Changes)
// ========================================
model EditHistory {
  id              String   @id @default(cuid())
  gameId          String

  editedBy        String   // User ID
  editedAt        DateTime @default(now())

  fieldPath       String   // e.g., "homeTeam.players[0].points"
  oldValue        String?
  newValue        String?

  @@index([gameId])
  @@index([editedAt])
  @@index([fieldPath]) // Analytics: "Which fields are edited most?"
}
```

**Total Models:** 5 (down from 15)
**Total Fields:** ~45 (down from 87)

---

## Week 1: Foundation (Database, Auth, Image Upload)

### Day 1-2: Database & Prisma Setup

```bash
# Install dependencies
bun add prisma @prisma/client bcrypt
bun add -D @types/bcrypt

# Initialize Prisma
bunx prisma init

# Set DATABASE_URL in .env.local
# Example: postgresql://user:password@localhost:5432/fnfroom

# Create schema (use simplified schema above)

# Run migration
bunx prisma migrate dev --name init

# Generate client
bunx prisma generate
```

**Files created:**
- `prisma/schema.prisma` (simplified 5-model schema)
- `prisma/migrations/`
- `lib/prisma.ts` (singleton client with soft delete middleware)

**Prisma Client Setup:**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Soft delete middleware
prisma.$use(async (params, next) => {
  // Convert delete to soft delete (update deletedAt)
  if (params.action === 'delete') {
    params.action = 'update';
    params.args['data'] = { deletedAt: new Date() };
  }

  if (params.action === 'deleteMany') {
    params.action = 'updateMany';
    if (params.args.data != undefined) {
      params.args.data['deletedAt'] = new Date();
    } else {
      params.args['data'] = { deletedAt: new Date() };
    }
  }

  // Filter soft-deleted records from queries
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    params.action = 'findFirst';
    params.args.where = { ...params.args.where, deletedAt: null };
  }

  if (params.action === 'findMany') {
    if (params.args.where) {
      if (params.args.where.deletedAt === undefined) {
        params.args.where['deletedAt'] = null;
      }
    } else {
      params.args['where'] = { deletedAt: null };
    }
  }

  return next(params);
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

---

### Day 3-4: Simple Authentication

**No NextAuth. No OAuth. Just email/password + session cookies.**

```typescript
// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface Session {
  userId: string;
  email: string;
  role: 'ADMIN' | 'COACH';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: { id: string; email: string; role: 'ADMIN' | 'COACH'; name: string }) {
  const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get('session')?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as Session;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  cookies().delete('session');
}
```

**Sign-in Page:**

```typescript
// app/auth/signin/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });

    if (response.ok) {
      router.push('/scoresnap');
      router.refresh();
    } else {
      const data = await response.json();
      setError(data.error || 'Invalid credentials');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-card">
        <div>
          <h1 className="text-3xl font-display font-bold text-center">Friday Night Film Room</h1>
          <h2 className="text-xl font-semibold text-center mt-2">Coach Sign In</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="coach@school.edu"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-sm text-gray-600 text-center">
          Don't have an account? Contact your admin.
        </p>
      </div>
    </div>
  );
}
```

**Sign-in API Route:**

```typescript
// app/api/auth/signin/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if verified
    if (!user.verifiedAt) {
      return NextResponse.json({ error: 'Account pending verification' }, { status: 403 });
    }

    // Create session
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json({ error: 'Sign-in failed' }, { status: 500 });
  }
}
```

**Middleware for Route Protection:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Protected routes
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Admin Script to Create Coach Accounts:**

```typescript
// scripts/create-coach.ts
import prisma from '../lib/prisma';
import { hashPassword } from '../lib/auth';

async function createCoach(
  email: string,
  password: string,
  name: string,
  schoolName: string
) {
  const passwordHash = await hashPassword(password);

  const coach = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'COACH',
      schoolName,
      primarySport: 'BASKETBALL',
      verifiedAt: new Date(), // Auto-verify for beta
    },
  });

  console.log('✅ Coach created:', coach.email);
  console.log('Password:', password);
  return coach;
}

// Example usage:
createCoach(
  'coach@greensboroday.com',
  'temp-password-123', // Coach should change this
  'John Smith',
  'Greensboro Day School'
).then(() => process.exit(0));
```

Run with: `bun run scripts/create-coach.ts`

---

### Day 5: Sanity CDN Image Upload

**Use existing Sanity infrastructure - no R2, no Vercel Blob.**

```typescript
// lib/sanity-upload.ts
import { sanityClient } from '@/sanity/lib/client';

export async function uploadToSanity(file: File): Promise<{
  assetId: string;
  url: string;
}> {
  // Convert File to Buffer
  const buffer = await file.arrayBuffer();

  // Upload to Sanity
  const asset = await sanityClient.assets.upload('image', Buffer.from(buffer), {
    filename: file.name,
    contentType: file.type,
  });

  return {
    assetId: asset._id,
    url: asset.url,
  };
}
```

**Server Action for Upload:**

```typescript
// app/actions/upload-scorebook.ts
'use server';

import { getSession } from '@/lib/auth';
import { uploadToSanity } from '@/lib/sanity-upload';
import prisma from '@/lib/prisma';
import sharp from 'sharp';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function uploadScorebook(formData: FormData) {
  // Auth check
  const session = await getSession();
  if (!session || session.role !== 'COACH') {
    throw new Error('Unauthorized');
  }

  const file = formData.get('image') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large (max 10MB)');
  }

  // Validate MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type (use JPEG, PNG, or WebP)');
  }

  // Validate image content
  const buffer = Buffer.from(await file.arrayBuffer());
  let metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    throw new Error('Invalid image file');
  }

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions');
  }

  // Upload to Sanity
  const { assetId, url } = await uploadToSanity(file);

  // Create submission record
  const submission = await prisma.submission.create({
    data: {
      userId: session.userId,
      sport: 'BASKETBALL',
      status: 'DRAFT',
      imageUrl: url,
      imageAssetId: assetId,
    },
  });

  return {
    success: true,
    submissionId: submission.id,
    imageUrl: url,
  };
}
```

---

## Week 2: AI Extraction & Validation

### Day 6-7: Claude Vision Integration with Retry Logic

```bash
# Install dependencies
bun add @anthropic-ai/sdk zod
```

**Extraction with Full Error Handling (Kieran's Requirements):**

```typescript
// lib/ai-extraction.ts
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ========================================
// Basketball Schema
// ========================================
export const BasketballPlayerStatSchema = z.object({
  jerseyNumber: z.number().min(0).max(99),
  name: z.string().min(1),
  points: z.number().min(0),
  fieldGoals: z.object({
    made: z.number().min(0),
    attempted: z.number().min(0),
  }),
  threePointers: z.object({
    made: z.number().min(0),
    attempted: z.number().min(0),
  }),
  freeThrows: z.object({
    made: z.number().min(0),
    attempted: z.number().min(0),
  }),
  rebounds: z.object({
    offensive: z.number().min(0),
    defensive: z.number().min(0),
  }),
  assists: z.number().min(0),
  steals: z.number().min(0),
  blocks: z.number().min(0),
  turnovers: z.number().min(0),
  fouls: z.number().min(0).max(5),
});

export const BasketballExtractionSchema = z.object({
  sport: z.literal('basketball'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  homeTeam: z.object({
    name: z.string().min(1),
    players: z.array(BasketballPlayerStatSchema),
    teamFouls: z.array(z.number().min(0)),
    timeoutsUsed: z.number().min(0),
  }),
  awayTeam: z.object({
    name: z.string().min(1),
    players: z.array(BasketballPlayerStatSchema),
    teamFouls: z.array(z.number().min(0)),
    timeoutsUsed: z.number().min(0),
  }),
  quarterScores: z.array(z.array(z.number())),
  finalScore: z.object({
    home: z.number().min(0),
    away: z.number().min(0),
  }),
  overtime: z.boolean(),
});

export type BasketballExtraction = z.infer<typeof BasketballExtractionSchema>;

// ========================================
// Extraction Errors
// ========================================
export class ExtractionError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

// ========================================
// Retry Utility
// ========================================
async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries: number;
    backoff: 'linear' | 'exponential';
    onRetry?: (error: Error, attempt: number) => void;
  }
): Promise<T> {
  const { retries, backoff, onRetry } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;

      onRetry?.(error as Error, attempt);

      const delay = backoff === 'exponential' ? Math.pow(2, attempt) * 1000 : attempt * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry logic failed');
}

// ========================================
// Basketball Extraction Prompt
// ========================================
const BASKETBALL_PROMPT = `You are an expert at extracting structured data from handwritten basketball scorebooks.

Extract all visible data from this scorebook page and return it as valid JSON matching this structure:

{
  "sport": "basketball",
  "date": "YYYY-MM-DD",
  "homeTeam": {
    "name": "Team Name",
    "players": [
      {
        "jerseyNumber": 10,
        "name": "Player Name",
        "points": 15,
        "fieldGoals": { "made": 6, "attempted": 12 },
        "threePointers": { "made": 1, "attempted": 3 },
        "freeThrows": { "made": 2, "attempted": 2 },
        "rebounds": { "offensive": 2, "defensive": 4 },
        "assists": 3,
        "steals": 2,
        "blocks": 1,
        "turnovers": 2,
        "fouls": 3
      }
    ],
    "teamFouls": [5, 6, 7, 4],
    "timeoutsUsed": 4
  },
  "awayTeam": { /* same structure */ },
  "quarterScores": [[20, 18], [22, 20], [18, 16], [25, 19]],
  "finalScore": { "home": 85, "away": 73 },
  "overtime": false
}

CRITICAL RULES:
1. Extract jersey numbers and names exactly as written
2. Calculate points: (FG - 3PT) × 2 + 3PT × 3 + FT × 1
3. Individual player points MUST sum to team total score
4. If handwriting is unclear, make your best guess (coaches will verify)
5. For missing/illegible fields, use 0
6. Return ONLY valid JSON, no explanatory text`;

// ========================================
// Main Extraction Function
// ========================================
export async function extractBasketballData(
  imageUrl: string,
  options: { retries?: number; timeout?: number } = {}
): Promise<BasketballExtraction> {
  const { retries = 3, timeout = 45000 } = options;

  return retry(
    async () => {
      // Fetch image and convert to base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new ExtractionError('Failed to fetch image', 'IMAGE_FETCH_FAILED');
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const message = await anthropic.messages.create(
          {
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 4096,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'image/jpeg',
                      data: base64,
                    },
                  },
                  {
                    type: 'text',
                    text: BASKETBALL_PROMPT,
                  },
                ],
              },
            ],
          },
          { signal: controller.signal as any }
        );

        clearTimeout(timeoutId);

        // Extract text response
        const textContent = message.content.find((block) => block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
          throw new ExtractionError('No text response from Claude', 'NO_TEXT_CONTENT');
        }

        let jsonText = textContent.text.trim();

        // Handle markdown code blocks
        const jsonMatch = jsonText.match(/```json\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else if (jsonText.startsWith('```')) {
          throw new ExtractionError('Malformed JSON response', 'INVALID_FORMAT');
        }

        // Parse JSON
        let parsedData: unknown;
        try {
          parsedData = JSON.parse(jsonText);
        } catch (jsonError) {
          throw new ExtractionError('JSON parse failed', 'INVALID_JSON', {
            rawResponse: jsonText.slice(0, 500),
          });
        }

        // Validate with Zod
        const validated = BasketballExtractionSchema.safeParse(parsedData);
        if (!validated.success) {
          throw new ExtractionError('Schema validation failed', 'INVALID_SCHEMA', {
            zodErrors: validated.error.issues,
          });
        }

        return validated.data;
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
          throw new ExtractionError('API timeout exceeded', 'TIMEOUT', { timeout });
        }
        if (error.status === 429) {
          throw new ExtractionError('Rate limit exceeded', 'RATE_LIMIT');
        }
        if (error.status === 500) {
          throw new ExtractionError('Claude API error', 'API_ERROR');
        }

        throw error;
      }
    },
    {
      retries,
      backoff: 'exponential',
      onRetry: (error, attempt) => {
        console.error(`Extraction attempt ${attempt} failed:`, error.message);
      },
    }
  );
}

// ========================================
// Comprehensive Validation Rules
// ========================================
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateBasketballData(data: BasketballExtraction): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate date
  const gameDate = new Date(data.date);
  const today = new Date();
  if (gameDate > today) {
    errors.push(`Game date (${data.date}) is in the future`);
  }

  // Validate both teams
  [data.homeTeam, data.awayTeam].forEach((team, idx) => {
    const teamLabel = idx === 0 ? 'Home' : 'Away';

    if (!team.name || team.name.trim() === '') {
      errors.push(`${teamLabel} team name is empty`);
    }

    const jerseyNumbers = new Set<number>();

    team.players.forEach((p) => {
      const playerLabel = `${teamLabel} ${p.name} (#${p.jerseyNumber})`;

      // Jersey uniqueness
      if (jerseyNumbers.has(p.jerseyNumber)) {
        errors.push(`${teamLabel}: Duplicate jersey number ${p.jerseyNumber}`);
      }
      jerseyNumbers.add(p.jerseyNumber);

      // Made <= Attempted
      if (p.fieldGoals.made > p.fieldGoals.attempted) {
        errors.push(`${playerLabel}: FG made > attempted`);
      }
      if (p.threePointers.made > p.threePointers.attempted) {
        errors.push(`${playerLabel}: 3PT made > attempted`);
      }
      if (p.freeThrows.made > p.freeThrows.attempted) {
        errors.push(`${playerLabel}: FT made > attempted`);
      }

      // Points calculation
      const calculatedPoints =
        (p.fieldGoals.made - p.threePointers.made) * 2 +
        p.threePointers.made * 3 +
        p.freeThrows.made;

      if (calculatedPoints !== p.points) {
        errors.push(
          `${playerLabel}: Points mismatch (calculated: ${calculatedPoints}, reported: ${p.points})`
        );
      }

      // Fouls max
      if (p.fouls > 5) {
        errors.push(`${playerLabel}: More than 5 fouls`);
      }

      // Warnings for outliers
      if (p.points > 50) {
        warnings.push(`${playerLabel}: Unusually high points (${p.points})`);
      }
    });

    // Team total validation
    const playerPointsSum = team.players.reduce((sum, p) => sum + p.points, 0);
    const expectedScore = idx === 0 ? data.finalScore.home : data.finalScore.away;

    if (playerPointsSum !== expectedScore) {
      errors.push(
        `${teamLabel}: Player points (${playerPointsSum}) ≠ final score (${expectedScore})`
      );
    }
  });

  // Quarter scores validation
  if (data.quarterScores && data.quarterScores.length > 0) {
    let homeSum = 0;
    let awaySum = 0;

    data.quarterScores.forEach((quarter) => {
      homeSum += quarter[0];
      awaySum += quarter[1];
    });

    if (homeSum !== data.finalScore.home) {
      errors.push(`Home quarter scores (${homeSum}) ≠ final score (${data.finalScore.home})`);
    }
    if (awaySum !== data.finalScore.away) {
      errors.push(`Away quarter scores (${awaySum}) ≠ final score (${data.finalScore.away})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

### Day 8-9: Extraction Server Action

```typescript
// app/actions/extract-scorebook.ts
'use server';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { extractBasketballData, validateBasketballData, ExtractionError } from '@/lib/ai-extraction';

export async function extractScorebook(submissionId: string) {
  const session = await getSession();
  if (!session || session.role !== 'COACH') {
    throw new Error('Unauthorized');
  }

  // Get submission
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  if (submission.userId !== session.userId) {
    throw new Error('Not your submission');
  }

  // Update status
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: 'PROCESSING' },
  });

  const startTime = Date.now();

  try {
    // Extract with Claude
    const extractedData = await extractBasketballData(submission.imageUrl, {
      retries: 3,
      timeout: 45000,
    });

    const processingTime = Date.now() - startTime;

    // Validate
    const validation = validateBasketballData(extractedData);

    // Save extraction result
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'COMPLETED',
        rawAiResponse: extractedData as any,
        processingTimeMs: processingTime,
      },
    });

    // Log validation errors
    if (!validation.valid) {
      await prisma.validationError.createMany({
        data: validation.errors.map((error) => ({
          submissionId,
          errorCode: 'VALIDATION_FAILED',
          errorMessage: error,
        })),
      });
    }

    return {
      success: true,
      data: extractedData,
      validation,
      processingTime,
    };
  } catch (error) {
    // Update status to failed
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'FAILED' },
    });

    if (error instanceof ExtractionError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
        context: error.context,
      };
    }

    throw error;
  }
}
```

---

## Week 3: Confirmation View & Submission

### Day 10-11: Confirmation View (Simplified)

```typescript
// app/scoresnap/confirm/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, AlertTriangle } from 'lucide-react';
import type { BasketballExtraction } from '@/lib/ai-extraction';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const submissionId = searchParams.get('submissionId');

  const [data, setData] = useState<BasketballExtraction | null>(null);
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const response = await fetch(`/api/submissions/${submissionId}`);
      const result = await response.json();
      setData(result.data);
      setValidation(result.validation);
      setLoading(false);
    }
    loadData();
  }, [submissionId]);

  async function handleSubmit() {
    setSubmitting(true);
    const response = await fetch('/api/scoresnap/submit', {
      method: 'POST',
      body: JSON.stringify({ submissionId, data }),
    });

    if (response.ok) {
      router.push('/scoresnap/success');
    } else {
      alert('Submission failed');
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Processing...</div>;
  if (!data) return <div className="p-8 text-center">No data found</div>;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-display font-bold mb-6">Review & Confirm</h1>

      {/* Validation Errors */}
      {!validation.valid && (
        <Card className="mb-6 border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Please Review These Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {validation.errors.map((error: string, idx: number) => (
                <li key={idx} className="text-red-600">• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Game Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Game Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Home Team</label>
              <Input
                value={data.homeTeam.name}
                onChange={(e) =>
                  setData({
                    ...data,
                    homeTeam: { ...data.homeTeam, name: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Away Team</label>
              <Input
                value={data.awayTeam.name}
                onChange={(e) =>
                  setData({
                    ...data,
                    awayTeam: { ...data.awayTeam, name: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Home Score</label>
              <Input
                type="number"
                value={data.finalScore.home}
                onChange={(e) =>
                  setData({
                    ...data,
                    finalScore: { ...data.finalScore, home: parseInt(e.target.value) },
                  })
                }
                className={validation.valid ? 'border-green-500' : 'border-red-500'}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Away Score</label>
              <Input
                type="number"
                value={data.finalScore.away}
                onChange={(e) =>
                  setData({
                    ...data,
                    finalScore: { ...data.finalScore, away: parseInt(e.target.value) },
                  })
                }
                className={validation.valid ? 'border-green-500' : 'border-red-500'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Stats Tables */}
      {[data.homeTeam, data.awayTeam].map((team, teamIdx) => (
        <Card key={teamIdx} className="mb-6">
          <CardHeader>
            <CardTitle>{team.name} Player Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-right">PTS</th>
                    <th className="p-2 text-right">FG</th>
                    <th className="p-2 text-right">3PT</th>
                    <th className="p-2 text-right">FT</th>
                    <th className="p-2 text-right">REB</th>
                    <th className="p-2 text-right">AST</th>
                    <th className="p-2 text-right">PF</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((player, playerIdx) => (
                    <tr key={playerIdx} className="border-t hover:bg-gray-50">
                      <td className="p-2">{player.jerseyNumber}</td>
                      <td className="p-2 font-medium">{player.name}</td>
                      <td className="p-2 text-right font-semibold">{player.points}</td>
                      <td className="p-2 text-right">
                        {player.fieldGoals.made}/{player.fieldGoals.attempted}
                      </td>
                      <td className="p-2 text-right">
                        {player.threePointers.made}/{player.threePointers.attempted}
                      </td>
                      <td className="p-2 text-right">
                        {player.freeThrows.made}/{player.freeThrows.attempted}
                      </td>
                      <td className="p-2 text-right">
                        {player.rebounds.offensive + player.rebounds.defensive}
                      </td>
                      <td className="p-2 text-right">{player.assists}</td>
                      <td className="p-2 text-right">{player.fouls}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={2} className="p-2">TOTAL</td>
                    <td className="p-2 text-right">
                      {team.players.reduce((sum, p) => sum + p.points, 0)}
                    </td>
                    <td colSpan={6}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Submit */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size="lg"
          className="bg-primary"
        >
          {submitting ? 'Submitting...' : 'Approve & Submit'}
        </Button>
      </div>
    </div>
  );
}
```

---

### Day 12-13: Final Submission & Public Scoreboard

**Submit Action:**

```typescript
// app/api/scoresnap/submit/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BasketballExtraction } from '@/lib/ai-extraction';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'COACH') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { submissionId, data } = await request.json() as {
    submissionId: string;
    data: BasketballExtraction;
  };

  // Get submission
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission || submission.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Check for duplicate game
  const existingGame = await prisma.game.findUnique({
    where: {
      homeTeamName_awayTeamName_date: {
        homeTeamName: data.homeTeam.name,
        awayTeamName: data.awayTeam.name,
        date: new Date(data.date),
      },
    },
  });

  if (existingGame) {
    return NextResponse.json({ error: 'DUPLICATE_GAME' }, { status: 409 });
  }

  // Create game
  const game = await prisma.game.create({
    data: {
      submissionId: submission.id,
      sport: 'BASKETBALL',
      date: new Date(data.date),
      homeTeamName: data.homeTeam.name,
      awayTeamName: data.awayTeam.name,
      homeScore: data.finalScore.home,
      awayScore: data.finalScore.away,
      quarterScores: data.quarterScores,
      overtime: data.overtime,
      gameData: data as any,
      approvedBy: session.userId,
      editableUntil: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ success: true, gameId: game.id });
}
```

**Public Scoreboard:**

```typescript
// app/scoreboard/page.tsx
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function ScoreboardPage() {
  const games = await prisma.game.findMany({
    where: {
      sport: 'BASKETBALL',
      deletedAt: null,
    },
    orderBy: {
      date: 'desc',
    },
    take: 50,
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-display font-bold mb-6">Basketball Scoreboard</h1>

      <div className="space-y-4">
        {games.map((game) => (
          <Card key={game.id} className="hover:shadow-card-hover transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-semibold text-lg">{game.homeTeamName}</span>
                    <span className="text-3xl font-bold">{game.homeScore}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">{game.awayTeamName}</span>
                    <span className="text-3xl font-bold">{game.awayScore}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {game.date.toLocaleDateString()}
                  </p>
                  {game.overtime && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      OT
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## Testing Strategy (Kieran's Requirement)

### Integration Tests

```typescript
// __tests__/extraction.test.ts
import { describe, test, expect, beforeAll } from 'bun:test';
import { extractBasketballData, validateBasketballData } from '@/lib/ai-extraction';

describe('AI Extraction', () => {
  test('extracts valid basketball data from sample image', async () => {
    const imageUrl = 'https://cdn.sanity.io/images/.../sample-scorebook.jpg';

    const result = await extractBasketballData(imageUrl, {
      retries: 1,
      timeout: 60000,
    });

    expect(result.sport).toBe('basketball');
    expect(result.homeTeam.name).toBeTruthy();
    expect(result.awayTeam.name).toBeTruthy();
    expect(result.finalScore.home).toBeGreaterThanOrEqual(0);
  });

  test('validates points calculation correctly', () => {
    const validData = {
      sport: 'basketball' as const,
      date: '2026-02-07',
      homeTeam: {
        name: 'Test High',
        players: [
          {
            jerseyNumber: 10,
            name: 'John Doe',
            points: 10,
            fieldGoals: { made: 5, attempted: 10 },
            threePointers: { made: 0, attempted: 0 },
            freeThrows: { made: 0, attempted: 0 },
            rebounds: { offensive: 2, defensive: 3 },
            assists: 2,
            steals: 1,
            blocks: 0,
            turnovers: 1,
            fouls: 2,
          },
        ],
        teamFouls: [3, 4, 5, 2],
        timeoutsUsed: 3,
      },
      awayTeam: {
        name: 'Away High',
        players: [],
        teamFouls: [2, 3, 4, 3],
        timeoutsUsed: 4,
      },
      quarterScores: [[10, 8], [0, 0], [0, 0], [0, 0]],
      finalScore: { home: 10, away: 8 },
      overtime: false,
    };

    const result = validateBasketballData(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('catches point mismatch error', () => {
    const invalidData = {
      // ... same structure but:
      homeTeam: {
        name: 'Test High',
        players: [
          {
            jerseyNumber: 10,
            name: 'John Doe',
            points: 15, // WRONG - should be 10
            fieldGoals: { made: 5, attempted: 10 },
            threePointers: { made: 0, attempted: 0 },
            freeThrows: { made: 0, attempted: 0 },
            rebounds: { offensive: 2, defensive: 3 },
            assists: 2,
            steals: 1,
            blocks: 0,
            turnovers: 1,
            fouls: 2,
          },
        ],
        teamFouls: [3, 4, 5, 2],
        timeoutsUsed: 3,
      },
      awayTeam: {
        name: 'Away High',
        players: [],
        teamFouls: [2, 3, 4, 3],
        timeoutsUsed: 4,
      },
      quarterScores: [[10, 8], [0, 0], [0, 0], [0, 0]],
      finalScore: { home: 10, away: 8 },
      overtime: false,
      sport: 'basketball' as const,
      date: '2026-02-07',
    };

    const result = validateBasketballData(invalidData);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(expect.stringContaining('Points mismatch'));
  });
});
```

Run tests: `bun test`

---

## Success Metrics (2-Week MVP)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Beta Coach Signups** | 10 coaches | Manual admin creation |
| **Extraction Accuracy** | >85% | Fields unchanged in confirmation |
| **Time to Submit** | <90 seconds | Camera → approved submission |
| **Completion Rate** | >80% | Coaches who start flow complete it |
| **Submission Volume** | 30 games in 2 weeks | Total approved games |

---

## What We Cut (Can Add Later)

### Removed from Phase 1:
1. ❌ NextAuth.js / Google OAuth → Simple manual auth
2. ❌ Cloudflare R2 → Sanity CDN (already have it)
3. ❌ 15 database models → 5 models
4. ❌ Multi-image capture → Single image only
5. ❌ Football support → Basketball only
6. ❌ Coach dashboard → Deferred
7. ❌ Roster management → Deferred
8. ❌ Social graphics → Deferred
9. ❌ PWA offline → Online-only
10. ❌ Push notifications → Deferred

### Add in Phase 2 (If Proven):
- Football support (Week 4)
- Google OAuth (Week 5)
- Multi-image stitching (Week 6)
- Coach dashboard (Week 7-8)

---

## Next Steps

1. ✅ **Week 1:** Set up PostgreSQL, Prisma, simple auth, Sanity upload
2. ✅ **Week 2:** Claude extraction with retry logic, comprehensive validation
3. ✅ **Week 3:** Confirmation view, submission flow, public scoreboard
4. 🚀 **Launch:** Deploy to beta coaches, gather feedback
5. 📊 **Iterate:** Based on real usage data (not speculation)

---

## Final Checklist Before Launch

- [ ] PostgreSQL provisioned and migrated
- [ ] 10 coach accounts created by admin
- [ ] Claude API key configured and tested
- [ ] Sanity image uploads working
- [ ] Retry logic tested with mock API failures
- [ ] Validation rules tested with sample scorebooks
- [ ] Confirmation view displays all player stats
- [ ] Duplicate game detection prevents overwrites
- [ ] Public scoreboard displays submitted games
- [ ] Integration tests pass for happy path
- [ ] Error handling logs to console (Sentry in production)
- [ ] Deployed to Vercel staging environment

**Timeline:** 2-3 weeks from today to beta launch with 10 coaches.

**Philosophy:** Ship the simplest thing that validates AI extraction works. Iterate based on reality, not speculation.
