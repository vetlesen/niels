import { client } from "../lib/client";

export async function getShowcaseBySlug(slug) {
  const query = `*[_type == "showcase" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    password,
    description,
    works[]-> {
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
            duration
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
      stack[0...10] {
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
      }
    }
  }`;

  try {
    const showcase = await client.fetch(query, { slug });
    return showcase;
  } catch (error) {
    console.error("Error fetching showcase by slug:", error);
    return null;
  }
}
