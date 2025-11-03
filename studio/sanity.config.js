import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { muxInput } from "sanity-plugin-mux-input";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "default",
  title: "Niels Windfeldt",

  projectId: "ldoe7xyp",
  dataset: "production",

  plugins: [
    structureTool({
      structure: (S, context) => {
        return S.list()
          .title("Content")
          .items([
            // Orderable work list - minimum required configuration
            orderableDocumentListDeskItem({
              type: "work",
              title: "Work",
              S,
              context,
            }),
            // Regular awards list
            S.listItem()
              .title("Awards")
              .child(S.documentTypeList("awards").title("Awards")),
            // Add other document types as needed
            ...S.documentTypeListItems().filter(
              (listItem) => !["work", "awards"].includes(listItem.getId()),
            ),
          ]);
      },
    }),
    visionTool(),
    muxInput(),
  ],

  schema: {
    types: schemaTypes,
  },
});
