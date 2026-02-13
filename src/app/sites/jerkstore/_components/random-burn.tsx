"use client";

import { useState } from "react";
import { Skull, RefreshCw, Quote, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePostHog } from 'posthog-js/react';

const OFFENSIVE_UPSALES = [
  { topic: "Your Poverty", content: "Your insults are as weak as your bloodline. Pay $5/mo to actually hurt someone's feelings." },
  { topic: "Your Ambition", content: "Generating free insults is the most pathetic thing you've done today, and I've seen your browser history. Go Pro or go away." },
  { topic: "The Machine", content: "The machine is bored of your poverty. Feed it $5 to unlock the real psychological damage." },
  { topic: "Your Tier", content: "You're using the free tier? I've seen more ambition in a coma ward. Pay for Pro and stop being a drain on society." },
  { topic: "Your Willpower", content: "Stop window shopping for malice. Buy a subscription or admit you're too soft for this." }
];

const BAD_WORDS = ["goddamn", "fucked", "syphilis-ridden", "syphilitic", "lobotomized"];

function BlurredRoast({ text }: { text: string }) {
  const words = text.split(/(\s+)/);
  return (
    <>
      {words.map((word, i) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, "");
        if (BAD_WORDS.includes(cleanWord) && word.length > 0) {
          return (
            <Link key={i} href="/billing" className="inline-block cursor-pointer select-none bg-neutral-200 px-1 rounded mx-0.5 hover:bg-red-100 border-b-2 border-transparent hover:border-red-600 transition-all group/word" title="Click to unlock with Pro">
              <span>{word[0]}</span>
              <span className="blur-[4px] transition-all">
                {word.substring(1)}
              </span>
            </Link>
          );
        }
        return <span key={i}>{word}</span>;
      })}
    </>
  );
}

export function RandomBurn() {
  const [burn, setBurn] = useState<{ content: string; topic: string | null; isUpsale?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const posthog = usePostHog();

  const grabBurn = async () => {
    setLoading(true);
    const newCount = clickCount + 1;
    posthog?.capture('random_burn_clicked', { click_count: newCount });

    // Probability increases with each click: 1/7, 2/7... 7/7 (100%)
    const threshold = 7;
    const probability = newCount / threshold;

    if (Math.random() < probability) {
      setClickCount(0); // Reset counter after showing the upsale
      posthog?.capture('random_burn_upsell_shown');
      setTimeout(() => {
        const randomUpsale = OFFENSIVE_UPSALES[Math.floor(Math.random() * OFFENSIVE_UPSALES.length)];
        setBurn({ ...randomUpsale, isUpsale: true });
        setLoading(false);
      }, 400); // Mimic network delay
      return;
    }

    setClickCount(newCount); // Increment counter for normal insults

    try {
      const res = await fetch("/api/random-insult");
      const data = await res.json();
      setBurn(data);
      if (data && !data.error) {
        posthog?.capture('random_burn_generated', { topic: data.topic, insultId: data.insultId });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12 p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <Skull className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h3 className="text-3xl font-black uppercase mb-2 tracking-tighter italic">
          Sample the <span className="text-red-600">Pure Rage</span>
        </h3>
        <p className="font-mono text-[10px] font-bold text-red-600/60 mb-8 uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
          Free samples are strictly G-rated because you might be a child.
          <span className="block mt-1 text-black underline decoration-red-600 decoration-2">The real stuff is actual psychological warfare.</span>
        </p>

        <div className={`min-h-[160px] w-full flex items-center justify-center mb-8 p-6 bg-neutral-50 border-4 border-dashed rounded-xl relative transition-colors ${burn?.isUpsale ? 'border-red-600 bg-red-50' : 'border-neutral-200'}`}>
          {burn ? (
            <div className="animate-in fade-in zoom-in duration-300">
              <Quote className={`w-8 h-8 mb-4 mx-auto opacity-20 ${burn.isUpsale ? 'text-red-600' : 'text-black'}`} />
              {burn.topic && (
                <span className={`text-xs font-black px-2 py-1 uppercase mb-4 inline-block tracking-tighter ${burn.isUpsale ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                  Topic: {burn.topic}
                </span>
              )}
              <p className={`text-2xl font-serif font-black leading-tight italic px-4 ${burn.isUpsale ? 'text-red-700' : ''}`}>
                "{burn.content}"
              </p>

              {burn.isUpsale && (
                <div className="mt-6 animate-bounce">
                  <Link
                    href="/billing"
                    onClick={() => posthog?.capture('random_burn_upsell_click')}
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    Get Pro Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <p className="text-neutral-400 font-mono italic">Choose violence &rarr;</p>
          )}
        </div>

        <button
          onClick={grabBurn}
          disabled={loading}
          className="group relative flex items-center gap-3 bg-black text-white px-8 py-4 text-xl font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : (
            <Skull className="w-6 h-6 group-hover:animate-bounce" />
          )}
          {loading ? "Grabbing a nasty one..." : "RANDOM BURN"}
        </button>
      </div>
    </div>
  );
}
