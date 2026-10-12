import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getSortedArchivePostsData } from "@/lib/posts";
import styles from "../blog.module.css";

export const metadata: Metadata = {
  title: "Blog Archive | Proximal Coast",
  description: "Earlier Proximal Coast posts and project notes, preserved in the archive.",
  alternates: { canonical: "https://proximalcoast.com/blog/archive" },
  openGraph: {
    title: "Blog Archive | Proximal Coast",
    description: "Earlier Proximal Coast posts and project notes, preserved in the archive.",
    type: "website",
    url: "https://proximalcoast.com/blog/archive",
    images: ["https://proximalcoast.com/opengraph-image"],
  },
};

export default function BlogArchive() {
  const posts = getSortedArchivePostsData();

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Proximal Coast</Link>
        <nav className={styles.nav} aria-label="Archive navigation">
          <Link href="/blog">Blog</Link>
          <Link href="/">Home</Link>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="archive-title">
        <div className={styles.eyebrow}>Earlier posts / preserved</div>
        <h1 id="archive-title" className={styles.title}>Archive</h1>
        <p className={styles.intro}>
          These posts remain available as a record of earlier work across Proximal Coast.
        </p>
      </section>

      <section className={styles.posts} aria-label="Archived posts">
        <div className={styles.postList}>
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/archive/${post.id}`} className={styles.postRow}>
              <div className={styles.postMeta}>
                <time dateTime={post.date}>{post.date}</time>
                <span className={styles.tag}>archived / {post.site ?? "project"}</span>
              </div>
              <div className={styles.postCopy}>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
              </div>
              <ArrowUpRight size={18} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
