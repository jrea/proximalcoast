---
title: 'Building Jerkstore: The World’s Most Aggressive Insult Generator'
date: '2026-02-08'
---

We've been hard at work building **Jerkstore**, a project that graduated from a "what if" experiment into the world’s most sophisticated engine for psychological warfare. It’s an AI-powered roaster designed for one simple purpose: generating creative, biting, and soul-crushing insults that make a regular "yo mama" joke look like a Hallmark card.

## The Soul of a Savage: Prompting for Pain

At the heart of Jerkstore is a carefully crafted AI persona. We moved away from generic "funny roasts" and leaned into what we call the **Oxford Professor having a breakdown**.

The identity is built on visceral, high-impact metaphors and bizarrely specific imagery. Instead of template humor, our model uses a "Mad-Lib" approach to create jagged connections—think "syphilis-ridden monument to incompetence" or "genetic cul-de-sac." 

We use **DeepSeek V3** as the primary brain. It offers a unique balance of creativity and edge that feels less sanitized than other mainstream models. For those who need their emotional damage formatted professionally, our **Savage Tier** unlocks **Email Mode**, turning these burns into devastatingly articulate "circle back" messages.

## The Stack: Scalable Chaos

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
