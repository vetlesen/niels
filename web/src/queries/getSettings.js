import { client } from "../lib/client";

export async function getSettings() {
  const query = `*[_type == "settings"][0] {
    title,
    bio,
    contact[] {
      label,
      value,
      url
    },
    representation[] {
      label,
      value,
      url
    },
    awards->{
      _id,
      title,
      items[] {
        year,
        award,
        project
      }
    },
    image[] {
      _type == "image" => {
        _type,
        asset->{
          _id,
          url
        },
        hotspot,
        crop
      },
      _type == "mux.video" => {
        _type,
        asset->{
          _id,
          playbackId
        }
      },
      _type == "video" => {
        _type,
        videoType,
        video {
          asset->{
            _id,
            playbackId
          }
        }
      },
      _type == "object" => {
        _type,
        content
      }
    },
    seoTitle,
    seoDescription,
    keywords,
    ogImage {
      asset->{
        _id,
        url
      }
    }
  }`;

  try {
    const settings = await client.fetch(query);
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}
