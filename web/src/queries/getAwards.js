import { client } from "../lib/client";

export async function getAwards() {
  const query = `*[_type == "awards"] | order(year desc) {
    _id,
    name,
    slug,
    organization,
    year,
    category,
    status,
    description,
    url,
    "linkedWorks": *[_type == "work" && references(^._id)] {
      _id,
      name,
      slug
    }
  }`;

  try {
    const awards = await client.fetch(query);
    return awards;
  } catch (error) {
    console.error("Error fetching awards:", error);
    return [];
  }
}

export async function getAwardBySlug(slug) {
  const query = `*[_type == "awards" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    organization,
    year,
    category,
    status,
    description,
    url
  }`;

  try {
    const award = await client.fetch(query, { slug });
    return award;
  } catch (error) {
    console.error("Error fetching award by slug:", error);
    return null;
  }
}
