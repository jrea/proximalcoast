import type { Metadata } from "next";
import Link from "next/link";
import styles from "../roasts/roasts.module.css";

export const metadata: Metadata = {
  title: "Privacy & your roast data | Jerkstore",
  description: "What Jerkstore stores, which services process a roast, and how guest history works.",
  alternates: { canonical: "https://jerkstore.proximalcoast.com/privacy" },
  openGraph: { title: "Privacy & your roast data | Jerkstore", description: "What Jerkstore stores and how your roast data works.", url: "https://jerkstore.proximalcoast.com/privacy", images: ["https://jerkstore.proximalcoast.com/opengraph-image"] },
  twitter: { card: "summary_large_image", title: "Privacy & your roast data | Jerkstore", images: ["https://jerkstore.proximalcoast.com/opengraph-image"] },
};

export default function PrivacyPage() {
  return <div className={styles.page}><header className={styles.header}><Link href="/">Jerkstore</Link><Link href="/#generator">Free roast generator</Link></header>
    <main className={styles.main}><p className={styles.kicker}>Know what goes in the oven</p><h1>Your roast data.</h1>
      <section className={styles.empty}><h2>Topics and generated roasts</h2><p>Jerkstore stores the topic, generated text, language, heat setting and time of generation to provide your roast history and avoid repeating jokes. Your generated roasts are not automatically published on the landing page. The public examples are authored samples.</p></section>
      <section className={styles.empty}><h2>The services involved</h2><p>Roast requests are sent to DeepSeek for generation and OpenAI for input moderation. Payment details are processed by Stripe. Jerkstore uses PostHog and Google Analytics for visits and conversion metrics. Custom events describe actions, selected options and completed purchases without sending your raw roast topic, generated text, email or card details. PostHog uses an internal account ID to connect signed-in actions with earlier visits. Automatic form capture and session recording are disabled for Jerkstore.</p></section>
      <section className={styles.empty}><h2>Guests, accounts and cookies</h2><p>Guest access uses a signed browser cookie and server-side browser/network usage records to enforce the free allowance. Account cookies keep you signed in. Clearing the guest cookie can disconnect this browser from its guest history. A local storage flag remembers dismissal of the cookie notice.</p></section>
      <section className={styles.empty}><h2>Keep private details out of prompts</h2><p>Use a habit, hobby or fictional situation. Leave passwords, contact details and sensitive personal information out. Review a roast before sharing it; copying or posting a result can disclose the details you put in it.</p><p>For questions about your account or data, <a href="https://x.com/proximalcoast" className={styles.back}>contact the creator at @proximalcoast</a>.</p></section>
      <Link href="/terms" className={styles.back}>Terms of use</Link>
    </main></div>;
}
