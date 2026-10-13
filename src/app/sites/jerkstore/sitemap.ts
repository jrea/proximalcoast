import type { MetadataRoute } from 'next'
import { LANGUAGE_PAGES } from './_lib/language-pages'
import { languagePath } from './_lib/language-seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jerkstore.proximalcoast.com'
  // Shared blog posts belong to the main site's canonical URLs and sitemap.
  // Omit lastModified until the source tracks actual content revision dates.
  return [
    { url: baseUrl },
    { url: `${baseUrl}/languages` },
    ...LANGUAGE_PAGES.map(language => ({ url: `${baseUrl}${languagePath(language)}` })),
    { url: `${baseUrl}/privacy` },
    { url: `${baseUrl}/terms` },
  ]
}
