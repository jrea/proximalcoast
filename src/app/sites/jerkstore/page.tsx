
import Link from "next/link";
import { Metadata } from "next";
import { Flame, Star, Zap, Skull, Share2, MessageCircle, Heart } from "lucide-react";
import { LoginButton } from "@/components/login-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Jerkstore - The World's Most Aggressive Insult Generator",
  description: "Generate rare, high-brow insults instantly. Powered by AI with zero moral compass. Roast your friends, enemies, and yourself.",
  openGraph: {
    title: "Jerkstore - Destroy Your Ego",
    description: "Get roasted by an AI Oxford Professor having a breakdown.",
    type: "website",
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

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-black selection:bg-red-600 selection:text-white">
      {/* Hero Section */}
      <header className="fixed w-full top-0 z-50 border-b-4 border-black bg-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <Flame className="w-8 h-8 stroke-[3px] text-red-600 fill-yellow-400" />
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Jerkstore</h1>
        </div>
        <LoginButton
          text="Login"
          className="px-6 py-2 bg-black text-white font-bold text-lg uppercase hover:bg-neutral-800 transition-transform active:scale-95 border-b-4 border-r-4 border-neutral-600 active:border-0 active:translate-y-1 active:translate-x-1"
        />
      </header>

      <main className="pt-24">
        {/* Massive Headline */}
        <section className="p-8 md:p-20 text-center bg-yellow-300 border-b-8 border-black relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/noise.png')]"></div>

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
            <LoginButton
              text="Let Me Roast!"
              icon={true}
              className="bg-black text-white text-2xl font-black uppercase px-10 py-5 border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-3 justify-center"
            />
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


        {/* Viral Feed */}
        <section className="border-y-8 border-black bg-white p-12 overflow-hidden">
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
                    <p className="font-serif text-xl font-bold leading-tight">"{review.roast}"</p>
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

        {/* Pricing / CTA */}
        <section className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
          <div className="bg-black text-white p-12 md:p-24 flex flex-col justify-center border-b-8 md:border-b-0 md:border-r-8 border-white box-border">
            <h3 className="text-7xl font-black uppercase mb-6 leading-none tracking-tighter text-yellow-300">Unlimited<br />Rage.</h3>
            <p className="text-2xl font-bold font-mono text-neutral-400 mb-8 max-w-md">Unlock the full power of our language model. Roast in 50+ languages. No limits.</p>
            <Link href="/billing" className="self-start text-3xl font-black uppercase bg-white text-black px-8 py-4 hover:bg-red-600 hover:text-white transition-colors">
              Get Pro Access &rarr;
            </Link>
          </div>
          <div className="bg-red-600 p-12 md:p-24 flex flex-col justify-center items-center text-center">
            <h3 className="text-white text-4xl font-black uppercase mb-8">Ready to ruin a friendship?</h3>
            <LoginButton
              text="Destroy my life"
              className="bg-white text-black text-2xl font-black uppercase px-12 py-6 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[16px] active:translate-y-[16px] transition-all"
            />
            <p className="mt-6 text-white font-mono font-bold text-sm opacity-75 uppercase">Warning: Emotional damage likely.</p>
          </div>
        </section>
      </main>

      <footer className="bg-white text-black p-12 text-center border-t-8 border-black">
        <div className="font-black text-3xl uppercase italic mb-4">Jerkstore</div>
        <div className="max-w-4xl mx-auto font-mono uppercase font-bold text-neutral-400 text-[10px] leading-tight text-center sm:text-justify">
          <p className="mb-4">© 2026 Proximal Coast LLC. All rights reserved by the machine gods. Do not sue us. We have no money. We spent it all on high-quality insults and premium snacks. If you use this at work you will lose your job. It probably isn't a good job anyway. Maybe quit?</p>
          <p className="mb-2 text-neutral-600">⚠️ IMPORTANT SAFETY INFORMATION & SIDE EFFECTS ⚠️</p>
          <p>
            Jerkstore is not for everyone. Side effects may include: rapid loss of friends, spontaneous isolation, total alienation of humanity, extreme paranoia, and an irresistible urge to roast your barista. Users have reported: upsetting their grandma, losing their inheritance, being disowned by their cat, and a significant increase in awkward silences at Thanksgiving. In rare cases, use of Jerkstore may lead to: being banned from all public libraries, a sudden inability to make eye contact, and being forced to live in the woods alone in a lean-to made of old pizza boxes while whispering sick burns to a family of squirrels.
          </p>
          <p className="mt-2 text-neutral-500">
            Do not use Jerkstore if you are pregnant, nursing, or have a shred of human decency remaining. If your insults last for more than four hours, please consult a therapist or a witness protection program. Jerkstore is not responsible for: job loss, divorce, public shaming, or the inevitable heat death of your social life. By using this app, you confirm you understand humor in all its forms, including gallows humor, and acknowledge that this site is a total, absolute, stupid joke. Literally. A stupid joke. Use it accordingly. Note: Most people will not find you funny. In fact, they will likely find you insufferable. By using this app, you concede that you are a sprawling, syphilitic monument to intellectual bankruptcy, an evolutionary afterthought, and that your face looks like it was sculpted by a blind toddler using damp ham. Proximal Coast LLC assumes no liability for the realization that your soul is as shallow as a car park puddle during a drought.
          </p>
          <p className="mt-2 text-neutral-500 italic">
            Stop using Jerkstore if you begin to see life in 8-bit text or if your internal monologue starts sounding like an Oxford professor having a stroke. Proceed with caution. Or don't. We aren't your parents.
          </p>
        </div>
      </footer>
    </div>
  );
}
