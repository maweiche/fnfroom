import { client } from "./sanity/lib/client";
import { groq } from "next-sanity";

async function testBeerCoolerQuery() {
  console.log("Testing Beer Cooler query...\n");

  // Query for articles with beer-cooler category
  const query = groq`
    *[_type == "article" && category == "beer-cooler"] | order(publishDate desc) {
      _id,
      title,
      slug,
      sport,
      category,
      publishDate,
      excerpt
    }
  `;

  const articles = await client.fetch(query);

  console.log(`Found ${articles.length} articles with category="beer-cooler"`);
  console.log("\nArticles:", JSON.stringify(articles, null, 2));

  // Also check ALL articles to see what categories exist
  const allArticlesQuery = groq`
    *[_type == "article"] {
      _id,
      title,
      category
    }
  `;

  const allArticles = await client.fetch(allArticlesQuery);
  console.log(`\n\nTotal articles in Sanity: ${allArticles.length}`);
  console.log("All article categories:", allArticles.map((a: any) => ({ title: a.title, category: a.category })));
}

testBeerCoolerQuery().catch(console.error);
