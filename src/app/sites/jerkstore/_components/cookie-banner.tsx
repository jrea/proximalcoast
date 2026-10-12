"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import Link from "next/link";
import styles from "./cookie-banner.module.css";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let hasSeenBanner: string | null = null;
    try { hasSeenBanner = localStorage.getItem("jerkstore-cookie-consent"); } catch { /* Storage can be disabled in private browsers. */ }
    if (!hasSeenBanner) {
      // Small delay for dramatic effect
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    try { localStorage.setItem("jerkstore-cookie-consent", "true"); } catch { /* Dismiss for this visit even if storage is unavailable. */ }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.notice} aria-label="Cookie notice">
      <details>
        <summary><Cookie size={15} aria-hidden="true" /> We use cookies.</summary>
        <div className={styles.explanation}>
          <h2>Mandatory Discourtesy</h2>
          <p>We use cookies to keep you logged in (even if you&apos;re a guest) and to process payments via Stripe so we can take your money. Usage records enforce the free allowance. We just want to ensure you can be properly insulted and billed. <Link href="/privacy">Privacy</Link>.</p>
        </div>
      </details>
      <button type="button" onClick={dismiss}>I Accept My Fate</button>
    </div>
  );
}
