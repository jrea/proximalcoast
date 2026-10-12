import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";

import { getGameProject, gameProjects } from "@/content/games";
import { getPostsForGame } from "@/lib/posts";
import { cn } from "@/lib/utils";
import styles from "../../games.module.css";

const youtubeUrl = "https://youtube.com/@proximalcoast?si=YrGTcslpwd4hJJ8d";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return gameProjects.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameProject(slug);

  if (!game) {
    return {};
  }

  return {
    title: `${game.title} History | Proximal Coast`,
    description: `Preserved project notes for ${game.title}, an abandoned game project from Proximal Coast.`,
    alternates: {
      canonical: `https://proximalcoast.com/games/${game.slug}/blog`,
    },
  };
}

export default async function GameBlog({ params }: { params: Params }) {
  const { slug } = await params;
  const game = getGameProject(slug);

  if (!game) {
    notFound();
  }

  const posts = getPostsForGame(game.slug);

  return (
    <main className={cn(styles.page, styles[game.theme])}>
      <div className={styles.content}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label="Proximal Coast home">
            <Image
              src="/proximal-coast-mark-final.svg"
              alt=""
              width={610}
              height={630}
              className={styles.brandMark}
              priority
            />
            <span className={styles.brandTitle}>Proximal Coast</span>
          </Link>

          <nav className={styles.nav} aria-label="Site navigation">
            <Link href="/#games">Game archive</Link>
            <Link href="/blog">Blog</Link>
            <a href={youtubeUrl} target="_blank" rel="noreferrer">YouTube</a>
          </nav>
        </header>

        <section className={styles.hero} aria-labelledby="updates-page-title">
          <div className={styles.heroCopy}>
            <Link href={`/games/${game.slug}`} className={styles.backLink}>← {game.title}</Link>
            <p className={styles.eyebrow}>Project history / {game.status}</p>
            <h1 id="updates-page-title" className={styles.title}>History</h1>
            <p className={styles.description}>
              Preserved notes from {game.title}. This project is abandoned and is no longer in development.
            </p>
          </div>
        </section>

        <section className={styles.updates} aria-labelledby="updates-title">
          <div className={styles.updatesHeader}>
            <div>
              <p className={styles.eyebrow}>{game.title}</p>
              <h2 id="updates-title" className={styles.updatesTitle}>Project notes</h2>
            </div>
            <Link href={`/games/${game.slug}`} className={styles.updatesLink}>
              Back to project
              <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className={styles.updateList}>
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className={styles.updateRow}>
                  <time className={styles.updateMeta} dateTime={post.date}>{post.date}</time>
                  <div className={styles.updateCopy}>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                  </div>
                  <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyUpdate}>
              <span className={styles.emptyLabel}>No published project notes</span>
              <h3>{game.emptyUpdateTitle}</h3>
              <p>{game.emptyUpdateDescription}</p>
              <Link href="/#games">
                Browse the game archive
                <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        <footer className={styles.footer}>
          <Link href="/" className={styles.footerBrand} aria-label="Proximal Coast home">
            <Image
              src="/proximal-coast-mark-final.svg"
              alt=""
              width={610}
              height={630}
              className={styles.footerMark}
            />
            <span>Proximal Coast</span>
          </Link>
          <span className={styles.footerMeta}>© 2026 / {game.title}</span>
        </footer>
      </div>
    </main>
  );
}
