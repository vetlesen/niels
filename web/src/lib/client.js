// /lib/client.js
import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "ldoe7xyp",
  dataset: "production",
  apiVersion: "2024-03-13",
  useCdn: false, // Disable CDN for faster updates
  perspective: "published", // Only fetch published documents
  stega: {
    enabled: false,
    studioUrl: "/studio",
  },
});
