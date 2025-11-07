import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { muxInput } from "sanity-plugin-mux-input";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { plausibleAnalytics } from "sanity-plugin-plausible-analytics";
import { schemaTypes } from "./schemaTypes";

import { SparklesIcon, CogIcon, VideoIcon } from "@sanity/icons";

// Define the actions that should be available for singleton documents
const singletonActions = new Set(["publish", "discardChanges", "restore"]);

// Define the singleton document types
const singletonTypes = new Set(["settings"]);

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
            // Singleton Settings document
            S.listItem()
              .title("Settings")
              .id("settings")
              .icon(CogIcon)
              .child(
                S.document().schemaType("settings").documentId("settings"),
              ),
            // Orderable work list - minimum required configuration
            orderableDocumentListDeskItem({
              type: "work",
              title: "Work",
              icon: VideoIcon,
              S,
              context,
            }),
            // Regular awards list
            S.listItem()
              .title("Awards")
              .child(S.documentTypeList("awards").title("Awards"))
              .icon(SparklesIcon),
            // Add other document types as needed
            ...S.documentTypeListItems().filter(
              (listItem) =>
                !["work", "awards", "settings"].includes(listItem.getId()),
            ),
          ]);
      },
    }),
    visionTool(),
    muxInput(),
    plausibleAnalytics({
      domain: "nielswindfeldt.com",
    }),
  ],

  schema: {
    types: schemaTypes,
    // Filter out singleton types from the global "New document" menu options
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    // For singleton types, filter out actions that are not explicitly included
    // in the `singletonActions` list defined above
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
  },
});
