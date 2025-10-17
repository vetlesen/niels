export default {
  name: "work",
  title: "Work",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
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
    },
    {
      name: "video",
      title: "Video",
      type: "mux.video",
    },
    {
      name: "thumbnails",
      title: "Thumbnails",
      description:
        "if nothing is added then this is done automaticly, add items to overrite it",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "number",
              title: "Number",
              type: "number",
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
  ],
};
