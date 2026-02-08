import { defineField, defineType } from "sanity";

export default defineType({
  name: "staffMember",
  title: "Staff Member",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      options: {
        list: [
          { title: "Editor-in-Chief", value: "editor-in-chief" },
          { title: "Staff Writer", value: "staff-writer" },
          { title: "Contributing Photographer", value: "contributing-photographer" },
          { title: "Contributing Videographer", value: "contributing-videographer" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
        },
      ],
    }),
    defineField({
      name: "shortBio",
      title: "Short Bio",
      type: "string",
      description: "One-line bio for cards (50-100 characters)",
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      of: [{ type: "block" }],
      description: "Full bio for profile page",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Optional public email",
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
      description: "Personal portfolio site",
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [
        { name: "twitter", type: "url", title: "Twitter/X" },
        { name: "instagram", type: "url", title: "Instagram" },
        { name: "linkedin", type: "url", title: "LinkedIn" },
      ],
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Hide from staff page without deleting",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "photo",
    },
  },
});
