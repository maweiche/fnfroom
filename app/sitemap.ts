import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fridaynightfilmroom.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/basketball`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/football`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/lacrosse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/rankings`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/rankings/basketball`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/rankings/football`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/rankings/lacrosse`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/recruiting`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/college`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/video`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/beer-cooler`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/staff`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic article pages from Sanity
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await client.fetch<Array<{ sport: string; slug: string; publishDate: string }>>(
      `*[_type == "article" && defined(slug.current)] | order(publishDate desc) {
        sport,
        "slug": slug.current,
        publishDate
      }`
    );

    articlePages = articles.map((article) => ({
      url: `${siteUrl}/${article.sport}/${article.slug}`,
      lastModified: new Date(article.publishDate),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap: failed to fetch articles", error);
  }

  // Dynamic video pages from Sanity
  let videoPages: MetadataRoute.Sitemap = [];
  try {
    const videos = await client.fetch<Array<{ slug: string; publishDate: string }>>(
      `*[_type == "video" && defined(slug.current)] | order(publishDate desc) {
        "slug": slug.current,
        publishDate
      }`
    );

    videoPages = videos.map((video) => ({
      url: `${siteUrl}/video/${video.slug}`,
      lastModified: new Date(video.publishDate),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error("Sitemap: failed to fetch videos", error);
  }

  return [...staticPages, ...articlePages, ...videoPages];
}
