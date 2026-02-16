"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollapsibleSection } from "./collapsible-section";

export interface RosterPlayer {
  jerseyNumber: string | null;
  firstName: string;
  lastName: string;
  position: string | null;
  grade: string | null;
  heightFeet: number | null;
  heightInches: number | null;
  weight: number | null;
  collegeName: string | null;
  collegeDivision: string | null;
}

interface TeamRosterProps {
  players: RosterPlayer[];
  season: string;
}

const gradeColors: Record<string, string> = {
  SR: "bg-spotlight-gold/20 text-spotlight-gold",
  JR: "bg-info/20 text-info",
  SO: "bg-success/20 text-success",
  FR: "bg-muted/20 text-muted",
};

function formatHeight(feet: number | null, inches: number | null): string | null {
  if (feet === null) return null;
  return `${feet}'${inches ?? 0}"`;
}

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return null;
  return (
    <span
      className={cn(
        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
        gradeColors[grade] || "bg-muted/20 text-muted"
      )}
    >
      {grade}
    </span>
  );
}

export function TeamRoster({ players, season }: TeamRosterProps) {
  const hasPlayers = players.length > 0;

  return (
    <CollapsibleSection
      title="Roster"
      badge={hasPlayers ? players.length : undefined}
      defaultOpen={hasPlayers}
    >
      {!hasPlayers ? (
        <div className="text-center py-10">
          <Users className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-secondary text-sm">
            Roster not yet available for the {season} season.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/5">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide w-14">
                    #
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide w-16">
                    Pos
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide w-16">
                    Grade
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide w-16">
                    Ht
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide w-16">
                    Wt
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">
                    College
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {players.map((p, i) => {
                  const ht = formatHeight(p.heightFeet, p.heightInches);
                  return (
                    <tr key={i} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold tabular-nums text-foreground">
                        {p.jerseyNumber ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-foreground">
                        {p.firstName} {p.lastName}
                      </td>
                      <td className="px-4 py-2.5 text-secondary">
                        {p.position || "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <GradeBadge grade={p.grade} />
                      </td>
                      <td className="px-4 py-2.5 font-mono tabular-nums text-secondary">
                        {ht || "—"}
                      </td>
                      <td className="px-4 py-2.5 font-mono tabular-nums text-secondary">
                        {p.weight ? `${p.weight}` : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        {p.collegeName ? (
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-medium">
                              {p.collegeName}
                            </span>
                            {p.collegeDivision && (
                              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">
                                {p.collegeDivision}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
            {players.map((p, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3 min-h-[44px]">
                {/* Jersey badge */}
                <span className="w-8 h-8 flex items-center justify-center rounded bg-muted/10 font-mono font-bold tabular-nums text-sm text-foreground flex-shrink-0">
                  {p.jerseyNumber ?? "—"}
                </span>

                {/* Name + position */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.position && (
                      <span className="text-xs text-muted">{p.position}</span>
                    )}
                    {p.collegeName && (
                      <>
                        <span className="text-border">|</span>
                        <span className="text-xs text-primary truncate">
                          {p.collegeName}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Grade pill */}
                <GradeBadge grade={p.grade} />
              </div>
            ))}
          </div>
        </>
      )}
    </CollapsibleSection>
  );
}
