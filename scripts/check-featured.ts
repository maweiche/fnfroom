import { getFeaturedArticle } from "@/sanity/lib/fetch";

async function checkFeatured() {
  console.log("Checking featured article...");
  const featured = await getFeaturedArticle();

  if (featured) {
    console.log("✅ Featured article found:");
    console.log(`   Title: ${featured.title}`);
    console.log(`   Slug: ${featured.slug.current}`);
    console.log(`   Sport: ${featured.sport}`);
    console.log(`   Publish Date: ${featured.publishDate}`);
    console.log(`   Author: ${featured.author?.name ?? "❌ MISSING"}`);
    console.log(`   Featured Image: ${featured.featuredImage ? "✅" : "❌ MISSING"}`);
    console.log(`   Excerpt: ${featured.excerpt ? "✅" : "❌ MISSING"}`);
    console.log("\nFull object:", JSON.stringify(featured, null, 2));
  } else {
    console.log("❌ No featured article found");
    console.log("\nMake sure you:");
    console.log("1. Created an article in Sanity Studio");
    console.log("2. Set 'Featured' to true");
    console.log("3. Published the article (not just saved as draft)");
  }
}

checkFeatured();
