"use client";

import { useState, useEffect } from "react";
import { PlayerCard } from "@/components/player-card";
import type { Player } from "@/lib/sanity.types";
import type { Sport } from "@/lib/sanity.types";

export default function RecruitingBoardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<Sport | "all">("all");
  const [gradYearFilter, setGradYearFilter] = useState<number | "all">("all");

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("/api/players");
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter((player) => {
    const matchesSport = sportFilter === "all" || player.sport === sportFilter;
    const matchesGradYear =
      gradYearFilter === "all" || player.gradYear === gradYearFilter;
    return matchesSport && matchesGradYear;
  });

  const sportOptions: Array<{ value: Sport | "all"; label: string }> = [
    { value: "all", label: "All Sports" },
    { value: "basketball", label: "Basketball" },
    { value: "football", label: "Football" },
    { value: "lacrosse", label: "Lacrosse" },
  ];

  // Get unique grad years from players
  const gradYears = Array.from(new Set(players.map((p) => p.gradYear))).sort(
    (a, b) => a - b
  );

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Recruiting Board
        </h1>
        <p className="text-lg text-secondary">
          NC prep athletes with college potential
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label
            htmlFor="sport-filter"
            className="text-sm text-secondary mb-2 block"
          >
            Filter by Sport
          </label>
          <select
            id="sport-filter"
            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value as Sport | "all")}
          >
            {sportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="gradyear-filter"
            className="text-sm text-secondary mb-2 block"
          >
            Filter by Graduation Year
          </label>
          <select
            id="gradyear-filter"
            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={gradYearFilter}
            onChange={(e) =>
              setGradYearFilter(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
          >
            <option value="all">All Classes</option>
            {gradYears.map((year) => (
              <option key={year} value={year}>
                Class of {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="mb-6 text-sm text-secondary">
          Showing {filteredPlayers.length} of {players.length} players
        </div>
      )}

      {/* Player Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-secondary">Loading players...</p>
        </div>
      ) : filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player._id} player={player} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-card border border-border rounded-lg">
          <p className="text-secondary mb-4">
            {players.length === 0
              ? "No players in the recruiting board yet."
              : "No players match your filters."}
          </p>
          {players.length === 0 ? (
            <p className="text-sm text-muted">
              Add player profiles through{" "}
              <a
                href="/studio"
                className="text-primary hover:underline font-medium"
              >
                Sanity Studio
              </a>
            </p>
          ) : (
            <button
              onClick={() => {
                setSportFilter("all");
                setGradYearFilter("all");
              }}
              className="text-sm text-primary hover:underline font-medium"
            >
              Clear filters to see all players
            </button>
          )}
        </div>
      )}
    </div>
  );
}
