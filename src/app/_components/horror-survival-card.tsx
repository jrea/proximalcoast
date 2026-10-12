import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import styles from "../home.module.css";

export function HorrorSurvivalCard() {
  return (
    <article className={cn(styles.gameCard, styles.horrorCard)} aria-labelledby="horror-title">
      <div className={styles.gameCardTopline}>
        <span>03 / Survival prototype</span>
        <span>Abandoned</span>
      </div>

      <Link href="/games/horror-survival-craft" className={styles.gameCardMain} aria-labelledby="horror-title">
        <div className={cn(styles.gameCardArtwork, styles.horrorArtwork)} aria-hidden="true">
          <span className={styles.horrorWord}>SURVIVE</span>
          <span className={styles.horrorSlash}>/</span>
          <span className={styles.horrorIndex}>HS / 01</span>
          <span className={styles.horrorGlow} />
        </div>

        <div className={styles.gameCardCopy}>
          <h3 id="horror-title" className={styles.gameCardTitle}>Horror Survival Craft</h3>
          <p>
            An early horror-survival prototype exploring oxygen, base building, and expeditions.
          </p>
        </div>
      </Link>

      <div className={styles.gameCardFooter}>
        <div className={styles.gameTags}>
          <span>Survival</span>
          <span>Crafting</span>
        </div>
        <Link href="/games/horror-survival-craft">
          Project history
          <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
