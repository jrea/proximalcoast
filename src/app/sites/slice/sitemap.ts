import { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedPostsData()
  const slicePosts = posts
    .filter(post => post.site === 'slice')
    .map((post) => ({
      url: `https://slice.proximalcoast.com/blog/${post.id}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  return [
    {
      url: 'https://slice.proximalcoast.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...slicePosts,
  ]
}
