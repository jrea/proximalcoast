import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Hanko - Professional Document Signing';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#F5F5F0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '80px',
        }}
      >
        {/* Border */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            right: '40px',
            bottom: '40px',
            border: '2px solid #1A1A1A',
            opacity: 0.1,
          }}
        />

        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #1A1A1A',
            padding: '10px 30px',
            fontSize: '48px',
            fontWeight: 'bold',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '60px',
          }}
        >
          Hanko
        </div>

        {/* Main Text */}
        <div
          style={{
            fontSize: '72px',
            textAlign: 'center',
            color: '#1A1A1A',
            lineHeight: 1.1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>Secure Agreements with</span>
          <span style={{ color: '#BC241C', fontStyle: 'italic' }}>Precision & Integrity</span>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '80px',
            fontSize: '24px',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            opacity: 0.5,
          }}
        >
          Secure • Authenticated • Efficient
        </div>

        {/* Samurai Accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '60px',
            width: '120px',
            height: '120px',
            background: '#BC241C',
            borderRadius: '50%',
            opacity: 0.05,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
