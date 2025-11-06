import { client } from "../lib/client";

export async function getWork() {
  const query = `*[_type == "work" && hidden != true] | order(orderRank) {
    _id,
    name,
    slug,
    title,
    type,
    year,
    category,
    hidden,
    video {
      asset-> {
        _id,
        playbackId,
        assetId,
        status,
        data {
          duration,
          aspect_ratio
        }
      }
    },
    thumbnails[] {
      timestamp,
      type
    }
  }`;

  try {
    const work = await client.fetch(query);
    return work;
  } catch (error) {
    console.error("Error fetching work:", error);
    return [];
  }
}
