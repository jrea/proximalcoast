import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Proximal Coast'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default function Image() {
  return new ImageResponse(
    (
      // ImageResponse render element
      <div
        style={{
          fontSize: 128,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            background: '#FFD700',
            width: 400,
            height: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: '20px solid black',
            color: '#FF0000',
            fontSize: 200,
            fontWeight: 'bold',
            lineHeight: 1,
            textShadow: '8px 8px 0px black',
            marginBottom: 40,
          }}
        >
          <div style={{ marginTop: '-24px' }}>PX</div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 'bold' }}>Proximal Coast</div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
