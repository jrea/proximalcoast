import { getPostData, getAllPostIds } from "@/lib/posts";
import Link from "next/link";
import { Metadata } from 'next';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const postData = await getPostData(slug);
  return {
    title: `${postData.title} | Proximal Coast`,
    description: `Read about ${postData.title} on Proximal Coast.`,
  };
}

export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map((path) => ({
    slug: path.params.slug,
  }));
}

export default async function Post({ params }: { params: Params }) {
  const { slug } = await params;
  const postData = await getPostData(slug);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start py-24 px-4 sm:px-8 bg-zinc-50 dark:bg-black font-sans">
      <main className="w-full max-w-2xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors mb-4 inline-block"
          >
            ← Back to home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
            {postData.title}
          </h1>
          <div className="text-zinc-500 dark:text-zinc-400">
            <time dateTime={postData.date}>{postData.date}</time>
          </div>
        </div>

        <article
          className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300"
          dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
        />
      </main>
    </div>
  );
}
