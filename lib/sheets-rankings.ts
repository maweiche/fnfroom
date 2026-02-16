export interface SheetRanking {
  rank: number;
  team: string;
  location: string;
  record: string;
  wins: number;
  losses: number;
  ties: number;
  rating: number | null;
  strength: number | null;
  movement: "up" | "down" | "steady" | "new";
  movementValue: number;
}

interface SheetRankingRaw {
  rank: number;
  team: string;
  location: string;
  record: string;
  rating: number | null;
  strength: number | null;
  movement: string;
  movementValue: number;
}

interface SingleSportResponse {
  sport: string;
  updatedAt: string;
  count: number;
  rankings: SheetRankingRaw[];
}

type AllSportsResponse = Record<string, SingleSportResponse>;

function parseRecord(record: string): {
  wins: number;
  losses: number;
  ties: number;
} {
  const parts = record.split("-").map((p) => parseInt(p.trim(), 10));
  return {
    wins: parts[0] || 0,
    losses: parts[1] || 0,
    ties: parts[2] || 0,
  };
}

function normalizeMovement(m: string): SheetRanking["movement"] {
  if (m === "up" || m === "down" || m === "steady" || m === "new") return m;
  return "steady";
}

function toSheetRanking(raw: SheetRankingRaw): SheetRanking {
  const { wins, losses, ties } = parseRecord(raw.record);
  return {
    rank: raw.rank,
    team: raw.team,
    location: raw.location,
    record: raw.record,
    wins,
    losses,
    ties,
    rating: raw.rating,
    strength: raw.strength,
    movement: normalizeMovement(raw.movement),
    movementValue: raw.movementValue,
  };
}

const scriptUrl = process.env.GOOGLE_RANKINGS_SCRIPT_URL;

export async function getSheetRankings(
  sport: string
): Promise<SheetRanking[]> {
  if (!scriptUrl) return [];

  try {
    const res = await fetch(`${scriptUrl}?sport=${sport}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data: SingleSportResponse = await res.json();
    return (data.rankings || []).map(toSheetRanking);
  } catch {
    return [];
  }
}

export async function getAllSheetRankings(): Promise<
  Record<string, SheetRanking[]>
> {
  if (!scriptUrl) return {};

  try {
    const res = await fetch(`${scriptUrl}?sport=all`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return {};
    const data: AllSportsResponse = await res.json();
    const result: Record<string, SheetRanking[]> = {};
    for (const [sport, payload] of Object.entries(data)) {
      result[sport] = (payload.rankings || []).map(toSheetRanking);
    }
    return result;
  } catch {
    return {};
  }
}
