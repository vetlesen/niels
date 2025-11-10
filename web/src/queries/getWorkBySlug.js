import { client } from "../lib/client";

export async function getWorkBySlug(slug, randomSeed = null) {
  const stackSlice =
    randomSeed !== null
      ? `stack[${randomSeed}...${randomSeed + 20}]`
      : "stack[0...20]";

  const query = `*[_type == "work" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    title,
    type,
    year,
    category,
    hidden,
    password,
    video {
      asset-> {
        playbackId,
        data {
          aspect_ratio
        }
      }
    },
    credits[] {
      role,
      names
    },
    awards[]-> {
      name,
      year
    },
    info,
    badge,
    "stackCount": count(stack),
${stackSlice}[] {
  _key,
  timestamp,
  asset-> {
    _id,
    _type,
    url,
    playbackId,
    data {
      aspect_ratio
    },
    metadata {
      palette {
        dominant,
        vibrant,
        lightVibrant,
        darkVibrant,
        muted,
        lightMuted,
        darkMuted
      }
    }
  }
},
    "imagePalette0": ${stackSlice}[0].asset->metadata.palette,
    "imagePalette1": ${stackSlice}[4].asset->metadata.palette,
    "imagePalette2": ${stackSlice}[8].asset->metadata.palette,
    colorOverwrite
  }`;

  // console.log("GROQ Query:", query);
  // console.log("Query params:", { slug, randomSeed });

  try {
    const work = await client.fetch(query, { slug });
    // console.log("Fetched work:", work);
    // console.log("Stack items:", work?.stack);
    return work;
  } catch (error) {
    // console.error("Error fetching work by slug:", error);
    return null;
  }
}
