import { client } from "../lib/client";

export async function getWorkBySlug(slug) {
  const query = `*[_type == "work" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    title,
    type,
    year,
    category,
    video {
      asset-> {
        _id,
        playbackId,
        assetId,
        status
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
    }
  }`;

  try {
    const work = await client.fetch(query, { slug });
    return work;
  } catch (error) {
    console.error("Error fetching work by slug:", error);
    return null;
  }
}
