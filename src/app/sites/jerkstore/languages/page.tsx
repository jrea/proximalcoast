import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { LanguageDirectory } from "../_components/language-directory";
import { LanguageHeader, LanguageFooter } from "../_components/language-shell";
import { LANGUAGE_PAGES } from "../_lib/language-pages";
import { JERKSTORE_URL } from "../_lib/language-seo";
import styles from "./languages.module.css";

const title = "AI Insults in Every Supported Language | Jerkstore";
const description = "Find your AI insult generator: Spanish, French, Japanese, Klingon, Elvish, Dothraki, and every language, slang, and code supported by Jerkstore.";

export const metadata: Metadata = {
  metadataBase: new URL(JERKSTORE_URL),
  title: { absolute: title },
  description,
  alternates: { canonical: `${JERKSTORE_URL}/languages` },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: `${JERKSTORE_URL}/languages`, siteName: "Jerkstore", type: "website", images: [`${JERKSTORE_URL}/opengraph-image`] },
  twitter: { card: "summary_large_image", title, description, images: [`${JERKSTORE_URL}/opengraph-image`] },
};

export default function LanguagesPage() {
  return (
    <div className={styles.page}>
      <LanguageHeader />
      <main id="language-main">
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.badge}>{LANGUAGE_PAGES.length} supported languages &amp; styles</span>
            <h1>AI insults.<br />Every language.<br /><span>Same bruised ego.</span></h1>
            <p className={styles.heroDescription}>Find a roast generator for the language you actually want. From Spanish and Japanese to Klingon and High Valyrian, every supported option gets its own page and a generator ready to use.</p>
            <div className={styles.actions}>
              <a href="#all-languages" className={styles.primaryButton}>Find your language <ArrowDown size={20} aria-hidden="true" /></a>
              <Link href="/ai-insults/english" className={styles.secondaryButton}>Start in English <ArrowRight size={20} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
        <div id="all-languages" className={styles.content}><LanguageDirectory /></div>
        <section className={styles.directoryNote}>
          <h2>Real languages. Imaginary worlds. Ridiculous formats.</h2>
          <p>Living languages ask the AI to write in that language. Fictional and historical options ask it to attempt that vocabulary and style. Slang changes the voice; codes change the format. These are generative AI outputs, so accuracy varies—especially for constructed languages and encoded text.</p>
          <p>Pick any option to see its writing notes, topic ideas, and access details. The page stays in English so you can set up a roast even when you are still learning the output language.</p>
        </section>
      </main>
      <LanguageFooter />
    </div>
  );
}
