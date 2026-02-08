import { extractJSONFromImage, type ImageSource } from './claude-vision';
import {
  validateBasketballGame,
  type BasketballGame,
  type ValidationError,
} from './basketball-validator';

/**
 * Basketball scorebook extraction prompt for Claude Vision
 */
const BASKETBALL_EXTRACTION_PROMPT = `You are an expert at reading high school basketball scorebooks. Extract ALL information from this scorebook image into structured JSON.

Extract the following information:

1. Game Details:
   - date (YYYY-MM-DD format)
   - homeTeam name
   - awayTeam name
   - location (if visible)
   - overtime (true/false)

2. For each team (homeTeam and awayTeam):
   - team name
   - final score
   - list of players with:
     * number (jersey number as string)
     * name (full name)
     * points (total points scored)
     * fouls (personal fouls, 0-5)
     * quarters (optional breakdown by quarter if visible: q1, q2, q3, q4, ot)

3. Quarter Scores (if visible):
   - Array of [homeScore, awayScore] for each quarter
   - Example: [[15, 12], [18, 20], [22, 19], [20, 15]] for Q1-Q4

Return ONLY this JSON structure (no markdown, no explanations):

{
  "date": "YYYY-MM-DD",
  "homeTeam": {
    "name": "Team Name",
    "score": 75,
    "players": [
      {
        "number": "23",
        "name": "Player Name",
        "points": 15,
        "fouls": 2,
        "quarters": { "q1": 4, "q2": 6, "q3": 3, "q4": 2 }
      }
    ]
  },
  "awayTeam": {
    "name": "Team Name",
    "score": 66,
    "players": [...]
  },
  "quarterScores": [[15, 12], [18, 20], [22, 19], [20, 15]],
  "overtime": false,
  "location": "School Gym"
}

IMPORTANT:
- Be accurate with numbers (jersey numbers, points, fouls)
- Points must sum to team total score
- Fouls must be 0-5 (players foul out at 5)
- If a field is unclear or missing, use null
- Return ONLY valid JSON`;

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
