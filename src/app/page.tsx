import { getSortedPostsData } from "@/lib/posts";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { JerkstoreCard } from "./_components/jerkstore-card";
import { SliceCard } from "./_components/slice-card";
import { ComingSoonCard } from "./_components/coming-soon-card";

import { GundamSidebar } from "@/components/gundam-sidebar";

export const metadata: Metadata = {
  title: "Proximal Coast | AI Products & Software Experiments",
  description: "Exploring the boundaries of AI-powered software. From psychological warfare engines to productivity tools, we build next-generation products on the edge.",
  keywords: ["AI insults", "AI roast", "insult generator", "Jerkstore", "DeepSeek", "software experiments", "proximal coast"],
  openGraph: {
    title: "Proximal Coast | AI Products & Software Experiments",
    description: "Building unhinged and useful AI products on the edge.",
    type: "website",
    url: "https://proximalcoast.com",
    siteName: "Proximal Coast",
  },
  twitter: {
    card: "summary_large_image",
    title: "Proximal Coast | AI Products & Software Experiments",
    description: "Building unhinged and useful AI products on the edge.",
  },
};

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#050505] font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Premium Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

      {/* Gundam-style Vertical Sidebar */}
      <GundamSidebar />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-32 lg:ml-36 relative z-10 py-12 px-6 sm:px-12 max-w-6xl">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[2px] w-12 bg-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-600">
              System_Status // Online
            </h2>
          </div>
          <p className="text-2xl sm:text-4xl font-black italic tracking-tighter text-zinc-800 dark:text-zinc-200 leading-tight max-w-2xl transform skew-x-[-1deg]">
            Building <span className="text-blue-600 dark:text-blue-400">unhinged</span> and <span className="text-red-600 dark:text-red-500 underline decoration-4">useful</span> software on the edge of the data slog.
          </p>
        </header>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8 group">
            <h2 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-600" /> Live_Systems
            </h2>
            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800/50 ml-8 transition-all group-hover:bg-blue-600/30"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-10 max-w-4xl">
            <JerkstoreCard />
            <SliceCard />
            <ComingSoonCard />
          </div>
        </section>

        <section className="max-w-4xl">
          <div className="flex items-center justify-between mb-8 group">
            <h2 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-2 h-2 bg-red-600" /> Engineering_Notes
            </h2>
            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800/50 ml-8 transition-all group-hover:bg-red-600/30"></div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {allPostsData.map(({ id, date, title }) => (
              <li key={id}>
                <Link href={`/blog/${id}`} className="group h-full flex items-center justify-between border-l-4 border-zinc-200 dark:border-zinc-800 hover:border-blue-600 bg-white dark:bg-zinc-900/30 px-6 py-4 transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-400 mb-1 uppercase tracking-widest">{date}</span>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 group-hover:translate-x-1 transition-transform">
                      {title}
                    </h3>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-blue-600 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-24 pb-16 text-zinc-400 dark:text-zinc-700 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-6">
          <div className="w-12 h-[2px] bg-zinc-200 dark:bg-zinc-800" />
          &copy; 2026 Proximal Coast &bull; Built on the edge
          <div className="w-12 h-[2px] bg-zinc-200 dark:bg-zinc-800" />
        </footer>
      </main>
    </div>
  );
}
