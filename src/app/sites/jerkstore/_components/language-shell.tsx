import Link from "next/link";
import { ArrowLeft, Languages } from "lucide-react";
import { Logo } from "./logo";
import styles from "../languages/languages.module.css";

export function LanguageHeader() {
  return (
    <>
    <a href="#language-main" className={styles.skipLink}>Skip to content</a>
    <header className={styles.header}>
      <Link href="/" aria-label="Jerkstore home"><Logo /></Link>
      <nav aria-label="Main navigation">
        <Link href="/languages"><Languages size={18} aria-hidden="true" /> Languages</Link>
        <Link href="/app" className={styles.navCta}>Open Jerkstore</Link>
      </nav>
    </header>
    </>
  );
}

export function LanguageFooter() {
  return (
    <footer className={styles.footer}>
      <Link href="/"><ArrowLeft size={16} aria-hidden="true" /> Back to Jerkstore</Link>
      <p>Original AI roasts. Read before sharing. Everyone involved should be in on the joke.</p>
      <div><Link href="/languages">All languages</Link><Link href="/terms">Terms</Link><Link href="/billing">Credits</Link></div>
    </footer>
  );
}
