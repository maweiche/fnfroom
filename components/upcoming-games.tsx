"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { FilterToggle, FilterDropdown } from "./filter-toggle";

interface Game {
  id: string;
  date: string;
  sport: string;
  gender: string | null;
  homeTeam: {
    name: string;
    city: string;
    classification: string;
  };
  awayTeam: {
    name: string;
    city: string;
    classification: string;
  };
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  source: string | null;
}

interface UpcomingGamesProps {
  games?: Game[];
}

export function UpcomingGames({ games: initialGames = [] }: UpcomingGamesProps) {
  const [genderFilter, setGenderFilter] = useState<string>("Boys");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [games, setGames] = useState<Game[]>(initialGames);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch("/api/games/weekly");
        if (response.ok) {
          const data = await response.json();
          setGames(data.games || []);
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setLoading(false);
      }
    }

    if (initialGames.length === 0) {
      fetchGames();
    } else {
      setLoading(false);
    }
  }, [initialGames.length]);

  // Filter games based on selected filters
  const filteredGames = games.filter((game) => {
    const matchesGender = !game.gender || game.gender.toLowerCase() === genderFilter.toLowerCase();
    const matchesSport = sportFilter === "all" || game.sport === sportFilter;
    return matchesGender && matchesSport;
  });

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      {/* Section Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h2 className="font-display font-bold text-3xl md:text-4xl">
          Upcoming Games
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Boys/Girls Toggle */}
          <FilterToggle
            options={["Boys", "Girls"]}
            activeOption={genderFilter}
            onChange={setGenderFilter}
          />

          {/* Sport Filter Dropdown */}
          <FilterDropdown
            label="Filter by Sport"
            options={["Basketball", "Football", "Lacrosse"]}
            activeOption={sportFilter}
            onChange={setSportFilter}
          />

          {/* View All Link */}
          <Link
            href="/schedule"
            className="h-10 px-4 flex items-center rounded-lg border border-border hover:border-primary text-foreground hover:text-primary font-medium text-sm transition-colors duration-150"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted">Loading games...</p>
          </div>
        ) : filteredGames.length > 0 ? (
          filteredGames.map((game) => {
            const gameDate = new Date(game.date);
            const formattedDate = gameDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={game.id}
                className="rounded-lg border border-border bg-card p-6 hover:shadow-card transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex-1">
                    <div className="font-display font-bold text-lg leading-tight">
                      {game.homeTeam.name}
                    </div>
                    <div className="text-muted text-sm mt-1">vs</div>
                    <div className="font-display font-bold text-lg leading-tight">
                      {game.awayTeam.name}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                      {game.sport}
                    </span>
                    {game.gender && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-secondary/10 text-secondary capitalize">
                        {game.gender}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4 text-sm text-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{game.homeTeam.city}</span>
                  </div>
                  {(game.homeTeam.classification || game.awayTeam.classification) && (
                    <div className="text-xs text-muted pt-2 border-t border-border/50">
                      <span>
                        {game.homeTeam.classification} vs {game.awayTeam.classification}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted">No games found for the selected filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}
