import { defineField, defineType } from "sanity";

export default defineType({
  name: "video",
  title: "Video",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "video",
      title: "Video File",
      type: "mux.video",
      description: "Upload your video file (MP4, MOV, etc.)",
    }),
    defineField({
      name: "sport",
      title: "Sport",
      type: "string",
      options: {
        list: [
          { title: "Basketball", value: "basketball" },
          { title: "Football", value: "football" },
          { title: "Lacrosse", value: "lacrosse" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Video Type",
      type: "string",
      options: {
        list: [
          { title: "Highlights", value: "highlights" },
          { title: "Game Film", value: "game-film" },
          { title: "Interview", value: "interview" },
          { title: "Feature", value: "feature" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "contributor",
      title: "Contributor",
      type: "reference",
      to: [{ type: "staffMember" }],
      description: "Videographer who shot/edited this video",
    }),
    defineField({
      name: "publishDate",
      title: "Publish Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Brief description of the video content",
    }),
    defineField({
      name: "playerTags",
      title: "Featured Players",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description: "Player names featured in this video",
    }),
    defineField({
      name: "featured",
      title: "Featured Video",
      type: "boolean",
      description: "Display prominently on video hub page",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      sport: "sport",
      type: "type",
      contributor: "contributor.name",
      media: "video",
    },
    prepare(selection) {
      const { title, sport, type, contributor } = selection;
      return {
        title,
        subtitle: `${sport} • ${type}${contributor ? ` • ${contributor}` : ""}`,
        media: selection.media,
      };
    },
  },
});
