import { client } from "../lib/client";

export async function getSettings() {
  const query = `*[_type == "settings"][0] {
    title,
    bio,
    contact[] {
      label,
      value
    },
    representation[] {
      label,
      value
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
    image {
      asset->{
        _id,
        url
      },
      hotspot,
      crop
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
