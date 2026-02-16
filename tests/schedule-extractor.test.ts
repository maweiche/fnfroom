/**
 * Schedule Extractor Test Harness
 *
 * Usage:
 *   bun tests/schedule-extractor.test.ts <path-to-schedule-image>
 *
 * Runs Gemini Vision extraction on the provided file and prints
 * the full result so you can compare against the real schedule.
 *
 * To compare against expected output:
 *   1. Run once to get the extraction result
 *   2. Save corrected JSON as tests/fixtures/expected/<name>.json
 *   3. Run: bun tests/schedule-extractor.test.ts <image> --expected tests/fixtures/expected/<name>.json
 */

import { extractSchedule, type ExtractedSchedule, type ExtractedGame } from '../lib/schedule-extractor';
import { parseArgs } from 'util';

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    expected: { type: 'string', short: 'e' },
    sport: { type: 'string', short: 's' },
    gender: { type: 'string', short: 'g' },
  },
  allowPositionals: true,
});

const filePath = positionals[0];
if (!filePath) {
  console.error('Usage: bun tests/schedule-extractor.test.ts <schedule-file> [--expected <expected.json>] [--sport LACROSSE] [--gender Boys]');
  process.exit(1);
}

const MEDIA_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function getMediaType(path: string): string {
  const ext = path.toLowerCase().slice(path.lastIndexOf('.'));
  return MEDIA_TYPES[ext] || 'application/octet-stream';
}

// --- Diff / comparison helpers ---

interface GameDiff {
  index: number;
  field: string;
  expected: unknown;
  actual: unknown;
}

interface ComparisonResult {
  metaDiffs: { field: string; expected: unknown; actual: unknown }[];
  gameDiffs: GameDiff[];
  missingGames: ExtractedGame[];   // in expected but not extracted
  extraGames: ExtractedGame[];     // extracted but not in expected
  matchedGames: number;
  totalExpected: number;
  totalExtracted: number;
}

function compareSchedules(expected: ExtractedSchedule, actual: ExtractedSchedule): ComparisonResult {
  const result: ComparisonResult = {
    metaDiffs: [],
    gameDiffs: [],
    missingGames: [],
    extraGames: [],
    matchedGames: 0,
    totalExpected: expected.games.length,
    totalExtracted: actual.games.length,
  };

  // Compare metadata
  for (const field of ['teamName', 'sport', 'gender', 'season', 'city', 'classification', 'conference'] as const) {
    const e = expected[field];
    const a = actual[field];
    if (normalize(e) !== normalize(a)) {
      result.metaDiffs.push({ field, expected: e, actual: a });
    }
  }

  // Match games by date + opponent (fuzzy)
  const actualUsed = new Set<number>();

  for (let ei = 0; ei < expected.games.length; ei++) {
    const eg = expected.games[ei];
    let bestMatch = -1;
    let bestScore = 0;

    for (let ai = 0; ai < actual.games.length; ai++) {
      if (actualUsed.has(ai)) continue;
      const ag = actual.games[ai];
      const score = matchScore(eg, ag);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = ai;
      }
    }

    if (bestMatch >= 0 && bestScore >= 1) {
      actualUsed.add(bestMatch);
      result.matchedGames++;
      const ag = actual.games[bestMatch];

      // Compare fields
      for (const field of ['date', 'time', 'opponent', 'opponentCity', 'isHome', 'isConference', 'location'] as const) {
        const ev = eg[field];
        const av = ag[field];
        if (normalize(ev) !== normalize(av)) {
          result.gameDiffs.push({ index: ei + 1, field, expected: ev, actual: av });
        }
      }
    } else {
      result.missingGames.push(eg);
    }
  }

  // Find extra games (extracted but not in expected)
  for (let ai = 0; ai < actual.games.length; ai++) {
    if (!actualUsed.has(ai)) {
      result.extraGames.push(actual.games[ai]);
    }
  }

  return result;
}

function matchScore(a: ExtractedGame, b: ExtractedGame): number {
  let score = 0;
  if (a.date === b.date) score += 2;
  if (normalize(a.opponent) === normalize(b.opponent)) score += 2;
  // Partial match on opponent name
  if (score < 4 && normalize(a.opponent)?.includes(normalize(b.opponent) || '___')) score += 1;
  if (score < 4 && normalize(b.opponent)?.includes(normalize(a.opponent) || '___')) score += 1;
  return score;
}

function normalize(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  return String(val).trim().toLowerCase();
}

function printComparison(comp: ComparisonResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('COMPARISON RESULTS');
  console.log('='.repeat(60));

  // Summary
  const totalIssues = comp.metaDiffs.length + comp.gameDiffs.length + comp.missingGames.length + comp.extraGames.length;
  console.log(`\nGames: ${comp.matchedGames}/${comp.totalExpected} matched, ${comp.totalExtracted} extracted`);
  console.log(`Issues: ${totalIssues} total`);

  // Metadata diffs
  if (comp.metaDiffs.length > 0) {
    console.log('\n--- Metadata Differences ---');
    for (const d of comp.metaDiffs) {
      console.log(`  ${d.field}:`);
      console.log(`    expected: ${JSON.stringify(d.expected)}`);
      console.log(`    actual:   ${JSON.stringify(d.actual)}`);
    }
  }

  // Game field diffs
  if (comp.gameDiffs.length > 0) {
    console.log('\n--- Game Field Differences ---');
    for (const d of comp.gameDiffs) {
      console.log(`  Game #${d.index} → ${d.field}:`);
      console.log(`    expected: ${JSON.stringify(d.expected)}`);
      console.log(`    actual:   ${JSON.stringify(d.actual)}`);
    }
  }

  // Missing games
  if (comp.missingGames.length > 0) {
    console.log('\n--- Missing Games (expected but not extracted) ---');
    for (const g of comp.missingGames) {
      console.log(`  ${g.date} vs ${g.opponent} (${g.isHome ? 'Home' : 'Away'})`);
    }
  }

  // Extra games
  if (comp.extraGames.length > 0) {
    console.log('\n--- Extra Games (extracted but not expected) ---');
    for (const g of comp.extraGames) {
      console.log(`  ${g.date} vs ${g.opponent} (${g.isHome ? 'Home' : 'Away'})`);
    }
  }

  if (totalIssues === 0) {
    console.log('\n  ✓ Perfect extraction — all fields match!');
  }

  console.log('');
}

// --- Main ---

async function main() {
  const file = Bun.file(filePath);
  if (!await file.exists()) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const mediaType = getMediaType(filePath);
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  console.log(`Extracting schedule from: ${filePath}`);
  console.log(`Media type: ${mediaType}`);
  if (values.sport) console.log(`Sport override: ${values.sport}`);
  if (values.gender) console.log(`Gender override: ${values.gender}`);
  console.log('Calling Gemini Vision...\n');

  const result = await extractSchedule(
    { data: base64, mediaType },
    values.sport,
    values.gender,
  );

  console.log(`Processing time: ${result.processingTimeMs}ms`);
  console.log(`Success: ${result.success}`);

  if (result.errors.length > 0) {
    console.log('\nExtraction errors:');
    for (const err of result.errors) {
      console.log(`  - ${err}`);
    }
  }

  if (result.schedule) {
    console.log(`\nTeam: ${result.schedule.teamName}`);
    console.log(`Sport: ${result.schedule.sport} | Gender: ${result.schedule.gender} | Season: ${result.schedule.season}`);
    console.log(`City: ${result.schedule.city} | Class: ${result.schedule.classification} | Conference: ${result.schedule.conference}`);
    console.log(`Games extracted: ${result.schedule.games.length}\n`);

    // Print each game
    for (let i = 0; i < result.schedule.games.length; i++) {
      const g = result.schedule.games[i];
      const home = g.isHome ? 'HOME' : 'AWAY';
      const conf = g.isConference ? ' *' : '';
      console.log(`  ${String(i + 1).padStart(2)}. ${g.date}  ${(g.time || '---').padEnd(9)} ${home.padEnd(4)}  ${g.opponent}${conf}${g.opponentCity ? ` (${g.opponentCity})` : ''}${g.location ? ` @ ${g.location}` : ''}`);
    }

    // Save raw output for reference
    const outPath = filePath.replace(/\.[^.]+$/, '') + '.extracted.json';
    await Bun.write(outPath, JSON.stringify(result.schedule, null, 2));
    console.log(`\nRaw output saved to: ${outPath}`);

    // Compare against expected if provided
    if (values.expected) {
      const expectedFile = Bun.file(values.expected);
      if (!await expectedFile.exists()) {
        console.error(`Expected file not found: ${values.expected}`);
        process.exit(1);
      }
      const expected: ExtractedSchedule = await expectedFile.json();
      const comparison = compareSchedules(expected, result.schedule);
      printComparison(comparison);
    } else {
      console.log('\nTip: To compare against expected output, correct the JSON above and run:');
      console.log(`  bun tests/schedule-extractor.test.ts ${filePath} --expected <corrected.json>`);
    }
  }
}

main();
