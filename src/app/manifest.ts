import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Proximal Coast',
    short_name: 'Proximal Coast',
    description: 'Proximatic is our active project. Explore side projects Jerkstore and Slice, and the Proximal Coast archive of abandoned games.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D1418',
    theme_color: '#6A8292',
    icons: [
      {
        src: '/icon.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
