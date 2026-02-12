import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedGame {
  date: string;            // "YYYY-MM-DD"
  time: string | null;     // "7:15 PM"
  opponent: string;        // opponent school name
  opponentCity: string | null;
  isHome: boolean;         // true = home, false = away (@ prefix)
  isConference: boolean;   // * suffix
  location: string | null;
}

export interface ExtractedSchedule {
  teamName: string;
  sport: string;           // "LACROSSE", "BASKETBALL", "FOOTBALL"
  gender: string;          // "Boys" or "Girls"
  season: string;          // "2025-26"
  city: string | null;
  classification: string | null;
  conference: string | null;
  games: ExtractedGame[];
}

export interface ScheduleExtractionResult {
  success: boolean;
  schedule: ExtractedSchedule | null;
  errors: string[];
  processingTimeMs: number;
}

const SCHEDULE_EXTRACTION_PROMPT = `You are an expert at reading high school sports schedules printed from MaxPreps. Extract ALL game information from this schedule document into structured JSON.

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

CRITICAL INSTRUCTIONS:

1. TEAM HEADER:
   - Find the team name, sport, gender (Boys/Girls), and season
   - The header usually says something like "School Name Lacrosse Schedule (2025-26)"
   - Look for city, classification (e.g., "4A", "3A"), division, league, and conference name
   - Season format: "YYYY-YY" (e.g., "2025-26")

2. GAME ROWS - Extract EVERY SINGLE game row. Do NOT skip any:
   - Date: The schedule shows dates like "2/20" or "3/15" WITHOUT the year
   - Time: Normalize to "h:mm PM" format (e.g., "5:00 PM"). Time often appears below the date (e.g., "5:00p" means "5:00 PM"). Use null if not listed.
   - Opponent: The school name in BOLD. Strip any "@" prefix or "*" suffix. Do NOT include the city in parentheses — put that in opponentCity.
   - opponentCity: The city shown in parentheses after the opponent name, e.g., "(Charlotte, NC)" → "Charlotte". Use null if not shown.
   - isHome: If the opponent has an "@" prefix, this is an AWAY game (isHome: false). No "@" means HOME (isHome: true).
   - isConference: If the game row has a "*" suffix or asterisk marker, it's a conference game (true). Otherwise false.
   - location: The "Location:" line below the opponent, if present. Use null if not listed.

3. DATE YEAR ASSIGNMENT — THIS IS THE MOST IMPORTANT RULE:
   MaxPreps schedules show dates as "M/DD" without the year. You MUST assign the correct year.

   The season field (e.g., "2025-26") tells you the school year range:
   - FALL SPORTS (Football): Aug–Dec = first year (2025)
   - SPRING SPORTS (Lacrosse, Baseball, Softball, Track): Jan–Jun = second year (2026)
   - WINTER SPORTS (Basketball, Wrestling, Swimming): Nov–Dec = first year (2025), Jan–Mar = second year (2026)

   For a "2025-26" LACROSSE schedule:
   - ALL dates are in 2026 (lacrosse is a spring sport: Feb–May)
   - 2/20 → 2026-02-20
   - 3/15 → 2026-03-15
   - 4/6 → 2026-04-06
   - 5/1 → 2026-05-01

   For a "2025-26" FOOTBALL schedule:
   - ALL dates are in 2025 (football is a fall sport: Aug–Nov)
   - 8/22 → 2025-08-22
   - 10/3 → 2025-10-03

   For a "2025-26" BASKETBALL schedule:
   - Nov–Dec dates are 2025, Jan–Mar dates are 2026
   - 11/15 → 2025-11-15
   - 1/10 → 2026-01-10

4. ADDITIONAL RULES:
   - Extract EVERY game row, including preseason, regular season, and playoff games
   - Do NOT skip games that show results (W/L scores) — extract them too
   - Strip any score/result information from opponent names
   - Common MaxPreps markers: @ = away, * = conference, (DH) = doubleheader
   - "Preview Game" or "Box Score" in the Result column should be ignored

IMPORTANT: Respond with ONLY valid JSON. No markdown, no explanations, just the JSON object.

Return this exact JSON structure:
{
  "teamName": "School Name",
  "sport": "LACROSSE",
  "gender": "Boys",
  "season": "2025-26",
  "city": "City Name",
  "classification": "4A",
  "conference": "Conference Name",
  "games": [
    {
      "date": "2026-02-20",
      "time": "5:00 PM",
      "opponent": "Cannon",
      "opponentCity": "Concord",
      "isHome": true,
      "isConference": false,
      "location": "Greensboro Day School"
    }
  ]
}`;

/**
 * Fix game dates based on season and sport.
 * This is a safety net — if the AI assigns wrong years, we correct them.
 */
function fixGameDates(schedule: ExtractedSchedule): void {
  const seasonMatch = schedule.season?.match(/^(\d{4})-(\d{2,4})$/);
  if (!seasonMatch) return;

  const firstYear = parseInt(seasonMatch[1]);
  const secondYearSuffix = seasonMatch[2];
  const secondYear = secondYearSuffix.length === 2
    ? parseInt(`${String(firstYear).slice(0, 2)}${secondYearSuffix}`)
    : parseInt(secondYearSuffix);

  const sport = schedule.sport?.toUpperCase();

  for (const game of schedule.games) {
    if (!game.date) continue;

    const match = game.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) continue;

    const month = parseInt(match[2]);
    let correctYear: number;

    if (sport === 'FOOTBALL') {
      // Fall sport: all games in firstYear (Aug-Nov)
      correctYear = firstYear;
    } else if (sport === 'LACROSSE' || sport === 'BASEBALL' || sport === 'SOFTBALL' || sport === 'TRACK') {
      // Spring sport: all games in secondYear (Feb-Jun)
      correctYear = secondYear;
    } else if (sport === 'BASKETBALL' || sport === 'WRESTLING' || sport === 'SWIMMING') {
      // Winter sport: Nov-Dec = firstYear, Jan-Mar = secondYear
      correctYear = month >= 8 ? firstYear : secondYear;
    } else {
      // Unknown sport — use month heuristic
      correctYear = month >= 8 ? firstYear : secondYear;
    }

    const currentYear = parseInt(match[1]);
    if (currentYear !== correctYear) {
      game.date = `${correctYear}-${match[2]}-${match[3]}`;
    }
  }
}

function validateSchedule(schedule: ExtractedSchedule): string[] {
  const errors: string[] = [];

  if (!schedule.teamName?.trim()) {
    errors.push('Missing team name');
  }

  if (!schedule.games || schedule.games.length === 0) {
    errors.push('No games extracted');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const seen = new Set<string>();

  for (let i = 0; i < (schedule.games?.length || 0); i++) {
    const game = schedule.games[i];

    if (!game.date || !dateRegex.test(game.date)) {
      errors.push(`Game ${i + 1}: Invalid date "${game.date}"`);
    }

    if (!game.opponent?.trim()) {
      errors.push(`Game ${i + 1}: Missing opponent name`);
    }

    const key = `${game.date}|${game.opponent?.toLowerCase()}`;
    if (seen.has(key)) {
      errors.push(`Game ${i + 1}: Duplicate game on ${game.date} vs ${game.opponent}`);
    }
    seen.add(key);
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
 * Extract schedule from a PDF or image file using Gemini Vision
 */
export async function extractSchedule(
  file: { data: string; mediaType: string },
  sportOverride?: string,
  genderOverride?: string
): Promise<ScheduleExtractionResult> {
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
      { text: SCHEDULE_EXTRACTION_PROMPT },
    ]);

    const processingTimeMs = Date.now() - startTime;
    const text = result.response.text();

    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const schedule: ExtractedSchedule = JSON.parse(jsonString);

    // Apply overrides if provided
    if (sportOverride) schedule.sport = sportOverride;
    if (genderOverride) schedule.gender = genderOverride;

    // Normalize sport to uppercase
    if (schedule.sport) {
      schedule.sport = schedule.sport.toUpperCase();
    }

    // Fix dates based on season + sport (safety net for AI mistakes)
    fixGameDates(schedule);

    const errors = validateSchedule(schedule);

    return {
      success: errors.length === 0,
      schedule,
      errors,
      processingTimeMs,
    };
  } catch (error) {
    return {
      success: false,
      schedule: null,
      errors: [error instanceof Error ? error.message : String(error)],
      processingTimeMs: Date.now() - startTime,
    };
  }
}
