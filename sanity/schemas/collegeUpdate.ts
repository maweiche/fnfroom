import { defineField, defineType } from "sanity";

export default defineType({
  name: "collegeUpdate",
  title: "College Corner Update",
  type: "document",
  fields: [
    defineField({
      name: "playerName",
      title: "Player Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "playerName",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
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
      name: "position",
      title: "Position",
      type: "string",
      description: "e.g., PG, RB, M (midfielder)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "highSchool",
      title: "High School",
      type: "string",
      description: "NC high school they attended",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "classYear",
      title: "High School Class Year",
      type: "string",
      description: 'e.g., "2024"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "college",
      title: "College/University",
      type: "string",
      description: "Current college",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "division",
      title: "Division",
      type: "string",
      options: {
        list: [
          { title: "Division I", value: "Division I" },
          { title: "Division II", value: "Division II" },
          { title: "Division III", value: "Division III" },
          { title: "NAIA", value: "NAIA" },
          { title: "NJCAA", value: "NJCAA" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "updateText",
      title: "Update Text",
      type: "text",
      rows: 3,
      description: "Brief description of the performance/achievement",
      validation: (Rule) => Rule.required().max(250),
    }),
    defineField({
      name: "stats",
      title: "Game Stats",
      type: "string",
      description: 'e.g., "18 PTS, 5 AST, 3 REB" or "120 YDS, 2 TD"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gameDate",
      title: "Game Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured Update",
      type: "boolean",
      description: "Display prominently on College Corner page",
      initialValue: false,
    }),
    defineField({
      name: "publishDate",
      title: "Publish Date",
      type: "datetime",
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
        {
          name: "photographer",
          type: "string",
          title: "Photographer Credit",
        },
      ],
    }),
  ],
  preview: {
    select: {
      playerName: "playerName",
      college: "college",
      sport: "sport",
      gameDate: "gameDate",
      photo: "photo",
    },
    prepare({ playerName, college, sport, gameDate, photo }) {
      return {
        title: playerName,
        subtitle: `${college} • ${sport} • ${gameDate}`,
        media: photo,
      };
    },
  },
});
