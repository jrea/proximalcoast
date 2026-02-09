"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShieldAlert, X, ChevronLeft } from "lucide-react";
import { JerkstoreCheckoutForm } from "./checkout-form";

export function AccessModal({ onClose }: { onClose?: () => void }) {
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 italic overflow-y-auto pt-12 md:pt-24 min-h-screen">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-neutral-100 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 mb-24">
        {/* Header Strip */}
        <div className="bg-black text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {termsAccepted && (
              <button
                onClick={() => setTermsAccepted(false)}
                className="hover:text-yellow-400 transition-colors mr-2"
                title="Back to plans"
              >
                <ChevronLeft className="w-8 h-8 stroke-[3px]" />
              </button>
            )}
            <ShieldAlert className="w-6 h-6 text-yellow-400" />
            <span className="font-black uppercase tracking-tighter text-xl">
              Access Required
            </span>
          </div>
          <button
            onClick={onClose}
            className="hover:text-red-500 transition-colors"
          >
            <X className="w-8 h-8 stroke-[3px]" />
          </button>
        </div>

        <div className="p-8">
          {!termsAccepted ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-5xl font-black uppercase mb-2 tracking-tighter leading-none">Wait a minute.</h2>
                <p className="text-lg font-bold font-mono text-neutral-600">You're trying to generate high-quality psychological damage on a free loader's budget?</p>
              </div>

              <div className="space-y-6">
                <div className="bg-yellow-300 border-4 border-black p-6 relative overflow-hidden">
                  <div className="absolute top-4 right-[-35px] bg-red-600 text-white font-black uppercase text-[10px] px-10 py-1 rotate-45 border-y-2 border-black">
                    Required
                  </div>

                  <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">Diamond Hands Pro</h3>
                  <div className="text-4xl font-mono font-bold mb-6">
                    $5<span className="text-base text-neutral-800">/mo</span>
                  </div>

                  <ul className="space-y-2 mb-6 font-bold font-mono text-sm leading-tight">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 stroke-[4px]" /> UNLIMITED RAGE
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 stroke-[4px]" /> MULTI-LANGUAGE SNARK
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 stroke-[4px]" /> PRIORITY QUEUING
                    </li>
                  </ul>

                  <div className="flex items-start gap-3 p-3 bg-white/50 border-2 border-black/10">
                    <input
                      type="checkbox"
                      id="modal-terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-5 h-5 border-4 border-black text-black focus:ring-0 cursor-pointer mt-0.5"
                    />
                    <label
                      htmlFor="modal-terms"
                      className="font-bold font-mono text-[11px] cursor-pointer leading-tight uppercase"
                    >
                      I AGREE TO THE{" "}
                      <Link href="/terms" target="_blank" className="underline decoration-2">TERMS OF EMOTIONAL DAMAGE</Link>
                      . I AM 18+ AND ACKNOWLEDGE THIS IS A STUPID JOKE.
                    </label>
                  </div>
                </div>

                <div className="p-4 border-4 border-dashed border-black/20 text-center">
                  <p className="font-black text-neutral-400 uppercase italic">Accept terms to proceed with financial ruin</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="mb-6">
                <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tight">Final Step: Pay Up</h3>
                <p className="font-mono text-sm font-bold text-neutral-500">Enter your card details below to finalize your transition into a professional jerk.</p>
              </div>
              <div className="border-4 border-black">
                <JerkstoreCheckoutForm />
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-white border-t-4 border-black p-3 text-center">
          <p className="font-mono text-[9px] font-bold text-neutral-400 uppercase">© 2026 PROXIMAL COAST LLC • NO REFUNDS FOR DAMAGED EGOS</p>
        </div>
      </div>
    </div>
  );
}
