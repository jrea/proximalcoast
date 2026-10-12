import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck, FileText, Scissors, Users } from "lucide-react";

import { ForeseeableMisuseCard } from "./_components/foreseeable-misuse-card";
import { HorrorSurvivalCard } from "./_components/horror-survival-card";
import { SixDofCard } from "./_components/sixdof-card";
import { Logo as JerkstoreLogo } from "./sites/jerkstore/_components/logo";
import styles from "./home.module.css";

const description = "Proximatic is our active project: AI shift scheduling for event crews and volunteers. Explore side projects Jerkstore and Slice, and our abandoned game archive.";

export const metadata: Metadata = {
  title: "Proximal Coast | Software & Projects",
  description,
  alternates: { canonical: "https://proximalcoast.com" },
  openGraph: {
    title: "Proximal Coast | Software & Projects",
    description,
    type: "website",
    url: "https://proximalcoast.com",
    siteName: "Proximal Coast",
  },
  twitter: {
    card: "summary_large_image",
    title: "Proximal Coast | Software & Projects",
    description,
  },
};

export default function Home() {
  return (
    <main className={styles.site}>
      <a href="#projects" className={styles.skipLink}>Skip to Proximatic</a>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.content}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label="Proximal Coast home">
            <Image src="/proximal-coast-logo-final.svg" alt="Proximal Coast" width={758} height={870} className={styles.brandLogo} priority />
          </Link>
          <nav className={styles.headerNav} aria-label="Site navigation">
            <a href="#projects">Proximatic</a>
            <a href="#side-projects">Side projects</a>
            <a href="#games">Abandoned games</a>
          </nav>
        </header>

        <section id="projects" className={styles.projectsSection} aria-labelledby="proximatic-title">
          <p className={styles.eyebrow}>Proximal Coast / Our current project</p>
          <a href="https://www.proximatic.app" className={styles.proximaticCard}>
            <div className={styles.productCopy}>
              <span className={styles.activeLabel}><span aria-hidden="true" /> Active project</span>
              <h1 id="proximatic-title"><Image src="/proximatic-wordmark.svg" alt="Proximatic" width={652} height={143} className={styles.proximaticWordmark} /></h1>
              <p className={styles.productTagline}>Your event.<br /><span>Automatic.</span></p>
              <p className={styles.productDescription}>AI shift scheduling for event crews and volunteers. Turn an event brief into a working event and roster, with signups and attendance connected.</p>
              <span className={styles.productDestination}>
                <span className={styles.productCta}>Visit Proximatic <ArrowUpRight size={18} aria-hidden="true" /></span>
                <span className={styles.productDomain}>www.proximatic.app</span>
              </span>
            </div>
            <div className={styles.proximaticGraphic} aria-hidden="true">
              <div className={styles.productStep}><FileText size={28} strokeWidth={2} /><span>Notes.</span><span>01</span></div>
              <div className={styles.productStep}><Users size={28} strokeWidth={2} /><span>Roster.</span><span>02</span></div>
              <div className={styles.productStep}><CalendarCheck size={28} strokeWidth={2} /><span>Event day.</span><span>03</span></div>
            </div>
          </a>

        </section>

        <section id="side-projects" className={styles.sideProjectsSection} aria-labelledby="side-projects-title">
          <div className={styles.sectionHeading}>
            <h2 id="side-projects-title">Side projects</h2>
            <span>A couple of other things we made</span>
          </div>
          <div className={styles.toolsGrid}>
            <a href="https://jerkstore.proximalcoast.com" className={styles.jerkstoreProject}>
              <span className={styles.toolCategory}>A little less polite</span>
              <h3><span className={styles.visuallyHidden}>Jerkstore</span><span aria-hidden="true"><JerkstoreLogo variant="feature" /></span></h3>
              <p>AI-generated roasts with a mean streak. Pick a topic, choose the heat, and see what comes back.</p>
              <span className={styles.toolCta}>Open Jerkstore <ArrowUpRight size={18} aria-hidden="true" /></span>
            </a>
            <a href="https://slice.proximalcoast.com" className={styles.sliceProject}>
              <span className={styles.toolCategory}>Give footage some motion</span>
              <h3><Scissors size={36} strokeWidth={1.5} aria-hidden="true" /> Slice <span aria-hidden="true">{"//"}</span></h3>
              <p>A browser-based pan and zoom video editor. Add keyframed motion and music to your footage.</p>
              <span className={styles.toolCta}>Open Slice <ArrowUpRight size={18} aria-hidden="true" /></span>
            </a>
          </div>
        </section>

        <section id="games" className={styles.gamesSection} aria-labelledby="games-title">
          <div className={styles.sectionHeading}>
            <h2 id="games-title">Abandoned games</h2>
            <span>Earlier experiments</span>
          </div>
          <p className={styles.sectionIntro}>These projects are abandoned for now. Their concepts and project history remain here to explore.</p>
          <div className={styles.gameGrid}>
            <SixDofCard />
            <ForeseeableMisuseCard />
            <HorrorSurvivalCard />
          </div>
        </section>

        <footer className={styles.footer}>
          <Link href="/" className={styles.footerBrand} aria-label="Proximal Coast home">
            <Image src="/proximal-coast-logo-final.svg" alt="Proximal Coast" width={758} height={870} className={styles.footerLogo} />
          </Link>
          <nav className={styles.footerNav} aria-label="More from Proximal Coast">
            <Link href="/blog">Blog & archive</Link>
            <a href="https://youtube.com/@proximalcoast">YouTube</a>
            <a href="https://www.reddit.com/u/proximalcoast/">Reddit</a>
          </nav>
          <span className={styles.footerYear}>© 2026 Proximal Coast</span>
        </footer>
      </div>
    </main>
  );
}
