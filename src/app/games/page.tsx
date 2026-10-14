import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { gameProjects } from "@/content/games";
import { cn } from "@/lib/utils";
import styles from "./games.module.css";

const youtubeUrl = "https://youtube.com/@proximalcoast?si=YrGTcslpwd4hJJ8d";
const redditUrl = "https://www.reddit.com/u/proximalcoast/s/wxBNT1HH4r";
const discordUrl = "https://discord.gg/3S6YXC2FQ";

const description =
  "The Proximal Coast game archive: Failsafe, Foreseeable Misuse, and Horror Survival Craft. Abandoned projects, preserved with their notes and history.";

export const metadata: Metadata = {
  title: "Game Archive | Proximal Coast",
  description,
  alternates: { canonical: "https://www.proximalcoast.com/games" },
  openGraph: {
    title: "Game Archive | Proximal Coast",
    description,
    type: "website",
    url: "https://www.proximalcoast.com/games",
    images: ["https://www.proximalcoast.com/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Game Archive | Proximal Coast",
    description,
  },
};

export default function GamesIndex() {
  return (
    <main className={cn(styles.page)}>
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
            <Link href="/blog">Blog</Link>
            <a href={youtubeUrl} target="_blank" rel="noreferrer">YouTube</a>
            <a href={discordUrl} target="_blank" rel="noreferrer">Discord</a>
            <a href={redditUrl} target="_blank" rel="noreferrer">Reddit</a>
          </nav>
        </header>

        <section aria-labelledby="games-title">
          <p className={styles.eyebrow}>Proximal Coast / Archive</p>
          <h1 id="games-title" className={styles.title}>Game archive</h1>
          <p className={styles.description}>
            Game projects we started, worked on seriously, and stopped.
            Each one is preserved here with its notes and project history.
            None of them are coming back.
          </p>
        </section>

        <section className={styles.updates} aria-label="Archived game projects">
          <div className={styles.updateList}>
            {gameProjects.map((game) => (
              <Link key={game.slug} href={`/games/${game.slug}`} className={styles.updateRow}>
                <span className={styles.updateMeta}>{game.category}</span>
                <div className={styles.updateCopy}>
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                </div>
                <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
              </Link>
            ))}
          </div>
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
          <span className={styles.footerMeta}>© 2026 / Game archive</span>
        </footer>
      </div>
    </main>
  );
}
