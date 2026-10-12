import type { Metadata } from "next";
import { Suspense } from "react";
import { JerkstoreAnalytics } from "./_components/analytics";
import { Fraunces, Syne, Bebas_Neue, Comic_Neue } from "next/font/google";
import { CookieBanner } from "./_components/cookie-banner";
import { Toaster } from "sonner";

const title = "Jerkstore | AI Roast Generator";
const description = "AI-generated roasts, funny insults, and comebacks. Pick a topic and choose the heat with Jerkstore.";
const socialImage = "https://jerkstore.proximalcoast.com/opengraph-image";

export const metadata: Metadata = {
  metadataBase: new URL("https://jerkstore.proximalcoast.com"),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "Jerkstore",
    type: "website",
    images: [{ url: socialImage, width: 1200, height: 630, alt: "Jerkstore AI roast generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const comic = Comic_Neue({
  variable: "--font-comic",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function JerkstoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${fraunces.variable} ${syne.variable} ${bebas.variable} ${comic.variable} font-sans`}>
      <Suspense fallback={null}><JerkstoreAnalytics /></Suspense>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          className: "border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-sans font-bold uppercase rounded-none",
          style: {
            borderRadius: "0px",
            background: "white",
            color: "black",
          }
        }}
      />
      <CookieBanner />
    </div>
  );
}
