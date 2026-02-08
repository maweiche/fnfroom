"use client";

import { motion } from "framer-motion";
import { ArticleCard } from "./article-card";
import type { Article } from "@/lib/sanity.types";

interface ArticlesGridProps {
  articles: Article[];
  title?: string;
  priority?: boolean;
}

export function ArticlesGrid({ articles, title = "Latest Stories", priority = false }: ArticlesGridProps) {
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

  if (articles.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8">{title}</h2>
            <div className="p-12 text-center bg-card border border-border rounded-lg">
              <p className="text-secondary mb-4">
                No articles published yet. Check back soon for the latest coverage.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-cloud-gray/30">
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-bold">
              {title}
            </h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block text-sm text-secondary"
            >
              {articles.length} {articles.length === 1 ? "article" : "articles"}
            </motion.div>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-1 w-24 bg-primary mt-4 origin-left rounded-full"
          />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {articles.map((article, index) => (
            <motion.div key={article._id} variants={item}>
              <ArticleCard article={article} priority={priority && index < 3} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
