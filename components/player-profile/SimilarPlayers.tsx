import { PlayerCard } from "@/components/player-card";
import type { Player } from "@/lib/sanity.types";

interface SimilarPlayersProps {
  players: Player[];
  currentPlayerId: string;
}

export function SimilarPlayers({ players, currentPlayerId }: SimilarPlayersProps) {
  // Filter out current player (extra safety)
  const filteredPlayers = players.filter((p) => p._id !== currentPlayerId);

  if (filteredPlayers.length === 0) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Similar Players</h3>
      <div className="grid grid-cols-1 gap-4">
        {filteredPlayers.slice(0, 4).map((player) => (
          <PlayerCard key={player._id} player={player} />
        ))}
      </div>
    </div>
  );
}
