---
title: 'Building Jerkstore: The World’s Most Aggressive Insult Generator'
description: 'Go behind the scenes of Jerkstore, an AI engine built on DeepSeek V3 and Next.js 16 designed for high-fidelity psychological warfare.'
date: '2026-02-08'
site: 'jerkstore'
---


Jerkstore isn't just a fun side project; it's a showcase of a robust, modern web architecture:

*   **Next.js 16 (App Router)**: The skeleton of the app, utilizing Server Components and the new Edge runtime for speed.
*   **DeepSeek V3**: The engine behind the insults, pushed to high temperature for maximum unpredictability.
*   **Vercel AI SDK**: Powering the real-time streaming of insults so you can watch your ego crumble character by character.
*   **OpenAI Moderation API**: The "responsible adult" in the room, checking incoming messages to ensure we stay on the right side of the law (and safety policies).
*   **Stripe**: Managing our complex tiered system (Trial, Elite, and Savage).

## Multi-Tenant Architecture

Under the hood, Jerkstore is part of a larger **multi-tenant architecture**. Built on **Next.js** and deployed on **Vercel**, we use Middleware to rewrite incoming requests based on the hostname. This allows us to share core UI components and logic across multiple "sites" while maintaining completely separate identities.

For local development, mess around with /etc/hosts to simulate these subdomains, allowing us to test things like billing flows and site-specific prompts without a complex local network setup.

## Features of the Roast

We've built a suite of features designed to maximize engagement (and emotional damage):

1.  **Tiered Rage**: From a limited **Trial** (3 total roasts) to **Elite** (200/day) and the god-tier **Savage Mode** (1000/day).
2.  **Email Mode**: Exclusive to Savage users. Perfect for when you need to professionally dismantle a colleague or corporate entity.
3.  **Multilingual Burns**: Supporting over 50 languages, because getting roasted in Klingon or French just hits different.
4.  **Neo-Brutalist UI**: A high-impact, yellow-and-black design language featuring our custom fire logo and "Earthquake" animations for premium upsells.
5.  **Randomized Chaos**: From the "Let Me Roast" button labels to the topics, every interaction is designed to feel unpredictable.

## Marketing: The Wall of Shame

Our growth strategy is built on **Chaos Mode**. We've implemented a "Wall of Shame" (the fake live feed of public roasts) and "Blurred Roasts" on our landing page to tease the high-grade insults hidden behind the paywall. There's a hand curated safe mode that will maybe get updated some times, but probably not.

Jerkstore is a reminder that while AI can write your emails and fix your code, its true potential lies in its ability to remind you that your face looks like it was sculpted by a blind toddler using damp ham. Or really go down swinging in your fantasy leage 2-14 to secure your place in the Cone of Shame.

Stay tuned as we continue to refine the rage. Try it yourself at [jerkstore.app](https://jerkstore.proximalcoast.com).

---
*Disclaimer: Jerkstore is for entertainment purposes only. Please roast responsibly.*
