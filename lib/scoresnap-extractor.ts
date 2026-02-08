import { extractJSONFromImage, type ImageSource } from './claude-vision';
import {
  validateBasketballGame,
  type BasketballGame,
  type ValidationError,
} from './basketball-validator';

/**
 * Basketball scorebook extraction prompt for Claude Vision
 * Optimized based on real-world testing with handwritten scorebooks
 */
const BASKETBALL_EXTRACTION_PROMPT = `You are an expert at reading high school basketball scorebooks. You have extensive experience with handwritten text and complex grid layouts. Extract ALL information from this scorebook image into structured JSON.

CRITICAL INSTRUCTIONS - READ CAREFULLY:

1. PLAYER POINTS - MOST COMMON ERROR:
   - Scorebooks typically have a GRID with multiple columns for quarters/halves
   - Look for the RIGHTMOST column or "TOTAL" column for each player's final points
   - DO NOT add up all numbers you see across the row (those are quarter/running totals)
   - The TOTAL column shows each player's final points for the game
   - Common grid layout: Name | #No | Q1 | Q2 | Q3 | Q4 | TOTAL | Fouls
   - Read the TOTAL column carefully - it's usually on the right side
   - The sum of all player TOTAL points MUST equal the team's final score
   - If totals don't match, recheck which column you're reading

2. FOULS - COUNT CAREFULLY:
   - Count checkmarks, X's, or tally marks in the fouls column
   - Maximum fouls per player is 5 (they foul out at 5)
   - If you count more than 5 fouls, recount carefully - you may be misreading
   - Common mistake: Confusing other marks for fouls
   - Use null if unclear

3. DATE:
   - Look at the top of the scoresheet for the date
   - Common locations: "Date:", "Game No:", header section
   - Format as YYYY-MM-DD
   - If only partial date visible (e.g., "2/8"), use your best judgment for year
   - Use null if no date is visible

4. HANDWRITTEN TEXT:
   - Take extra care with handwritten player names
   - Look at letter shapes carefully - similar letters: 'a/o', 'e/c', 'i/l', 'n/m'
   - If name is unclear, make your best guess but be conservative
   - Common last names in basketball: Smith, Johnson, Brown, Davis, Wilson, etc.
   - First names are often nicknames or shortened (e.g., "Josh" for "Joshua")

5. JERSEY NUMBERS:
   - Each player should have a unique jersey number
   - If you see duplicate numbers, double-check - one may be misread
   - Use null if number is illegible

6. TEAM NAMES:
   - Usually found at top: "Team A:", "Home:", or "Visiting:"
   - May also be in "Coach:" section or header
   - Be careful with handwritten team names

Extract the following information:

{
  "date": "YYYY-MM-DD",           // Top of sheet, use null if not found
  "homeTeam": {
    "name": "Team Name",          // Team A or Home team
    "score": 75,                  // Final score from score box
    "players": [
      {
        "number": "23",           // Jersey number as string, null if unclear
        "name": "Player Name",    // Full name, null if illegible
        "points": 15,             // TOTAL points (not running total), must sum to team score
        "fouls": 2,               // Count marks (0-5), null if unclear
        "quarters": null          // Optional: { "q1": 4, "q2": 6, "q3": 3, "q4": 2 }
      }
    ]
  },
  "awayTeam": {                   // Team B or Visiting team
    "name": "Team Name",
    "score": 66,
    "players": [...]
  },
  "quarterScores": [[15, 12], [18, 20], [22, 19], [20, 15]], // [home, away] per quarter, null if not visible
  "overtime": false,              // true if OT visible, false otherwise
  "location": "School Gym"        // Null if not found
}

VALIDATION CHECKLIST (verify before responding):
✓ Sum of homeTeam player points = homeTeam score
✓ Sum of awayTeam player points = awayTeam score
✓ All fouls are 0-5 (no player has more than 5)
✓ No duplicate jersey numbers within same team
✓ Team names are present (not null)
✓ If quarterScores present, they sum to final scores

SCOREBOOK LAYOUT UNDERSTANDING:
- Most scorebooks have TWO main sections: Team A (top) and Team B (bottom)
- Each team section has a player roster on the LEFT and scoring grid on the RIGHT
- The scoring grid has columns for quarters and a TOTAL column
- Read the TOTAL column (usually rightmost) for player points
- Fouls are usually marked with checkmarks/X's in a separate fouls section

COMMON MISTAKES TO AVOID:
❌ Reading quarter totals instead of the TOTAL column
❌ Adding up numbers across the row (those are quarter breakdowns)
❌ Counting more than 5 fouls per player
❌ Missing the date when it's clearly visible
❌ Including the same player twice
❌ Misreading handwritten names (take extra care!)
❌ Confusing similar handwritten letters (a/o, e/c, n/m, i/l)

Return ONLY valid JSON (no markdown, no explanations, no thinking out loud).`;

export interface ExtractionResult {
  success: boolean;
  game: BasketballGame | null;
  validationErrors: ValidationError[];
  raw: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  processingTimeMs: number;
}

/**
 * Extract basketball game data from a scorebook image
 */
export async function extractBasketballGame(
  imageSource: ImageSource
): Promise<ExtractionResult> {
  try {
    // Step 1: Extract JSON from image using Claude Vision
    const extraction = await extractJSONFromImage<BasketballGame>(
      imageSource,
      BASKETBALL_EXTRACTION_PROMPT,
      {
        model: 'claude-sonnet-4-20250514', // Latest Claude Sonnet
        maxTokens: 4096,
        temperature: 0, // Deterministic for accuracy
      }
    );

    // Step 2: Validate extracted data
    const validationErrors = validateBasketballGame(extraction.data);

    return {
      success: validationErrors.filter((e) => e.severity === 'error').length === 0,
      game: extraction.data,
      validationErrors,
      raw: extraction.raw,
      usage: extraction.usage,
      processingTimeMs: extraction.processingTimeMs,
    };
  } catch (error) {
    // Extraction failed
    return {
      success: false,
      game: null,
      validationErrors: [
        {
          code: 'EXTRACTION_FAILED',
          message: error instanceof Error ? error.message : String(error),
          severity: 'error',
        },
      ],
      raw: '',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
      },
      processingTimeMs: 0,
    };
  }
}

/**
 * Extract game from image URL
 */
export async function extractFromURL(url: string): Promise<ExtractionResult> {
  return extractBasketballGame({
    type: 'url',
    data: url,
  });
}

/**
 * Extract game from base64-encoded image
 */
export async function extractFromBase64(
  base64Data: string,
  mediaType: string = 'image/jpeg'
): Promise<ExtractionResult> {
  return extractBasketballGame({
    type: 'base64',
    data: base64Data,
    mediaType,
  });
}

/**
 * Extract game from local file path
 */
export async function extractFromFile(
  filePath: string
): Promise<ExtractionResult> {
  const { imageFileToBase64 } = await import('./claude-vision');
  const { data, mediaType } = await imageFileToBase64(filePath);

  return extractBasketballGame({
    type: 'base64',
    data,
    mediaType,
  });
}
