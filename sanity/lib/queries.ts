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
 * Get featured article for a specific sport
 */
export const featuredArticleBySportQuery = groq`
  *[_type == "article" && sport == $sport && featured == true] | order(publishDate desc) [0] {
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
 * Get articles by category
 */
export const articlesByCategoryQuery = groq`
  *[_type == "article" && category == $category] | order(publishDate desc) {
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

/**
 * Get latest rankings for each sport
 */
export const latestRankingsBySportQuery = groq`
  {
    "basketball": *[_type == "rankings" && sport == "basketball"] | order(publishDate desc) [0],
    "football": *[_type == "rankings" && sport == "football"] | order(publishDate desc) [0],
    "lacrosse": *[_type == "rankings" && sport == "lacrosse"] | order(publishDate desc) [0]
  }
`;

/**
 * Get all rankings for a specific sport
 */
export const rankingsBySportQuery = groq`
  *[_type == "rankings" && sport == $sport] | order(publishDate desc) {
    _id,
    sport,
    season,
    week,
    publishDate,
    editorsNote,
    entries
  }
`;

/**
 * Get latest rankings for a specific sport
 */
export const latestRankingsForSportQuery = groq`
  *[_type == "rankings" && sport == $sport] | order(publishDate desc) [0] {
    _id,
    sport,
    season,
    week,
    publishDate,
    editorsNote,
    entries
  }
`;

/**
 * Get rankings by sport and season
 */
export const rankingsBySportAndSeasonQuery = groq`
  *[_type == "rankings" && sport == $sport && season == $season] | order(week desc) {
    _id,
    sport,
    season,
    week,
    publishDate,
    editorsNote,
    entries
  }
`;

/**
 * Get all videos
 */
export const videosQuery = groq`
  *[_type == "video"] | order(publishDate desc) {
    _id,
    title,
    slug,
    video,
    sport,
    type,
    contributor->{
      _id,
      name,
      slug
    },
    publishDate,
    description,
    playerTags,
    featured
  }
`;

/**
 * Get latest N videos
 */
export const latestVideosQuery = (limit: number = 6) => groq`
  *[_type == "video"] | order(publishDate desc) [0...${limit}] {
    _id,
    title,
    slug,
    video,
    sport,
    type,
    contributor->{
      _id,
      name,
      slug
    },
    publishDate,
    description,
    playerTags,
    featured
  }
`;

/**
 * Get featured video
 */
export const featuredVideoQuery = groq`
  *[_type == "video" && featured == true] | order(publishDate desc) [0] {
    _id,
    title,
    slug,
    video,
    sport,
    type,
    contributor->{
      _id,
      name,
      slug
    },
    publishDate,
    description,
    playerTags,
    featured
  }
`;

/**
 * Get videos by sport
 */
export const videosBySportQuery = groq`
  *[_type == "video" && sport == $sport] | order(publishDate desc) {
    _id,
    title,
    slug,
    video,
    sport,
    type,
    contributor->{
      _id,
      name,
      slug
    },
    publishDate,
    description,
    playerTags,
    featured
  }
`;

/**
 * Get video by slug
 */
export const videoBySlugQuery = groq`
  *[_type == "video" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    video,
    sport,
    type,
    contributor->{
      _id,
      name,
      slug,
      role,
      photo
    },
    publishDate,
    description,
    playerTags,
    featured
  }
`;

/**
 * Get all players
 */
export const playersQuery = groq`
  *[_type == "player"] | order(gradYear desc, name asc) {
    _id,
    name,
    slug,
    photo,
    sport,
    gradYear,
    position,
    school,
    height,
    weight,
    featured
  }
`;

/**
 * Get featured players
 */
export const featuredPlayersQuery = groq`
  *[_type == "player" && featured == true] | order(gradYear desc) [0...6] {
    _id,
    name,
    slug,
    photo,
    sport,
    gradYear,
    position,
    school,
    height,
    weight,
    featured
  }
`;

/**
 * Get player by slug
 */
export const playerBySlugQuery = groq`
  *[_type == "player" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    photo,
    sport,
    gradYear,
    position,
    school,
    height,
    weight,
    jerseyNumber,
    bio,
    highlightVideo->{
      _id,
      title,
      slug,
      video
    },
    stats,
    offers,
    socialLinks,
    featured
  }
`;

/**
 * Get articles featuring a specific player
 */
export const articlesByPlayerQuery = groq`
  *[_type == "article" && $playerName in playerTags] | order(publishDate desc) [0...5] {
    _id,
    title,
    slug,
    sport,
    publishDate,
    ${authorFragment},
    ${imageFragment}
  }
`;
