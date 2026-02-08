import { defineField, defineType } from "sanity";

export default defineType({
  name: "player",
  title: "Player",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Player Name",
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
      name: "photo",
      title: "Player Photo",
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
      name: "gradYear",
      title: "Graduation Year",
      type: "number",
      description: "e.g., 2026, 2027",
      validation: (Rule) => Rule.required().min(2024).max(2035),
    }),
    defineField({
      name: "position",
      title: "Position",
      type: "string",
      description: "e.g., PG, QB, Attack",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "school",
      title: "High School",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "height",
      title: "Height",
      type: "string",
      description: 'e.g., "6\'2" or "5\'11"',
    }),
    defineField({
      name: "weight",
      title: "Weight",
      type: "string",
      description: 'e.g., "185 lbs"',
    }),
    defineField({
      name: "jerseyNumber",
      title: "Jersey Number",
      type: "string",
    }),
    defineField({
      name: "bio",
      title: "Scouting Report / Bio",
      type: "array",
      of: [{ type: "block" }],
      description: "Player strengths, play style, analysis",
    }),
    defineField({
      name: "highlightVideo",
      title: "Highlight Video",
      type: "reference",
      to: [{ type: "video" }],
      description: "Link to player's highlight reel",
    }),
    defineField({
      name: "stats",
      title: "Season Stats",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "season",
              title: "Season",
              type: "string",
              description: 'e.g., "2025-26"',
            },
            {
              name: "statsData",
              title: "Stats",
              type: "object",
              description: "Flexible stat fields based on sport",
              fields: [
                { name: "ppg", title: "PPG (Basketball)", type: "number" },
                { name: "rpg", title: "RPG (Basketball)", type: "number" },
                { name: "apg", title: "APG (Basketball)", type: "number" },
                {
                  name: "passingYards",
                  title: "Passing Yards (Football)",
                  type: "number",
                },
                {
                  name: "rushingYards",
                  title: "Rushing Yards (Football)",
                  type: "number",
                },
                {
                  name: "touchdowns",
                  title: "Touchdowns (Football)",
                  type: "number",
                },
                { name: "goals", title: "Goals (Lacrosse)", type: "number" },
                { name: "assists", title: "Assists (Lacrosse)", type: "number" },
                {
                  name: "groundBalls",
                  title: "Ground Balls (Lacrosse)",
                  type: "number",
                },
              ],
            },
          ],
          preview: {
            select: {
              season: "season",
            },
            prepare({ season }) {
              return {
                title: season || "Season Stats",
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "offers",
      title: "College Offers / Interest",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description: "College programs with offers or interest",
    }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [
        { name: "twitter", type: "url", title: "Twitter/X" },
        { name: "instagram", type: "url", title: "Instagram" },
        { name: "hudl", type: "url", title: "Hudl Profile" },
      ],
    }),
    defineField({
      name: "featured",
      title: "Featured Player",
      type: "boolean",
      description: "Display prominently on recruiting board",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      name: "name",
      school: "school",
      sport: "sport",
      gradYear: "gradYear",
      photo: "photo",
    },
    prepare({ name, school, sport, gradYear, photo }) {
      return {
        title: name,
        subtitle: `${school} • Class of ${gradYear} • ${sport}`,
        media: photo,
      };
    },
  },
});
