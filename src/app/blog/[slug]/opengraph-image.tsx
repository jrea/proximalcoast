import { ImageResponse } from 'next/og'
import { getPostData } from '@/lib/posts'

// Image metadata
export const alt = 'Proximal Coast Blog'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

type Params = Promise<{ slug: string }>;

// Image generation
export default async function Image({ params }: { params: Params }) {
  const { slug } = await params
  const postData = await getPostData(slug)

  return new ImageResponse(
    (
      // ImageResponse render element
      <div
        style={{
          fontSize: 84,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          color: 'white',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              background: '#FFD700',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              marginRight: '20px',
              color: 'black',
              fontSize: '40px',
              fontWeight: 'bold',
            }}
          >
            PX
          </div>
          <div
            style={{
              fontSize: '32px',
              color: '#FFD700',
              fontWeight: '600',
              letterSpacing: '0.1em',
            }}
          >
            PROXIMAL COAST
          </div>
        </div>
        <div
          style={{
            fontSize: '84px',
            fontWeight: 'bold',
            lineHeight: '1.1',
            marginBottom: '20px',
            maxWidth: '1000px',
          }}
        >
          {postData.title}
        </div>
        <div
          style={{
            fontSize: '32px',
            color: '#A1A1AA',
          }}
        >
          {postData.date}
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
