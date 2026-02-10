"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, Users, Calendar } from "lucide-react";

const STATS = [
  { icon: Users, label: "Players Tracked", value: "150+" },
  { icon: Award, label: "All-Conference", value: "24" },
  { icon: TrendingUp, label: "Avg PPG", value: "12.5" },
  { icon: Calendar, label: "Active Season", value: "2025-26" },
];

export function CollegeHero() {
  return (
    <section className="relative bg-gradient-to-b from-charcoal-black to-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              College Corner
            </h1>
            <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto">
              Tracking North Carolina prep athletes making their mark at the
              next level
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
        </div>
      </div>
    </section>
  );
}
