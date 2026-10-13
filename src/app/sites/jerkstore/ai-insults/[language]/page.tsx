import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowRight, Check, Flame } from "lucide-react";
import { LandingGenerator } from "../../_components/landing-generator";
import { LanguageHeader, LanguageFooter } from "../../_components/language-shell";
import { getLanguagePage, LANGUAGE_PAGES } from "../../_lib/language-pages";
import { languageFaq, languageMetadata, languagePath, languageStructuredData } from "../../_lib/language-seo";
import styles from "../../languages/languages.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGUAGE_PAGES.map(page => ({ language: page.slug }));
}

type Props = { params: Promise<{ language: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getLanguagePage((await params).language);
  if (!page) notFound();
  return languageMetadata(page);
}

export default async function LanguagePage({ params }: Props) {
  const page = getLanguagePage((await params).language);
  if (!page) notFound();

  const related = LANGUAGE_PAGES.filter(other => other.category === page.category && other.slug !== page.slug).slice(0, 6);
  const faqs = languageFaq(page);

  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(languageStructuredData(page)).replace(/</g, "\\u003c") }} />
      <LanguageHeader />
      <main id="language-main">
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              <Link href="/">Jerkstore</Link><span aria-hidden="true">/</span><Link href="/languages">Languages</Link><span aria-hidden="true">/</span><span aria-current="page">{page.name}</span>
            </nav>
            <span className={styles.badge}>{page.category}</span>
            <h1>AI insults in<br /><span>{page.name}.</span></h1>
            <p className={styles.heroDescription}>{page.intro}</p>
            <div className={styles.actions}>
              <a href="#generator" className={styles.primaryButton}>Roast in {page.name} <ArrowDown size={20} aria-hidden="true" /></a>
              <Link href="/languages" className={styles.secondaryButton}>See all {LANGUAGE_PAGES.length} options <ArrowRight size={20} aria-hidden="true" /></Link>
            </div>
            <p className={styles.heroCaption}>{page.label} · Topic-based roasts · Up to five results per pack</p>
          </div>
        </section>

        <section id="generator" className={styles.generatorSection} aria-labelledby="generator-title">
          <div className={styles.generatorIntro}>
            <span className={styles.eyebrow}><Flame size={18} aria-hidden="true" /> Your language is already selected</span>
            <h2 id="generator-title">{page.name} insult generator</h2>
            <p>Give the AI something specific to work with: a habit, a hobby, or a situation. Then let it turn your topic into a roast in {page.name}.</p>
            <ol className={styles.steps}>
              <li><strong>Pick your target.</strong> Describe the behavior you want to roast.</li>
              <li><strong>Choose the heat.</strong> Start mild or use the available hotter settings.</li>
              <li><strong>Read the results.</strong> Get up to five roasts, choose your favorite, and share if you like.</li>
            </ol>
            <Link href="#faq" className={styles.textLink}>Free roasts, credits, and language access <ArrowDown size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.generator}><LandingGenerator initialLanguage={page.value} isHomePage={false} returnTo={languagePath(page)} /></div>
        </section>

        <section className={styles.editorialGrid}>
          <div className={styles.notes}>
            <span className={styles.eyebrow}>The voice matters</span>
            <h2>Writing roasts in {page.name}</h2>
            <ul>{page.styleNotes.map(note => <li key={note}><Check size={20} aria-hidden="true" /><span>{note}</span></li>)}</ul>
          </div>
          <div className={styles.prompts}>
            <span className={styles.eyebrow}>Give the AI some material</span>
            <h2>Topics to try in {page.name}</h2>
            <p>Use these as topic ideas in the generator. They are prompts, not sample output.</p>
            <ul>{page.promptExamples.map(prompt => <li key={prompt}><q>{prompt}</q></li>)}</ul>
            <p className={styles.promptTip}>A concrete detail gives the roast more to work with than a name alone.</p>
          </div>
        </section>

        <section id="faq" className={styles.faq} aria-labelledby="faq-title">
          <span className={styles.eyebrow}>Before you hit generate</span>
          <h2 id="faq-title">{page.name} AI insult generator FAQ</h2>
          {faqs.map(faq => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
        </section>

        <section className={styles.related} aria-labelledby="related-title">
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>Keep the roast tour going</span><h2 id="related-title">More {page.category.toLowerCase()}</h2></div><Link href="/languages" className={styles.textLink}>All languages <ArrowRight size={18} aria-hidden="true" /></Link></div>
          <ul className={styles.relatedList}>{related.map(other => <li key={other.slug}><Link href={languagePath(other)} prefetch={false}>AI insults in {other.name}<ArrowRight size={18} aria-hidden="true" /></Link></li>)}</ul>
        </section>
      </main>
      <LanguageFooter />
    </div>
  );
}
