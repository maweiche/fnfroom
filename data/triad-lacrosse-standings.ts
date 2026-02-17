/**
 * Triad Adult Lacrosse League Standings
 *
 * Update this file to change the standings table on the Beer Cooler page.
 *
 * Instructions:
 * 1. Update team records (wins, losses)
 * 2. Update goals for (gf) and goals against (ga)
 * 3. Teams are displayed in order (rank 1-N)
 * 4. Season label can be changed below
 */

export interface TeamStanding {
  rank: number;
  team: string;
  wins: number;
  losses: number;
  gf: number; // Goals For
  ga: number; // Goals Against
}

export const CURRENT_SEASON = "Regular Season"; // or "Playoffs", "Championship", etc.

export const STANDINGS: TeamStanding[] = [
  {
    rank: 1,
    team: "Titans",
    wins: 2,
    losses: 0,
    gf: 45,
    ga: 36,
  },
  {
    rank: 2,
    team: "Storm",
    wins: 2,
    losses: 0,
    gf: 33,
    ga: 27,
  },
  {
    rank: 3,
    team: "NightHawks",
    wins: 0,
    losses: 2,
    gf: 29,
    ga: 35,
  },
  {
    rank: 4,
    team: "Grinders",
    wins: 0,
    losses: 2,
    gf: 34,
    ga: 43,
  },
];

/**
 * TEAM ROSTER REFERENCE
 *
 * Teams in the Triad Adult Lacrosse League:
 * 1. Titans
 * 2. Storm
 * 3. NightHawks
 * 4. Grinders
 *
 * Add new teams by adding entries to the STANDINGS array above.
 * Keep rank numbers sequential (1, 2, 3, etc.)
 */
