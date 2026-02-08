/**
 * Basketball-specific validation rules for ScoreSnap
 * Validates extracted game data for accuracy and consistency
 */

export interface BasketballPlayer {
  number: string;
  name: string;
  points: number;
  fouls: number;
  quarters?: {
    q1?: number;
    q2?: number;
    q3?: number;
    q4?: number;
    ot?: number;
  };
}

export interface BasketballTeam {
  name: string;
  score: number;
  players: BasketballPlayer[];
}

export interface BasketballGame {
  date: string;
  homeTeam: BasketballTeam;
  awayTeam: BasketballTeam;
  quarterScores?: Array<[number, number]>; // [home, away] for each quarter
  overtime?: boolean;
  location?: string;
}

export interface ValidationError {
  code: string;
  message: string;
  fieldPath?: string;
  severity: 'error' | 'warning';
}

/**
 * Validate a basketball game for common errors
 */
export function validateBasketballGame(
  game: BasketballGame
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate team scores match sum of player points
  errors.push(...validateTeamScores(game.homeTeam, 'homeTeam'));
  errors.push(...validateTeamScores(game.awayTeam, 'awayTeam'));

  // Validate player fouls don't exceed maximum
  errors.push(...validatePlayerFouls(game.homeTeam, 'homeTeam'));
  errors.push(...validatePlayerFouls(game.awayTeam, 'awayTeam'));

  // Validate quarter scores if present
  if (game.quarterScores && game.quarterScores.length > 0) {
    errors.push(...validateQuarterScores(game));
  }

  // Validate team names are present
  if (!game.homeTeam.name || game.homeTeam.name.trim() === '') {
    errors.push({
      code: 'MISSING_TEAM_NAME',
      message: 'Home team name is missing',
      fieldPath: 'homeTeam.name',
      severity: 'error',
    });
  }

  if (!game.awayTeam.name || game.awayTeam.name.trim() === '') {
    errors.push({
      code: 'MISSING_TEAM_NAME',
      message: 'Away team name is missing',
      fieldPath: 'awayTeam.name',
      severity: 'error',
    });
  }

  // Validate date format
  if (!isValidDate(game.date)) {
    errors.push({
      code: 'INVALID_DATE',
      message: `Invalid date format: ${game.date}. Expected YYYY-MM-DD`,
      fieldPath: 'date',
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Validate team score matches sum of player points
 */
function validateTeamScores(
  team: BasketballTeam,
  teamPath: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  const playerPointsSum = team.players.reduce(
    (sum, player) => sum + (player.points || 0),
    0
  );

  if (playerPointsSum !== team.score) {
    errors.push({
      code: 'POINTS_MISMATCH',
      message: `Team score (${team.score}) doesn't match sum of player points (${playerPointsSum})`,
      fieldPath: `${teamPath}.score`,
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Validate player fouls don't exceed maximum
 */
function validatePlayerFouls(
  team: BasketballTeam,
  teamPath: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  team.players.forEach((player, index) => {
    if (player.fouls > 5) {
      errors.push({
        code: 'FOULS_EXCEED_MAX',
        message: `Player #${player.number} (${player.name}) has ${player.fouls} fouls (max 5)`,
        fieldPath: `${teamPath}.players[${index}].fouls`,
        severity: 'error',
      });
    }

    if (player.fouls < 0) {
      errors.push({
        code: 'NEGATIVE_FOULS',
        message: `Player #${player.number} (${player.name}) has negative fouls`,
        fieldPath: `${teamPath}.players[${index}].fouls`,
        severity: 'error',
      });
    }
  });

  return errors;
}

/**
 * Validate quarter scores match final scores
 */
function validateQuarterScores(game: BasketballGame): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!game.quarterScores || game.quarterScores.length === 0) {
    return errors;
  }

  // Sum quarter scores
  const homeQuarterSum = game.quarterScores.reduce(
    (sum, [home]) => sum + home,
    0
  );
  const awayQuarterSum = game.quarterScores.reduce(
    (sum, [, away]) => sum + away,
    0
  );

  // Check if quarter scores match final scores
  if (homeQuarterSum !== game.homeTeam.score) {
    errors.push({
      code: 'QUARTER_SCORE_MISMATCH',
      message: `Home team quarter scores (${homeQuarterSum}) don't match final score (${game.homeTeam.score})`,
      fieldPath: 'quarterScores',
      severity: 'error',
    });
  }

  if (awayQuarterSum !== game.awayTeam.score) {
    errors.push({
      code: 'QUARTER_SCORE_MISMATCH',
      message: `Away team quarter scores (${awayQuarterSum}) don't match final score (${game.awayTeam.score})`,
      fieldPath: 'quarterScores',
      severity: 'error',
    });
  }

  // Validate expected number of quarters (4 regular + OT if applicable)
  const expectedQuarters = game.overtime ? 5 : 4;
  if (game.quarterScores.length !== expectedQuarters) {
    errors.push({
      code: 'UNEXPECTED_QUARTER_COUNT',
      message: `Expected ${expectedQuarters} quarters, found ${game.quarterScores.length}`,
      fieldPath: 'quarterScores',
      severity: 'warning',
    });
  }

  return errors;
}

/**
 * Check if date string is valid
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Get severity counts from validation errors
 */
export function getErrorCounts(errors: ValidationError[]): {
  errors: number;
  warnings: number;
} {
  return {
    errors: errors.filter((e) => e.severity === 'error').length,
    warnings: errors.filter((e) => e.severity === 'warning').length,
  };
}

/**
 * Check if validation passed (no errors, warnings are OK)
 */
export function validationPassed(errors: ValidationError[]): boolean {
  return errors.filter((e) => e.severity === 'error').length === 0;
}
