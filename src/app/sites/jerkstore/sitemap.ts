import { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData()
  const jerkstorePosts = posts
    .filter(post => post.site === 'jerkstore')
    .map((post) => ({
      url: `https://jerkstore.proximalcoast.com/blog/${post.id}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [
    {
      url: 'https://jerkstore.proximalcoast.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...jerkstorePosts,
  ]
}
