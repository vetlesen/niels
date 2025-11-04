import { SparklesIcon } from "@sanity/icons";

export default {
  name: "awards",
  title: "Awards",
  type: "document",
  icon: SparklesIcon,
  preview: {
    select: {
      name: "name",
      year: "year",
      category: "category",
    },
    prepare(selection) {
      const { name, year, category } = selection;
      return {
        title: name,
        subtitle: `${year}${category ? ` – ${category}` : ""}`,
      };
    },
  },
  fields: [
    {
      name: "name",
      title: "Award Name",
      type: "string",
    },

    {
      name: "year",
      title: "Year",
      type: "number",
      validation: (Rule) =>
        Rule.required()
          .min(1900)
          .max(new Date().getFullYear() + 1),
    },
  ],
};
