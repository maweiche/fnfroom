import type { Image } from "sanity";

export type Sport = "basketball" | "football" | "lacrosse";

export type ArticleCategory =
  | "game-recap"
  | "preview"
  | "player-spotlight"
  | "rankings-analysis"
  | "recruiting"
  | "news"
  | "opinion";

export type StaffRole =
  | "editor-in-chief"
  | "staff-writer"
  | "contributing-photographer"
  | "contributing-videographer";

export interface StaffMember {
  _id: string;
  _type: "staffMember";
  name: string;
  slug: {
    current: string;
  };
  role: StaffRole;
  photo?: Image & {
    alt?: string;
  };
  shortBio?: string;
  bio?: any[]; // Portable Text
  email?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  active: boolean;
}

export interface Article {
  _id: string;
  _type: "article";
  title: string;
  slug: {
    current: string;
  };
  sport: Sport;
  category?: ArticleCategory;
  featured: boolean;
  publishDate: string;
  author: StaffMember;
  featuredImage?: Image & {
    alt: string;
    photographer?: string;
  };
  excerpt?: string;
  body: any[]; // Portable Text
  tags?: string[];
  seoDescription?: string;
}

export type RankingTrend = "up" | "down" | "steady" | "new";

export interface RankingEntry {
  rank: number;
  team: string;
  record: string;
  conference?: string;
  previousRank?: number;
  trend?: RankingTrend;
}

export interface Rankings {
  _id: string;
  _type: "rankings";
  sport: Sport;
  season: string;
  week: number;
  publishDate: string;
  editorsNote?: any[]; // Portable Text
  entries: RankingEntry[];
}

export type VideoType = "highlights" | "game-film" | "interview" | "feature";

export interface MuxVideo {
  asset?: {
    playbackId?: string;
    thumbTime?: number;
    status?: string;
  };
}

export interface Video {
  _id: string;
  _type: "video";
  title: string;
  slug: {
    current: string;
  };
  video?: MuxVideo;
  sport: Sport;
  type: VideoType;
  contributor?: StaffMember;
  publishDate: string;
  description?: string;
  playerTags?: string[];
  featured: boolean;
}

export interface PlayerStats {
  season: string;
  statsData: {
    // Basketball
    ppg?: number;
    rpg?: number;
    apg?: number;
    // Football
    passingYards?: number;
    rushingYards?: number;
    touchdowns?: number;
    // Lacrosse
    goals?: number;
    assists?: number;
    groundBalls?: number;
  };
}

export interface Player {
  _id: string;
  _type: "player";
  name: string;
  slug: {
    current: string;
  };
  photo?: Image & {
    alt?: string;
  };
  sport: Sport;
  gradYear: number;
  position: string;
  school: string;
  height?: string;
  weight?: string;
  jerseyNumber?: string;
  bio?: any[]; // Portable Text
  highlightVideo?: Video;
  stats?: PlayerStats[];
  offers?: string[];
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    hudl?: string;
  };
  featured: boolean;
}
