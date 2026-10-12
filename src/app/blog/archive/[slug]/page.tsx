import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllArchivePostIds, getArchivePostData } from "@/lib/posts";
import styles from "../../blog.module.css";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const postData = await getArchivePostData(slug);
    return {
      title: `${postData.title} | Proximal Coast Archive`,
      description: postData.description,
      alternates: {
        canonical: `https://www.proximalcoast.com/blog/archive/${slug}`,
      },
      openGraph: {
        title: `${postData.title} | Proximal Coast Archive`,
        description: postData.description,
        type: "article",
        publishedTime: postData.date,
        url: `https://www.proximalcoast.com/blog/archive/${slug}`,
      },
    };
  } catch {
    return {};
  }
}

export function generateStaticParams() {
  return getAllArchivePostIds().map((path) => ({
    slug: path.params.slug,
  }));
}

export default async function ArchivedPost({ params }: { params: Params }) {
  const { slug } = await params;
  let postData;

  try {
    postData = await getArchivePostData(slug);
  } catch {
    notFound();
  }

  return (
    <main className={styles.article}>
      <Link href="/blog/archive" className={styles.backLink}>
        ← Back to archive
      </Link>
      <div>
        <div className={styles.archiveLabel}>Archived post</div>
        <h1>{postData.title}</h1>
        <div className={styles.articleDate}>
          <time dateTime={postData.date}>{postData.date}</time>
        </div>
      </div>

      <article
        className={styles.articleBody}
        dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
      />
    </main>
  );
}
