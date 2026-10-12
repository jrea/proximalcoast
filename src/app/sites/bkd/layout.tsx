import { Noto_Serif_JP, Inter } from "next/font/google";
import "@/app/globals.css";
import "./bkd.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://bkd.proximalcoast.com"),
  title: "Bushin Kan Dojo | Member Portal",
  description: "Manage your Bushin Kan Dojo membership and account.",
  openGraph: {
    title: "Bushin Kan Dojo | Member Portal",
    description: "Manage your Bushin Kan Dojo membership and account.",
    siteName: "Bushin Kan Dojo",
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "Bushin Kan Dojo | Member Portal",
    description: "Manage your Bushin Kan Dojo membership and account.",
    images: [],
  },
};

const notoSerif = Noto_Serif_JP({ subsets: ["latin"], weight: ["400", "500", "600", "700", "900"], variable: "--bkd-font-subhead", preload: false });
const inter = Inter({ subsets: ["latin"], variable: "--bkd-font-body" });

export default function BKDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(notoSerif.variable, inter.variable, "bkd-container")}>
      <div className="bkd-grain-overlay" />
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          className: "bg-[#F7F2E8] border border-[#D1C7B7] rounded-none text-[#1A1A1B] font-['Inter',sans-serif] p-4",
        }}
      />
    </div>
  );
}
