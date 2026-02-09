"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, MapPin, Grid, List } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
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
    <section className="container mx-auto px-4 py-12 md:py-16 bg-gradient-to-b from-transparent to-cloud-gray/20 dark:to-transparent">
      {/* Section Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
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

          {/* Grid/List Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors duration-150 ${
                viewMode === "grid"
                  ? "bg-primary text-primary-dark"
                  : "text-muted hover:text-foreground"
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors duration-150 ${
                viewMode === "list"
                  ? "bg-primary text-primary-dark"
                  : "text-muted hover:text-foreground"
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* View All Link */}
          <Link
            href="/schedule"
            className="h-10 px-4 flex items-center rounded-lg border border-border hover:border-primary text-foreground hover:text-primary font-medium text-sm transition-colors duration-150"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Games Grid/List */}
      <div className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "flex flex-col gap-3"
      }>
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

            if (viewMode === "list") {
              return (
                <div
                  key={game.id}
                  className="rounded-lg border border-border bg-card hover:bg-muted/5 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                    {/* Date Badge */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{formattedDate}</span>
                      </div>
                    </div>

                    {/* Teams */}
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 text-right">
                        <div className="font-display font-bold text-base text-foreground">
                          {game.homeTeam.name}
                        </div>
                        <div className="text-xs text-muted">{game.homeTeam.city}</div>
                      </div>
                      <div className="text-muted font-medium px-3">vs</div>
                      <div className="flex-1">
                        <div className="font-display font-bold text-base text-foreground">
                          {game.awayTeam.name}
                        </div>
                        <div className="text-xs text-muted">{game.awayTeam.city}</div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20">
                        {game.sport}
                      </span>
                      {game.gender && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted/50 text-foreground dark:bg-muted/30 capitalize">
                          {game.gender}
                        </span>
                      )}
                      {(game.homeTeam.classification || game.awayTeam.classification) && (
                        <span className="text-xs text-muted font-mono">
                          {game.homeTeam.classification} v {game.awayTeam.classification}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={game.id}
                className="rounded-lg border border-border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1">
                    <div className="font-display font-bold text-lg leading-tight text-foreground">
                      {game.homeTeam.name}
                    </div>
                    <div className="text-muted text-sm mt-2 font-medium">vs</div>
                    <div className="font-display font-bold text-lg leading-tight text-foreground mt-2">
                      {game.awayTeam.name}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                      {game.sport}
                    </span>
                    {game.gender && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted/50 text-foreground dark:bg-muted/30 capitalize">
                        {game.gender}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary">
                    <MapPin className="w-4 h-4" />
                    <span>{game.homeTeam.city}</span>
                  </div>
                  {(game.homeTeam.classification || game.awayTeam.classification) && (
                    <div className="text-xs text-muted pt-2 border-t border-border/50 font-mono">
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
          <div className="col-span-full text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted">No games found for the selected filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}
