"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, ChevronDown } from "lucide-react";
import { SportTag } from "./sport-tag";
import Link from "next/link";
import type { Article } from "@/lib/sanity.types";

interface VideoHeroProps {
  article?: Article;
  videoPlaybackId?: string;
}

export function VideoHero({ article, videoPlaybackId }: VideoHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const { scrollY } = useScroll();

  // Parallax effect for video and content
  const videoY = useTransform(scrollY, [0, 800], [0, 200]);
  const contentY = useTransform(scrollY, [0, 800], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, []);

  const scrollToContent = () => {
    heroRef.current?.nextElementSibling?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div ref={heroRef} className="relative h-screen w-full overflow-hidden">
      {/* Mux Video Background */}
      <motion.div
        style={{ y: videoY }}
        className="absolute inset-0 w-full h-[120%]"
      >
        {videoPlaybackId ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onLoadedData={() => setIsVideoLoaded(true)}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source
                src={`https://stream.mux.com/${videoPlaybackId}/high.mp4`}
                type="video/mp4"
              />
            </video>

            {/* Loading state */}
            {!isVideoLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-navy-header via-slate-800 to-slate-900 animate-pulse" />
            )}
          </>
        ) : (
          // Fallback gradient
          <div className="absolute inset-0 bg-gradient-to-br from-navy-header via-slate-800 to-slate-900">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-basketball/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-football/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>
          </div>
        )}

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative h-full flex flex-col justify-end md:justify-center pb-32 md:pb-24"
      >
        <div className="container-content">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl"
          >
            {article ? (
              <Link href={`/${article.sport}/${article.slug.current}`}>
                <article className="group cursor-pointer">
                  {/* Sport tag */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-4"
                  >
                    <SportTag sport={article.sport} />
                  </motion.div>

                  {/* Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight group-hover:text-primary transition-colors duration-300"
                  >
                    {article.title}
                  </motion.h1>

                  {/* Meta */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex items-center gap-4 text-white/90"
                  >
                    <span className="font-medium">{article.author.name}</span>
                    <span className="w-1 h-1 rounded-full bg-white/60" />
                    <time className="text-sm">
                      {new Date(article.publishDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="ml-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-sm font-medium group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300"
                    >
                      Read Story
                    </motion.div>
                  </motion.div>
                </article>
              </Link>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="mb-6"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full text-primary text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Live Coverage
                  </span>
                </motion.div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[0.95] tracking-tight">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    Friday Night
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-primary"
                  >
                    Film Room
                  </motion.div>
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl"
                >
                  North Carolina high school sports coverage.
                  <br />
                  <span className="text-white/70">Basketball • Football • Lacrosse</span>
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    href="/video"
                    className="group inline-flex items-center gap-3 px-6 py-4 bg-primary text-primary-dark font-semibold rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Play className="w-5 h-5" fill="currentColor" />
                    Watch Highlights
                  </Link>
                  <Link
                    href="/rankings"
                    className="inline-flex items-center justify-center px-6 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
                  >
                    View Rankings
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-colors group"
        aria-label="Scroll to content"
      >
        <span className="text-xs uppercase tracking-wider font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
}
