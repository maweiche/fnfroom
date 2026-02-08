# FRIDAY NIGHT FILM ROOM
## Product Requirements Document — ScoreSnap: AI-Powered Score Submission

| Field | Detail |
|-------|--------|
| **Document** | PRD-FNFR-001 |
| **Version** | 1.0 |
| **Date** | February 8, 2026 |
| **Author** | HRD Studio / Friday Night Film Room |
| **Status** | Draft |
| **Classification** | Internal |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Flow](#2-user-flow)
3. [Feature Requirements](#3-feature-requirements)
4. [Technical Architecture](#4-technical-architecture)
5. [Sport-Specific Configurations](#5-sport-specific-configurations)
6. [Edge Cases & Error Handling](#6-edge-cases--error-handling)
7. [Coach Dashboard & Retention](#7-coach-dashboard--retention)
8. [Success Metrics](#8-success-metrics)
9. [Rollout Plan](#9-rollout-plan)
10. [Cost Estimates](#10-cost-estimates)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Appendix](#12-appendix)

---

## 1. Executive Summary

### 1.1 Problem Statement

High school coaches in North Carolina are the primary source of game scores and player statistics, yet current submission methods are fragmented and time-consuming. Coaches must manually enter data across multiple platforms including MaxPreps, HighSchoolOT, and NCHSAA portals, often duplicating effort after already recording stats in physical scorebooks during games. This friction results in delayed reporting, incomplete data, and low submission rates, particularly for smaller programs without dedicated stat keepers.

### 1.2 Proposed Solution

ScoreSnap is an AI-powered score and stat submission feature within the Friday Night Film Room platform. Coaches photograph their physical scorebook or stat sheet after a game, and a vision AI model extracts all relevant data into a structured, editable format. The coach reviews the parsed data in a clean confirmation interface, makes any corrections, and submits with a single tap. The entire process takes under 60 seconds, compared to 10–15 minutes of manual data entry.

### 1.3 Strategic Value

ScoreSnap positions Friday Night Film Room as the primary data ingestion point for NC high school athletics. By making FNFR the easiest place to submit scores, we build a proprietary first-party dataset that becomes the foundation of every other product feature: standings, rankings, player profiles, recruiting exposure, and editorial content. Coaches who submit through ScoreSnap become embedded in the FNFR ecosystem, driving retention and establishing FNFR as the authoritative source for NC high school sports data.

> **🔴 COMPETITIVE MOAT:** No existing NC high school sports platform offers AI-powered score extraction from photos. MaxPreps, HighSchoolOT, and NCHSAA all require manual form entry. ScoreSnap is a genuine first-mover advantage.

---

## 2. User Flow

### 2.1 Primary Flow: Photo Submission

1. Coach opens FNFR app or PWA after a game and taps the prominent "Submit Score" button on the home screen or bottom navigation.
2. Coach selects their sport from a quick-select grid (basketball, football, soccer, baseball, volleyball, wrestling, etc.). The system remembers their last-used sport.
3. Camera interface opens with an overlay guide showing optimal framing for a scorebook page. Coach can also select from camera roll.
4. Coach captures one or more photos of the scorebook pages. For basketball, this might be 2–3 pages covering both teams. The UI shows a filmstrip of captured pages with an "Add Page" option.
5. Coach taps "Process" and the images are sent to the AI extraction endpoint. A loading state shows progress with contextual messaging.
6. The AI-extracted data renders in the Confirmation View — a structured, sport-specific layout showing all parsed data organized by category (game info, team scores, individual stats). Fields with lower confidence are highlighted for review.
7. Coach reviews and taps any field to edit inline. Numeric fields use a number pad; name fields use autocomplete against the team roster if available.
8. Coach taps "Approve & Submit." Data is persisted to the FNFR database and optionally cross-posted to partner platforms.

### 2.2 Fallback Flow: Manual Entry

If a coach does not have a physical scorebook, or the AI extraction fails, a manual entry form is always available as a secondary path. This form is pre-populated with known team rosters and schedules where possible, and uses sport-specific templates to minimize field count.

### 2.3 Post-Submission Flow

After submission, the coach sees a success confirmation with options to share the game summary to social media (auto-generated graphic), view the game on the FNFR scoreboard, or submit another game. Submitted data immediately appears on the FNFR website and feeds any downstream features (standings calculations, player stat aggregation, etc.).

---

## 3. Feature Requirements

### 3.1 Image Capture Module

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| **IC-001** | Camera capture with real-time viewfinder overlay showing recommended scorebook framing area | P0 | Planned |
| **IC-002** | Camera roll / photo library selection as alternative to live capture | P0 | Planned |
| **IC-003** | Multi-page capture: support 1–6 images per submission with filmstrip preview | P0 | Planned |
| **IC-004** | Auto-crop and perspective correction for angled photos | P1 | Planned |
| **IC-005** | Image quality validation: reject blurry or too-dark images with re-capture prompt | P1 | Planned |
| **IC-006** | Flash toggle and exposure controls in camera interface | P2 | Planned |

### 3.2 AI Extraction Engine

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| **AE-001** | Vision AI extraction via Anthropic Claude API (claude-sonnet-4-5-20250929 or later) with structured JSON output | P0 | Planned |
| **AE-002** | Sport-specific system prompts for basketball, football, soccer, baseball, volleyball, and wrestling | P0 | Planned |
| **AE-003** | Handwritten text recognition from physical scorebooks with varying formats and penmanship | P0 | Planned |
| **AE-004** | Digital screenshot recognition from GameChanger, HUDL, and iScore exports | P1 | Planned |
| **AE-005** | Confidence scoring per field: high (auto-accept), medium (yellow highlight), low (red flag for review) | P0 | Planned |
| **AE-006** | Multi-image stitching: combine data across 2–6 images into a single unified extraction | P1 | Planned |
| **AE-007** | Validation rules engine: cross-check extracted totals (individual points must sum to team total, fouls cannot exceed 5 per player in basketball, etc.) | P0 | Planned |
| **AE-008** | Fallback to Google Cloud Vision OCR if Claude API is unavailable or rate-limited | P2 | Planned |

### 3.3 Confirmation & Editing View

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| **CE-001** | Sport-specific confirmation layout matching the mental model of each sport's stat sheet | P0 | Planned |
| **CE-002** | Inline tap-to-edit on any field with sport-appropriate input (number pad for stats, text for names) | P0 | Planned |
| **CE-003** | Confidence-based field highlighting: green border (high), yellow border (medium), red border (low) | P0 | Planned |
| **CE-004** | Roster autocomplete: if team roster is known, suggest player names as coach types corrections | P1 | Planned |
| **CE-005** | Running validation: real-time total recalculation as coach edits individual fields | P0 | Planned |
| **CE-006** | Side-by-side view: original photo alongside extracted data for easy comparison | P1 | Planned |
| **CE-007** | Undo/redo support for all edits made in the confirmation view | P2 | Planned |
| **CE-008** | Quick-fix suggestions: if totals don't match, highlight which player rows are likely misread | P2 | Planned |

### 3.4 Submission & Data Pipeline

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| **SD-001** | Persist approved data to FNFR PostgreSQL database with full audit trail (original images, raw AI output, coach edits, final approved data) | P0 | Planned |
| **SD-002** | Automatic standings and season stat recalculation triggered on new submission | P0 | Planned |
| **SD-003** | Optional cross-post toggle: "Also submit to MaxPreps" and "Also submit to HighSchoolOT" | P2 | Planned |
| **SD-004** | Auto-generated social media graphic with final score, key stats, and FNFR branding | P1 | Planned |
| **SD-005** | Push notification to FNFR followers of that team when a new score is submitted | P1 | Planned |
| **SD-006** | Webhook/API endpoint for downstream consumers of FNFR data | P2 | Planned |

---

## 4. Technical Architecture

### 4.1 System Overview

ScoreSnap operates as a feature module within the existing FNFR Next.js application. The architecture prioritizes mobile-first PWA delivery, fast AI processing, and reliable data persistence. All components are designed for the existing FNFR tech stack.

### 4.2 Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js 14+ (App Router) | PWA with service worker for offline camera capture |
| **UI Framework** | Tailwind CSS + shadcn/ui | Consistent with FNFR design system |
| **Camera** | Native MediaDevices API | With fallback to file input on unsupported browsers |
| **Image Processing** | Client-side canvas + sharp (server) | Crop, compress, perspective correction |
| **AI Extraction** | Anthropic Claude API (Vision) | claude-sonnet-4-5-20250929 with structured output |
| **API Layer** | Next.js API Routes / Server Actions | Edge-compatible where possible |
| **Database** | PostgreSQL (via Prisma ORM) | Submissions, rosters, game data, audit logs |
| **File Storage** | Cloudflare R2 or AWS S3 | Original scorebook images, processed variants |
| **Auth** | NextAuth.js | Coach accounts linked to school/team profiles |
| **Real-time** | Server-Sent Events or WebSocket | Live scoreboard updates on submission |

### 4.3 AI Extraction Pipeline

#### Request Flow

The extraction pipeline follows a three-stage process. First, the client compresses and uploads scorebook images to the server. Second, the server constructs a sport-specific prompt with the images and sends them to the Claude Vision API, requesting structured JSON output conforming to a predefined schema for that sport. Third, the server validates the returned JSON against the sport schema, runs cross-validation rules (totals checks, range checks, player count checks), assigns confidence scores to each field, and returns the enriched result to the client for the confirmation view.

#### Prompt Engineering Strategy

Each supported sport has a dedicated system prompt that instructs the model on the expected layout and data points of that sport's scorebook. The prompt includes a JSON schema definition for the expected output, explicit instructions for handling ambiguous handwriting, and examples of common scorebook formats. The prompt also instructs the model to return a confidence indicator per field when handwriting is unclear or values seem anomalous.

#### Example: Basketball Extraction Schema

```typescript
interface GameExtraction {
  sport: "basketball"
  date: string                    // YYYY-MM-DD
  homeTeam: TeamData
  awayTeam: TeamData
  quarterScores: number[][]       // home/away x quarters
  finalScore: { home: number; away: number }
  overtime: boolean
}

interface TeamData {
  name: string
  players: PlayerStat[]
  teamFouls: number[]             // per quarter
  timeoutsUsed: number
}

interface PlayerStat {
  jerseyNumber: number
  name: string
  points: number
  fieldGoals: { made: number; attempted: number }
  threePointers: { made: number; attempted: number }
  freeThrows: { made: number; attempted: number }
  rebounds: { offensive: number; defensive: number }
  assists: number
  steals: number
  blocks: number
  turnovers: number
  fouls: number
  confidence: Record<string, "high" | "medium" | "low">
}
```

### 4.4 Data Model

The submission data model maintains a complete audit trail from raw image to approved data. Key tables include:

- **Submissions** — metadata, status, timestamps
- **SubmissionImages** — original files, processed variants, storage URLs
- **ExtractionResults** — raw AI JSON output, version
- **GameData** — approved final data, the source of truth for all downstream features
- **EditLog** — every field-level change the coach made during review, enabling quality feedback loops for prompt improvement

---

## 5. Sport-Specific Configurations

Each sport requires a tailored extraction prompt, validation ruleset, and confirmation UI layout. Phase 1 launches with basketball and football. Additional sports are added in subsequent phases.

| Sport | Key Data Points | Validation Rules | Phase |
|-------|----------------|-----------------|-------|
| **Basketball** | PTS, FG, 3PT, FT, REB, AST, STL, BLK, TO, PF, quarter scores | Individual PTS must sum to team total; max 5 PF per player; FG+3PT attempts ≤ reasonable range | Phase 1 |
| **Football** | Passing (C/A, YDS, TD, INT), Rushing (CAR, YDS, TD), Receiving (REC, YDS, TD), Tackles, Sacks, quarter scores | Passing completions ≤ attempts; total offensive yards cross-check; score consistent with TDs/FGs | Phase 1 |
| **Soccer** | Goals, assists, shots, saves, fouls, cards, corner kicks | Goals must sum to final score; cards per player max check | Phase 2 |
| **Baseball** | Batting (AB, H, R, RBI, HR, BB, K), Pitching (IP, H, R, ER, BB, K), Fielding (E) | Hits ≤ at-bats; runs must align with box score by inning | Phase 2 |
| **Volleyball** | Kills, assists, digs, blocks, aces, serve errors, set scores | Set scores must be 25+ (or 15 for set 5) with 2-point margin | Phase 2 |
| **Wrestling** | Match result, pin/decision/major/tech, weight class, time | Weight classes must be valid NCHSAA weights; team score cross-check | Phase 3 |

---

## 6. Edge Cases & Error Handling

### 6.1 Image Quality Issues

- **Blurry or out-of-focus photos:** Client-side blur detection before upload. If below threshold, prompt re-capture with tips ("Hold steady, ensure good lighting").
- **Poor lighting / shadows:** Server-side image enhancement (contrast, brightness adjustment) before sending to AI. Coach can also toggle flash.
- **Partial scorebook capture:** If the AI detects missing columns or cut-off data, return partial extraction with clear indicators of what's missing and prompt for additional photos.
- **Non-scorebook images:** If the AI cannot identify scorebook content, return a friendly error and offer manual entry as fallback.

### 6.2 AI Extraction Failures

- **API timeout:** 30-second timeout with retry logic (max 2 retries). On final failure, preserve images and offer manual entry with option to retry extraction later.
- **Rate limiting:** Queue system for high-volume periods (Friday nights). Show position in queue with estimated wait time.
- **Low-confidence extraction:** If more than 40% of fields are low-confidence, suggest manual entry instead of presenting unreliable data.
- **Duplicate submission detection:** Check for existing games between the same teams on the same date. If found, prompt coach to confirm this is a correction or a different game.

### 6.3 Data Integrity

- **Conflicting submissions:** If both coaches from a game submit, flag for reconciliation. Use the submission with higher confidence scores as baseline and highlight discrepancies for manual review.
- **Stat corrections after submission:** Allow coaches to edit submitted games for 48 hours. After 48 hours, corrections require FNFR admin approval.
- **Roster mismatches:** If extracted player names don't match known roster, allow coach to map names or add new players.

---

## 7. Coach Dashboard & Retention

### 7.1 Season Dashboard

Every coach who submits through ScoreSnap gets a persistent dashboard showing their season data auto-aggregated from all submissions. This is the retention hook — coaches return because their season data lives here. The dashboard includes season record (W-L), team stat leaders, game-by-game results with detailed box scores, season trends and visualizations, and an exportable season summary for end-of-year awards and recruiting.

### 7.2 Submission Streaks & Gamification

To drive consistent usage, ScoreSnap tracks submission streaks (consecutive games submitted) and awards badges for milestones. Coaches who submit every game get a "Verified Coach" badge that appears on their team's public profile, creating social incentive. A season-end leaderboard highlights the most active programs.

### 7.3 Cross-Platform Hub Value Proposition

The "Submit everywhere from one place" value proposition is key to adoption. If a coach can submit to FNFR and have their data automatically forwarded to MaxPreps and HighSchoolOT, FNFR becomes the single point of data entry. This requires partnership agreements but is the ultimate lock-in — once a coach is using ScoreSnap as their hub, switching costs are high.

---

## 8. Success Metrics

| Metric | Target (6 months) | Target (12 months) | Measurement |
|--------|-------------------|---------------------|-------------|
| **Active coach submitters** | 100 coaches | 300 coaches | Unique coaches with ≥1 submission/month |
| **Submission volume** | 400 games/month | 1,500 games/month | Total approved submissions |
| **AI extraction accuracy** | ≥85% fields correct | ≥92% | Fields unchanged by coach in review |
| **Time to submit** | <60 seconds avg | <45 seconds | Camera open to approved submission |
| **Coach retention (monthly)** | ≥60% return | ≥75% | Coaches active in consecutive months |
| **Photo vs manual ratio** | 70% photo / 30% manual | 85% / 15% | Submission method distribution |
| **NC coverage** | 30% of NCHSAA games | 60% | FNFR submissions / total NCHSAA games |

---

## 9. Rollout Plan

### Phase 1: MVP (Weeks 1–6)

- Basketball and football support only
- Single-image capture with basic AI extraction
- Core confirmation/edit UI with confidence highlighting
- Manual entry fallback form
- Basic coach authentication (email + school verification)
- Data persistence and public scoreboard display
- Beta launch with 10–20 Greensboro-area coaches (leverage existing Greensboro Sports relationships)

### Phase 2: Expansion (Weeks 7–12)

- Multi-image capture and stitching
- Soccer, baseball, and volleyball support
- GameChanger / HUDL screenshot recognition
- Coach dashboard with season stats
- Auto-generated social media graphics
- Roster management and autocomplete
- Expand to Triangle and Charlotte metro area coaches

### Phase 3: Scale (Weeks 13–24)

- Wrestling and remaining sport support
- Cross-posting to MaxPreps / HighSchoolOT (pending partnerships)
- Push notifications for team followers
- API/webhook for downstream data consumers
- Submission streaks and gamification
- Statewide NC rollout with NCHSAA partnership outreach

---

## 10. Cost Estimates

### 10.1 AI API Costs

The primary variable cost is the Claude Vision API. Based on Anthropic's current pricing for claude-sonnet-4-5-20250929, each scorebook image is approximately 1,500–2,000 input tokens (image) plus 200 tokens (system prompt) plus approximately 800–1,200 output tokens (structured JSON response). At current rates, this works out to roughly $0.01–$0.03 per extraction depending on image count and complexity.

| Volume | Extractions/mo | Est. API Cost/mo | Per-game cost |
|--------|---------------|-----------------|---------------|
| **Phase 1 (beta)** | 200 | $4–$6 | $0.02–$0.03 |
| **Phase 2 (regional)** | 800 | $16–$24 | $0.02–$0.03 |
| **Phase 3 (statewide)** | 3,000 | $60–$90 | $0.02–$0.03 |
| **Scale target** | 10,000 | $200–$300 | $0.02–$0.03 |

> **🔴 COST ADVANTAGE:** At $0.02–$0.03 per game extraction, ScoreSnap costs less than the time value of a coach spending 10 minutes on manual entry. Even at 10,000 extractions/month, the AI cost is under $300/month, making this feature extremely cost-efficient to operate.

### 10.2 Infrastructure Costs

Image storage (R2/S3) at approximately $0.015/GB, database hosting via existing FNFR infrastructure, and Vercel hosting for the Next.js application are all marginal additions to the existing FNFR operating budget. The total incremental infrastructure cost for ScoreSnap is estimated at $20–$50/month at Phase 1 volumes, scaling linearly with storage.

---

## 11. Risks & Mitigations

| Risk | Severity | Mitigation | Owner |
|------|----------|-----------|-------|
| **AI accuracy on handwritten text** | High | Extensive prompt tuning with real NC scorebook samples; confidence scoring to prevent bad data from being published without review | Engineering |
| **Coach adoption / behavior change** | High | Partner with Greensboro Sports for warm intros; demonstrate time savings; gamification incentives | Product / Partnerships |
| **Friday night API load spikes** | Medium | Queue system with graceful degradation; pre-warm API connections; manual entry fallback always available | Engineering |
| **Scorebook format variability** | Medium | Flexible prompts that describe general scorebook layouts rather than rigid templates; continuous improvement from coach edit feedback data | Engineering |
| **Data accuracy disputes** | Medium | Full audit trail with original images; 48-hour edit window; admin reconciliation process for conflicting submissions | Product |
| **Claude API pricing changes** | Low | Architecture supports swappable AI backends; Google Gemini Vision as backup; monitor costs closely | Engineering |

---

## 12. Appendix

### 12.1 Competitive Landscape

MaxPreps (CBS Sports) requires manual form entry; no photo or AI features. Their stat import partners program is inbound-only (pushing data into MaxPreps) with no public API. HighSchoolOT (WRAL/Capitol Broadcasting) accepts scores via email and Twitter hashtag — a distinctly manual process. NCHSAA does not provide a direct submission tool for coaches; they rely on MaxPreps data. GameChanger and HUDL are stat-collection tools used during games but do not serve as public-facing score platforms for fans. None of these platforms offer AI-powered extraction from physical scorebooks.

### 12.2 Prompt Improvement Feedback Loop

Every coach edit in the confirmation view represents a signal about AI extraction quality. By logging the original AI output alongside the coach's corrections, we build a continuous training dataset. Monthly analysis of the most-corrected field types (e.g., if jersey numbers are frequently wrong, or three-point vs. two-point field goals are confused) informs prompt refinements. Over time, extraction accuracy improves organically from real-world usage data without requiring formal model training.

### 12.3 Privacy & Data Handling

Scorebook images may contain student names and jersey numbers, which are generally considered public information in the context of high school athletics (published in programs, on MaxPreps, etc.). However, FNFR will not extract or store any personally identifiable information beyond what appears in a standard box score (name, jersey number, stats). Images are stored securely with access restricted to the submitting coach and FNFR administrators. Coaches must agree to FNFR's terms of service confirming they have authority to submit game data for their team.

---

*— End of Document —*