
import { Inter, Playfair_Display, Space_Mono } from "next/font/google"; // Assuming these are available or standard
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });

export default function OvermakeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "min-h-screen",
      inter.variable,
      playfair.variable,
      spaceMono.variable
    )}>
      {/* Scoped CSS Variables for themes */}
      <style>{`
        :root {
            --overmake-gold: #D4AF37;
            --overmake-black: #0a0a0a;
        }
        .theme-luxury {
            --bg-primary: var(--overmake-black);
            --text-primary: white;
            --accent: var(--overmake-gold);
            font-family: var(--font-playfair), serif;
        }
        .theme-trash {
            --bg-primary: #fef3c7;
            --text-primary: #7f1d1d;
            --accent: #dc2626;
            font-family: var(--font-space-mono), monospace;
        }
        .theme-standard {
            --bg-primary: white;
            --text-primary: #1f2937;
            --accent: #2563eb;
            font-family: var(--font-inter), sans-serif;
        }
      `}</style>
      {children}
    </div>
  );
}
