import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Proximal Coast',
    short_name: 'Proximal Coast',
    description: 'Next-generation site builder and management.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#FFD700',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
