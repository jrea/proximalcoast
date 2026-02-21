import { Inter } from "next/font/google";
import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function BKDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(inter.className, "bg-neutral-50 text-neutral-900 min-h-screen")}>
      {children}
      <Toaster
        toastOptions={{
          className: "bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-black/5 rounded-sm text-neutral-900 font-sans p-4",
        }}
      />
    </div>
  );
}
