"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SportTag } from "./sport-tag";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import type { Sport } from "@/lib/sanity.types";

interface RankingEntry {
  rank: number;
  team: string;
  record: string;
  trend: "up" | "down" | "steady";
}

interface SportRankings {
  sport: Sport;
  entries: RankingEntry[];
  lastUpdated: string;
}

interface RankingsSnapshotProps {
  rankings: SportRankings[];
}

export function RankingsSnapshot({ rankings }: RankingsSnapshotProps) {
  if (rankings.length === 0) {
    return null;
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-error" />;
      default:
        return <Minus className="w-4 h-4 text-muted" />;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container-content">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Current Rankings
              </h2>
              <p className="text-secondary mt-2 text-lg">
                Top 5 teams across all sports
              </p>
            </div>
            <Link
              href="/rankings"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-cloud-gray border border-border rounded-lg font-medium transition-all duration-200 group"
            >
              View Full Rankings
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 w-24 bg-primary mt-4 origin-left rounded-full"
          />
        </motion.div>

        {/* Rankings Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {rankings.map((sportRanking) => (
            <motion.div
              key={sportRanking.sport}
              variants={item}
              className="group"
            >
              <Link href={`/rankings/${sportRanking.sport}`}>
                <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card-hover transition-all duration-300 h-full">
                  {/* Sport Header */}
                  <div className="p-4 bg-gradient-to-br from-cloud-gray/50 to-transparent border-b border-border">
                    <div className="flex items-center justify-between">
                      <SportTag sport={sportRanking.sport} />
                      <span className="text-xs text-muted">
                        Updated {sportRanking.lastUpdated}
                      </span>
                    </div>
                  </div>

                  {/* Rankings Table */}
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr className="text-xs uppercase tracking-wide text-secondary">
                          <th className="text-left pb-2 font-semibold w-12">Rank</th>
                          <th className="text-left pb-2 font-semibold">Team</th>
                          <th className="text-right pb-2 font-semibold w-20">Record</th>
                          <th className="text-center pb-2 font-semibold w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sportRanking.entries.slice(0, 5).map((entry) => (
                          <tr
                            key={entry.rank}
                            className="border-b border-border/50 last:border-0 hover:bg-cloud-gray/30 transition-colors"
                          >
                            <td className="py-3 font-mono tabular-nums font-bold text-primary">
                              {entry.rank}
                            </td>
                            <td className="py-3 font-medium truncate pr-2">
                              {entry.team}
                            </td>
                            <td className="py-3 font-mono tabular-nums text-right text-secondary">
                              {entry.record}
                            </td>
                            <td className="py-3 text-center">
                              {getTrendIcon(entry.trend)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* View Full Link */}
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-sm text-secondary group-hover:text-foreground transition-colors">
                        <span>View full rankings</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 lg:hidden text-center"
        >
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-cloud-gray border border-border rounded-lg font-medium transition-all duration-200"
          >
            View Full Rankings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
