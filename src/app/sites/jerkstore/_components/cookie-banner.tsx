"use client";

import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { getStoredConsent, updateAnalyticsConsent } from "@/lib/analytics-consent";
import styles from "./cookie-banner.module.css";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) {
      // Small delay for dramatic effect
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const choose = (state: "granted" | "denied") => {
    setIsVisible(false);
    updateAnalyticsConsent(state, posthog);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.notice} aria-label="Cookie notice">
      <details>
        <summary><Cookie size={15} aria-hidden="true" /> We use cookies.</summary>
        <div className={styles.explanation}>
          <h2>Mandatory Discourtesy</h2>
          <p>We use essential cookies to keep you logged in and process payments via Stripe, plus optional analytics cookies to see what works. <Link href="/privacy">Privacy</Link>.</p>
        </div>
      </details>
      <div className={styles.actions}>
        <button type="button" className={styles.reject} onClick={() => choose("denied")}>Reject</button>
        <button type="button" onClick={() => choose("granted")}>Accept</button>
      </div>
    </div>
  );
}
