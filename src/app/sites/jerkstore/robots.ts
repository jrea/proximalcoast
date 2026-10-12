import type { MetadataRoute } from 'next'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Account and utility HTML stays crawlable so its noindex can be read.
      disallow: ['/api/'],
    },
    sitemap: 'https://jerkstore.proximalcoast.com/sitemap.xml',
  } satisfies MetadataRoute.Robots
}
