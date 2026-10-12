import { MetadataRoute } from 'next'
import { getSortedArchivePostsData, getSortedCurrentPostsData } from '@/lib/posts'
import { gameProjects } from '@/content/games'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getSortedCurrentPostsData()
  const archivePosts = getSortedArchivePostsData()
  const baseUrl = 'https://proximalcoast.com'

  const blogPosts = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const archivedPosts = archivePosts.map((post) => ({
    url: `${baseUrl}/blog/archive/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  const gameRoutes = gameProjects.flatMap((game) => [
    {
      url: `${baseUrl}/games/${game.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/games/${game.slug}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ])

  const routes = ['', '/blog', '/blog/archive'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1,
  }))

  return [...routes, ...gameRoutes, ...blogPosts, ...archivedPosts]
}
