"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Trophy, MapPin, Filter } from "lucide-react";
import type { Sport } from "@/lib/utils";

interface Team {
  id: string;
  key: string | null;
  name: string;
  city: string | null;
  classification: string | null;
  conference: string | null;
  rank: number | null;
  wins: number;
  losses: number;
  ties: number;
  rating: number | null;
  season: string | null;
}

interface TeamsGridProps {
  teams: Team[];
  sport: Sport;
  classifications: string[];
  conferences: string[];
}

const sportAccentClasses: Record<Sport, { bg: string; text: string; border: string; badge: string }> = {
  basketball: {
    bg: "bg-[#D97B34]/10",
    text: "text-[#D97B34]",
    border: "border-[#D97B34]/30",
    badge: "bg-[#D97B34]",
  },
  football: {
    bg: "bg-[#2d5a3d]/10 dark:bg-[#4c8a5f]/10",
    text: "text-[#2d5a3d] dark:text-[#4c8a5f]",
    border: "border-[#2d5a3d]/30 dark:border-[#4c8a5f]/30",
    badge: "bg-[#2d5a3d] dark:bg-[#4c8a5f]",
  },
  lacrosse: {
    bg: "bg-[#1e3a5f]/10 dark:bg-[#4a6b9e]/10",
    text: "text-[#1e3a5f] dark:text-[#4a6b9e]",
    border: "border-[#1e3a5f]/30 dark:border-[#4a6b9e]/30",
    badge: "bg-[#1e3a5f] dark:bg-[#4a6b9e]",
  },
};

export function TeamsGrid({
  teams,
  sport,
  classifications,
  conferences,
}: TeamsGridProps) {
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState("");
  const [conference, setConference] = useState("");
  const accent = sportAccentClasses[sport];

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        !search ||
        team.name.toLowerCase().includes(search.toLowerCase()) ||
        team.city?.toLowerCase().includes(search.toLowerCase());
      const matchesClass =
        !classification || team.classification === classification;
      const matchesConf = !conference || team.conference === conference;
      return matchesSearch && matchesClass && matchesConf;
    });
  }, [teams, search, classification, conference]);

  const hasActiveFilters = search || classification || conference;

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search teams by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-muted hidden md:block" />

          {classifications.length > 0 && (
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Classifications</option>
              {classifications.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {conferences.length > 0 && (
            <select
              value={conference}
              onChange={(e) => setConference(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Conferences</option>
              {conferences.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setClassification("");
                setConference("");
              }}
              className="px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-sm text-muted tabular-nums font-mono">
            {filteredTeams.length} team{filteredTeams.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 border-b border-border bg-muted/5">
          <div className="col-span-1 text-xs font-semibold text-muted uppercase tracking-wide">
            Rank
          </div>
          <div className="col-span-4 text-xs font-semibold text-muted uppercase tracking-wide">
            Team
          </div>
          <div className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide">
            Record
          </div>
          <div className="col-span-2 text-xs font-semibold text-muted uppercase tracking-wide">
            Classification
          </div>
          <div className="col-span-3 text-xs font-semibold text-muted uppercase tracking-wide">
            Conference
          </div>
        </div>

        {/* Team Rows */}
        {filteredTeams.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredTeams.map((team) => {
              const rowContent = (
                <>
                {/* Desktop Row */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                  {/* Rank */}
                  <div className="col-span-1">
                    {team.rank ? (
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold font-mono tabular-nums ${
                          team.rank <= 10
                            ? `${accent.bg} ${accent.text}`
                            : "text-secondary"
                        }`}
                      >
                        {team.rank}
                      </span>
                    ) : (
                      <span className="text-muted text-sm">—</span>
                    )}
                  </div>

                  {/* Team Name + City */}
                  <div className="col-span-4">
                    <div className="font-semibold text-foreground">
                      {team.name}
                    </div>
                    {team.city && (
                      <div className="flex items-center gap-1 text-xs text-muted mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {team.city}
                      </div>
                    )}
                  </div>

                  {/* Record */}
                  <div className="col-span-2">
                    {team.rank ? (
                      <span className="font-mono tabular-nums text-sm font-medium">
                        {team.wins}-{team.losses}
                        {team.ties > 0 ? `-${team.ties}` : ""}
                      </span>
                    ) : (
                      <span className="text-muted text-sm">—</span>
                    )}
                  </div>

                  {/* Classification */}
                  <div className="col-span-2">
                    {team.classification ? (
                      <span className="text-sm text-secondary">
                        {team.classification}
                      </span>
                    ) : (
                      <span className="text-muted text-sm">—</span>
                    )}
                  </div>

                  {/* Conference */}
                  <div className="col-span-3">
                    {team.conference ? (
                      <span className="text-sm text-secondary truncate block">
                        {team.conference}
                      </span>
                    ) : (
                      <span className="text-muted text-sm">—</span>
                    )}
                  </div>
                </div>

                {/* Mobile Row */}
                <div className="md:hidden flex items-start gap-3">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-10">
                    {team.rank ? (
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold font-mono tabular-nums ${
                          team.rank <= 10
                            ? `${accent.bg} ${accent.text}`
                            : "text-secondary"
                        }`}
                      >
                        {team.rank}
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 text-muted text-sm">
                        —
                      </span>
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground truncate">
                        {team.name}
                      </span>
                      {team.rank ? (
                        <span className="font-mono tabular-nums text-sm font-medium flex-shrink-0">
                          {team.wins}-{team.losses}
                          {team.ties > 0 ? `-${team.ties}` : ""}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                      {team.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {team.city}
                        </span>
                      )}
                      {team.classification && (
                        <>
                          <span className="text-border">|</span>
                          <span>{team.classification}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                </>
              );
              return team.key ? (
                <Link
                  key={team.id + team.name}
                  href={`/${sport}/teams/${team.key}`}
                  className="block px-4 py-3 hover:bg-muted/5 transition-colors"
                >
                  {rowContent}
                </Link>
              ) : (
                <div
                  key={team.id + team.name}
                  className="px-4 py-3"
                >
                  {rowContent}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <Trophy className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-secondary mb-1">No teams found</p>
            <p className="text-sm text-muted">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
