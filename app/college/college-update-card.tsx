"use client";

import { motion } from "framer-motion";

const SPORT_COLORS = {
  basketball: "#D97B34",
  football: "#2d5a3d",
  lacrosse: "#1e3a5f",
};

type CollegeUpdate = {
  id: string;
  playerName: string;
  position: string;
  college: string;
  division: string;
  sport: "basketball" | "football" | "lacrosse";
  highSchool: string;
  classYear: string;
  update: string;
  stats: string;
  gameDate: string;
  image: string | null;
};

export function CollegeUpdateCard({ update }: { update: CollegeUpdate }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Sport Badge */}
      <div
        className="h-1"
        style={{
          backgroundColor: SPORT_COLORS[update.sport],
        }}
      />

      <div className="p-6">
        {/* Player Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {update.playerName}
            </h3>
            <p className="text-sm text-secondary">
              {update.position} • {update.college}
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-muted/20 text-muted font-medium">
            {update.division}
          </span>
        </div>

        {/* Update Content */}
        <p className="text-sm text-foreground mb-4">{update.update}</p>

        {/* Stats */}
        {update.stats && (
          <div className="mb-4 p-3 rounded bg-muted/10 border border-border">
            <p className="font-mono text-sm font-semibold text-foreground tabular-nums">
              {update.stats}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted">
            {update.highSchool} &apos;{update.classYear.slice(-2)}
          </span>
          <time className="text-xs text-muted">
            {new Date(update.gameDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </time>
        </div>
      </div>
    </motion.article>
  );
}
