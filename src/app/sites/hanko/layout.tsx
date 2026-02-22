import type { Metadata } from 'next';
import './hanko.css';

export const metadata: Metadata = {
  title: 'Hanko | Secure & Minimalist Document Signing',
  description: 'The premium standard for cryptographic document signing. Secure, authenticated, and audit-ready PDF signatures for modern organizations.',
  keywords: ['secure PDF signing', 'cryptographic signature', 'digital signature', 'Hanko', 'audit-ready e-sign', 'minimalist document signing'],
  openGraph: {
    title: 'Hanko | Secure & Minimalist Document Signing',
    description: 'The premium standard for cryptographic document signing. Secure, authenticated, and audit-ready.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hanko | Secure & Minimalist Document Signing',
    description: 'The premium standard for cryptographic document signing. Secure, authenticated, and audit-ready.',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Dancing+Script&family=Great+Vibes&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-[var(--hanko-surface)] text-[var(--hanko-ink)] relative selection:bg-[#BC241C] selection:text-white pb-32 antialiased">
        {/* Shoji Screen Slide Effect */}
        <div className="hanko-slide-enter flex flex-col min-h-screen">
          <header className="p-8 border-b border-[var(--hanko-border)] flex justify-between items-center z-10 relative">
            <div className="flex items-center justify-center border-2 border-[var(--hanko-ink)] px-3 py-1 relative font-bold tracking-widest text-lg uppercase cursor-crosshair">
              Hanko
            </div>
            <nav className="flex space-x-12">
              <a href="/admin" className="text-sm tracking-widest uppercase hover:text-[var(--hanko-primary)] transition-colors">Dashboard</a>
              <a href="/settings" className="text-sm tracking-widest uppercase hover:text-[var(--hanko-primary)] transition-colors">Settings</a>
            </nav>
          </header>

          <main className="flex-1 relative z-10 w-full hanko-container pt-16">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
