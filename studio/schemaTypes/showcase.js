export default {
  name: "showcase",
  title: "Showcase",
  type: "document",
  preview: {
    select: {
      title: "title",
      works: "works",
    },
    prepare(selection) {
      const { title, works } = selection;
      return {
        title: title || "Untitled Showcase",
        subtitle: `${works?.length || 0} work(s)`,
      };
    },
  },
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "password",
      title: "Password (Optional)",
      type: "string",
      description:
        "Leave empty for public access. Add a password to restrict access.",
    },
    {
      name: "description",
      title: "Description",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "External Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) => Rule.required(),
                  },
                ],
              },
            ],
          },
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 1", value: "h1" },
            { title: "Heading 2", value: "h2" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
        },
      ],
      description: "Custom introduction or description for this showcase",
    },
    {
      name: "works",
      title: "Works",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "work" }],
        },
      ],
      description: "Select and order the works to include in this showcase",
      validation: (Rule) => Rule.required().min(1),
    },
  ],
};
