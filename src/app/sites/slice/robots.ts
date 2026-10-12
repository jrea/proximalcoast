import type { MetadataRoute } from 'next'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: 'https://slice.proximalcoast.com/sitemap.xml',
  } satisfies MetadataRoute.Robots
}
