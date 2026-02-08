import { groq } from "next-sanity";

// Author fragment - reusable author fields
const authorFragment = groq`
  author->{
    _id,
    name,
    slug,
    role,
    photo,
    shortBio
  }
`;

// Featured image fragment
const imageFragment = groq`
  featuredImage{
    ...,
    "alt": alt,
    "photographer": photographer
  }
`;

/**
 * Get all articles, newest first
 */
export const articlesQuery = groq`
  *[_type == "article"] | order(publishDate desc) {
    _id,
    title,
    slug,
    sport,
    category,
    featured,
    publishDate,
    ${authorFragment},
    ${imageFragment},
    excerpt,
    tags
  }
`;

/**
 * Get latest N articles
 */
export const latestArticlesQuery = (limit: number = 6) => groq`
  *[_type == "article"] | order(publishDate desc) [0...${limit}] {
    _id,
    title,
    slug,
    sport,
    category,
    publishDate,
    ${authorFragment},
    ${imageFragment},
    excerpt
  }
`;

/**
 * Get featured article (most recent with featured=true)
 */
export const featuredArticleQuery = groq`
  *[_type == "article" && featured == true] | order(publishDate desc) [0] {
    _id,
    title,
    slug,
    sport,
    publishDate,
    ${authorFragment},
    ${imageFragment},
    excerpt
  }
`;

/**
 * Get single article by slug
 */
export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    sport,
    category,
    featured,
    publishDate,
    ${authorFragment},
    ${imageFragment},
    body,
    tags,
    seoDescription
  }
`;

/**
 * Get articles by sport
 */
export const articlesBySportQuery = groq`
  *[_type == "article" && sport == $sport] | order(publishDate desc) {
    _id,
    title,
    slug,
    sport,
    category,
    publishDate,
    ${authorFragment},
    ${imageFragment},
    excerpt
  }
`;

/**
 * Get related articles (same sport, excluding current article)
 */
export const relatedArticlesQuery = groq`
  *[_type == "article" && sport == $sport && _id != $currentId] | order(publishDate desc) [0...3] {
    _id,
    title,
    slug,
    sport,
    publishDate,
    ${authorFragment},
    ${imageFragment},
    excerpt
  }
`;

/**
 * Get all staff members
 */
export const staffMembersQuery = groq`
  *[_type == "staffMember" && active == true] | order(name asc) {
    _id,
    name,
    slug,
    role,
    photo,
    shortBio
  }
`;

/**
 * Get staff member by slug
 */
export const staffMemberBySlugQuery = groq`
  *[_type == "staffMember" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    role,
    photo,
    shortBio,
    bio,
    email,
    website,
    socialLinks
  }
`;
