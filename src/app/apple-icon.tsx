import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
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
          border: '10px solid black',
          color: '#FF0000',
          fontSize: 100,
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          lineHeight: 1,
          textShadow: '4px 4px 0px black',
          marginTop: '-12px',
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
