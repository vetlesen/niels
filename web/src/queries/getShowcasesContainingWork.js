import { client } from "../lib/client";

export async function getShowcasesContainingWork(workId) {
  const query = `*[_type == "showcase" && references($workId)] {
    _id,
    title,
    slug,
    password
  }`;

  try {
    const showcases = await client.fetch(query, { workId });
    return showcases;
  } catch (error) {
    console.error("Error fetching showcases containing work:", error);
    return [];
  }
}
