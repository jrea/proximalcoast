import { Shippori_Mincho, Noto_Serif_JP, Inter } from "next/font/google";
import "@/app/globals.css";
import "./bkd.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const shippori = Shippori_Mincho({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--bkd-font-display" });
const notoSerif = Noto_Serif_JP({ subsets: ["latin"], weight: ["400", "500", "600", "700", "900"], variable: "--bkd-font-subhead" });
const inter = Inter({ subsets: ["latin"], variable: "--bkd-font-body" });

export default function BKDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(shippori.variable, notoSerif.variable, inter.variable, "bkd-container")}>
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
