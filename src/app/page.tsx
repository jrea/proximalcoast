
import { getSortedPostsData } from "@/lib/posts";
import Link from "next/link";
import { Metadata } from "next";
import { Flame, ArrowRight } from "lucide-react";

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
            Proximal Coast
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 font-medium">
            Next-generation products, built on the edge.
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
