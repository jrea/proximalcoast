import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";

import { getGameProject, gameProjects } from "@/content/games";
import { getPostsForGame } from "@/lib/posts";
import { cn } from "@/lib/utils";
import styles from "../games.module.css";

const youtubeUrl = "https://youtube.com/@proximalcoast?si=YrGTcslpwd4hJJ8d";
const redditUrl = "https://www.reddit.com/u/proximalcoast/s/wxBNT1HH4r";
const discordUrl = "https://discord.gg/3S6YXC2FQ";

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

  const description = `${game.description} Abandoned project, preserved in the Proximal Coast game archive.`;

  return {
    title: `${game.title} — Abandoned | Proximal Coast`,
    description,
    alternates: {
      canonical: `https://www.proximalcoast.com/games/${game.slug}`,
    },
    openGraph: {
      title: `${game.title} — Abandoned | Proximal Coast`,
      description,
      type: "website",
      url: `https://www.proximalcoast.com/games/${game.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.title} — Abandoned | Proximal Coast`,
      description,
    },
  };
}

export default async function GamePage({ params }: { params: Params }) {
  const { slug } = await params;
  const game = getGameProject(slug);

  if (!game) {
    notFound();
  }

  const updates = getPostsForGame(game.slug);

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
            <a href={discordUrl} target="_blank" rel="noreferrer">Discord</a>
            <a href={redditUrl} target="_blank" rel="noreferrer">Reddit</a>
          </nav>
        </header>

        <section className={styles.hero} aria-labelledby="game-title">
          <div className={styles.heroCopy}>
            <Link href="/#games" className={styles.backLink}>← Game archive</Link>
            <p className={styles.eyebrow}>{game.category} / {game.status}</p>
            <h1 id="game-title" className={styles.title}>{game.title}</h1>
            <p className={styles.description}>{game.description}</p>

            <div className={styles.meta}>
              {game.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>

            <div className={styles.actions}>
              <Link href={`/games/${game.slug}/blog`} className={styles.primaryAction}>
                Project history
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </Link>
              <a href={youtubeUrl} target="_blank" rel="noreferrer" className={styles.textAction}>
                Proximal Coast on YouTube
                <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className={styles.projectArt} aria-hidden="true">
            {game.theme === "sixDof" && (
              <>
                <span className={styles.artNumber}>6</span>
                <span className={styles.artLabel}>DOF</span>
                <span className={styles.artIndex}>GAME / 01</span>
              </>
            )}
            {game.theme === "misuse" && (
              <>
                <span className={styles.artWord}>FORESEEABLE</span>
                <span className={styles.artWord}>MISUSE</span>
                <span className={styles.artIndex}>PROJECT / 02</span>
              </>
            )}
            {game.theme === "horror" && (
              <>
                <span className={styles.artWord}>SURVIVE</span>
                <span className={styles.artLabel}>/</span>
                <span className={styles.artIndex}>GAME / 03</span>
              </>
            )}
          </div>
        </section>

        <section className={styles.updates} aria-labelledby="updates-title">
          <div className={styles.updatesHeader}>
            <div>
              <p className={styles.eyebrow}>Preserved project notes</p>
              <h2 id="updates-title" className={styles.updatesTitle}>Project history</h2>
            </div>
            <Link href={`/games/${game.slug}/blog`} className={styles.updatesLink}>
              Browse project notes
              <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
            </Link>
          </div>

          {updates.length > 0 ? (
            <div className={styles.updateList}>
              {updates.map((post) => (
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
              <span className={styles.emptyLabel}>Abandoned project</span>
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
