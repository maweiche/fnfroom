"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ScoreboardGame } from "./scoreboard-types";
import { ScoreboardCard } from "./scoreboard-card";

export function ScoreboardTicker({ games }: { games: ScoreboardGame[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollable = el.scrollWidth > el.clientWidth + 1;
    setNeedsScroll(scrollable);
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  // Check scroll state on mount and resize
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // Auto-scroll
  useEffect(() => {
    if (!needsScroll || isHovered) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = 0;
      return;
    }

    const tick = (time: number) => {
      const el = scrollRef.current;
      if (!el) return;

      if (lastTimeRef.current) {
        const delta = (time - lastTimeRef.current) / 1000;
        el.scrollLeft += 30 * delta;

        // Reset when we reach the end
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      lastTimeRef.current = time;
      checkScroll();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [needsScroll, isHovered, checkScroll]);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsHovered(false), 3000);
        }}
        className={`flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide py-2 px-3 md:px-4 ${
          needsScroll ? "" : "justify-center"
        }`}
        style={{ scrollSnapType: "x mandatory" }}
      >
        {games.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: "easeOut" }}
          >
            <ScoreboardCard game={game} />
          </motion.div>
        ))}
      </div>

      {/* Left fade */}
      {needsScroll && canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-6 md:w-12 bg-gradient-to-r from-background/80 to-transparent pointer-events-none" />
      )}

      {/* Right fade */}
      {needsScroll && canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-6 md:w-12 bg-gradient-to-l from-background/80 to-transparent pointer-events-none" />
      )}

      {/* Arrow buttons (md+ only, on hover) */}
      {needsScroll && canScrollLeft && (
        <button
          onClick={() => scrollBy(-1)}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-card/60 backdrop-blur-sm border border-border/30 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {needsScroll && canScrollRight && (
        <button
          onClick={() => scrollBy(1)}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-card/60 backdrop-blur-sm border border-border/30 text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
