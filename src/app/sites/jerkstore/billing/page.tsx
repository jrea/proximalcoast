"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";

export default function BillingPage() {
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 p-8 font-sans selection:bg-red-600 selection:text-white">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <Link href="/sites/jerkstore" className="text-2xl font-black uppercase underline decoration-4 underline-offset-4 hover:text-red-600">&larr; Back to App</Link>
          <h1 className="text-4xl font-black uppercase italic">Billing</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white border-4 border-black p-8 opacity-50 grayscale">
            <h2 className="text-4xl font-black uppercase mb-4">Paper Hands</h2>
            <div className="text-5xl font-mono font-bold mb-8">$0<span className="text-xl text-neutral-500">/mo</span></div>
            <ul className="space-y-4 mb-8 font-bold font-mono">
              <li className="flex items-center gap-2"><Check /> 3 Insults / Day</li>
              <li className="flex items-center gap-2"><Check /> English Only</li>
              <li className="flex items-center gap-2 line-through decoration-4">Streaming API</li>
            </ul>
            <button disabled className="w-full bg-neutral-300 text-neutral-500 font-black text-xl py-4 border-4 border-neutral-400 cursor-not-allowed uppercase">Current Plan</button>
          </div>

          {/* Pro Plan */}
          <div className="bg-yellow-300 border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-6 right-[-40px] bg-red-600 text-white font-black uppercase text-sm px-12 py-1 rotate-45 border-y-4 border-black">Best Value</div>
            <h2 className="text-4xl font-black uppercase mb-4">Diamond Hands</h2>
            <div className="text-5xl font-mono font-bold mb-8">$5<span className="text-xl text-neutral-800">/mo</span></div>
            <ul className="space-y-4 mb-8 font-bold font-mono">
              <li className="flex items-center gap-2"><Check className="stroke-[3px]" /> Unlimited Insults</li>
              <li className="flex items-center gap-2"><Check className="stroke-[3px]" /> Multi-Language Support</li>
              <li className="flex items-center gap-2"><Check className="stroke-[3px]" /> Priority Queuing</li>
            </ul>

            <div className="mb-6 flex items-start gap-3 p-4 bg-white/50 border-2 border-black/10">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-6 h-6 border-4 border-black text-black focus:ring-0 cursor-pointer mt-1"
              />
              <label htmlFor="terms" className="font-bold font-mono text-sm cursor-pointer leading-tight">
                I agree to the <Link href="/sites/jerkstore/terms" target="_blank" className="underline decoration-2">Terms of Emotional Damage</Link>. I confirm I am 18+ and understand this content is satire.
              </label>
            </div>

            <button
              disabled={!termsAccepted}
              className="w-full bg-black text-white font-black text-xl py-4 border-4 border-white active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all hover:bg-neutral-800 uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
