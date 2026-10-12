import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getSortedCurrentPostsData } from "@/lib/posts";
import styles from "./blog.module.css";

const youtubeUrl = "https://youtube.com/@proximalcoast?si=YrGTcslpwd4hJJ8d";
const redditUrl = "https://www.reddit.com/u/proximalcoast/s/wxBNT1HH4r";
const discordUrl = "https://discord.gg/3S6YXC2FQ";

export const metadata: Metadata = {
  title: "Blog | Proximal Coast",
  description: "Project-specific updates, videos, and notes from Proximal Coast.",
  alternates: { canonical: "https://proximalcoast.com/blog" },
  openGraph: {
    title: "Blog | Proximal Coast",
    description: "Project-specific updates, videos, and notes from Proximal Coast.",
    type: "website",
    url: "https://proximalcoast.com/blog",
    images: ["https://proximalcoast.com/opengraph-image"],
  },
};

export default function BlogIndex() {
  const posts = getSortedCurrentPostsData();

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Proximal Coast</Link>
        <nav className={styles.nav} aria-label="Blog navigation">
          <Link href="/">Home</Link>
          <a href={youtubeUrl} target="_blank" rel="noreferrer">YouTube</a>
          <a href={discordUrl} target="_blank" rel="noreferrer">Discord</a>
          <a href={redditUrl} target="_blank" rel="noreferrer">Reddit</a>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="blog-title">
        <div className={styles.eyebrow}>Project updates</div>
        <h1 id="blog-title" className={styles.title}>Blog</h1>
        <p className={styles.intro}>
          Notes from across Proximal Coast. Earlier writing remains available in the archive.
        </p>
        <Link href="/blog/archive" className={styles.archiveLink}>
          Open the archive
          <ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </section>

      <section className={styles.posts} aria-label="Current project updates">
        {posts.length > 0 ? (
          <div className={styles.postList}>
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className={styles.postRow}>
                <div className={styles.postMeta}>
                  <time dateTime={post.date}>{post.date}</time>
                  <span className={styles.tag}>{post.game ?? post.site ?? "project"}</span>
                </div>
                <div className={styles.postCopy}>
                  <h2>{post.title}</h2>
                  <p>{post.description}</p>
                </div>
                <ArrowUpRight size={18} strokeWidth={1.6} aria-hidden="true" />
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.eyebrow}>Earlier writing</span>
            <h2>Explore the archive.</h2>
            <Link href="/blog/archive" className={styles.archiveLink}>
              Read past posts
              <ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
