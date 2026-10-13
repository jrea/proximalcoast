"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { LoginButton } from "./login-button";
import styles from "../marketing.module.css";

export function LandingNav() {
  const [expanded, setExpanded] = useState(false);
  return <header className={styles.header} onKeyDown={event => {
    if (event.key === "Escape") setExpanded(false);
  }}>
    <Link href="/" aria-label="Jerkstore home"><Logo /></Link>
    <button type="button" className={styles.menuButton} aria-expanded={expanded}
      aria-controls="jerkstore-navigation" aria-label={expanded ? "Close navigation" : "Open navigation"}
      onClick={() => setExpanded(!expanded)}>{expanded ? <X size={22} /> : <Menu size={22} />}</button>
    <nav id="jerkstore-navigation" aria-label="Jerkstore" className={styles.navigation} data-expanded={expanded}>
      <a href="#generator" onClick={() => setExpanded(false)}>Roast something</a>
      <a href="#examples" onClick={() => setExpanded(false)}>Wall of Shame</a>
      <a href="#pricing" onClick={() => setExpanded(false)}>Pay as you burn</a>
      <a href="#faq" onClick={() => setExpanded(false)}>FAQ</a>
      <Link href="/languages" onClick={() => setExpanded(false)}>Languages</Link>
      <a href="/roasts">Your roasts</a>
      <LoginButton text="Login" icon variant="login" className={styles.loginButton} />
    </nav>
  </header>;
}
