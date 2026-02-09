import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FFD700',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '2px solid black',
          color: '#FF0000',
          fontSize: 18,
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          textShadow: '1px 1px 0px black',
          marginTop: '-2px',
        }}
      >
        PX
      </div>
    ),
    {
      ...size,
    }
  )
}
