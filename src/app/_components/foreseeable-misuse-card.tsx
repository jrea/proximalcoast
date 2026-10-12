import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import styles from "../home.module.css";

const foreseeableMisuseUrl = "/games/foreseeable-misuse";

export function ForeseeableMisuseCard() {
  return (
    <article className={cn(styles.gameCard, styles.misuseCard)} aria-labelledby="misuse-title">
      <div className={styles.gameCardTopline}>
        <span>02 / Top-down action</span>
        <span>Abandoned</span>
      </div>

      <Link href={foreseeableMisuseUrl} className={styles.gameCardMain} aria-labelledby="misuse-title">
        <div className={cn(styles.gameCardArtwork, styles.misuseArtwork)} aria-hidden="true">
          <span className={styles.misuseWord}>FORESEEABLE</span>
          <span className={styles.misuseWord}>MISUSE</span>
          <span className={styles.misuseIndex}>FM / 01</span>
        </div>

        <div className={styles.gameCardCopy}>
          <h3 id="misuse-title" className={styles.gameCardTitle}>Foreseeable Misuse</h3>
          <p>
            A top-down action prototype about turning ordinary industrial junk into unpredictable weapons, with consequences shaped by the parts you combine.
          </p>
        </div>
      </Link>

      <div className={styles.gameCardFooter}>
        <div className={styles.gameTags}>
          <span>Systemic weapons</span>
          <span>Industrial chaos</span>
        </div>
        <Link href={foreseeableMisuseUrl}>
          Project history
          <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
