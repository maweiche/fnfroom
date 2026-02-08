"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { VideoCard } from "./video-card";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import type { Video } from "@/lib/sanity.types";

interface VideoSpotlightProps {
  videos: Video[];
}

export function VideoSpotlight({ videos }: VideoSpotlightProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

  if (videos.length === 0) {
    return null;
  }

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity, scale }}
      className="py-16 md:py-24 bg-navy-header text-white overflow-hidden"
    >
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4 border border-white/10"
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Video Highlights
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Watch the Action
              </h2>
              <p className="text-white/70 mt-2 text-lg">
                Game highlights, player spotlights, and exclusive coverage
              </p>
            </div>
            <Link
              href="/video"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 font-medium transition-all duration-200 group"
            >
              View All
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

        {/* Horizontal Scroll Container */}
        <div className="relative -mx-4 md:mx-0">
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto pb-4 px-4 md:px-0 snap-x snap-mandatory scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {videos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-none w-[85vw] md:w-[400px] snap-start"
              >
                <VideoCard video={video} />
              </motion.div>
            ))}
          </div>

          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-navy-header to-transparent pointer-events-none md:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-navy-header to-transparent pointer-events-none md:hidden" />
        </div>

        {/* Mobile View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 md:hidden text-center"
        >
          <Link
            href="/video"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 font-medium transition-all duration-200"
          >
            View All Videos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.section>
  );
}
