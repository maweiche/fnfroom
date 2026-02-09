"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Grid, List } from "lucide-react";
import { ArticleCard } from "./article-card";
import { FilterToggle, FilterDropdown } from "./filter-toggle";
import type { Article, Sport } from "@/lib/sanity.types";

interface ArticlesGridProps {
  articles: Article[];
  title?: string;
  priority?: boolean;
  showFilters?: boolean;
}

export function ArticlesGrid({
  articles,
  title = "Latest Stories",
  priority = false,
  showFilters = false
}: ArticlesGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [trendFilter, setTrendFilter] = useState<string>("Latest");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
        ease: "easeOut" as const,
      },
    },
  };

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    if (sportFilter === "all") return true;
    return article.sport === sportFilter;
  });

  if (articles.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-cloud-gray/20 dark:to-transparent">
        <div className="container-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">{title}</h2>
            <div className="p-12 text-center bg-card border border-border rounded-lg shadow-sm">
              <p className="text-foreground mb-2 font-medium">
                No articles published yet
              </p>
              <p className="text-muted text-sm">
                Check back soon for the latest coverage.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-cloud-gray/20 dark:to-transparent">
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {title}
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-1 w-24 bg-primary mt-3 origin-left rounded-full"
              />
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-3">
                {/* Latest/Trending Toggle */}
                <FilterToggle
                  options={["Latest", "Trending"]}
                  activeOption={trendFilter}
                  onChange={setTrendFilter}
                />

                {/* Sport Filter */}
                <FilterDropdown
                  label="Filter by Sport"
                  options={["Basketball", "Football", "Lacrosse"]}
                  activeOption={sportFilter}
                  onChange={setSportFilter}
                />

                {/* Grid/List Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors duration-150 ${
                      viewMode === "grid"
                        ? "bg-primary text-primary-dark"
                        : "text-muted hover:text-foreground"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors duration-150 ${
                      viewMode === "list"
                        ? "bg-primary text-primary-dark"
                        : "text-muted hover:text-foreground"
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              : "flex flex-col gap-4"
          }
        >
          {filteredArticles.map((article, index) => (
            <motion.div key={article._id} variants={item}>
              <ArticleCard
                article={article}
                priority={priority && index < 3}
                listView={viewMode === "list"}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
