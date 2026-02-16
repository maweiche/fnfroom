export interface ScoreboardTeam {
  name: string | null;
  key: string | null;
}

export interface ScoreboardGame {
  id: string;
  date: string;
  sport: string;
  status: string | null;
  homeTeam: ScoreboardTeam;
  awayTeam: ScoreboardTeam;
  homeScore: number | null;
  awayScore: number | null;
  gameTime: string | null;
  overtime: boolean;
}
