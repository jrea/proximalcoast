import { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData()
  const hankoPosts = posts
    .filter(post => post.site === 'hanko' || post.site === 'all')
    .map((post) => ({
      url: `https://hanko.proximalcoast.com/blog/${post.id}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [
    {
      url: 'https://hanko.proximalcoast.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://hanko.proximalcoast.com/auth',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...hankoPosts,
  ]
}
