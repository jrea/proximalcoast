import { Fraunces, Syne, Bebas_Neue, Comic_Neue } from "next/font/google";
import { CookieBanner } from "./_components/cookie-banner";
import { Toaster } from "sonner";

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
