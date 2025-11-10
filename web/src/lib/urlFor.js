// /lib/urlFor.js
import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";

const builder = imageUrlBuilder(client);

/**
 * Generate optimized image URLs from Sanity image assets
 * @param {Object} source - Sanity image asset reference
 * @returns {Object} - Image URL builder with chainable methods
 */
export function urlFor(source) {
  return builder.image(source);
}
