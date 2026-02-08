import { getSortedPostsData } from "@/lib/posts";
import Link from "next/link";

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-24 px-4 sm:px-8 bg-zinc-50 dark:bg-black font-sans">
      <main className="w-full max-w-2xl">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 mb-4">
            Proximal Coast
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Notes on building software products.
          </p>
        </header>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-zinc-800 dark:text-zinc-200">
            Latest Posts
          </h2>
          <ul className="space-y-6">
            {allPostsData.map(({ id, date, title }) => (
              <li key={id} className="border-b border-zinc-200 dark:border-zinc-800 pb-6 last:border-0 last:pb-0">
                <Link href={`/blog/${id}`} className="group block">
                  <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <time dateTime={date}>{date}</time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
