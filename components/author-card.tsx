import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { StaffMember } from "@/lib/sanity.types";

interface AuthorCardProps {
  author: StaffMember;
}

export function AuthorCard({ author }: AuthorCardProps) {
  const roleLabels = {
    "editor-in-chief": "Editor-in-Chief",
    "staff-writer": "Staff Writer",
    "contributing-photographer": "Contributing Photographer",
    "contributing-videographer": "Contributing Videographer",
  };

  return (
    <Link
      href={`/staff/${author.slug.current}`}
      className="block p-6 bg-card border border-border rounded-lg hover:shadow-card transition-shadow duration-200"
    >
      <div className="flex gap-4">
        {/* Author Photo */}
        {author.photo && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={urlFor(author.photo).width(128).height(128).url()}
              alt={author.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        )}

        {/* Author Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{author.name}</h3>
          <p className="text-sm text-secondary mb-2">
            {roleLabels[author.role]}
          </p>
          {author.shortBio && (
            <p className="text-sm text-muted line-clamp-2">{author.shortBio}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
