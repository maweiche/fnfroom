# ScoreSnap: AI-Powered Score Submission for Friday Night Film Room
## Implementation Plan

| Field | Detail |
|-------|--------|
| **Plan ID** | feat-scoresnap-ai-score-submission |
| **Version** | 1.0 |
| **Date** | February 8, 2026 |
| **Status** | Ready for Review |
| **Complexity** | High |
| **Estimated Effort** | 6-8 weeks (3 phases) |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Motivation](#2-problem-statement--motivation)
3. [Proposed Solution](#3-proposed-solution)
4. [Technical Architecture](#4-technical-architecture)
5. [Phase 1: MVP Implementation (Weeks 1-3)](#5-phase-1-mvp-implementation-weeks-1-3)
6. [Phase 2: Enhancement & Scale (Weeks 4-6)](#6-phase-2-enhancement--scale-weeks-4-6)
7. [Phase 3: Polish & Integration (Weeks 7-8)](#7-phase-3-polish--integration-weeks-7-8)
8. [Critical Decisions Required](#8-critical-decisions-required)
9. [Success Metrics](#9-success-metrics)
10. [Risk Analysis & Mitigation](#10-risk-analysis--mitigation)
11. [References & Research](#11-references--research)

---

## 1. Executive Summary

ScoreSnap transforms game score submission from a 10-15 minute manual data entry task into a **sub-60-second AI-powered photo workflow**. Coaches photograph their physical scorebook after games, and Claude Vision AI extracts structured game data with field-level confidence scores. Coaches review and approve the data in a mobile-optimized confirmation interface, and submissions instantly populate FNFR scoreboards, standings, and player statistics.

**Strategic Value:**
- Positions FNFR as the **primary data ingestion point** for NC high school athletics
- Builds proprietary first-party dataset for rankings, recruiting, and editorial content
- Creates coach retention loop through persistent season dashboards
- **Competitive moat**: No existing platform offers AI extraction from physical scorebooks

**Phase 1 Scope** (MVP, Weeks 1-3):
- Basketball and football support only
- Single-image capture with Claude Vision extraction
- Mobile-first PWA with camera capture
- Coach authentication with manual verification
- Basic confirmation/edit UI with confidence highlighting
- PostgreSQL database with Prisma ORM

**Phase 2 Scope** (Enhancement, Weeks 4-6):
- Multi-image capture and stitching
- Soccer, baseball, volleyball support
- Coach dashboard with season stats
- Auto-generated social media graphics
- Roster management and autocomplete

**Phase 3 Scope** (Polish, Weeks 7-8):
- Offline PWA support
- GameChanger/HUDL screenshot recognition
- Submission streaks and gamification
- Performance optimization and monitoring

---

## 2. Problem Statement & Motivation

### Current Pain Points

**For Coaches:**
- Must manually enter game data across **3+ platforms**: MaxPreps, HighSchoolOT, NCHSAA
- Average time: **10-15 minutes per game** of duplicate data entry
- Data entry often delayed until next day due to post-game fatigue
- Errors occur when transcribing handwritten scorebooks to digital forms
- No single source of truth for season statistics

**For FNFR:**
- Dependent on external data sources (MaxPreps, manual staff entry)
- Incomplete coverage of NC games, especially smaller programs
- No control over data quality or timeliness
- Limited ability to build unique features on incomplete data

**For Fans & Players:**
- Delayed score availability (hours to days after games)
- Inconsistent stat reporting across platforms
- Missing data for non-revenue sports and smaller schools

### Why Now?

**Technology Enablers:**
- **Claude Sonnet 4.5** (2025) offers industry-leading vision capabilities for handwritten text
- **Mobile camera quality** (2026 devices) provides 12MP+ with excellent low-light performance
- **PWA maturity** (2026) enables native-like experiences in browsers
- **Next.js 16** provides optimal framework for mobile-first, server-side AI workflows

**Market Timing:**
- MaxPreps, HighSchoolOT, and NCHSAA all require manual form entry (no AI features)
- Growing coach frustration with duplicate data entry across platforms
- FNFR's Greensboro Sports partnership provides warm introduction to 10-20 beta coaches
- January 2025 = prime timing to launch before spring sports season

---

## 3. Proposed Solution

### Core User Flow

```
Coach → Opens FNFR PWA → Taps "Submit Score"
     → Selects sport (basketball/football)
     → Captures 1-6 scorebook photos
     → Taps "Process"
     → Reviews AI-extracted data (color-coded by confidence)
     → Edits any low-confidence fields inline
     → Taps "Approve & Submit"
     → Success! Data live on FNFR scoreboard
     → Auto-generated social graphic ready to share
```

**Total time: <60 seconds** (vs. 10-15 minutes manual entry)

### Key Features

**Phase 1 (MVP):**
- ✅ Mobile-first PWA with camera capture
- ✅ Claude Vision AI extraction (basketball, football)
- ✅ Confidence-scored fields (green/yellow/red)
- ✅ Inline editing with real-time validation
- ✅ Coach authentication with school verification
- ✅ PostgreSQL database with audit trail
- ✅ Public scoreboard display

**Phase 2 (Enhancement):**
- ✅ Multi-image capture (2-6 photos per game)
- ✅ 3 additional sports (soccer, baseball, volleyball)
- ✅ Coach dashboard with season stats
- ✅ Auto-generated social media graphics
- ✅ Roster upload and autocomplete

**Phase 3 (Polish):**
- ✅ Offline capture with background sync
- ✅ GameChanger/HUDL screenshot recognition
- ✅ Submission streaks and gamification
- ✅ Performance monitoring (Sentry, Vercel Analytics)

---

## 4. Technical Architecture

### Tech Stack Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 16.1.6 (App Router) | Already in use; optimal for SSR + client interactivity |
| **UI Framework** | Tailwind CSS 3.4.17 + shadcn/ui | Consistent with existing FNFR design system |
| **Camera Capture** | Native MediaDevices API | Zero dependencies; PWA-compatible |
| **Image Processing** | browser-image-compression (client) | Reduce upload size/time on mobile data |
| **AI Extraction** | Anthropic Claude API (Sonnet 4.5) | Best-in-class vision model for handwritten OCR |
| **API Layer** | Next.js Server Actions | Type-safe, simpler than REST routes for forms |
| **Database** | PostgreSQL 16 + Prisma 6.19 | **NEW**: Relational data for games/stats; Sanity for editorial only |
| **File Storage** | Cloudflare R2 | S3-compatible; zero egress fees; already on Cloudflare |
| **Auth** | NextAuth.js v5 (Auth.js) | **NEW**: Industry standard for Next.js auth + RBAC |
| **Validation** | Zod 3.23 | Type-safe runtime validation for AI outputs |
| **PWA** | Serwist (successor to next-pwa) | Turbopack-compatible; workbox patterns |
| **Monitoring** | Vercel Analytics + Sentry | Performance and error tracking |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (PWA)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Camera       │  │ Image        │  │ Confirmation │       │
│  │ Capture      │→ │ Preview      │→ │ View         │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │               │
│         ↓ (File)           ↓ (Compressed)    ↓ (FormData)    │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│              Next.js Server (Vercel Edge)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Auth         │  │ Upload       │  │ Extract      │       │
│  │ Middleware   │→ │ Action       │→ │ Action       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                            │                  │               │
│                            ↓                  ↓               │
│                    ┌──────────────┐  ┌──────────────┐       │
│                    │ Cloudflare   │  │ Claude API   │       │
│                    │ R2           │  │ (Vision)     │       │
│                    └──────────────┘  └──────────────┘       │
│                                              │               │
│                                              ↓               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Validate     │← │ Parse JSON   │← │ Structured   │       │
│  │ (Zod)        │  │ Response     │  │ Output       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                                                     │
│         ↓                                                     │
│  ┌──────────────────────────────────────────────────┐       │
│  │          Submit Action                             │       │
│  │  • Persist to Postgres (Prisma)                    │       │
│  │  • Recalculate standings                           │       │
│  │  • Trigger notifications                           │       │
│  │  • Audit log entry                                 │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ PostgreSQL   │  │ Sanity CMS   │  │ Cloudflare   │       │
│  │ (Games,      │  │ (Editorial   │  │ R2           │       │
│  │  Stats,      │  │  Content)    │  │ (Images)     │       │
│  │  Coaches)    │  │              │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema (PostgreSQL)

**Why PostgreSQL?**
- Relational game data (games → team stats → player stats) fits SQL model
- Sanity is expensive at scale for transactional data
- Prisma ORM provides type-safe queries + automatic migrations
- Existing Sanity remains for editorial content (articles, videos, rankings)

**Key Models:**

```prisma
// prisma/schema.prisma

enum Sport {
  BASKETBALL
  FOOTBALL
  SOCCER
  BASEBALL
  VOLLEYBALL
  WRESTLING
}

enum Role {
  USER
  COACH
  ADMIN
}

enum SubmissionStatus {
  DRAFT
  PROCESSING
  COMPLETED
  FAILED
}

// Authentication & Users
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String   @unique
  emailVerified DateTime?
  image         String?
  role          Role     @default(USER)

  // Relations
  accounts      Account[]
  sessions      Session[]
  coachProfile  Coach?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime? // Soft delete

  @@index([email])
  @@index([role])
}

model Coach {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // School association
  schoolName      String
  schoolLocation  String?
  verifiedAt      DateTime? // Admin approval timestamp
  verifiedBy      String?   // Admin user ID who approved

  // Coaching details
  primarySport    Sport
  position        String?   // "Head Coach", "Assistant Coach"
  phoneNumber     String?

  // Relations
  teams           CoachTeam[]
  submissions     Submission[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([schoolName])
  @@index([verifiedAt])
}

model Team {
  id              String   @id @default(cuid())
  name            String
  schoolName      String
  sport           Sport
  level           String?   // "Varsity", "JV", "Freshman"
  season          String    // "2025-26"

  // Relations
  coaches         CoachTeam[]
  homeGames       Game[]    @relation("HomeTeam")
  awayGames       Game[]    @relation("AwayTeam")
  roster          Player[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([schoolName, sport, level, season])
  @@index([schoolName])
  @@index([sport])
}

model CoachTeam {
  id              String   @id @default(cuid())
  coachId         String
  coach           Coach    @relation(fields: [coachId], references: [id], onDelete: Cascade)
  teamId          String
  team            Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)

  isPrimary       Boolean  @default(false) // Head coach designation

  createdAt       DateTime @default(now())

  @@unique([coachId, teamId])
  @@index([coachId])
  @@index([teamId])
}

model Player {
  id              String   @id @default(cuid())
  teamId          String
  team            Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)

  name            String
  jerseyNumber    Int
  position        String?
  gradYear        Int?

  // Relations
  stats           PlayerStat[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([teamId, jerseyNumber])
  @@index([teamId])
  @@index([name])
}

// Submissions & Games
model Submission {
  id              String           @id @default(cuid())
  coachId         String
  coach           Coach            @relation(fields: [coachId], references: [id])

  sport           Sport
  status          SubmissionStatus @default(DRAFT)

  // Relations
  images          SubmissionImage[]
  extractionResult ExtractionResult?
  game            Game?
  editLog         EditLog[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([coachId])
  @@index([status])
  @@index([createdAt])
}

model SubmissionImage {
  id              String   @id @default(cuid())
  submissionId    String
  submission      Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  originalUrl     String   // Cloudflare R2 URL
  processedUrl    String?  // Compressed/corrected version
  sequence        Int      // Order in multi-image submission

  metadata        Json?    // { width, height, fileSize, capturedAt }

  createdAt       DateTime @default(now())

  @@index([submissionId])
}

model ExtractionResult {
  id              String   @id @default(cuid())
  submissionId    String   @unique
  submission      Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  rawOutput       Json     // Full Claude API response
  modelVersion    String   // "claude-sonnet-4-5-20250929"

  // Parsed data (sport-specific JSON)
  extractedData   Json     // Structured game data
  confidenceScores Json    // Field-level confidence

  processingTimeMs Int     // API response time

  createdAt       DateTime @default(now())

  @@index([submissionId])
}

model Game {
  id              String   @id @default(cuid())
  submissionId    String   @unique
  submission      Submission @relation(fields: [submissionId], references: [id])

  sport           Sport
  date            DateTime

  // Teams
  homeTeamId      String
  homeTeam        Team     @relation("HomeTeam", fields: [homeTeamId], references: [id])
  awayTeamId      String
  awayTeam        Team     @relation("AwayTeam", fields: [awayTeamId], references: [id])

  // Scores
  homeScore       Int
  awayScore       Int
  quarterScores   Json?    // Sport-specific: [Q1, Q2, Q3, Q4] or [H1, H2]
  overtime        Boolean  @default(false)

  // Metadata
  location        String?
  neutral         Boolean  @default(false)

  // Relations
  teamStats       TeamStat[]
  playerStats     PlayerStat[]

  // Audit
  approvedAt      DateTime @default(now())
  approvedBy      String   // Coach ID
  editableUntil   DateTime // approvedAt + 48 hours

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime? // Soft delete for corrections

  @@unique([homeTeamId, awayTeamId, date]) // Duplicate detection
  @@index([sport])
  @@index([date])
  @@index([homeTeamId])
  @@index([awayTeamId])
}

model TeamStat {
  id              String   @id @default(cuid())
  gameId          String
  game            Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  teamId          String

  // Generic stats (stored as JSON for sport flexibility)
  stats           Json     // { fieldGoals: { made: 30, attempted: 65 }, ... }

  createdAt       DateTime @default(now())

  @@unique([gameId, teamId])
  @@index([gameId])
}

model PlayerStat {
  id              String   @id @default(cuid())
  gameId          String
  game            Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  playerId        String
  player          Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)

  // Generic stats (JSON for sport flexibility)
  stats           Json     // { points: 24, rebounds: 8, assists: 5, ... }

  // Metadata
  started         Boolean  @default(false)
  minutesPlayed   Int?

  createdAt       DateTime @default(now())

  @@unique([gameId, playerId])
  @@index([gameId])
  @@index([playerId])
}

model EditLog {
  id              String   @id @default(cuid())
  submissionId    String
  submission      Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)

  editedBy        String   // Coach ID
  editedAt        DateTime @default(now())

  // Change tracking
  fieldName       String   // "homeScore", "player_5_points", etc.
  oldValue        String?
  newValue        String?

  @@index([submissionId])
  @@index([editedAt])
}

// NextAuth.js required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## 5. Phase 1: MVP Implementation (Weeks 1-3)

### Week 1: Foundation (Auth, Database, Infrastructure)

#### Task 1.1: Database Setup
**File:** `prisma/schema.prisma`

```bash
# Install Prisma
bun add prisma @prisma/client
bunx prisma init

# Create schema (copy from above)
# Set DATABASE_URL in .env

# Run initial migration
bunx prisma migrate dev --name init

# Generate Prisma Client
bunx prisma generate
```

**Deliverables:**
- ✅ PostgreSQL database provisioned (Vercel Postgres or Supabase)
- ✅ Prisma schema defined with all models
- ✅ Initial migration applied
- ✅ Prisma Client generated

**Files created:**
- `prisma/schema.prisma`
- `prisma/migrations/`
- `lib/prisma.ts` (singleton client)

---

#### Task 1.2: Authentication Setup
**Files:** `auth.ts`, `middleware.ts`, `app/auth/signin/page.tsx`

```typescript
// auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
```

```typescript
// middleware.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes
  if (pathname === '/' || pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Require authentication for /scoresnap routes
  if (pathname.startsWith('/scoresnap')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Require COACH or ADMIN role
    if (!['COACH', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Deliverables:**
- ✅ NextAuth.js configured with Google OAuth
- ✅ Middleware protects /scoresnap routes
- ✅ Sign-in page created
- ✅ Role-based access control (COACH role required)

**Files created:**
- `auth.ts`
- `middleware.ts`
- `app/auth/signin/page.tsx`
- `types/next-auth.d.ts`

---

#### Task 1.3: Coach Onboarding Flow
**File:** `app/coach/onboard/page.tsx`

**Manual Verification Process (Phase 1):**
1. Coach creates account via Google OAuth
2. Coach fills out onboarding form:
   - School name
   - Primary sport
   - Position (Head Coach / Assistant Coach)
   - Phone number
3. Form creates `Coach` record with `verifiedAt: null`
4. FNFR admin receives email notification
5. Admin verifies coach via admin panel (sets `verifiedAt`)
6. Coach receives email: "Your account has been verified!"

**Deliverables:**
- ✅ Onboarding form with school verification
- ✅ Admin notification system
- ✅ Admin panel for coach verification
- ✅ Email templates for verification status

**Files created:**
- `app/coach/onboard/page.tsx`
- `app/actions/onboard-coach.ts`
- `app/admin/coaches/page.tsx`
- `lib/email.ts`

---

#### Task 1.4: Cloudflare R2 Setup
**File:** `lib/r2.ts`

```typescript
// lib/r2.ts
import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;
```

**Deliverables:**
- ✅ Cloudflare R2 bucket created
- ✅ R2 client configured with AWS SDK
- ✅ CORS policy set for FNFR domain
- ✅ Public access enabled (or presigned URLs implemented)

**Files created:**
- `lib/r2.ts`
- `.env.local` (R2 credentials)

---

### Week 2: Camera Capture & Image Upload

#### Task 2.1: Camera Capture Component
**File:** `components/scoresnap/camera-capture.tsx`

```typescript
'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  maxImages?: number;
}

export function CameraCapture({ onCapture, maxImages = 6 }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
    } catch (error) {
      console.error('Camera error:', error);
      alert('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (capturedImages.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setCapturedImages((prev) => [...prev, url]);
        onCapture(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const removeImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Camera viewfinder */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className="w-full h-full object-cover"
        />

        {/* Overlay guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-white/50 w-11/12 h-5/6 rounded-lg" />
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <Button onClick={capture} size="lg">
          <Camera className="mr-2 h-5 w-5" />
          Capture ({capturedImages.length}/{maxImages})
        </Button>
        <Button onClick={switchCamera} variant="outline" size="lg">
          <SwitchCamera className="h-5 w-5" />
        </Button>
      </div>

      {/* Filmstrip preview */}
      {capturedImages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {capturedImages.map((url, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img
                src={url}
                alt={`Capture ${index + 1}`}
                className="w-24 h-16 object-cover rounded border-2 border-primary"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Deliverables:**
- ✅ Camera capture with MediaDevices API
- ✅ Front/rear camera toggle
- ✅ Overlay guide for optimal framing
- ✅ Filmstrip preview of captured images
- ✅ Remove image functionality
- ✅ Max 6 images enforcement

**Files created:**
- `components/scoresnap/camera-capture.tsx`

---

#### Task 2.2: Image Upload with Compression
**File:** `app/actions/upload-image.ts`

```bash
# Install image compression library
bun add browser-image-compression
```

```typescript
'use client';

import imageCompression from 'browser-image-compression';

export async function compressImage(file: Blob): Promise<Blob> {
  const options = {
    maxSizeMB: 2, // Max 2MB per image
    maxWidthOrHeight: 1920, // Max 1920px
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  try {
    const compressedFile = await imageCompression(file as File, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression error:', error);
    return file; // Return original if compression fails
  }
}
```

```typescript
// app/actions/upload-image.ts
'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File;

  if (!file) {
    throw new Error('No file provided');
  }

  // Generate unique key
  const key = `scoresnap/${Date.now()}-${file.name}`;

  // Convert to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload to R2
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await r2Client.send(command);

  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return {
    success: true,
    url: publicUrl,
    key,
  };
}
```

**Deliverables:**
- ✅ Client-side image compression (max 2MB, 1920px)
- ✅ Server action for R2 upload
- ✅ Unique key generation
- ✅ Public URL returned

**Files created:**
- `app/actions/upload-image.ts`
- `lib/image-compression.ts`

---

#### Task 2.3: Sport Selection Page
**File:** `app/scoresnap/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Basketball, Football } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const SPORTS = [
  {
    id: 'basketball',
    name: 'Basketball',
    icon: Basketball,
    color: 'bg-[#E67E22]', // Basketball orange from design system
  },
  {
    id: 'football',
    name: 'Football',
    icon: Football,
    color: 'bg-[#27AE60]', // Football green from design system
  },
];

export default function ScoreSnapHome() {
  const router = useRouter();
  const [lastUsedSport, setLastUsedSport] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('lastUsedSport') : null
  );

  const handleSelectSport = (sportId: string) => {
    localStorage.setItem('lastUsedSport', sportId);
    router.push(`/scoresnap/capture?sport=${sportId}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold mb-2">Submit Score</h1>
        <p className="text-lg text-gray-600">
          Photograph your scorebook and we'll do the rest
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SPORTS.map((sport) => (
          <Card
            key={sport.id}
            onClick={() => handleSelectSport(sport.id)}
            className={`cursor-pointer hover:shadow-card-hover transition-shadow ${
              lastUsedSport === sport.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardHeader className="text-center">
              <div className={`${sport.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <sport.icon className="w-8 h-8 text-white" />
              </div>
              <CardTitle>{sport.name}</CardTitle>
              {lastUsedSport === sport.id && (
                <CardDescription className="text-primary font-semibold">
                  Last used
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**Deliverables:**
- ✅ Sport selection grid (basketball, football)
- ✅ Last-used sport remembered (localStorage)
- ✅ Sport-specific color coding
- ✅ Navigation to capture page with sport parameter

**Files created:**
- `app/scoresnap/page.tsx`

---

### Week 3: AI Extraction & Confirmation View

#### Task 3.1: Claude Vision API Integration
**File:** `lib/ai-extraction.ts`

```bash
# Install Anthropic SDK
bun add @anthropic-ai/sdk
```

```typescript
// lib/ai-extraction.ts
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Basketball schema
const BasketballPlayerStatSchema = z.object({
  jerseyNumber: z.number(),
  name: z.string(),
  points: z.number(),
  fieldGoals: z.object({
    made: z.number(),
    attempted: z.number(),
  }),
  threePointers: z.object({
    made: z.number(),
    attempted: z.number(),
  }),
  freeThrows: z.object({
    made: z.number(),
    attempted: z.number(),
  }),
  rebounds: z.object({
    offensive: z.number(),
    defensive: z.number(),
  }),
  assists: z.number(),
  steals: z.number(),
  blocks: z.number(),
  turnovers: z.number(),
  fouls: z.number(),
  confidence: z.record(z.enum(['high', 'medium', 'low'])),
});

const BasketballExtractionSchema = z.object({
  sport: z.literal('basketball'),
  date: z.string(), // YYYY-MM-DD
  homeTeam: z.object({
    name: z.string(),
    players: z.array(BasketballPlayerStatSchema),
    teamFouls: z.array(z.number()), // per quarter
    timeoutsUsed: z.number(),
  }),
  awayTeam: z.object({
    name: z.string(),
    players: z.array(BasketballPlayerStatSchema),
    teamFouls: z.array(z.number()),
    timeoutsUsed: z.number(),
  }),
  quarterScores: z.array(z.array(z.number())), // [home, away] x quarters
  finalScore: z.object({
    home: z.number(),
    away: z.number(),
  }),
  overtime: z.boolean(),
});

type BasketballExtraction = z.infer<typeof BasketballExtractionSchema>;

const BASKETBALL_PROMPT = `You are an expert at extracting structured data from handwritten basketball scorebooks.

Extract all visible data from this scorebook page and return it in the exact JSON format specified in the schema.

For each field, provide a confidence indicator:
- "high": Clearly legible, no ambiguity (>90% confident)
- "medium": Mostly clear, minor uncertainty (70-90% confident)
- "low": Partially legible or unclear (<70% confident)

Key guidelines:
1. Extract player jersey numbers and names exactly as written
2. Calculate total points by: (FG - 3PT) × 2 + 3PT × 3 + FT × 1
3. Cross-check: individual player points must sum to team total score
4. If handwriting is unclear, mark with "low" confidence
5. For missing or illegible fields, use null with "low" confidence

Return ONLY valid JSON matching the schema. Do not include any explanatory text.`;

export async function extractBasketballData(imageBase64: string): Promise<BasketballExtraction> {
  const message = await anthropic.messages.create({
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
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: BASKETBALL_PROMPT,
          },
        ],
      },
    ],
  });

  // Parse response
  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Extract JSON from response (may be wrapped in markdown code block)
  let jsonText = textContent.text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
  }

  const parsedData = JSON.parse(jsonText);

  // Validate with Zod
  const validated = BasketballExtractionSchema.parse(parsedData);

  return validated;
}

// Validation rules
export function validateBasketballData(data: BasketballExtraction): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check: individual points sum to team total
  const homePlayerPoints = data.homeTeam.players.reduce((sum, p) => sum + p.points, 0);
  const awayPlayerPoints = data.awayTeam.players.reduce((sum, p) => sum + p.points, 0);

  if (homePlayerPoints !== data.finalScore.home) {
    errors.push(`Home team: Individual points (${homePlayerPoints}) don't match total (${data.finalScore.home})`);
  }

  if (awayPlayerPoints !== data.finalScore.away) {
    errors.push(`Away team: Individual points (${awayPlayerPoints}) don't match total (${data.finalScore.away})`);
  }

  // Check: max 5 fouls per player
  data.homeTeam.players.forEach((p) => {
    if (p.fouls > 5) {
      errors.push(`${p.name} (#${p.jerseyNumber}): More than 5 fouls (${p.fouls})`);
    }
  });

  data.awayTeam.players.forEach((p) => {
    if (p.fouls > 5) {
      errors.push(`${p.name} (#${p.jerseyNumber}): More than 5 fouls (${p.fouls})`);
    }
  });

  // Check: FG + 3PT attempts are reasonable (max 50 per player)
  data.homeTeam.players.forEach((p) => {
    const totalAttempts = p.fieldGoals.attempted + p.threePointers.attempted;
    if (totalAttempts > 50) {
      errors.push(`${p.name}: Unreasonable FG attempts (${totalAttempts})`);
    }
  });

  data.awayTeam.players.forEach((p) => {
    const totalAttempts = p.fieldGoals.attempted + p.threePointers.attempted;
    if (totalAttempts > 50) {
      errors.push(`${p.name}: Unreasonable FG attempts (${totalAttempts})`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

**Deliverables:**
- ✅ Claude Vision API client configured
- ✅ Basketball extraction prompt engineered
- ✅ Zod schema for type-safe validation
- ✅ Cross-validation rules implemented
- ✅ Confidence scoring per field

**Files created:**
- `lib/ai-extraction.ts`
- `lib/prompts/basketball.ts`

---

#### Task 3.2: Extraction Server Action
**File:** `app/actions/extract-scorebook.ts`

```typescript
'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { extractBasketballData, validateBasketballData } from '@/lib/ai-extraction';

export async function extractScorebook(submissionId: string) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Get submission with images
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { images: true },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  // For Phase 1: single-image only
  const image = submission.images[0];
  if (!image) {
    throw new Error('No image found');
  }

  // Fetch image from R2
  const response = await fetch(image.originalUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const startTime = Date.now();

  // Extract data with Claude
  const extractedData = await extractBasketballData(base64);

  const processingTime = Date.now() - startTime;

  // Validate data
  const validation = validateBasketballData(extractedData);

  // Save extraction result
  const extractionResult = await prisma.extractionResult.create({
    data: {
      submissionId: submission.id,
      rawOutput: extractedData as any,
      modelVersion: 'claude-sonnet-4-5-20250929',
      extractedData: extractedData as any,
      confidenceScores: {} as any, // Extract from players' confidence fields
      processingTimeMs: processingTime,
    },
  });

  // Update submission status
  await prisma.submission.update({
    where: { id: submission.id },
    data: { status: 'COMPLETED' },
  });

  return {
    extractionId: extractionResult.id,
    data: extractedData,
    validation,
  };
}
```

**Deliverables:**
- ✅ Server action to trigger extraction
- ✅ Image fetching from R2
- ✅ Base64 encoding for Claude API
- ✅ Extraction result saved to database
- ✅ Processing time tracked

**Files created:**
- `app/actions/extract-scorebook.ts`

---

#### Task 3.3: Confirmation View Component
**File:** `app/scoresnap/confirm/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, AlertTriangle, AlertCircle } from 'lucide-react';

interface BasketballData {
  // ... (same as extraction schema)
}

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const extractionId = searchParams.get('extractionId');

  const [data, setData] = useState<BasketballData | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Load extraction data
  useEffect(() => {
    async function loadData() {
      const response = await fetch(`/api/extraction/${extractionId}`);
      const result = await response.json();
      setData(result.data);
    }
    loadData();
  }, [extractionId]);

  const handleFieldEdit = (fieldPath: string, newValue: any) => {
    // Update data state
    // Recalculate totals if necessary
  };

  const handleSubmit = async () => {
    // Submit final data to database
    const response = await fetch('/api/scoresnap/submit', {
      method: 'POST',
      body: JSON.stringify({ extractionId, data }),
    });

    if (response.ok) {
      router.push('/scoresnap/success');
    }
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    if (confidence === 'high') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          <Check className="w-3 h-3 mr-1" />
          High confidence
        </span>
      );
    } else if (confidence === 'medium') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Review suggested
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Please verify
        </span>
      );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold mb-2">Review & Confirm</h1>
        <p className="text-gray-600">
          Verify the extracted data and make any corrections
        </p>
      </div>

      {/* Game Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Game Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Home Team</label>
              <Input value={data.homeTeam.name} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium">Away Team</label>
              <Input value={data.awayTeam.name} readOnly />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Home Score</label>
              <div className="flex items-center gap-2">
                <Input
                  value={data.finalScore.home}
                  onChange={(e) => handleFieldEdit('finalScore.home', parseInt(e.target.value))}
                  type="number"
                  className="border-green-500"
                />
                {getConfidenceBadge('high')}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Away Score</label>
              <div className="flex items-center gap-2">
                <Input
                  value={data.finalScore.away}
                  onChange={(e) => handleFieldEdit('finalScore.away', parseInt(e.target.value))}
                  type="number"
                  className="border-green-500"
                />
                {getConfidenceBadge('high')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Stats Tables */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{data.homeTeam.name} Player Stats</CardTitle>
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
                  <th className="p-2 text-right">STL</th>
                  <th className="p-2 text-right">BLK</th>
                  <th className="p-2 text-right">TO</th>
                  <th className="p-2 text-right">PF</th>
                </tr>
              </thead>
              <tbody>
                {data.homeTeam.players.map((player, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{player.jerseyNumber}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {player.name}
                        {getConfidenceBadge(player.confidence.name)}
                      </div>
                    </td>
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
                    <td className="p-2 text-right">{player.steals}</td>
                    <td className="p-2 text-right">{player.blocks}</td>
                    <td className="p-2 text-right">{player.turnovers}</td>
                    <td className="p-2 text-right">{player.fouls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button onClick={handleSubmit} size="lg" className="bg-primary">
          Approve & Submit
        </Button>
      </div>
    </div>
  );
}
```

**Deliverables:**
- ✅ Confirmation view layout (sport-specific)
- ✅ Game info section (teams, scores, date)
- ✅ Player stats table with all fields
- ✅ Confidence badges (green/yellow/red)
- ✅ Inline editing (tap-to-edit fields)
- ✅ Real-time validation feedback
- ✅ "Approve & Submit" button

**Files created:**
- `app/scoresnap/confirm/page.tsx`
- `components/scoresnap/player-stats-table.tsx`
- `components/scoresnap/confidence-badge.tsx`

---

#### Task 3.4: Final Submission & Database Persistence
**File:** `app/actions/submit-game.ts`

```typescript
'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitGame(extractionId: string, editedData: any) {
  const session = await auth();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Get extraction result
  const extraction = await prisma.extractionResult.findUnique({
    where: { id: extractionId },
    include: {
      submission: {
        include: { coach: true },
      },
    },
  });

  if (!extraction) {
    throw new Error('Extraction not found');
  }

  // Find or create teams
  const homeTeam = await prisma.team.upsert({
    where: {
      schoolName_sport_level_season: {
        schoolName: editedData.homeTeam.name,
        sport: 'BASKETBALL',
        level: 'Varsity',
        season: '2025-26',
      },
    },
    create: {
      name: editedData.homeTeam.name,
      schoolName: editedData.homeTeam.name,
      sport: 'BASKETBALL',
      level: 'Varsity',
      season: '2025-26',
    },
    update: {},
  });

  const awayTeam = await prisma.team.upsert({
    where: {
      schoolName_sport_level_season: {
        schoolName: editedData.awayTeam.name,
        sport: 'BASKETBALL',
        level: 'Varsity',
        season: '2025-26',
      },
    },
    create: {
      name: editedData.awayTeam.name,
      schoolName: editedData.awayTeam.name,
      sport: 'BASKETBALL',
      level: 'Varsity',
      season: '2025-26',
    },
    update: {},
  });

  // Check for duplicate game
  const existingGame = await prisma.game.findUnique({
    where: {
      homeTeamId_awayTeamId_date: {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        date: new Date(editedData.date),
      },
    },
  });

  if (existingGame) {
    throw new Error('DUPLICATE_GAME');
  }

  // Create game
  const game = await prisma.game.create({
    data: {
      submissionId: extraction.submissionId,
      sport: 'BASKETBALL',
      date: new Date(editedData.date),
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeScore: editedData.finalScore.home,
      awayScore: editedData.finalScore.away,
      quarterScores: editedData.quarterScores,
      overtime: editedData.overtime,
      approvedBy: extraction.submission.coachId,
      editableUntil: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    },
  });

  // Create player stats
  for (const player of editedData.homeTeam.players) {
    const playerRecord = await prisma.player.upsert({
      where: {
        teamId_jerseyNumber: {
          teamId: homeTeam.id,
          jerseyNumber: player.jerseyNumber,
        },
      },
      create: {
        teamId: homeTeam.id,
        name: player.name,
        jerseyNumber: player.jerseyNumber,
      },
      update: {
        name: player.name, // Update name if different
      },
    });

    await prisma.playerStat.create({
      data: {
        gameId: game.id,
        playerId: playerRecord.id,
        stats: player, // Store as JSON
      },
    });
  }

  // Repeat for away team players
  // ...

  // Revalidate relevant pages
  revalidatePath('/scoreboard');
  revalidatePath(`/team/${homeTeam.id}`);
  revalidatePath(`/team/${awayTeam.id}`);

  return {
    success: true,
    gameId: game.id,
  };
}
```

**Deliverables:**
- ✅ Submit server action
- ✅ Team upsert logic
- ✅ Duplicate game detection
- ✅ Game record creation
- ✅ Player stats persistence
- ✅ Audit trail (submission → extraction → game linkage)
- ✅ Path revalidation for ISR

**Files created:**
- `app/actions/submit-game.ts`

---

### Week 3 Deliverables Summary

**End-to-End Flow Working:**
1. Coach signs in with Google OAuth
2. Coach completes onboarding (pending admin verification)
3. Admin verifies coach account
4. Coach selects sport (basketball/football)
5. Coach captures 1 scorebook photo
6. Photo uploads to Cloudflare R2
7. Claude Vision extracts structured data
8. Validation rules execute
9. Confirmation view displays with confidence badges
10. Coach reviews and edits any low-confidence fields
11. Coach approves and submits
12. Data persists to PostgreSQL
13. Scoreboard displays new game

**Testing Checklist:**
- [ ] Authentication flow works end-to-end
- [ ] Camera capture works on iOS Safari and Android Chrome
- [ ] Image compression reduces file size to <2MB
- [ ] Claude API returns valid JSON matching schema
- [ ] Validation catches common errors (point totals, fouls)
- [ ] Confirmation view displays all fields correctly
- [ ] Inline editing updates state
- [ ] Submission creates all database records
- [ ] Scoreboard shows new game immediately

---

## 6. Phase 2: Enhancement & Scale (Weeks 4-6)

### Week 4: Multi-Image Support & Additional Sports

#### Task 4.1: Multi-Image Stitching Logic
**File:** `lib/ai-extraction.ts` (updated)

```typescript
// Updated prompt for multi-image
const BASKETBALL_MULTI_IMAGE_PROMPT = `You are extracting data from a basketball scorebook that may span multiple pages.

IMPORTANT: These images are from the SAME GAME. Do not duplicate data.

Image identification:
- Identify which page/section each image represents
- Look for page numbers, team sections, or column headers
- Avoid duplicating player data that appears on multiple pages

Data extraction:
- Extract all unique player entries across all images
- If the same player appears on multiple pages, combine their stats (do NOT duplicate)
- If team totals appear on multiple pages, use the value from the most complete page
- Cross-check: all individual player points must sum to team total

Return a SINGLE unified JSON object with all data from all pages.`;

export async function extractBasketballDataMultiImage(
  imageBase64Array: string[]
): Promise<BasketballExtraction> {
  const imageContent = imageBase64Array.map((base64) => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: 'image/jpeg' as const,
      data: base64,
    },
  }));

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192, // Larger for multi-image
    messages: [
      {
        role: 'user',
        content: [
          ...imageContent,
          {
            type: 'text',
            text: BASKETBALL_MULTI_IMAGE_PROMPT,
          },
        ],
      },
    ],
  });

  // Parse and validate (same as single-image)
  // ...
}
```

**Deliverables:**
- ✅ Multi-image extraction prompt
- ✅ Deduplication logic for overlapping data
- ✅ Page identification strategy
- ✅ Unified JSON output from multiple images

**Files updated:**
- `lib/ai-extraction.ts`
- `app/actions/extract-scorebook.ts`

---

#### Task 4.2: Add 3 Additional Sports
**Files:** `lib/prompts/football.ts`, `lib/prompts/soccer.ts`, `lib/prompts/baseball.ts`

**Football Schema:**
```typescript
const FootballPlayerStatSchema = z.object({
  jerseyNumber: z.number(),
  name: z.string(),
  position: z.string(),
  passing: z.object({
    completions: z.number(),
    attempts: z.number(),
    yards: z.number(),
    touchdowns: z.number(),
    interceptions: z.number(),
  }).optional(),
  rushing: z.object({
    carries: z.number(),
    yards: z.number(),
    touchdowns: z.number(),
  }).optional(),
  receiving: z.object({
    receptions: z.number(),
    yards: z.number(),
    touchdowns: z.number(),
  }).optional(),
  defense: z.object({
    tackles: z.number(),
    sacks: z.number(),
    interceptions: z.number(),
    forcedFumbles: z.number(),
  }).optional(),
  confidence: z.record(z.enum(['high', 'medium', 'low'])),
});

// Similar schemas for soccer, baseball
```

**Deliverables:**
- ✅ Football extraction prompt & schema
- ✅ Soccer extraction prompt & schema
- ✅ Baseball extraction prompt & schema
- ✅ Sport-specific validation rules for each
- ✅ Sport selection updated to show all 5 sports

**Files created:**
- `lib/prompts/football.ts`
- `lib/prompts/soccer.ts`
- `lib/prompts/baseball.ts`
- `lib/validation/football.ts`
- `lib/validation/soccer.ts`
- `lib/validation/baseball.ts`

---

### Week 5: Coach Dashboard & Roster Management

#### Task 5.1: Coach Dashboard Page
**File:** `app/dashboard/page.tsx`

```typescript
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function DashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== 'COACH') {
    redirect('/');
  }

  // Get coach data
  const coach = await prisma.coach.findUnique({
    where: { userId: session.user.id },
    include: {
      teams: {
        include: {
          team: {
            include: {
              homeGames: {
                orderBy: { date: 'desc' },
                take: 10,
              },
            },
          },
        },
      },
      submissions: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!coach) {
    redirect('/coach/onboard');
  }

  // Calculate stats
  const totalSubmissions = coach.submissions.length;
  const submissionStreak = calculateStreak(coach.submissions);
  const seasonRecord = calculateSeasonRecord(coach.teams[0]?.team);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-display font-bold mb-6">Coach Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Season Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {seasonRecord.wins}-{seasonRecord.losses}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalSubmissions}</div>
            <p className="text-sm text-gray-600">games submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{submissionStreak} 🔥</div>
            <p className="text-sm text-gray-600">consecutive games</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {coach.teams[0]?.team.homeGames.map((game) => (
              <div key={game.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-semibold">{game.homeTeam.name} vs {game.awayTeam.name}</p>
                  <p className="text-sm text-gray-600">{game.date.toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {game.homeScore} - {game.awayScore}
                  </p>
                  <p className="text-sm">
                    {game.homeScore > game.awayScore ? 'W' : 'L'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Deliverables:**
- ✅ Dashboard with season stats
- ✅ Win-loss record display
- ✅ Total submissions count
- ✅ Submission streak tracking
- ✅ Recent games list
- ✅ Team stat leaders (top scorers, etc.)

**Files created:**
- `app/dashboard/page.tsx`
- `lib/stats-calculator.ts`

---

#### Task 5.2: Roster Upload & Management
**File:** `app/dashboard/roster/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RosterManagementPage() {
  const [players, setPlayers] = useState<any[]>([]);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n').slice(1); // Skip header

    const parsedPlayers = rows.map((row) => {
      const [name, jerseyNumber, position] = row.split(',');
      return {
        name: name.trim(),
        jerseyNumber: parseInt(jerseyNumber.trim()),
        position: position.trim(),
      };
    });

    setPlayers(parsedPlayers);
  };

  const handleSaveRoster = async () => {
    const response = await fetch('/api/roster/save', {
      method: 'POST',
      body: JSON.stringify({ players }),
    });

    if (response.ok) {
      alert('Roster saved!');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-display font-bold mb-6">Manage Roster</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Roster CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a CSV file with columns: Name, Jersey Number, Position
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
            />
          </div>
        </CardContent>
      </Card>

      {players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Roster Preview ({players.length} players)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Jersey #</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{player.jerseyNumber}</td>
                      <td className="p-2">{player.name}</td>
                      <td className="p-2">{player.position}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={handleSaveRoster} size="lg">
                Save Roster
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Deliverables:**
- ✅ CSV roster upload interface
- ✅ Roster preview table
- ✅ Save roster to database
- ✅ Autocomplete integration in confirmation view

**Files created:**
- `app/dashboard/roster/page.tsx`
- `app/api/roster/save/route.ts`

---

### Week 6: Social Graphics & Notifications

#### Task 6.1: Auto-Generated Social Media Graphics
**File:** `lib/social-graphics.ts`

```bash
# Install canvas library for server-side image generation
bun add canvas
```

```typescript
// lib/social-graphics.ts
import { createCanvas, loadImage } from 'canvas';

export async function generateGameGraphic(game: {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: Date;
}): Promise<Buffer> {
  const width = 1200;
  const height = 630; // Twitter/OG image size
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#94d873'); // FNFR primary green
  gradient.addColorStop(1, '#27AE60'); // Football green
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Load FNFR logo
  const logo = await loadImage('/public/logo.png');
  ctx.drawImage(logo, 50, 50, 120, 120);

  // Game result text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';

  const resultText = `${game.homeTeam} ${game.homeScore} - ${game.awayScore} ${game.awayTeam}`;
  ctx.fillText(resultText, width / 2, height / 2);

  // Date
  ctx.font = '32px sans-serif';
  ctx.fillText(game.date.toLocaleDateString(), width / 2, height / 2 + 60);

  // Footer
  ctx.font = '24px sans-serif';
  ctx.fillText('fridaynightfilmroom.com', width / 2, height - 50);

  return canvas.toBuffer('image/png');
}
```

**Deliverables:**
- ✅ Server-side graphic generation with canvas
- ✅ FNFR branding (logo, colors)
- ✅ Game result display (teams, scores, date)
- ✅ Export as PNG buffer
- ✅ Upload to R2 for sharing

**Files created:**
- `lib/social-graphics.ts`
- `app/api/graphics/generate/route.ts`

---

#### Task 6.2: Push Notifications
**File:** `lib/notifications.ts`

```bash
# Install web push library
bun add web-push
```

```typescript
// lib/notifications.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@fridaynightfilmroom.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendGameNotification(game: {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}) {
  // Get all subscribers for this team
  const subscribers = await prisma.pushSubscription.findMany({
    where: {
      OR: [
        { teamId: game.homeTeamId },
        { teamId: game.awayTeamId },
      ],
    },
  });

  const payload = JSON.stringify({
    title: 'Final Score',
    body: `${game.homeTeam} ${game.homeScore} - ${game.awayScore} ${game.awayTeam}`,
    icon: '/logo.png',
    url: `/games/${game.id}`,
  });

  await Promise.all(
    subscribers.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      )
    )
  );
}
```

**Deliverables:**
- ✅ Push notification service configured
- ✅ Subscriber management (team follows)
- ✅ Notification triggered on game submission
- ✅ Deep linking to game page

**Files created:**
- `lib/notifications.ts`
- `app/api/subscribe/route.ts`
- `public/service-worker.js`

---

## 7. Phase 3: Polish & Integration (Weeks 7-8)

### Week 7: Offline PWA Support

#### Task 7.1: Service Worker with Serwist
**File:** `app/sw.ts`

```bash
# Install Serwist
bun add @serwist/next @serwist/sw -D
```

```typescript
// app/sw.ts
import { Serwist } from 'serwist';
import type { PrecacheEntry } from 'serwist';

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\/api\//i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 5 * 60,
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

serwist.addEventListeners();
```

**Deliverables:**
- ✅ Service worker configured with Serwist
- ✅ Offline camera capture (photos stored in IndexedDB)
- ✅ Background sync for pending submissions
- ✅ Cache strategies for API routes, images, fonts

**Files created:**
- `app/sw.ts`
- `next.config.mjs` (Serwist plugin configured)
- `app/manifest.ts` (web app manifest)

---

#### Task 7.2: Offline Draft Management
**File:** `lib/offline-storage.ts`

```typescript
// lib/offline-storage.ts
import { openDB } from 'idb';

const DB_NAME = 'scoresnap-offline';
const STORE_NAME = 'drafts';

export async function saveDraft(draft: {
  sport: string;
  images: Blob[];
  timestamp: number;
}) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
    },
  });

  await db.put(STORE_NAME, draft);
}

export async function getPendingDrafts() {
  const db = await openDB(DB_NAME, 1);
  return await db.getAll(STORE_NAME);
}

export async function deleteDraft(timestamp: number) {
  const db = await openDB(DB_NAME, 1);
  await db.delete(STORE_NAME, timestamp);
}
```

**Deliverables:**
- ✅ IndexedDB storage for offline drafts
- ✅ Pending uploads UI
- ✅ Auto-sync when connection restored
- ✅ Draft deletion after successful upload

**Files created:**
- `lib/offline-storage.ts`
- `components/scoresnap/pending-uploads.tsx`

---

### Week 8: GameChanger/HUDL Recognition & Performance

#### Task 8.1: Screenshot Recognition
**File:** `lib/prompts/gamechanger.ts`

```typescript
const GAMECHANGER_PROMPT = `You are extracting data from a GameChanger app screenshot.

GameChanger is a digital scorekeeper app. Identify the following elements in the screenshot:
- Team names (usually at top of screen)
- Final score (large numbers)
- Individual player stats (in tabular format)
- Quarter/inning scores (if visible)

Extract all visible data into the same structured JSON format as physical scorebooks.`;

export async function extractFromGameChangerScreenshot(imageBase64: string) {
  // Similar to physical scorebook extraction, but with GameChanger-specific prompt
}
```

**Deliverables:**
- ✅ GameChanger screenshot recognition
- ✅ HUDL screenshot recognition
- ✅ Auto-detect screenshot vs. physical scorebook
- ✅ Same structured output as physical scorebooks

**Files created:**
- `lib/prompts/gamechanger.ts`
- `lib/prompts/hudl.ts`
- `lib/image-classifier.ts` (detect screenshot vs. photo)

---

#### Task 8.2: Performance Monitoring
**File:** `instrumentation.ts`

```bash
# Install Sentry
bun add @sentry/nextjs
```

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Prisma({ prisma: prisma }),
  ],
});
```

**Deliverables:**
- ✅ Sentry error tracking configured
- ✅ Vercel Analytics for performance monitoring
- ✅ Custom metrics for AI extraction time
- ✅ Database query performance tracking

**Files created:**
- `instrumentation.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

---

## 8. Critical Decisions Required

### Decision 1: Coach Verification Process (BLOCKER)

**Question:** How do coaches prove they represent a school/team?

**Options:**

A. **Manual Admin Approval** (Recommended for Phase 1)
   - Pros: High security, low technical complexity, works for small beta
   - Cons: Not scalable, requires admin time
   - Implementation: Coach fills form → admin verifies → coach gets access

B. **School Email Domain Verification**
   - Pros: Automated, scalable
   - Cons: Not all NC schools use consistent email domains (@schoolname.k12.nc.us)
   - Implementation: Coach enters school email → receives verification code → activates

C. **Access Code System**
   - Pros: Scalable with partnerships (Greensboro Sports provides codes to coaches)
   - Cons: Code distribution logistics
   - Implementation: FNFR provides unique codes to partner organizations → coaches redeem codes

**Recommendation:** **Option A for Phase 1** (manual approval for 10-20 beta coaches), transition to **Option B + C hybrid** in Phase 2 (email domain where available, access codes for others).

**Action Item:** Implement manual admin approval panel by end of Week 1.

---

### Decision 2: Image Storage Strategy

**Question:** Cloudflare R2 or AWS S3?

**Recommendation:** **Cloudflare R2**
- Zero egress fees (critical for images shared on social media)
- S3-compatible API (can migrate to S3 if needed)
- Already on Cloudflare for domain/CDN
- Simpler billing

**Action Item:** Create R2 bucket by end of Week 1.

---

### Decision 3: Confidence Score Thresholds

**Question:** What confidence scores trigger "high" (green), "medium" (yellow), "low" (red)?

**Recommendation:**
- High: ≥90% (auto-accept, green border)
- Medium: 70-89% (review suggested, yellow border)
- Low: <70% (verify required, red border)

**Rationale:** Based on OCR industry standards and user testing assumptions. Will A/B test in beta and adjust.

**Action Item:** Implement static thresholds in Phase 1, add per-sport dynamic thresholds in Phase 2 based on coach edit feedback.

---

### Decision 4: Validation Rule Specifics

**Question:** What are explicit numerical thresholds for "reasonable range" validation?

**Recommendation (Basketball):**
- Max 50 FG attempts per player
- Max 40 rebounds per player
- Max 60 points per player (rare but possible)
- Max 5 fouls per player (hard rule)

**Recommendation (Football):**
- Max 80 pass attempts per player
- Max 50 carries per player
- Max 500 yards per player (any category)

**Action Item:** Document all validation rules in `lib/validation/rules.ts` with justifications. Review with beta coaches for feedback.

---

### Decision 5: Duplicate Game Handling

**Question:** When duplicate detected, how to resolve?

**Recommendation:**
- **Prompt coach** with 3 options:
  1. "This is a correction" → Replace existing game
  2. "This is a different game" → Require context (JV/Varsity, Game 1/2 of doubleheader)
  3. "Cancel"

**Action Item:** Implement duplicate detection modal in Week 3, Task 3.4.

---

## 9. Success Metrics

### Phase 1 MVP (Weeks 1-3)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Coach Beta Signups** | 10 coaches | Manual outreach via Greensboro Sports |
| **Submission Completion Rate** | >80% | Coaches who start submission flow complete it |
| **AI Extraction Accuracy** | >85% | Fields unchanged by coach in confirmation view |
| **Time to Submit** | <90 seconds | Camera open to approved submission (MVP allows 90s) |
| **Error Rate** | <5% | Failed extractions or database errors |

### Phase 2 Enhancement (Weeks 4-6)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Active Coach Submitters** | 25 coaches | Unique coaches with ≥1 submission/month |
| **Multi-Sport Coverage** | 3+ sports | At least 1 submission each for basketball, football, soccer |
| **Time to Submit** | <60 seconds | Improved from Phase 1 with optimizations |
| **Dashboard Adoption** | >70% | Coaches who return to view dashboard after submission |

### Phase 3 Scale (Weeks 7-8)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Monthly Submission Volume** | 100 games/month | Total approved submissions |
| **NC Game Coverage** | 10% of NCHSAA games | FNFR submissions / total NC high school games |
| **Coach Retention** | >60% return | Coaches active in consecutive months |
| **Social Sharing Rate** | >40% | Coaches who share auto-generated graphic |

---

## 10. Risk Analysis & Mitigation

### Risk 1: AI Extraction Accuracy Below Target

**Severity:** High (blocks adoption if coaches don't trust AI)

**Likelihood:** Medium (handwriting variability, scorebook format diversity)

**Mitigation:**
- **Pre-launch:** Test with 50+ real NC scorebook samples from beta coaches
- **Launch:** Conservative confidence thresholds (flag anything <90% for review)
- **Post-launch:** Implement prompt improvement feedback loop (analyze coach edits monthly)
- **Fallback:** Manual entry always available, no blocking on AI quality

---

### Risk 2: Friday Night API Load Spikes

**Severity:** Medium (affects UX but not data loss)

**Likelihood:** High (predictable peak: 9-10pm Friday nights)

**Mitigation:**
- **Queue system:** Graceful degradation with estimated wait times
- **Batch API:** Use Anthropic's batch API for non-urgent submissions (50% cost savings)
- **Manual entry fallback:** Always available if queue wait >5 minutes
- **Pre-warm:** Increase API rate limits with Anthropic before launch

---

### Risk 3: Coach Adoption Resistance

**Severity:** High (no adoption = no data = failed product)

**Likelihood:** Medium (behavioral change is hard)

**Mitigation:**
- **Partnership:** Leverage Greensboro Sports for warm introductions to coaches
- **Value prop clarity:** Demo "submit in 60 seconds" vs. "10 minutes manual entry"
- **Incentives:** Submission streaks, Verified Coach badge, free recruiting exposure
- **Continuous improvement:** Weekly feedback sessions with beta coaches in Phase 1

---

### Risk 4: Student Privacy / FERPA Compliance

**Severity:** Critical (legal liability)

**Likelihood:** Low (stats are generally public)

**Mitigation:**
- **Legal review:** Consult attorney on FERPA applicability BEFORE Phase 1 launch
- **Privacy policy:** Clear terms of service explaining data usage
- **Parent opt-out:** Provide mechanism for parents to request data removal
- **Assumption:** Game stats are public information (already on MaxPreps, in programs)

---

### Risk 5: Cost Overruns at Scale

**Severity:** Low (predictable costs)

**Likelihood:** Low (cost per submission is $0.02-$0.03)

**Mitigation:**
- **Monitoring:** Track API costs daily via Anthropic dashboard
- **Optimization:** Use prompt caching (90% savings on repeated content)
- **Batch processing:** Non-urgent submissions use batch API (50% savings)
- **Budget alert:** Set billing alerts at $100/month threshold

---

## 11. References & Research

### Repository Research
- **Location:** `/Users/matt/Developer/personal/fnfroom/`
- **Current Stack:** Next.js 16.1.6, React 19.2.4, Sanity CMS, Mux video, Tailwind CSS
- **Design System:** `/Users/matt/Developer/personal/fnfroom/.design-system/system.md`
- **Patterns:** `/Users/matt/Developer/personal/fnfroom/app/recruiting/page.tsx` (form patterns)

### Best Practices Research
- **Claude Vision API:** [Anthropic Documentation](https://platform.claude.com/docs/en/build-with-claude/vision)
- **Image Preprocessing:** [OCR Preprocessing Techniques](https://medium.com/@TechforHumans/image-pre-processing-techniques-for-ocr-d231586c1230)
- **Structured Output:** [Zod with LLMs](https://github.com/dzhng/zod-gpt)
- **Form Validation UX:** [Inline Validation Best Practices](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)

### Framework Documentation
- **Next.js Server Actions:** [Next.js Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- **PWA with Serwist:** [Serwist Documentation](https://serwist.pages.dev/)
- **Prisma ORM:** [Prisma Docs](https://www.prisma.io/docs)
- **Cloudflare R2:** [R2 with Next.js Guide](https://www.buildwithmatija.com/blog/how-to-upload-files-to-cloudflare-r2-nextjs)
- **NextAuth.js:** [NextAuth RBAC Guide](https://authjs.dev/guides/role-based-access-control)

### Spec Flow Analysis
- **User Flows:** 10 primary flows mapped (photo submission, manual entry, multi-image, error handling, etc.)
- **Edge Cases:** 50+ gaps identified and categorized
- **Critical Questions:** 10 blocking questions requiring decision before implementation

---

## Next Steps

1. **Review This Plan** - Read through all phases, ask clarifying questions
2. **Make Critical Decisions** - Answer Decision 1 (coach verification) and Decision 3 (confidence thresholds)
3. **Begin Phase 1, Week 1** - Set up database, authentication, and infrastructure
4. **Recruit Beta Coaches** - Partner with Greensboro Sports to identify 10-20 coaches for testing
5. **Iterate Based on Feedback** - Weekly check-ins with beta coaches during Phase 1

---

**Plan Status:** ✅ Ready for Implementation

**Questions or concerns?** Add comments to this document or schedule a review session.
