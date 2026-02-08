import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Twitter, Instagram, Linkedin, ExternalLink } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { PortableTextRenderer } from "@/components/portable-text";
import { ArticleCard } from "@/components/article-card";
import { getStaffMemberBySlug, getArticles, getVideos } from "@/sanity/lib/fetch";

interface StaffMemberPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: StaffMemberPageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = await getStaffMemberBySlug(slug);

  if (!member) {
    return {
      title: "Staff Member Not Found",
    };
  }

  return {
    title: `${member.name} | Friday Night Film Room Staff`,
    description: member.shortBio || `${member.name}, ${member.role} at Friday Night Film Room`,
  };
}

export default async function StaffMemberPage({ params }: StaffMemberPageProps) {
  const { slug } = await params;
  const member = await getStaffMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  // Fetch all articles and videos to filter by this staff member
  const [allArticles, allVideos] = await Promise.all([
    getArticles(),
    getVideos(),
  ]);

  // Filter content by this staff member
  const memberArticles = allArticles.filter(
    (article) => article.author._id === member._id
  );
  const memberVideos = allVideos.filter(
    (video) => video.contributor?._id === member._id
  );

  const roleLabels = {
    "editor-in-chief": "Editor-in-Chief",
    "staff-writer": "Staff Writer",
    "contributing-photographer": "Contributing Photographer",
    "contributing-videographer": "Contributing Videographer",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Photo */}
          {member.photo && (
            <div className="relative w-48 h-48 rounded-lg overflow-hidden flex-shrink-0 mx-auto md:mx-0">
              <Image
                src={urlFor(member.photo).width(384).height(384).url()}
                alt={member.name}
                fill
                sizes="192px"
                className="object-cover"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {member.name}
            </h1>
            <p className="text-xl text-secondary mb-4">
              {roleLabels[member.role]}
            </p>

            {/* Social Links */}
            {member.socialLinks && (
              <div className="flex gap-4 mb-4">
                {member.socialLinks.twitter && (
                  <a
                    href={member.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-primary transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {member.socialLinks.instagram && (
                  <a
                    href={member.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {member.socialLinks.linkedin && (
                  <a
                    href={member.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}

            {member.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Personal Website
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Bio */}
        {member.bio && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <div className="prose prose-lg max-w-none">
              <PortableTextRenderer content={member.bio} />
            </div>
          </div>
        )}

        {/* Portfolio - Articles */}
        {memberArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Articles ({memberArticles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memberArticles.slice(0, 6).map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </div>
        )}

        {/* Portfolio - Videos */}
        {memberVideos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Videos ({memberVideos.length})
            </h2>
            <div className="text-secondary">
              {memberVideos.length} video{memberVideos.length !== 1 ? "s" : ""}{" "}
              contributed
            </div>
          </div>
        )}

        {/* Empty State */}
        {memberArticles.length === 0 && memberVideos.length === 0 && (
          <div className="p-8 text-center bg-card border border-border rounded-lg">
            <p className="text-secondary">No published work yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
