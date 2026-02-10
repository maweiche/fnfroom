import { defineField, defineType } from "sanity";

export default defineType({
  name: "article",
  title: "Article",
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
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Game Recap", value: "game-recap" },
          { title: "Preview", value: "preview" },
          { title: "Player Spotlight", value: "player-spotlight" },
          { title: "Rankings Analysis", value: "rankings-analysis" },
          { title: "Recruiting", value: "recruiting" },
          { title: "News", value: "news" },
          { title: "Opinion", value: "opinion" },
          { title: "Beer Cooler (Adult League)", value: "beer-cooler" },
        ],
      },
    }),
    defineField({
      name: "featured",
      title: "Featured Article",
      type: "boolean",
      description: "Display this article in the hero section",
      initialValue: false,
    }),
    defineField({
      name: "publishDate",
      title: "Publish Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "staffMember" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "photographer",
          type: "string",
          title: "Photographer Credit",
        },
      ],
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary for article cards (optional, first 160 chars of body used if empty)",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "caption",
              type: "string",
              title: "Caption",
            },
            {
              name: "photographer",
              type: "string",
              title: "Photographer Credit",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      description: "Custom meta description (max 160 chars, optional)",
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      media: "featuredImage",
      sport: "sport",
    },
    prepare(selection) {
      const { author, sport } = selection;
      return {
        ...selection,
        subtitle: `${sport} • ${author}`,
      };
    },
  },
});
