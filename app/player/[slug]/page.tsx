import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPlayerBySlug,
  getArticlesByPlayer,
  getSimilarPlayers,
} from "@/sanity/lib/fetch";
import { PlayerHero } from "@/components/player-profile/PlayerHero";
import { PlayerStats } from "@/components/player-profile/PlayerStats";
import { PlayerBio } from "@/components/player-profile/PlayerBio";
import { PlayerMedia } from "@/components/player-profile/PlayerMedia";
import { PlayerOffers } from "@/components/player-profile/PlayerOffers";
import { PlayerSocial } from "@/components/player-profile/PlayerSocial";
import { RelatedContent } from "@/components/player-profile/RelatedContent";
import { SimilarPlayers } from "@/components/player-profile/SimilarPlayers";

interface PlayerPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);

  if (!player) {
    return {
      title: "Player Not Found",
    };
  }

  const title = `${player.name} | Class of ${player.gradYear} | ${player.school} | Friday Night Film Room`;
  const description = `${player.name} is a ${player.gradYear} ${player.position} at ${player.school}.${
    player.height ? ` ${player.height},` : ""
  }${player.weight ? ` ${player.weight}.` : ""} View stats, highlights, and recruiting information.`;

  // Generate OG image URL from player photo or use fallback
  const ogImageUrl = player.photo
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://fridaynightfilmroom.com"}/api/og?type=player&name=${encodeURIComponent(player.name)}&school=${encodeURIComponent(player.school)}&sport=${player.sport}`
    : `${process.env.NEXT_PUBLIC_SITE_URL || "https://fridaynightfilmroom.com"}/og-default.jpg`;

  return {
    title,
    description,
    keywords: [
      player.name,
      player.school,
      `${player.sport} recruiting`,
      `Class of ${player.gradYear}`,
      player.position,
      "North Carolina high school",
      player.sport,
    ],
    openGraph: {
      type: "profile",
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${player.name} - ${player.school}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;

  // Fetch player data
  const player = await getPlayerBySlug(slug);

  if (!player) {
    notFound();
  }

  // Fetch related content in parallel
  const [relatedArticles, similarPlayers] = await Promise.all([
    getArticlesByPlayer(player.name),
    getSimilarPlayers(player.sport, player.gradYear, player._id),
  ]);

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    sport: player.sport,
    affiliation: {
      "@type": "EducationalOrganization",
      name: player.school,
    },
    ...(player.height && { height: player.height }),
    ...(player.weight && { weight: player.weight }),
    ...(player.socialLinks && {
      sameAs: Object.values(player.socialLinks).filter(Boolean),
    }),
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <PlayerHero player={player} />

        {/* Two-Column Layout */}
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content (8 cols) */}
            <div className="lg:col-span-8 space-y-8 md:space-y-12">
              {/* Stats Section */}
              {player.stats && player.stats.length > 0 && (
                <PlayerStats stats={player.stats} sport={player.sport} />
              )}

              {/* Bio Section */}
              {player.bio && player.bio.length > 0 && (
                <PlayerBio bio={player.bio} playerName={player.name} />
              )}

              {/* Highlight Video */}
              {player.highlightVideo && (
                <PlayerMedia highlightVideo={player.highlightVideo} />
              )}
            </div>

            {/* Sidebar (4 cols, sticky) */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-20 space-y-6 md:space-y-8">
                {/* Quick Stats */}
                <div className="p-4 md:p-6 bg-card border border-border rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-muted">Class</dt>
                      <dd className="font-mono font-semibold text-lg">
                        {player.gradYear}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted">Position</dt>
                      <dd className="font-semibold text-lg">{player.position}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted">School</dt>
                      <dd className="font-semibold text-lg">{player.school}</dd>
                    </div>
                    {player.height && (
                      <div>
                        <dt className="text-sm text-muted">Height</dt>
                        <dd className="font-mono font-semibold text-lg">
                          {player.height}
                        </dd>
                      </div>
                    )}
                    {player.weight && (
                      <div>
                        <dt className="text-sm text-muted">Weight</dt>
                        <dd className="font-mono font-semibold text-lg">
                          {player.weight}
                        </dd>
                      </div>
                    )}
                    {player.jerseyNumber && (
                      <div>
                        <dt className="text-sm text-muted">Jersey #</dt>
                        <dd className="font-mono font-semibold text-lg">
                          {player.jerseyNumber}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* College Offers */}
                {player.offers && player.offers.length > 0 && (
                  <PlayerOffers offers={player.offers} sport={player.sport} />
                )}

                {/* Social Links */}
                {player.socialLinks && (
                  <PlayerSocial socialLinks={player.socialLinks} />
                )}

                {/* Related Content */}
                {relatedArticles.length > 0 && (
                  <RelatedContent articles={relatedArticles} />
                )}

                {/* Similar Players */}
                {similarPlayers.length > 0 && (
                  <SimilarPlayers
                    players={similarPlayers}
                    currentPlayerId={player._id}
                  />
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
