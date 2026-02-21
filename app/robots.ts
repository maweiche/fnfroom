import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fridaynightfilmroom.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/studio/", "/api/", "/scoresnap/", "/pressbox/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
