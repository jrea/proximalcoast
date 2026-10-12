
import Link from "next/link";
import type { Metadata } from "next";
import { Zap, Skull, Heart, Baby, Ban, Trash2, Flame, Infinity, Crown, Car, RefreshCcw } from "lucide-react";
import { Logo } from "./_components/logo";
import { LoginButton } from "./_components/login-button";
import { LiveTicker } from "./_components/live-ticker";
import { BlurredRoast } from "./_components/blurred-roast";
import { LandingGenerator } from "./_components/landing-generator";
import { LandingNav } from "./_components/landing-nav";
import { FREE_ROAST_LIMIT, CREDIT_COSTS } from "./constants";
import { InsultCarousel } from "./_components/insult-carousel";
import { jerkstoreFaqs } from "./_content/faq";
import { exampleRoasts } from "./_content/example-roasts";
import styles from "./marketing.module.css";

const title = "Free AI Insult Generator & Savage Roasts | Jerkstore";
const description = "Generate savage AI roasts, brutal insults and sharp comebacks. Try Jerkstore free without signing up, then choose Mild, Spicy or Nuclear heat. Limited free allowance.";

export const metadata: Metadata = {
  metadataBase: new URL("https://jerkstore.proximalcoast.com"),
  alternates: { canonical: "https://jerkstore.proximalcoast.com" },
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://jerkstore.proximalcoast.com",
    type: "website",
    siteName: "Jerkstore",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Jerkstore — AI-powered insults and roasts",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
};

const SAMPLE_ROASTS = [
  {
    topic: "My startup idea",
    roast: "Tell that genetic cul-de-sac that his face looks like a goddamn topographical map of a failure, and it's a miracle his mother didn't swallow the mistake.",
    author: "Oxford AI"
  },
  {
    topic: "My haircut",
    roast: "You look like a falafel that was dropped in a barber shop, stepped on by a blind horse, and then fucked by a lawnmower. You represent the death of aesthetics.",
    author: "Oxford AI"
  },
  {
    topic: "My coding skills",
    roast: "Your codebase is a sprawling, syphilis-ridden monument to incompetence that looks like it was written by a lobotomized howler monkey banging on a keyboard with a dead fish.",
    author: "Oxford AI"
  },
];

export default function MarketingPage() {
  const siteUrl = "https://jerkstore.proximalcoast.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://www.proximalcoast.com/#organization", name: "Proximal Coast", url: "https://www.proximalcoast.com/" },
      { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "Jerkstore", url: siteUrl, publisher: { "@id": "https://www.proximalcoast.com/#organization" }, inLanguage: "en" },
      { "@type": "WebApplication", "@id": `${siteUrl}/#generator`, name: "Jerkstore", url: siteUrl, description, applicationCategory: "EntertainmentApplication", operatingSystem: "Web", isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Three free roast results per 24-hour window. Optional paid credit packs." } },
      { "@type": "FAQPage", "@id": `${siteUrl}/#faq`, mainEntity: jerkstoreFaqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
    ],
  };

  return (
    <div className={`min-h-screen bg-neutral-100 font-sans text-black selection:bg-red-600 selection:text-white ${styles.page}`}>
      <style>{`
        @keyframes stink-drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.4; }
          50% { transform: translateY(-40px) translateX(10px); }
          80% { opacity: 0.1; }
          100% { transform: translateY(-80px) translateX(-5px); opacity: 0; }
        }
        .stink-line {
          position: absolute;
          width: 2px;
          height: 20px;
          background: #8b4513;
          border-radius: 50%;
          filter: blur(2px);
          animation: stink-drift 3s infinite linear;
        }
        .nasty-gradient {
          background: linear-gradient(135deg, #3d2b1f 0%, #5c4033 50%, #2a1d15 100%);
          background-size: 200% 200%;
          animation: fluid-shift 12s ease infinite;
          border-color: #2a1d15 !important;
        }
        .savage-gradient {
          background: linear-gradient(135deg, #9333ea, #db2777, #2563eb);
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fluid-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <a href="#generator" className={styles.skipLink}>Skip to the insult generator</a>
      <div className={`fixed top-0 w-full z-[60] ${styles.ticker}`}><LiveTicker /></div>
      <LandingNav />
      <main className={styles.main}>
        {/* Massive Headline */}
        <section className="p-5 md:p-8 text-center bg-yellow-300 border-b-8 border-black relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im4iPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjUiIG51bU9jdGF2ZXM9IjEiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')]"></div>

          <div className="inline-block bg-white border-4 border-black px-4 py-2 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
            <span className="font-bold font-mono uppercase text-sm md:text-base">🚀 #1 Product of the Day (in hell)</span>
          </div>

          <h1 id="hero-title" className="text-4xl md:text-7xl font-black uppercase leading-[0.9] mb-4 relative z-10 max-w-5xl mx-auto">
            Use AI for what it was meant to do.
            <span className="block text-red-600 bg-black text-white px-2 mt-2 transform rotate-1 inline-block">Insult Humanity.</span>
          </h1>

          <p className="text-base md:text-xl font-bold max-w-2xl mx-auto mb-6 font-mono">
            Stop generating polite emails. Start generating psychological damage.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6 relative z-20">
            <div id="generator" tabIndex={-1} aria-label="AI roast generator" className="w-full max-w-2xl transform hover:scale-[1.01] transition-transform duration-500">
              <LandingGenerator />
              <p className="mt-4 font-mono text-xs font-bold">{FREE_ROAST_LIMIT} free roast results per 24 hours. No sign-up. Nuclear requires an account.</p>
            </div>
          </div>
        </section>

        {/* How It Works - Cleaner Usage */}
        <section className="py-20 px-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-1 flex-1 bg-black"></div>
            <h3 className="text-3xl font-black uppercase text-center border-4 border-black px-6 py-2 bg-white -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              How to Ruin Your Day
            </h3>
            <div className="h-1 flex-1 bg-black"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-6xl mb-4">🎯</div>
              <h4 className="text-xl font-black uppercase mb-2">1. Choose a Victim</h4>
              <p className="font-mono font-bold text-neutral-600">Enter a topic. Yourself, your boss, your ex&apos;s mixtape.</p>
            </div>
            <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative top-4">
              <div className="text-6xl mb-4">🤖</div>
              <h4 className="text-xl font-black uppercase mb-2">2. Let AI Cook</h4>
              <p className="font-mono font-bold text-neutral-600">Our unhinged model crafts a bespoke, soul-crushing insult.</p>
            </div>
            <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-6xl mb-4">😭</div>
              <h4 className="text-xl font-black uppercase mb-2">3. Emotional Damage</h4>
              <p className="font-mono font-bold text-neutral-600">Read it. weep. Copy it. Send it. Lose your friends.</p>
            </div>
          </div>
        </section>



        <section className="py-12 bg-black text-white border-y-8 border-white overflow-hidden relative">
          <InsultCarousel insults={exampleRoasts.map(({ topic, roast }) => ({ topic, content: roast }))} variant="dark" subtitle="Example roasts · Rated G for Cowards" />
        </section>



        {/* Viral Feed */}
        <section id="examples" className="border-b-8 border-black bg-white px-5 py-12 md:p-12 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black uppercase mb-4 text-center italic tracking-tighter">
              <span className="bg-red-600 text-white px-4">Sample</span> Wall of Shame
            </h2>

            <p className="font-mono text-xs text-center mb-10">Example roasts. The damage is illustrative.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SAMPLE_ROASTS.map((review, i) => (
                <div key={i} className="bg-neutral-50 border-4 border-black p-6 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all cursor-default group">
                  <div className="flex items-center gap-3 mb-4 border-b-2 border-neutral-200 pb-3">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">OA</div>
                    <div>
                      <div className="font-black text-sm uppercase">{review.author}</div>
                      <div className="text-xs font-mono text-neutral-500">@OxfordUnleashed</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs font-bold bg-neutral-200 px-2 py-1 rounded uppercase tracking-wide text-neutral-600 mb-2 inline-block">Topic: {review.topic}</span>
                    <p className="font-serif text-xl font-bold leading-tight">&quot;<BlurredRoast text={review.roast} />&quot;</p>
                  </div>


                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <a href="/roasts" className="inline-block text-xl font-black uppercase border-b-4 border-red-600 hover:text-red-600 hover:border-black transition-colors">View all your roasts &rarr;</a>
            </div>
          </div>
        </section>

        {/* Pricing/Usage Section */}
        <section id="pricing" className="py-24 px-6 md:px-12 bg-neutral-100 border-b-8 border-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
                Pay As You <span className="text-red-600 bg-black px-2 inline-block transform -skew-x-12 pr-6">Burn</span>
              </h3>
              <p className="text-xl font-mono font-bold text-neutral-500 max-w-2xl mx-auto">
                No subscriptions. No contracts. Just raw, unadulterated roasting power.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch pt-8">

              {/* Free Tier */}
              <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative group hover:-translate-y-1 transition-transform flex flex-col">
                <div className="absolute -top-4 inset-x-0 mx-auto w-max bg-neutral-200 text-black px-3 py-1 font-black uppercase text-xs border-4 border-black">Refills Daily</div>

                <h3 className="text-2xl font-black uppercase italic mb-2 text-center mt-4">The Tease</h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-black mb-1">FREE</div>
                  <div className="font-mono font-bold text-neutral-500 text-xs uppercase">Limited daily allowance</div>
                </div>

                <ul className="space-y-4 font-mono text-xs font-bold uppercase mb-8 border-t-4 border-black pt-6 flex-1">
                  <li className="flex gap-2 items-center"><Baby className="w-5 h-5 shrink-0 text-black" /> Make {FREE_ROAST_LIMIT} Babies Cry / Day</li>
                  <li className="flex gap-2 items-center"><RefreshCcw className="w-5 h-5 shrink-0 text-neutral-500" /> Shame Refills Daily</li>
                  <li className="flex gap-2 items-center opacity-50"><Ban className="w-5 h-5 shrink-0 text-red-600" /> No hoarding (You monster)</li>
                </ul>

                <a href="#generator" className="w-full py-3 border-4 border-black font-black uppercase text-center bg-neutral-100 hover:bg-neutral-200 transition-colors text-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">Claim Free</a>
              </div>

              {/* $1 Starter - The Turd */}
              <div className="border-4 border-black p-6 bg-[#5c4033] text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative group hover:-translate-y-1 transition-transform flex flex-col">
                <h3 className="text-2xl font-black uppercase italic mb-2 text-center mt-8">The Turd</h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-black mb-1">$1</div>
                  <div className="font-mono font-bold text-white/50 text-xs uppercase">50 Credits</div>
                </div>

                <ul className="space-y-4 font-mono text-xs font-bold uppercase mb-8 border-t-4 border-black/30 pt-6 flex-1">
                  <li className="flex gap-2 items-center"><Trash2 className="w-5 h-5 shrink-0 text-white" /> 50 Roasts in the Bag</li>
                  <li className="flex gap-2 items-center"><Infinity className="w-5 h-5 shrink-0 text-white/70" /> Never Expire</li>
                  <li className="flex gap-2 items-center"><Heart className="w-5 h-5 shrink-0 text-red-400 fill-red-400" /> Pity Support Us</li>
                </ul>

                <LoginButton
                  text="Buy, Turd"
                  variant="login"
                  className="w-full py-3 border-4 border-black font-black uppercase bg-black text-white hover:bg-neutral-900 transition-colors text-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                />
              </div>

              {/* $5 Value */}
              <div className="border-4 border-black p-6 bg-orange-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative group hover:-translate-y-1 transition-transform flex flex-col">
                <div className="absolute -top-4 inset-x-0 mx-auto w-max bg-blue-600 text-white px-3 py-1 font-black uppercase text-xs border-4 border-black rotate-1">Popular</div>
                <h3 className="text-2xl font-black uppercase italic mb-2 text-center mt-4">Loaded</h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-black mb-1">$5</div>
                  <div className="font-mono font-bold text-black text-xs uppercase">275 Credits</div>
                </div>

                <ul className="space-y-4 font-mono text-xs font-bold uppercase mb-8 border-t-4 border-black pt-6 flex-1">
                  <li className="flex gap-2 items-center"><Flame className="w-5 h-5 shrink-0" /> 275 Rounds of Ammo</li>
                  <li className="flex gap-2 items-center"><Car className="w-5 h-5 shrink-0 text-black" /> $199,995 cheaper than a Lambo</li>
                  <li className="flex gap-2 items-center"><Zap className="w-5 h-5 shrink-0 fill-yellow-300 text-black" /> <strong>+25 Bonus</strong> (Math is hard)</li>
                </ul>

                <LoginButton
                  text="Get Loaded"
                  variant="login"
                  className="w-full py-3 border-4 border-black font-black uppercase bg-black text-white hover:bg-neutral-800 transition-colors text-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
                />
              </div>

              {/* $10 Savage */}
              <div className="border-4 border-black p-6 savage-gradient text-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative group hover:-translate-y-2 transition-transform flex flex-col">
                <div className="absolute -top-6 inset-x-0 mx-auto w-max bg-red-600 text-white px-4 py-1 font-black uppercase text-sm -rotate-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">Best Value</div>

                <h3 className="text-2xl font-black uppercase italic mb-2 text-center mt-4 drop-shadow-md">Doomsday</h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-black mb-1 drop-shadow-md">$10</div>
                  <div className="font-mono font-bold text-white/90 text-xs uppercase">600 Credits</div>
                </div>

                <ul className="space-y-4 font-mono text-xs font-bold uppercase mb-8 border-t-4 border-white/20 pt-6 flex-1">
                  <li className="flex gap-2 items-center"><Skull className="w-5 h-5 shrink-0" /> 600 Roasts <span className="text-[9px]">(Phenominal Cosmic Power)</span></li>
                  <li className="flex gap-2 items-center"><Heart className="w-5 h-5 shrink-0 fill-red-500 text-red-500" /> Your Mom Loves It</li>
                  <li className="flex gap-2 items-center"><Crown className="w-5 h-5 shrink-0 fill-yellow-400 text-yellow-400" /> Cheaper Than Therapy</li>
                </ul>

                <LoginButton
                  text="Go Savage"
                  variant="login"
                  className="w-full py-3 border-4 border-black font-black uppercase bg-white text-black hover:bg-neutral-200 transition-colors text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

            </div>
            <p className={styles.pricingNote}>The free allowance counts individual roasts. Standard packs use the free results left, then credits: {CREDIT_COSTS.STANDARD_PACK} credits for a full five-result pack. Max Effort returns one extended roast for {CREDIT_COSTS.LONG_ROAST} credits.</p>
          </div>
        </section>

        <section id="faq" className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title">AI insult generator FAQ</h2>
          <dl>{jerkstoreFaqs.map(faq => <div key={faq.question}><dt>{faq.question}</dt><dd>{faq.answer}</dd></div>)}</dl>
        </section>

        {/* CTA */}
        <section className="bg-red-600 p-12 md:p-24 flex flex-col justify-center items-center text-center border-t-8 border-black">
          <h3 className="text-white text-4xl font-black uppercase mb-8">Ready to ruin a friendship?</h3>
          <a href="#generator" className="bg-white text-black text-lg sm:text-2xl font-black uppercase px-6 py-4 sm:px-12 sm:py-6 border-4 sm:border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">Destroy</a>
          <p className="mt-6 text-white font-mono font-bold text-sm opacity-75 uppercase">Warning: Emotional damage likely.</p>
        </section>
      </main>

      <footer className="bg-white text-black p-6 md:p-8 text-center border-t-8 border-black">
        <Logo className="justify-center mb-4" textClassName="text-3xl font-black uppercase italic" />
        <nav aria-label="Jerkstore footer" className="flex justify-center gap-6 mb-6 font-mono text-xs underline"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="https://www.proximalcoast.com">Proximal Coast</a></nav>
        <div className="max-w-4xl mx-auto font-mono uppercase font-bold text-neutral-400 text-[10px] leading-tight text-center sm:text-justify">
          <p className="mb-4"><BlurredRoast text="© 2026 Proximal Coast LLC. All rights reserved by the machine gods. Do not sue us. We have no money. We spent it all on high-quality insults and premium snacks. If you use this at work you will lose your job. It probably isn't a good job anyway. Maybe quit?" /></p>
          <p className="mb-2 text-neutral-600">⚠️ IMPORTANT SAFETY INFORMATION & SIDE EFFECTS ⚠️</p>
          <p><BlurredRoast text="Jerkstore is not for everyone. Side effects may include: rapid loss of friends, spontaneous isolation, total alienation of humanity, extreme paranoia, and an irresistible urge to roast your barista. Users have reported: upsetting their grandma, losing their inheritance, being disowned by their cat, and a significant increase in awkward silences at Thanksgiving. In rare cases, use of Jerkstore may lead to: being banned from all public libraries, a sudden inability to make eye contact, and being forced to live in the woods alone in a lean-to made of old pizza boxes while whispering sick burns to a family of squirrels." /></p>
          <p className="mt-2 text-neutral-500"><BlurredRoast text="Do not use Jerkstore if you are pregnant, nursing, or have a shred of human decency remaining. If your insults last for more than four hours, please consult a therapist or a witness protection program. Jerkstore is not responsible for: job loss, divorce, public shaming, or the inevitable heat death of your social life. By using this app, you confirm you understand humor in all its forms, including gallows humor, and acknowledge that this site is a total, absolute, stupid joke. Literally. A stupid joke. Use it accordingly. Note: Most people will not find you funny. In fact, they will likely find you insufferable. By using this app, you concede that you are a sprawling, syphilitic monument to intellectual bankruptcy, an evolutionary afterthought, and that your face looks like it was sculpted by a blind toddler using damp ham. Proximal Coast LLC assumes no liability for the realization that your soul is as shallow as a car park puddle during a drought." /></p>
          <p className="mt-2 text-neutral-500 italic"><BlurredRoast text="Stop using Jerkstore if you begin to see life in 8-bit text or if your internal monologue starts sounding like an Oxford professor having a stroke. Proceed with caution. Or don't. We aren't your parents." /></p>
        </div>
      </footer>
    </div>
  );
}
