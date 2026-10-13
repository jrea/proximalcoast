import Link from "next/link";
import { ArrowRight, Languages } from "lucide-react";
import { LANGUAGE_GROUPS, LANGUAGE_PAGES } from "../_lib/language-pages";
import { languagePath } from "../_lib/language-seo";
import styles from "../languages/languages.module.css";

export function LanguageDirectory({ compact = false }: { compact?: boolean }) {
  if (compact) {
    const pages = LANGUAGE_GROUPS.flatMap(group => group.pages);
    return (
      <section className={`${styles.directory} ${styles.compactDirectory}`} aria-labelledby="language-directory-title">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}><Languages size={18} aria-hidden="true" /> {LANGUAGE_PAGES.length} ways to get roasted</span>
            <h2 id="language-directory-title">Pick your language. Take your damage.</h2>
          </div>
          <Link href="/languages" className={styles.textLink}>Browse all languages <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <ul className={styles.compactList}>
          {pages.map(page => (
            <li key={page.slug}>
              <Link href={languagePath(page)} prefetch={false}>{page.name}</Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className={styles.directory} aria-labelledby="language-directory-title">
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}><Languages size={18} aria-hidden="true" /> {LANGUAGE_PAGES.length} ways to get roasted</span>
          <h2 id="language-directory-title">Pick your language. Take your damage.</h2>
          <p>AI insults in real languages, fictional tongues, old-school English, and formats that make the punchline work harder.</p>
        </div>
        {compact && <Link href="/languages" className={styles.textLink}>Browse all languages <ArrowRight size={18} aria-hidden="true" /></Link>}
      </div>
      <div className={styles.groups}>
        {LANGUAGE_GROUPS.map(group => (
          <div className={styles.group} key={group.category}>
            <h3>{group.category}</h3>
            <ul className={styles.languageList}>
              {group.pages.map(page => (
                <li key={page.slug}>
                  <Link href={languagePath(page)} prefetch={false}>
                    <span>{compact ? page.name : `AI insults in ${page.name}`}</span>
                    {!compact && page.label !== page.name && <small>{page.label}</small>}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
