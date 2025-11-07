import { client } from "../lib/client";

export async function getWorkBySlug(slug, randomSeed = null) {
  // If randomSeed is provided, use it to get a random selection
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
        _id,
        playbackId,
        assetId,
        status,
        data {
          aspect_ratio,
        },
      },
    },
    thumbnails[] {
      timestamp,
      type,
      image {
        asset-> {
          _id,
          url
        }
      },
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
      }
    },
    credits[] {
      role,
      names
    },
    awards[]-> {
      _id,
      name,
      slug,
      organization,
      year,
      category,
      status,
      description,
      url
    },
    info[]{
      ...,
      markDefs[]{
        ...,
        _type == "internalLink" => {
          ...,
          reference-> {
            _id,
            name,
            slug
          }
        }
      }
    },
    "stackCount": count(stack),
    ${stackSlice} {
      _key,
      _type,
      asset-> {
        _id,
        url,
        playbackId,
        assetId,
        status,
        metadata {
          dimensions {
            width,
            height
          },
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

  try {
    const work = await client.fetch(query, { slug });
    return work;
  } catch (error) {
    console.error("Error fetching work by slug:", error);
    return null;
  }
}
