
import React from 'react';
import { Inter, JetBrains_Mono } from "next/font/google"; // Using generic Google fonts for the editor
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RefocusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "font-sans antialiased bg-black text-white selection:bg-blue-500/30",
      inter.variable,
      jetbrains.variable
    )}>
      {children}
    </div>
  );
}
