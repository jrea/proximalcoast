"use client";

import { useState } from "react";
import { Skull, RefreshCw, Quote } from "lucide-react";

export function RandomBurn() {
  const [burn, setBurn] = useState<{ content: string; topic: string | null } | null>(null);
  const [loading, setLoading] = useState(false);

  const grabBurn = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/random-insult");
      const data = await res.json();
      setBurn(data);
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
        <p className="font-mono text-sm font-bold text-neutral-500 mb-8 uppercase tracking-widest">
          Click the button to see what our AI thinks of humanity.
        </p>

        <div className="min-h-[160px] w-full flex items-center justify-center mb-8 p-6 bg-neutral-50 border-4 border-dashed border-neutral-200 rounded-xl relative">
          {burn ? (
            <div className="animate-in fade-in zoom-in duration-300">
              <Quote className="w-8 h-8 text-red-600 mb-4 mx-auto opacity-20" />
              {burn.topic && (
                <span className="text-xs font-black bg-black text-white px-2 py-1 uppercase mb-4 inline-block tracking-tighter">
                  Topic: {burn.topic}
                </span>
              )}
              <p className="text-2xl font-serif font-black leading-tight italic px-4">
                "{burn.content}"
              </p>
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
