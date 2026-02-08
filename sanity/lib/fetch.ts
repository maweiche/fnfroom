import { client } from "./client";
import type { Article, StaffMember, Rankings } from "@/lib/sanity.types";
import {
  articlesQuery,
  latestArticlesQuery,
  featuredArticleQuery,
  featuredArticleBySportQuery,
  articleBySlugQuery,
  articlesBySportQuery,
  relatedArticlesQuery,
  staffMembersQuery,
  staffMemberBySlugQuery,
  latestRankingsBySportQuery,
  rankingsBySportQuery,
  latestRankingsForSportQuery,
  rankingsBySportAndSeasonQuery,
} from "./queries";

/**
 * Fetch all articles
 */
export async function getArticles(): Promise<Article[]> {
  return client.fetch(articlesQuery, {}, { next: { revalidate: 60 } });
}

/**
 * Fetch latest N articles
 */
export async function getLatestArticles(limit: number = 6): Promise<Article[]> {
  return client.fetch(
    latestArticlesQuery(limit),
    {},
    { next: { revalidate: 60 } }
  );
}

/**
 * Fetch featured article
 */
export async function getFeaturedArticle(): Promise<Article | null> {
  return client.fetch(featuredArticleQuery, {}, { next: { revalidate: 60 } });
}

/**
 * Fetch featured article for a specific sport
 */
export async function getFeaturedArticleBySport(
  sport: "basketball" | "football" | "lacrosse"
): Promise<Article | null> {
  return client.fetch(
    featuredArticleBySportQuery,
    { sport },
    { next: { revalidate: 60 } }
  );
}

/**
 * Fetch article by slug
 */
export async function getArticleBySlug(
  slug: string
): Promise<Article | null> {
  return client.fetch(articleBySlugQuery, { slug }, { cache: "no-store" });
}

/**
 * Fetch articles by sport
 */
export async function getArticlesBySport(
  sport: "basketball" | "football" | "lacrosse"
): Promise<Article[]> {
  return client.fetch(
    articlesBySportQuery,
    { sport },
    { next: { revalidate: 60 } }
  );
}

/**
 * Fetch related articles (same sport)
 */
export async function getRelatedArticles(
  sport: "basketball" | "football" | "lacrosse",
  currentId: string
): Promise<Article[]> {
  return client.fetch(
    relatedArticlesQuery,
    { sport, currentId },
    { next: { revalidate: 60 } }
  );
}

/**
 * Fetch all staff members
 */
export async function getStaffMembers(): Promise<StaffMember[]> {
  return client.fetch(staffMembersQuery, {}, { next: { revalidate: 3600 } });
}

/**
 * Fetch staff member by slug
 */
export async function getStaffMemberBySlug(
  slug: string
): Promise<StaffMember | null> {
  return client.fetch(
    staffMemberBySlugQuery,
    { slug },
    { next: { revalidate: 3600 } }
  );
}

/**
 * Fetch latest rankings for all sports
 */
export async function getLatestRankingsBySport(): Promise<{
  basketball: Rankings | null;
  football: Rankings | null;
  lacrosse: Rankings | null;
}> {
  return client.fetch(
    latestRankingsBySportQuery,
    {},
    { next: { revalidate: 300 } }
  );
}

/**
 * Fetch all rankings for a specific sport
 */
export async function getRankingsBySport(
  sport: "basketball" | "football" | "lacrosse"
): Promise<Rankings[]> {
  return client.fetch(
    rankingsBySportQuery,
    { sport },
    { next: { revalidate: 300 } }
  );
}

/**
 * Fetch latest rankings for a specific sport
 */
export async function getLatestRankingsForSport(
  sport: "basketball" | "football" | "lacrosse"
): Promise<Rankings | null> {
  return client.fetch(
    latestRankingsForSportQuery,
    { sport },
    { next: { revalidate: 300 } }
  );
}

/**
 * Fetch rankings by sport and season
 */
export async function getRankingsBySportAndSeason(
  sport: "basketball" | "football" | "lacrosse",
  season: string
): Promise<Rankings[]> {
  return client.fetch(
    rankingsBySportAndSeasonQuery,
    { sport, season },
    { next: { revalidate: 300 } }
  );
}
