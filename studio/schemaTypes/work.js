import ThumbnailsArrayInput from "../components/ThumbnailsArrayInput.jsx";

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
  ],
};
