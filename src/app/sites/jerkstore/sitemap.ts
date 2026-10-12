import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jerkstore.proximalcoast.com'
  // Shared blog posts belong to the main site's canonical URLs and sitemap.
  // Omit lastModified until the source tracks actual content revision dates.
  return [
    { url: baseUrl },
    { url: `${baseUrl}/privacy` },
    { url: `${baseUrl}/terms` },
  ]
}
