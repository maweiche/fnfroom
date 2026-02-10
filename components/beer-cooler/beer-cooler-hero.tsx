"use client";

import { motion } from "framer-motion";
import { Beer, Users, Trophy, Calendar } from "lucide-react";

const STATS = [
  { icon: Users, label: "Teams", value: "4" },
  { icon: Trophy, label: "Championships", value: "1" },
  { icon: Beer, label: "Post-Game Brews", value: "∞" },
  { icon: Calendar, label: "Games This Season", value: "24" },
];

export function BeerCoolerHero() {
  return (
    <section className="relative bg-gradient-to-b from-charcoal-black to-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <Beer className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                Beer Cooler
              </h1>
            </div>
            <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto">
              Super Serious Adult Lacrosse League coverage.
            </p>
            <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto">
              NCF Men's League Unofficial News Source.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
          >
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="bg-card rounded-lg p-4 border border-border"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="font-mono text-2xl font-bold text-foreground tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs text-secondary mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <p className="text-xs italic text-secondary max-w-2xl mx-auto mt-4">
            * All stats are unofficial, no one keeps track of this stuff. We just make it up.
          </p>
        </div>
      </div>
    </section>
  );
}
