export interface Team {
  name: string;
  city: string;
  classification: string;
}

export interface TeamWithRecord extends Team {
  record: string;
}

export interface Game {
  id: string;
  date: string;
  sport: string;
  gender: string | null;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  source: string | null;
}

export interface GameWithRecords extends Omit<Game, 'homeTeam' | 'awayTeam'> {
  homeTeam: TeamWithRecord;
  awayTeam: TeamWithRecord;
}

export interface WeeklyGamesResponse {
  startDate: string;
  endDate: string;
  totalGames: number;
  games: Game[];
}

export interface TopMatchupsResponse {
  games: GameWithRecords[];
}
