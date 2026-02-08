import { defineField, defineType } from "sanity";

export default defineType({
  name: "rankings",
  title: "Rankings",
  type: "document",
  fields: [
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
      name: "season",
      title: "Season",
      type: "string",
      description: 'e.g., "2025-26" or "Fall 2025"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "week",
      title: "Week Number",
      type: "number",
      description: "Week of the season (1, 2, 3, etc.)",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "publishDate",
      title: "Publish Date",
      type: "datetime",
      description: "When these rankings were published",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "editorsNote",
      title: "Editor's Note",
      type: "array",
      of: [{ type: "block" }],
      description: "Optional analysis of this week's rankings",
    }),
    defineField({
      name: "entries",
      title: "Rankings Entries",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "rank",
              title: "Rank",
              type: "number",
              validation: (Rule) => Rule.required().min(1),
            },
            {
              name: "team",
              title: "Team Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "record",
              title: "Record",
              type: "string",
              description: 'e.g., "12-2" or "8-1-1"',
              validation: (Rule) => Rule.required(),
            },
            {
              name: "conference",
              title: "Conference",
              type: "string",
            },
            {
              name: "previousRank",
              title: "Previous Rank",
              type: "number",
              description: "Last week's rank (leave blank if unranked)",
            },
            {
              name: "trend",
              title: "Trend",
              type: "string",
              options: {
                list: [
                  { title: "↑ Up", value: "up" },
                  { title: "↓ Down", value: "down" },
                  { title: "— Steady", value: "steady" },
                  { title: "★ New", value: "new" },
                ],
                layout: "radio",
              },
            },
          ],
          preview: {
            select: {
              rank: "rank",
              team: "team",
              record: "record",
            },
            prepare({ rank, team, record }) {
              return {
                title: `#${rank} ${team}`,
                subtitle: record,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      sport: "sport",
      season: "season",
      week: "week",
      publishDate: "publishDate",
    },
    prepare({ sport, season, week, publishDate }) {
      return {
        title: `${sport} - Week ${week} (${season})`,
        subtitle: new Date(publishDate).toLocaleDateString(),
      };
    },
  },
  orderings: [
    {
      title: "Publish Date (newest first)",
      name: "publishDateDesc",
      by: [{ field: "publishDate", direction: "desc" }],
    },
    {
      title: "Sport",
      name: "sportAsc",
      by: [
        { field: "sport", direction: "asc" },
        { field: "publishDate", direction: "desc" },
      ],
    },
  ],
});
