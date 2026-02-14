
import Link from "next/link";
import { Metadata } from "next";
import { Star, Zap, Skull, Share2, MessageCircle, Heart, Check, X } from "lucide-react";
import { Logo } from "./_components/logo";
import { LoginButton } from "./_components/login-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db"; // Import prisma
import { LiveTicker } from "./_components/live-ticker"; // Import Ticker
import { cn } from "@/lib/utils";
import { BlurredRoast } from "./_components/blurred-roast";
import { InsultGenerator } from "./_components/insult-generator";
import { BUTTON_LABELS, TOPIC_LABELS } from "./constants";
import { InsultCarousel } from "./_components/insult-carousel";

export const metadata: Metadata = {
  metadataBase: new URL("https://jerkstore.proximalcoast.com"),
  title: "Jerkstore - The World's Most Aggressive AI Insult Generator",
  description: "Generate rare, high-impact insults instantly. Powered by AI with zero moral compass. Roast your friends, enemies, and colleagues with surgical precision.",
  keywords: ["AI insults", "AI roast", "insult generator", "Jerkstore", "DeepSeek", "fun AI apps", "psychological warfare"],
  openGraph: {
    title: "Jerkstore - The World's Most Aggressive AI Insult Generator",
    description: "Get roasted by an AI Oxford Professor having a breakdown. Destructive, creative, and hilarious insults.",
    type: "website",
    siteName: "Jerkstore",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Jerkstore - AI-Powered Ego Destruction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jerkstore | AI-Powered Ego Destruction",
    description: "The world's most aggressive AI insult generator. Zero moral compass. Infinite rage.",
    images: ["/opengraph-image"],
  },
};


const FAKE_REVIEWS = [
  {
    topic: "My startup idea",
    roast: "Tell that genetic cul-de-sac that his face looks like a goddamn topographical map of a failure, and it's a miracle his mother didn't swallow the mistake.",
    author: "Oxford AI",
    likes: "4.2k",
    retweets: "1.1k"
  },
  {
    topic: "My haircut",
    roast: "You look like a falafel that was dropped in a barber shop, stepped on by a blind horse, and then fucked by a lawnmower. You represent the death of aesthetics.",
    author: "Oxford AI",
    likes: "8.9k",
    retweets: "3.4k"
  },
  {
    topic: "My coding skills",
    roast: "Your codebase is a sprawling, syphilis-ridden monument to incompetence that looks like it was written by a lobotomized howler monkey banging on a keyboard with a dead fish.",
    author: "Oxford AI",
    likes: "2.1k",
    retweets: "500"
  },
];

export default async function MarketingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch a random safe roast for the spotlight
  const safeRoastCount = await prisma.jerkstore_insult_safe.count();
  const skip = Math.floor(Math.random() * safeRoastCount);
  const safeRoastRef = await prisma.jerkstore_insult_safe.findFirst({
    skip: skip,
    take: 1,
    include: { insult: true }
  });

  const mildInsults = await prisma.jerkstore_insult.findMany({
    where: { heatLevel: 'mild' },
    select: { content: true, topic: true },
    take: 50,
    orderBy: { createdAt: 'desc' }
  });

  const safeRoast = safeRoastRef?.insult;

  // Determine Plan & Access for Home Page Generator
  let plan = "trial";
  let isActive = true; // Always allow roasting on home page (limits applied by API/Frontend logic)

  if (session) {
    const subscription = await prisma.user_subscription.findUnique({
      where: {
        userId_siteSlug: {
          userId: session.user.id,
          siteSlug: "jerkstore",
        },
      },
    });

    const isSubActive = !!(subscription &&
      (subscription.status === "active" || subscription.status === "trialing") &&
      new Date(subscription.expiresAt) > new Date());

    if (isSubActive) {
      plan = subscription?.plan || "trial";
    }
  }

  const randomButtonLabel = BUTTON_LABELS[Math.floor(Math.random() * BUTTON_LABELS.length)];
  const randomTopicLabel = TOPIC_LABELS[Math.floor(Math.random() * TOPIC_LABELS.length)];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Jerkstore",
    "url": "https://jerkstore.proximalcoast.com",
    "description": "The World's Most Aggressive AI Insult Generator. Powered by AI with zero moral compass.",
    "applicationCategory": "Entertainment",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "5.00",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1242"
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-black selection:bg-red-600 selection:text-white pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Use Live Ticker */}
      <div className="fixed top-0 w-full z-[60]">
        <LiveTicker />
      </div>

      {/* Hero Section */}
      <header className="fixed w-full top-8 z-50 border-b-4 border-black bg-white p-4 flex justify-between items-center shadow-lg">
        <Logo />
        <LoginButton
          text="Login"
          icon={true}
          variant="login"
          className="px-6 py-2 bg-red-600 text-white font-black text-lg uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        />
      </header>

      <main className="pt-24">
        {/* Massive Headline */}
        <section className="p-8 md:p-20 text-center bg-yellow-300 border-b-8 border-black relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im4iPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjUiIG51bU9jdGF2ZXM9IjEiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')]"></div>

          <div className="inline-block bg-white border-4 border-black px-6 py-2  mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
            <span className="font-bold font-mono uppercase text-sm md:text-base">🚀 #1 Product of the Day (in hell)</span>
          </div>

          <h2 className="text-5xl md:text-8xl font-black uppercase leading-[0.9] mb-8 relative z-10 max-w-5xl mx-auto">
            Use AI for what it was meant to do.
            <span className="block text-red-600 bg-black text-white px-2 mt-4 transform rotate-1 inline-block">Insult Humanity.</span>
          </h2>

          <p className="text-xl md:text-2xl font-bold max-w-2xl mx-auto mb-12 font-mono">
            Stop generating polite emails. Start generating psychological damage.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6 relative z-20">
            <div className="w-full max-w-2xl transform hover:scale-[1.01] transition-transform duration-500">
              <InsultGenerator
                isActive={isActive}
                plan={plan}
                initialButtonLabel={randomButtonLabel}
                initialTopicLabel={randomTopicLabel}
              />
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
              <p className="font-mono font-bold text-neutral-600">Enter a topic. Yourself, your boss, your ex's mixtape.</p>
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


        <InsultCarousel insults={mildInsults} />

        {/* Safe Roast Spotlight (Burn of the Day) */}
        <section className="py-12 bg-black text-white border-y-8 border-white overflow-hidden relative">
          <InsultCarousel
            insults={mildInsults}
            variant="dark"
            title="Burn of the Day"
            subtitle="Verified Safe(ish)"
          />
        </section>

        {/* Viral Feed */}
        <section className="border-b-8 border-black bg-white p-12 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-5xl font-black uppercase mb-16 text-center italic tracking-tighter">
              <span className="bg-red-600 text-white px-4">Live</span> Wall of Shame
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FAKE_REVIEWS.map((review, i) => (
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
                    <p className="font-serif text-xl font-bold leading-tight">"<BlurredRoast text={review.roast} />"</p>
                  </div>

                  <div className="flex items-center justify-between text-neutral-400 font-mono text-xs pt-4 border-t-2 border-neutral-100 group-hover:text-black transition-colors">
                    <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer"><MessageCircle className="w-4 h-4" /> 24</div>
                    <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer"><Share2 className="w-4 h-4" /> {review.retweets}</div>
                    <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer"><Heart className="w-4 h-4" /> {review.likes}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/app" className="inline-block text-xl font-black uppercase border-b-4 border-red-600 hover:text-red-600 hover:border-black transition-colors">View All 8,492 Roasts &rarr;</Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-6 md:px-12 bg-neutral-100 border-b-8 border-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
                Choose Your <span className="text-red-600 bg-black px-2 inline-block transform -skew-x-12 pr-6">Pain</span>
              </h3>
              <p className="text-xl font-mono font-bold text-neutral-500 max-w-2xl mx-auto">
                We accept all major credit cards and bits of your soul.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-stretch pt-8">

              {/* Trial Tier - The Lame One */}
              <div className="border-4 border-black bg-white p-6 relative flex flex-col hover:-translate-y-2 transition-transform shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                <h4 className="text-3xl font-black uppercase italic text-neutral-400 mb-2">Trial</h4>
                <div className="text-5xl font-black mb-6">$0</div>
                <ul className="space-y-3 font-mono text-xs font-bold uppercase text-neutral-500 mb-8 flex-grow">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-black" /> 3 Roasts Total</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-black" /> Basic Insults</li>
                  <li className="flex gap-2 opacity-50"><X className="w-4 h-4" /> No History</li>
                  <li className="flex gap-2 opacity-50"><X className="w-4 h-4" /> Shame Included</li>
                </ul>
                <LoginButton text="Start Failure" className="w-full py-4 border-4 border-black font-black uppercase hover:bg-neutral-100 transition-colors bg-white text-black" />
              </div>

              {/* Standard Tier - SOLD OUT JOKE */}
              <div className="border-4 border-black bg-neutral-200 p-6 relative flex flex-col opacity-60 grayscale cursor-not-allowed select-none transform scale-95 origin-bottom">
                <div className="absolute -top-4 -right-4 bg-red-600 text-white font-black uppercase px-4 py-1 rotate-12 border-4 border-white shadow-md z-10">SOLD OUT</div>
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#000000_0,#000000_1px,transparent_0,transparent_50%)] [background-size:10px_10px] opacity-10 pointer-events-none"></div>

                <h4 className="text-3xl font-black uppercase italic text-neutral-500 mb-2 decoration-red-600/50 decoration-4">Standard</h4>
                <div className="text-5xl font-black mb-6 text-neutral-400">$1<span className="text-sm">/mo</span></div>
                <ul className="space-y-3 font-mono text-xs font-bold uppercase text-neutral-400 mb-8 flex-grow">
                  <li className="flex gap-2"><Check className="w-4 h-4" /> 3 Roasts / Day</li>
                  <li className="flex gap-2"><Check className="w-4 h-4" /> Probably has Ads</li>
                  <li className="flex gap-2"><Check className="w-4 h-4" /> Dishonors your ancestors</li>
                </ul>
                <button disabled className="w-full py-4 border-4 border-neutral-400 font-black uppercase bg-neutral-300 text-neutral-500 cursor-not-allowed">
                  Out of Stock
                </button>
                <p className="mt-2 text-center text-[10px] font-mono font-bold text-red-600 uppercase">Due to supply chain issues</p>
              </div>

              {/* Elite Tier - Most Popular */}
              <div className="border-4 border-black bg-yellow-300 p-6 relative flex flex-col shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform scale-105 z-10 hover:-translate-y-2 transition-transform">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 font-black uppercase text-sm -rotate-2 whitespace-nowrap border-2 border-white shadow-lg">Most Popular</div>

                <h4 className="text-3xl font-black uppercase italic mb-2">Elite</h4>
                <div className="text-6xl font-black mb-6">$5<span className="text-xl font-bold">/mo</span></div>
                <ul className="space-y-3 font-mono text-sm font-bold uppercase mb-8 flex-grow">
                  <li className="flex gap-2"><Check className="w-5 h-5" /> 200 Roasts / Day</li>
                  <li className="flex gap-2"><Check className="w-5 h-5" /> No Ads</li>
                  <li className="flex gap-2"><Check className="w-5 h-5" /> Looks golden</li>
                  <li className="flex gap-2 flex-row"><Check className="w-5 h-5" /> <span>Priority Queue <span className="text-[9px]">(does nothing)</span></span></li>
                </ul>
                <LoginButton text="Get Elite" className="w-full py-4 border-4 border-black font-black uppercase hover:bg-neutral-800 transition-colors bg-black text-white text-xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]" />
              </div>

              {/* Savage Tier - God Mode */}
              <div className="border-4 border-black bg-black text-white p-6 relative flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:16px_16px] opacity-30 animate-pulse"></div>

                <div className="relative z-10">
                  <h4 className="text-3xl font-black uppercase italic mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-md">Savage</h4>
                  <div className="text-5xl font-black mb-6">$99<span className="text-sm font-bold opacity-70">/mo</span></div>
                  <ul className="space-y-3 font-mono text-xs font-bold uppercase mb-8 flex-grow text-white/90">
                    <li className="flex gap-2"><Zap className="w-4 h-4 text-purple-400" /> 1000 Roasts / Day</li>
                    <li className="flex gap-2"><Zap className="w-4 h-4 text-purple-400" /> Legendary Status</li>
                    <li className="flex gap-2"><Zap className="w-4 h-4 text-purple-400" /> Max Length Mode</li>
                    <li className="flex gap-2"><Zap className="w-4 h-4 text-purple-400" /> Your Mom Loves It</li>
                  </ul>
                  <LoginButton text="Ascend Now" className="w-full py-4 border-4 border-white font-black uppercase hover:bg-white hover:text-black transition-colors bg-transparent text-white backdrop-blur-md" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-red-600 p-12 md:p-24 flex flex-col justify-center items-center text-center border-t-8 border-black">
          <h3 className="text-white text-4xl font-black uppercase mb-8">Ready to ruin a friendship?</h3>
          <LoginButton
            text="Destroy "
            className="bg-white text-black text-2xl font-black uppercase px-12 py-6 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[16px] active:translate-y-[16px] transition-all"
          />
          <p className="mt-6 text-white font-mono font-bold text-sm opacity-75 uppercase">Warning: Emotional damage likely.</p>
        </section>
      </main>

      <footer className="bg-white text-black p-12 text-center border-t-8 border-black">
        <Logo className="justify-center mb-4" textClassName="text-3xl font-black uppercase italic" />
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
