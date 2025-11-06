import { CogIcon } from "@sanity/icons";

export default {
  name: "settings",
  title: "Settings",
  type: "document",
  icon: CogIcon,
  groups: [
    {
      name: "content",
      title: "Content",
    },
    {
      name: "seo",
      title: "SEO",
    },
  ],
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
    },
    {
      name: "bio",
      title: "Bio",
      type: "array",
      of: [{ type: "block" }],
      group: "content",
    },
    {
      name: "contact",
      title: "Contact",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "label",
              title: "Label",
              type: "string",
            },
            {
              name: "value",
              title: "Value",
              type: "string",
            },
            {
              name: "url",
              title: "url",
              type: "string",
            },
          ],
        },
      ],
      group: "content",
    },
    {
      name: "representation",
      title: "Representation",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "label",
              title: "Label",
              type: "string",
            },
            {
              name: "value",
              title: "Value",
              type: "string",
            },
            {
              name: "url",
              title: "url",
              type: "string",
            },
          ],
        },
      ],
      group: "content",
    },
    {
      name: "awards",
      title: "Awards",
      type: "reference",
      description: "if no awards is added we render out all awards",
      to: [{ type: "awards" }],
      group: "content",
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      description: "image on the right side",
      options: {
        hotspot: true,
      },
      group: "content",
    },
    {
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      description: "Title for search engines (50-60 characters)",
      group: "seo",
    },
    {
      name: "seoDescription",
      title: "Meta Description",
      type: "text",
      description: "Description for search engines (150-160 characters)",
      rows: 3,
      group: "seo",
    },
    {
      name: "keywords",
      title: "Keywords",
      type: "array",
      of: [{ type: "string" }],
      description: "Keywords for search engines",
      group: "seo",
    },
    {
      name: "ogImage",
      title: "Open Graph Image",
      type: "image",
      description: "Image for social media sharing (1200x630px recommended)",
      options: {
        hotspot: true,
      },
      group: "seo",
    },
  ],
};
