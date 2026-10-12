import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import styles from "../home.module.css";

const failsafeUrl = "/games/failsafe";

export function SixDofCard() {
  return (
    <article className={cn(styles.gameCard, styles.sixDofCard)} aria-labelledby="sixdof-title">
      <div className={styles.gameCardTopline}>
        <span>01 / 6DOF Shooter</span>
        <span>Abandoned</span>
      </div>

      <Link href={failsafeUrl} className={styles.gameCardMain} aria-labelledby="sixdof-title">
        <div className={styles.gameCardArtwork} aria-hidden="true">
          <span className={styles.sixDofNumber}>6</span>
          <span className={styles.sixDofLabel}>DOF</span>
          <span className={styles.sixDofOrbit} />
          <span className={styles.sixDofCrosshair} />
          <span className={styles.artworkCaption}>Move through it</span>
        </div>

        <div className={styles.gameCardCopy}>
          <h3 id="sixdof-title" className={styles.gameCardTitle}>Failsafe</h3>
          <p>
            A six-degrees-of-freedom shooter prototype exploring movement, spatial combat, and control.
          </p>
        </div>
      </Link>

      <div className={styles.gameCardFooter}>
        <div className={styles.gameTags}>
          <span>6DOF</span>
          <span>Spatial combat</span>
        </div>
        <Link href={failsafeUrl}>
          Project history
          <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
