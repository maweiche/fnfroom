import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { urlFor } from "@/sanity/lib/image";
import { getStaffMembers } from "@/sanity/lib/fetch";

export const metadata: Metadata = {
  title: "Staff & Contributors | Friday Night Film Room",
  description:
    "Meet the team behind Friday Night Film Room's coverage of NC prep sports.",
};

export default async function StaffPage() {
  const staffMembers = await getStaffMembers();

  const roleLabels = {
    "editor-in-chief": "Editor-in-Chief",
    "staff-writer": "Staff Writer",
    "contributing-photographer": "Contributing Photographer",
    "contributing-videographer": "Contributing Videographer",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Staff & Contributors
          </h1>
          <p className="text-lg text-secondary">
            The team bringing you NC prep sports coverage
          </p>
        </div>

        {/* Staff Grid */}
        {staffMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {staffMembers.map((member) => (
              <Link
                key={member._id}
                href={`/staff/${member.slug.current}`}
                className="block group"
              >
                <article className="p-6 bg-card border border-border rounded-lg hover:shadow-card transition-shadow duration-200 text-center">
                  {/* Photo */}
                  {member.photo && (
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                      <Image
                        src={urlFor(member.photo).width(192).height(192).url()}
                        alt={member.name}
                        fill
                        sizes="96px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-150">
                    {member.name}
                  </h3>
                  <p className="text-sm text-secondary mb-3">
                    {roleLabels[member.role]}
                  </p>
                  {member.shortBio && (
                    <p className="text-sm text-muted line-clamp-2">
                      {member.shortBio}
                    </p>
                  )}
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-card border border-border rounded-lg">
            <p className="text-secondary mb-4">No staff members yet.</p>
            <p className="text-sm text-muted">
              Add team members through{" "}
              <a
                href="/studio"
                className="text-primary hover:underline font-medium"
              >
                Sanity Studio
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
