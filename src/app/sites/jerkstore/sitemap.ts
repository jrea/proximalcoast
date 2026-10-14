import type { MetadataRoute } from 'next'
import { LANGUAGE_PAGES } from './_lib/language-pages'
import { languagePath } from './_lib/language-seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jerkstore.proximalcoast.com'
  // Shared blog posts belong to the main site's canonical URLs and sitemap.
  // The source doesn't track per-page content revision dates, so entries use
  // the generation date: the sitemap is regenerated on every deploy, which
  // keeps lastModified fresh without claiming per-page edit history.
  const lastModified = new Date()
  return [
    { url: baseUrl, lastModified },
    { url: `${baseUrl}/languages`, lastModified },
    ...LANGUAGE_PAGES.map(language => ({ url: `${baseUrl}${languagePath(language)}`, lastModified })),
    { url: `${baseUrl}/privacy`, lastModified },
    { url: `${baseUrl}/terms`, lastModified },
  ]
}
