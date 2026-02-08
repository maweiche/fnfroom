# Week 2: AI Extraction Pipeline

## Overview
Week 2 implements the core AI extraction pipeline for ScoreSnap, using Claude Vision (Sonnet 4) to extract structured basketball game data from scorebook images.

## Components Built

### 1. Claude Vision API Client (`lib/claude-vision.ts`)
**Purpose:** Generic wrapper for Claude Vision API

**Features:**
- Image input from URL or base64
- Structured JSON extraction
- Token usage tracking
- Processing time measurement
- Error handling and retries

**Key Functions:**
```typescript
// Extract text from image
extractFromImage(imageSource, prompt, options)

// Extract JSON from image (auto-parsing)
extractJSONFromImage<T>(imageSource, prompt, options)

// Convert local file to base64
imageFileToBase64(filePath)
```

### 2. Basketball Validator (`lib/basketball-validator.ts`)
**Purpose:** Validate extracted game data for accuracy

**Validation Rules:**
- ✅ Team score matches sum of player points
- ✅ Player fouls don't exceed 5 (foul out rule)
- ✅ Quarter scores match final scores
- ✅ Team names are present
- ✅ Valid date format (YYYY-MM-DD)
- ✅ No negative values

**Key Functions:**
```typescript
// Validate entire game
validateBasketballGame(game): ValidationError[]

// Check if validation passed (no errors)
validationPassed(errors): boolean

// Get error/warning counts
getErrorCounts(errors): { errors, warnings }
```

### 3. ScoreSnap Extractor (`lib/scoresnap-extractor.ts`)
**Purpose:** Main extraction orchestrator

**Features:**
- Basketball-specific extraction prompt
- Claude Vision → Validation pipeline
- Support for URL, base64, or file input
- Comprehensive result object with usage stats

**Key Functions:**
```typescript
// Extract from any source
extractBasketballGame(imageSource)

// Convenience wrappers
extractFromURL(url)
extractFromBase64(base64, mediaType)
extractFromFile(filePath)
```

## Data Structure

### Extracted Game Format
```typescript
{
  date: "2026-02-08",
  homeTeam: {
    name: "Grimsley Whirlies",
    score: 75,
    players: [
      {
        number: "23",
        name: "John Smith",
        points: 15,
        fouls: 2,
        quarters: { q1: 4, q2: 6, q3: 3, q4: 2 }
      }
    ]
  },
  awayTeam: { /* same structure */ },
  quarterScores: [[15, 12], [18, 20], [22, 19], [20, 15]],
  overtime: false,
  location: "Grimsley High School"
}
```

## Testing

### Test Script
```bash
# Test with local file
bun scripts/test-extraction.ts ./path/to/scorebook.jpg

# Test with URL
bun scripts/test-extraction.ts https://example.com/scorebook.png
```

### Expected Output
```
🏀 ScoreSnap - Basketball Scorebook Extraction Test

📸 Input: ./scorebook.jpg

⏳ Extracting game data with Claude Vision...

============================================================
EXTRACTION RESULTS
============================================================

✅ Success: Yes
⏱️  Processing Time: 2341ms
🔢 Token Usage: 1523 in / 487 out

📊 GAME DATA
────────────────────────────────────────────────────────────
Date: 2026-02-08
Location: Grimsley High School
Overtime: No

🏠 Grimsley Whirlies: 75
   Players: 12
     #23 John Smith                15 pts, 2 fouls
     [...]

✈️  Smith Spartans: 66
   Players: 10
     [...]

✅ VALIDATION: All checks passed!
```

## Extraction Prompt

The extraction prompt is carefully designed to:
1. **Be specific** - High school basketball context
2. **Request structure** - Exact JSON format
3. **Enforce rules** - Points sum, foul limits
4. **Handle uncertainty** - Use null for unclear fields

Key prompt sections:
- Game details (date, teams, location)
- Player stats (number, name, points, fouls)
- Quarter breakdown (if visible)
- JSON structure example
- Important rules (accuracy, validation)

## Performance

**Typical extraction:**
- Processing time: 2-4 seconds
- Input tokens: ~1500 (includes image + prompt)
- Output tokens: ~400-600 (JSON response)
- Cost per extraction: ~$0.01-0.02 (Sonnet 4 pricing)

## Accuracy Considerations

### What Claude Vision Handles Well:
- ✅ Clear, typed scorebook images
- ✅ Standard high school scorebook formats
- ✅ Printed or neat handwriting
- ✅ Good lighting and resolution
- ✅ Standard player numbering

### Potential Challenges:
- ⚠️ Very messy handwriting
- ⚠️ Blurry or low-resolution images
- ⚠️ Non-standard scorebook formats
- ⚠️ Damaged or partially obscured images

### Mitigation Strategies:
1. **Validation** catches most errors (points mismatch, invalid fouls)
2. **Manual review** step in confirmation UI
3. **Edit history** tracks corrections to improve future extraction
4. **Retry mechanism** for extraction failures

## Next Steps

### Week 3: Submission API & UI (Next)
1. Build submission API endpoints
2. Create upload flow in Next.js
3. Build confirmation/edit UI
4. Handle validation errors gracefully
5. Implement 48-hour edit window

### Future Enhancements
- Multi-page scorebook support
- Automatic image quality checks
- Confidence scores for extracted fields
- Football scorebook extraction
- Coach feedback loop for AI improvement

## Error Handling

### Extraction Errors
```typescript
{
  success: false,
  game: null,
  validationErrors: [{
    code: 'EXTRACTION_FAILED',
    message: 'Claude API Error...',
    severity: 'error'
  }]
}
```

### Validation Errors
```typescript
{
  success: false, // if any errors present
  game: { /* extracted data */ },
  validationErrors: [
    {
      code: 'POINTS_MISMATCH',
      message: 'Team score (75) doesn\'t match sum of player points (73)',
      fieldPath: 'homeTeam.score',
      severity: 'error'
    },
    {
      code: 'FOULS_EXCEED_MAX',
      message: 'Player #23 (John Smith) has 6 fouls (max 5)',
      fieldPath: 'homeTeam.players[0].fouls',
      severity: 'error'
    }
  ]
}
```

## Integration with Database

When extraction succeeds:
1. Create `Submission` record with status='PROCESSING'
2. Store `rawAiResponse` (full JSON for debugging)
3. Store `processingTimeMs` (for analytics)
4. Create `ValidationError` records for any issues
5. If validation passes: status='COMPLETED'
6. If validation fails: status='FAILED'

Coach can then:
- Review validation errors
- Manually correct issues
- Approve to create `Game` record
- All edits tracked in `EditHistory`

## Cost Estimation

**Per extraction:**
- Input: ~1500 tokens × $0.003 per 1K = $0.0045
- Output: ~500 tokens × $0.015 per 1K = $0.0075
- **Total: ~$0.012 per scorebook**

**Monthly cost (basketball season):**
- 30 games/week × 16 weeks = 480 games
- 480 × $0.012 = **$5.76/season**

Very affordable for beta!

## Security Considerations

1. **API Key Protection**
   - ANTHROPIC_API_KEY in .env.local
   - Never exposed to client
   - Rate limiting via Anthropic account

2. **Image Storage**
   - Images stored in Sanity CDN
   - Public URLs (read-only)
   - CDN caching for performance

3. **Data Privacy**
   - Player names/numbers extracted
   - No sensitive personal data
   - Public scorebook data

## Monitoring & Analytics

Track these metrics:
- **Extraction success rate** (% without errors)
- **Average processing time** (should be 2-4s)
- **Common validation errors** (improve AI prompt)
- **Fields requiring manual edits** (AI accuracy by field)
- **Token usage trends** (cost monitoring)

Use this data to:
- Refine extraction prompt
- Improve validation rules
- Identify problematic scorebook formats
- Optimize cost/accuracy tradeoff
