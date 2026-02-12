
import React from 'react';
import { Inter, JetBrains_Mono } from "next/font/google"; // Using generic Google fonts for the editor
import { cn } from "@/lib/utils";
import type { Metadata } from 'next';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "SLICE// - Pro Pan & Zoom Video Editor (Free & No Login)",
  description: "The fast, free, and intuitive video editor for dynamic pan and zoom effects. No accounts, no watermarks, just professional results in seconds. Add music and export high-quality clips directly in your browser.",
  keywords: ["video editor", "pan and zoom", "ken burns effect", "free video editor", "no login video editor", "video zoom tool", "online video editor", "slice video"],
  authors: [{ name: "Proximal Coast" }],
  openGraph: {
    title: "SLICE// - Professional Pan & Zoom Made Simple",
    description: "Create stunning pan and zoom effects for your videos for free. No login required. Professional results with music directly in your browser.",
    type: "website",
    url: "https://slice.proximalcoast.com",
    siteName: "SLICE//",
    images: [
      {
        url: "/og-slice.png", // We should probably generate this or use a placeholder
        width: 1200,
        height: 630,
        alt: "SLICE// Video Editor Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SLICE// - Free Pan & Zoom Video Editor",
    description: "Fast, free, and no login required. The best way to add dynamic motion to your clips.",
    images: ["/og-slice.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RefocusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SLICE//",
    "operatingSystem": "Web Browser",
    "applicationCategory": "MultimediaApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "A high-performance web-based video editor specializing in pan and zoom effects (Ken Burns). Free to use, no account required, and handles high-resolution video directly in the browser.",
    "featureList": [
      "Professional Pan and Zoom keyframing",
      "No login required",
      "Add music background",
      "Full client-side processing",
      "High-quality MP4/WebM export",
      "Responsive timeline"
    ]
  };

  return (
    <div className={cn(
      "font-sans antialiased bg-black text-white selection:bg-blue-500/30",
      inter.variable,
      jetbrains.variable
    )}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </div>
  );
}
