"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Clock } from "lucide-react";
import { FilterToggle, FilterDropdown } from "./filter-toggle";

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  gender: "boys" | "girls";
  date: string;
  time: string;
  venue: string;
}

interface UpcomingGamesProps {
  games?: Game[];
}

export function UpcomingGames({ games = [] }: UpcomingGamesProps) {
  const [genderFilter, setGenderFilter] = useState<string>("Boys");
  const [sportFilter, setSportFilter] = useState<string>("all");

  // Placeholder games if none provided
  const placeholderGames: Game[] = [
    {
      id: "1",
      homeTeam: "Green Hope",
      awayTeam: "Cary",
      sport: "Basketball",
      gender: "boys",
      date: "Feb 10, 2026",
      time: "7:00 PM",
      venue: "Green Hope HS",
    },
    {
      id: "2",
      homeTeam: "Cardinal Gibbons",
      awayTeam: "Millbrook",
      sport: "Basketball",
      gender: "boys",
      date: "Feb 11, 2026",
      time: "6:30 PM",
      venue: "Cardinal Gibbons HS",
    },
    {
      id: "3",
      homeTeam: "Leesville Road",
      awayTeam: "Broughton",
      sport: "Basketball",
      gender: "girls",
      date: "Feb 10, 2026",
      time: "5:30 PM",
      venue: "Leesville Road HS",
    },
    {
      id: "4",
      homeTeam: "Wake Forest",
      awayTeam: "Heritage",
      sport: "Football",
      gender: "boys",
      date: "Feb 12, 2026",
      time: "7:30 PM",
      venue: "Wake Forest HS",
    },
  ];

  const displayGames = games.length > 0 ? games : placeholderGames;

  // Filter games based on selected filters
  const filteredGames = displayGames.filter((game) => {
    const matchesGender = game.gender === genderFilter.toLowerCase();
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
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <div
              key={game.id}
              className="rounded-lg border border-border bg-card p-6 hover:shadow-card transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-display font-bold text-lg">
                    {game.homeTeam}
                  </div>
                  <div className="text-muted text-sm mt-1">vs</div>
                  <div className="font-display font-bold text-lg">
                    {game.awayTeam}
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                  {game.sport}
                </span>
              </div>

              <div className="space-y-2 mt-4 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{game.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{game.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{game.venue}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted">No games found for the selected filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}
