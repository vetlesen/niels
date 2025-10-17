import ThumbnailsArrayInput from "../components/ThumbnailsArrayInput.jsx";

export default {
  name: "work",
  title: "Work",
  type: "document",
  preview: {
    select: {
      name: "name",
      title: "title",
      category: "category",
    },
    prepare(selection) {
      const { name, title, category } = selection;
      return {
        title: `${name}${title ? ` – ${title}` : ""}`,
        subtitle: category,
      };
    },
  },
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
    },
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "type",
      title: "Type",
      type: "string",
    },
    {
      name: "year",
      title: "Year",
      type: "number",
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Narrative", value: "narrative" },
          { title: "Commercial", value: "commercial" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "video",
      title: "Video",
      type: "mux.video",
    },
    {
      name: "thumbnails",
      title: "Thumbnails",
      type: "array",
      components: {
        input: ThumbnailsArrayInput,
      },
      of: [
        {
          type: "object",
          fields: [
            {
              name: "timestamp",
              title: "Timestamp (MM:SS)",
              type: "string",
              description:
                "Enter time in format MM:SS (e.g., 01:30 for 1 minute 30 seconds)",
              validation: (Rule) =>
                Rule.regex(/^[0-9]{1,2}:[0-5][0-9]$/, {
                  name: "timestamp",
                  invert: false,
                }).error("Please enter time in MM:SS format (e.g., 01:30)"),
            },
            {
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Video", value: "video" },
                  { title: "Image", value: "image" },
                ],
                layout: "radio",
              },
            },
          ],
        },
      ],
    },
    {
      name: "credits",
      title: "Credits",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "role",
              title: "Role",
              type: "string",
            },
            {
              name: "names",
              title: "Names",
              type: "array",
              of: [{ type: "string" }],
            },
          ],
        },
      ],
    },
    {
      name: "awards",
      title: "Awards",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "awards" }],
        },
      ],
      description: "Awards received for this work",
    },
    {
      name: "info",
      title: "Info",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            decorators: [],
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
              {
                name: "internalLink",
                type: "object",
                title: "Internal Link",
                fields: [
                  {
                    name: "reference",
                    type: "reference",
                    title: "Reference",
                    to: [{ type: "work" }],
                    validation: (Rule) => Rule.required(),
                  },
                ],
              },
            ],
          },
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
        },
      ],
    },
  ],
};
