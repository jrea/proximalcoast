
import { getSortedPostsData } from "@/lib/posts";
import Link from "next/link";
import { Metadata } from "next";
import { Flame, ArrowRight, Disc } from "lucide-react";
import { IdentityDisk } from "./sites/slice/_components/identity-disk";

export const metadata: Metadata = {
  title: "Proximal Coast | AI Products & Software Experiments",
  description: "Exploring the boundaries of AI-powered software. From psychological warfare engines to productivity tools, we build next-generation products on the edge.",
  keywords: ["AI insults", "AI products", "Next.js", "Vercel", "DeepSeek", "software experiments", "Jerkstore"],
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
    <div className="flex min-h-screen flex-col items-center justify-start py-24 px-4 sm:px-8 bg-zinc-50 dark:bg-[#050505] font-sans selection:bg-blue-500 selection:text-white">
      <main className="w-full max-w-2xl">
        <header className="mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-300 dark:to-zinc-500">
            Proximal Coast Product Lab
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 font-medium">
            Building unhinged and useful software on the edge.
          </p>
        </header>

        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-sm">
              Live Applications
            </h2>
            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800 ml-4"></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Link
              href="https://jerkstore.proximalcoast.com"
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-all hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-500/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 transition-transform group-hover:scale-110">
                    <Flame className="h-6 w-6 stroke-[2.5px] fill-red-500/20" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      Jerkstore
                      <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
                        Live
                      </span>
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      The world's most aggressive AI insult generator. Destroy your ego for $5.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-red-500" />
              </div>
            </Link>

            <Link
              href="https://slice.proximalcoast.com"
              className="group relative overflow-hidden rounded-2xl border border-[#28E7FF]/20 bg-[#02090E] p-8 transition-all hover:shadow-[0_0_50px_rgba(40,231,255,0.15)] hover:border-[#28E7FF]/50 font-mono"
            >
              {/* TRON Grid Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(40,231,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(40,231,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] transform rotateX-[60deg] scale-150" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02090E] via-transparent to-transparent" />
              </div>

              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,#28E7FF_50%)] bg-[size:100%_4px] animate-[scan_10s_linear_infinite]" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <div className="shrink-0 relative">
                  <IdentityDisk size="md" className="group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(40,231,255,0.3)]" />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <h3 className="text-2xl font-black italic tracking-tighter flex items-center justify-center sm:justify-start gap-1 transform skew-x-[-12deg]">
                      <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">SLICE</span>
                      <span className="flex tracking-[-0.3em] ml-1">
                        <span className="text-[#FF8F00] drop-shadow-[0_0_10px_#FF8F00]">/</span>
                        <span className="text-[#28E7FF] drop-shadow-[0_0_10px_#28E7FF]">/</span>
                      </span>
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start gap-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#28E7FF] bg-[#28E7FF]/10 px-2 py-0.5 border border-[#28E7FF]/20">
                        LIVE_SYSTEM
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#6FC3DF] font-bold uppercase tracking-widest leading-relaxed max-w-md">
                    High-performance <span className="text-white">Pan & Zoom</span> editor. Browser-native architecture with zero-friction rendering core.
                  </p>

                  <div className="mt-6 flex items-center justify-center sm:justify-start gap-6 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
                    <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#28E7FF] rounded-full shadow-[0_0_5px_#28E7FF]" /> NO_LOGIN</span>
                    <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FF8F00] rounded-full shadow-[0_0_5px_#FF8F00]" /> 100%_FREE</span>
                  </div>
                </div>

                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-[#28E7FF] drop-shadow-[0_0_10px_#28E7FF]" />
                </div>
              </div>
            </Link>

            <div className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-6 opacity-60">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                  <span className="text-xl font-bold">?</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-500 dark:text-zinc-400">
                    Coming Soon
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500 font-mono">
                    Something unhinged is brewing...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest text-sm">
              Engineering Notes
            </h2>
            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800 ml-4"></div>
          </div>

          <ul className="space-y-4">
            {allPostsData.map(({ id, date, title }) => (
              <li key={id}>
                <Link href={`/blog/${id}`} className="group block rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-950 p-4 -mx-4 transition-all">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                      {title}
                    </h3>
                    <time dateTime={date} className="text-xs font-mono text-zinc-400">
                      {date}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="mt-32 text-zinc-400 dark:text-zinc-600 text-xs font-mono uppercase tracking-widest">
        &copy; 2026 Proximal Coast &bull; Built on the edge
      </footer>
    </div>
  );
}
