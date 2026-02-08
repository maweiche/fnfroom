#!/usr/bin/env bun
/**
 * Test script for basketball scorebook extraction
 * Usage: bun scripts/test-extraction.ts <image-path-or-url>
 */

import { extractFromFile, extractFromURL } from '../lib/scoresnap-extractor';
import { getErrorCounts } from '../lib/basketball-validator';

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.error('❌ Usage: bun scripts/test-extraction.ts <image-path-or-url>');
    console.error('');
    console.error('Examples:');
    console.error('  bun scripts/test-extraction.ts ./scorebook.jpg');
    console.error('  bun scripts/test-extraction.ts https://example.com/scorebook.png');
    process.exit(1);
  }

  console.log('🏀 ScoreSnap - Basketball Scorebook Extraction Test\n');
  console.log(`📸 Input: ${input}\n`);

  try {
    // Determine if input is URL or file path
    const isURL = input.startsWith('http://') || input.startsWith('https://');

    console.log('⏳ Extracting game data with Claude Vision...\n');

    const result = isURL
      ? await extractFromURL(input)
      : await extractFromFile(input);

    // Display results
    console.log('='.repeat(60));
    console.log('EXTRACTION RESULTS');
    console.log('='.repeat(60));
    console.log('');

    console.log(`✅ Success: ${result.success ? 'Yes' : 'No'}`);
    console.log(`⏱️  Processing Time: ${result.processingTimeMs}ms`);
    console.log(
      `🔢 Token Usage: ${result.usage.inputTokens} in / ${result.usage.outputTokens} out`
    );
    console.log('');

    if (result.game) {
      console.log('📊 GAME DATA');
      console.log('─'.repeat(60));
      console.log(`Date: ${result.game.date}`);
      console.log(`Location: ${result.game.location || 'N/A'}`);
      console.log(`Overtime: ${result.game.overtime ? 'Yes' : 'No'}`);
      console.log('');

      console.log(`🏠 ${result.game.homeTeam.name}: ${result.game.homeTeam.score}`);
      console.log(`   Players: ${result.game.homeTeam.players.length}`);
      result.game.homeTeam.players.forEach((p) => {
        const number = (p.number || '?').toString().padStart(2);
        const name = (p.name || 'Unknown').padEnd(25);
        const points = p.points ?? '?';
        const fouls = p.fouls ?? '?';
        console.log(`     #${number} ${name} ${points} pts, ${fouls} fouls`);
      });
      console.log('');

      console.log(`✈️  ${result.game.awayTeam.name}: ${result.game.awayTeam.score}`);
      console.log(`   Players: ${result.game.awayTeam.players.length}`);
      result.game.awayTeam.players.forEach((p) => {
        const number = (p.number || '?').toString().padStart(2);
        const name = (p.name || 'Unknown').padEnd(25);
        const points = p.points ?? '?';
        const fouls = p.fouls ?? '?';
        console.log(`     #${number} ${name} ${points} pts, ${fouls} fouls`);
      });
      console.log('');

      if (result.game.quarterScores && result.game.quarterScores.length > 0) {
        console.log('📈 QUARTER SCORES');
        console.log('─'.repeat(60));
        result.game.quarterScores.forEach(([home, away], i) => {
          const quarter = i < 4 ? `Q${i + 1}` : 'OT';
          console.log(`${quarter}: ${home} - ${away}`);
        });
        console.log('');
      }
    }

    // Display validation errors
    const { errors, warnings } = getErrorCounts(result.validationErrors);

    if (result.validationErrors.length > 0) {
      console.log('⚠️  VALIDATION RESULTS');
      console.log('─'.repeat(60));
      console.log(`Errors: ${errors}`);
      console.log(`Warnings: ${warnings}`);
      console.log('');

      result.validationErrors.forEach((error) => {
        const icon = error.severity === 'error' ? '❌' : '⚠️ ';
        console.log(`${icon} [${error.code}] ${error.message}`);
        if (error.fieldPath) {
          console.log(`   Field: ${error.fieldPath}`);
        }
      });
      console.log('');
    } else {
      console.log('✅ VALIDATION: All checks passed!\n');
    }

    // Display raw response (truncated)
    console.log('📝 RAW RESPONSE (truncated)');
    console.log('─'.repeat(60));
    const truncated =
      result.raw.length > 500
        ? result.raw.substring(0, 500) + '...'
        : result.raw;
    console.log(truncated);
    console.log('');

    console.log('='.repeat(60));
    console.log('');

    if (result.success) {
      console.log('✅ Extraction completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Review the extracted data for accuracy');
      console.log('2. Test with more scorebook images');
      console.log('3. Build the submission API endpoints');
      process.exit(0);
    } else {
      console.log('❌ Extraction failed or has validation errors');
      console.log('');
      console.log('Please review the errors above and try again.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
