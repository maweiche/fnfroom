import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedPlayer {
  jerseyNumber: string | null;
  firstName: string;
  lastName: string;
  position: string | null;
  grade: string | null;        // source grade from document (FR, SO, JR, SR)
  progressedGrade: string | null; // grade advanced by one year
  heightFeet: number | null;
  heightInches: number | null;
  weight: number | null;
  dropped: boolean;            // true if graduated senior
}

export interface ExtractedRoster {
  schoolName: string;
  sport: string;               // "LACROSSE", "BASKETBALL", "FOOTBALL"
  gender: string;              // "Boys" or "Girls"
  sourceSeason: string;        // season from document, e.g. "2024-25"
  targetSeason: string;        // advanced season, e.g. "2025-26"
  players: ExtractedPlayer[];
}

export interface RosterExtractionResult {
  success: boolean;
  roster: ExtractedRoster | null;
  errors: string[];
  processingTimeMs: number;
}

const GRADE_MAP: Record<string, string> = {
  '9': 'FR', 'fr': 'FR', 'freshman': 'FR', '9th': 'FR',
  '10': 'SO', 'so': 'SO', 'sophomore': 'SO', '10th': 'SO',
  '11': 'JR', 'jr': 'JR', 'junior': 'JR', '11th': 'JR',
  '12': 'SR', 'sr': 'SR', 'senior': 'SR', '12th': 'SR',
};

const GRADE_PROGRESSION: Record<string, string> = {
  'FR': 'SO',
  'SO': 'JR',
  'JR': 'SR',
  'SR': 'SR', // seniors stay SR but get marked as dropped
};

const ROSTER_EXTRACTION_PROMPT = `You are an expert at reading high school sports rosters printed from MaxPreps. Extract ALL player information from this roster document into structured JSON.

CRITICAL INSTRUCTIONS:

1. TEAM HEADER:
   - Find the school name, sport, gender (Boys/Girls), and season
   - The header usually says something like "School Name Boys Lacrosse Roster (2024-25)"
   - Season format: "YYYY-YY" (e.g., "2024-25")

2. PLAYER ROWS - Extract EVERY SINGLE player row. Do NOT skip any:
   - jerseyNumber: The jersey/uniform number. Use null if not shown.
   - firstName: The player's first name (split from full name)
   - lastName: The player's last name (split from full name)
   - position: The position abbreviation (A, M, D, G, LSM, FOGO, etc.). Use null if not shown.
   - grade: The grade level as shown (e.g., "Fr", "So", "Jr", "Sr", "9", "10", "11", "12"). Use null if not shown.
   - heightFeet: Height feet portion (e.g., for 5'10", this is 5). Use null if not shown.
   - heightInches: Height inches portion (e.g., for 5'10", this is 10). Use null if not shown.
   - weight: Weight in pounds as a number. Use null if not shown.

3. NAME SPLITTING:
   - "John Smith" → firstName: "John", lastName: "Smith"
   - "John Paul Smith" → firstName: "John Paul", lastName: "Smith"
   - "De'Andre Johnson" → firstName: "De'Andre", lastName: "Johnson"
   - Last word is always the lastName, everything before is firstName

4. HEIGHT PARSING:
   - "5-10" or "5'10" or "5'10\"" → heightFeet: 5, heightInches: 10
   - "6-1" or "6'1" → heightFeet: 6, heightInches: 1
   - If only a single number like "72" (inches total), convert: 72/12 = 6'0 → heightFeet: 6, heightInches: 0

5. GRADE NORMALIZATION:
   - Report the grade EXACTLY as shown in the document (Fr, So, Jr, Sr, 9, 10, 11, 12, etc.)

IMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations, just the JSON object.

Return this exact JSON structure:
{
  "schoolName": "School Name",
  "sport": "LACROSSE",
  "gender": "Boys",
  "season": "2024-25",
  "players": [
    {
      "jerseyNumber": "12",
      "firstName": "John",
      "lastName": "Smith",
      "position": "A",
      "grade": "Jr",
      "heightFeet": 5,
      "heightInches": 10,
      "weight": 160
    }
  ]
}`;

/**
 * Normalize a grade string to standard format (FR, SO, JR, SR)
 */
function normalizeGrade(grade: string | null): string | null {
  if (!grade) return null;
  // Strip trailing periods and whitespace (Gemini often returns "FR.", "SO.", etc.)
  const cleaned = grade.replace(/\./g, '').toLowerCase().trim();
  const normalized = GRADE_MAP[cleaned];
  return normalized || cleaned.toUpperCase();
}

/**
 * Advance all grades by one year and mark graduated seniors as dropped.
 */
export function progressGrades(players: ExtractedPlayer[]): ExtractedPlayer[] {
  return players.map((player) => {
    const normalized = normalizeGrade(player.grade);
    if (!normalized) {
      return { ...player, progressedGrade: null, dropped: false };
    }

    const progressed = GRADE_PROGRESSION[normalized] || normalized;
    const dropped = normalized === 'SR';

    return {
      ...player,
      grade: normalized,
      progressedGrade: progressed,
      dropped,
    };
  });
}

/**
 * Advance a season string by one year: "2024-25" → "2025-26"
 */
export function advanceSeason(season: string): string {
  const match = season.match(/^(\d{4})-(\d{2,4})$/);
  if (!match) return season;

  const firstYear = parseInt(match[1]);
  const newFirst = firstYear + 1;
  const newSecondSuffix = String(newFirst + 1).slice(-2);
  return `${newFirst}-${newSecondSuffix}`;
}

/**
 * Validate an extracted roster for completeness.
 */
function validateRoster(roster: ExtractedRoster): string[] {
  const errors: string[] = [];

  if (!roster.schoolName?.trim()) {
    errors.push('Missing school name');
  }

  if (!roster.players || roster.players.length === 0) {
    errors.push('No players extracted');
  }

  for (let i = 0; i < (roster.players?.length || 0); i++) {
    const player = roster.players[i];
    if (!player.firstName?.trim()) {
      errors.push(`Player ${i + 1}: Missing first name`);
    }
    if (!player.lastName?.trim()) {
      errors.push(`Player ${i + 1}: Missing last name`);
    }
  }

  return errors;
}

function getGemini(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set in environment variables');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Extract roster from a PDF or image file using Gemini Vision
 */
export async function extractRoster(
  file: { data: string; mediaType: string },
  sportOverride?: string,
  genderOverride?: string
): Promise<RosterExtractionResult> {
  const startTime = Date.now();

  try {
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 16384,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.mediaType,
          data: file.data,
        },
      },
      { text: ROSTER_EXTRACTION_PROMPT },
    ]);

    const processingTimeMs = Date.now() - startTime;
    const text = result.response.text();

    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const raw = JSON.parse(jsonString);

    // Apply overrides
    if (sportOverride) raw.sport = sportOverride;
    if (genderOverride) raw.gender = genderOverride;

    // Normalize sport to uppercase
    if (raw.sport) raw.sport = raw.sport.toUpperCase();

    // Build ExtractedRoster with grade progression
    const sourceSeason = raw.season || '2024-25';
    const targetSeason = advanceSeason(sourceSeason);

    const playersWithProgression = progressGrades(
      (raw.players || []).map((p: any) => ({
        jerseyNumber: p.jerseyNumber ?? null,
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        position: p.position || null,
        grade: p.grade || null,
        progressedGrade: null,
        heightFeet: p.heightFeet ?? null,
        heightInches: p.heightInches ?? null,
        weight: p.weight ?? null,
        dropped: false,
      }))
    );

    const roster: ExtractedRoster = {
      schoolName: raw.schoolName || '',
      sport: raw.sport || '',
      gender: raw.gender || '',
      sourceSeason,
      targetSeason,
      players: playersWithProgression,
    };

    const errors = validateRoster(roster);

    return {
      success: errors.length === 0,
      roster,
      errors,
      processingTimeMs,
    };
  } catch (error) {
    return {
      success: false,
      roster: null,
      errors: [error instanceof Error ? error.message : String(error)],
      processingTimeMs: Date.now() - startTime,
    };
  }
}
