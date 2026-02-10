"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShieldAlert, X, ChevronLeft, Loader2, Zap } from "lucide-react";
import { JerkstoreCheckoutForm } from "./checkout-form";
import { useRouter } from "next/navigation";

export function AccessModal({
  onClose,
  tier = 'trial',
  isActive = false,
  onSuccess
}: {
  onClose?: () => void,
  tier?: 'trial' | 'elite' | 'savage',
  isActive?: boolean,
  onSuccess?: () => void
}) {
  const [activeTier, setActiveTier] = useState<'trial' | 'elite' | 'savage'>(tier);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isSavage = activeTier === 'savage';
  const isElite = activeTier === 'elite';
  const isTrial = activeTier === 'trial';
  const priceId = isSavage ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SAVAGE : isTrial ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE;
  const price = isSavage ? "99" : isTrial ? "0" : "5";
  const planName = isSavage ? "Savage God Mode" : isTrial ? "Poopy Trial (Card Required) 💩" : "Diamond Hands Pro";

  const handleInstantUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/update-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          newPlanName: activeTier,
          siteSlug: "jerkstore"
        }),
      });

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
          onClose?.();
        }
      } else {
        const data = await response.json();
        setError(data.error || "Failed to upgrade. Maybe your credit is as bad as your roasts?");
      }
    } catch (err) {
      setError("Something went wrong. The internet is failing you.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 italic overflow-y-auto pt-12 md:pt-24 min-h-screen">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative w-full max-w-xl border-4 sm:border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 mb-12 sm:mb-24 ${isSavage ? 'bg-neutral-900 text-white' : 'bg-neutral-100'}`}>
        {/* Header Strip */}
        <div className="bg-black text-white p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {termsAccepted && (
              <button
                onClick={() => setTermsAccepted(false)}
                className="hover:text-yellow-400 transition-colors mr-1 sm:mr-2"
                title="Back to plans"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3px]" />
              </button>
            )}
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <span className="font-black uppercase tracking-tighter text-lg sm:text-xl">
              Verification
            </span>
          </div>
          <button
            onClick={onClose}
            className="hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3px]" />
          </button>
        </div>

        <div className="p-4 sm:p-8">
          {!termsAccepted ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-5xl font-black uppercase mb-2 tracking-tighter leading-none">
                  {isSavage ? "ASCEND TO DIVINITY." : "Wait a minute."}
                </h2>
                <p className={`text-sm sm:text-lg font-bold font-mono ${isSavage ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {isSavage
                    ? "Scaling to godhood requires a sacrifice."
                    : isTrial
                      ? "Age verification required. Prove you're not a middle schooler."
                      : "Generating high-quality damage isn't free."}
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className={`border-4 border-black p-4 sm:p-6 relative overflow-hidden ${isSavage ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600' : 'bg-yellow-300 text-black'}`}>
                  <div className="absolute top-4 right-[-40px] bg-red-600 text-white font-black uppercase text-[8px] sm:text-[10px] px-10 py-1 rotate-45 border-y-2 border-black z-10">
                    {isSavage ? "GOD LIKE" : "Required"}
                  </div>

                  <h3 className={`text-2xl sm:text-3xl font-black uppercase mb-3 sm:mb-4 tracking-tighter ${isSavage ? 'text-white' : ''}`}>
                    {planName}
                  </h3>
                  <div className={`text-3xl sm:text-4xl font-mono font-bold mb-4 sm:mb-6 ${isSavage ? 'text-white' : ''}`}>
                    ${price}<span className={`text-sm ${isSavage ? 'text-white/70' : 'text-neutral-800'}`}>/mo</span>
                  </div>

                  <ul className={`space-y-2 mb-4 sm:mb-6 font-bold font-mono text-[10px] sm:text-sm leading-tight ${isSavage ? 'text-white' : ''}`}>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 stroke-[4px]" /> {isSavage ? "1000 ROASTS / DAY" : isTrial ? "3 TOTAL BURNS (EVER)" : "200 ROASTS / DAY"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 stroke-[4px]" /> {isSavage ? "SOUL-CRUSHING EMAILS" : isTrial ? "BASIC VERBAL ASSAULT" : "MULTI-LANGUAGE SNARK"}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 stroke-[4px]" /> {isSavage ? "GOD-TIER VERDICT" : "ADULT VERIFICATION"}
                    </li>
                  </ul>

                  <div className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border-2 border-black/10 ${isSavage ? 'bg-black/30' : 'bg-white/50'}`}>
                    <input
                      type="checkbox"
                      id="modal-terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-4 border-black text-black focus:ring-0 cursor-pointer mt-0.5"
                    />
                    <label
                      htmlFor="modal-terms"
                      className={`font-bold font-mono text-[9px] sm:text-[11px] cursor-pointer leading-tight uppercase ${isSavage ? 'text-white' : ''}`}
                    >
                      I AGREE TO THE{" "}
                      <Link href="/terms" target="_blank" className="underline decoration-2 text-red-600">TERMS</Link>
                      . I AM 18+ AND THIS IS A JOKE.
                    </label>
                  </div>
                </div>

                <div className={`p-3 sm:p-4 border-4 border-dashed text-center ${isSavage ? 'border-purple-500/50' : 'border-black/20'}`}>
                  {isSavage ? (
                    <div className="space-y-3">
                      <p className="font-black uppercase italic text-neutral-400 text-[10px] sm:text-xs">
                        Shed your mortal skin to proceed
                      </p>
                      <button
                        onClick={() => setActiveTier('elite')}
                        className="text-[10px] font-black uppercase underline decoration-purple-500 hover:text-purple-400 transition-colors"
                      >
                        Wait, I'm semi-poor. Show me Elite ($5).
                      </button>
                    </div>
                  ) : isElite ? (
                    <div className="space-y-3">
                      <p className="font-black uppercase italic text-neutral-600 text-[10px] sm:text-xs">
                        Elite status pending.
                      </p>
                      <button
                        onClick={() => setActiveTier('savage')}
                        className="text-[10px] font-black uppercase underline decoration-black hover:text-red-600 transition-colors"
                      >
                        Nevermind, I want to be a GOD. Show Savage ($99).
                      </button>
                    </div>
                  ) : (
                    <p className="font-black uppercase italic text-neutral-500 text-[10px] sm:text-sm">
                      Accept terms to confirm age
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="mb-6">
                <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tight">
                  {isActive ? "One Click Ascension" : "Final Step: Pay Up"}
                </h3>
                <p className={`font-mono text-sm font-bold ${isSavage ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {isActive
                    ? `You're already an Elite member. We'll just charge the difference to your card on file and unlock the vitriol immediately.`
                    : `Enter your card details below to finalize your transition into ${isSavage ? "a deity of disdain" : "a professional jerk"}.`}
                </p>
              </div>

              {isActive ? (
                <div className="space-y-4">
                  <button
                    onClick={handleInstantUpgrade}
                    disabled={loading}
                    className={`w-full relative group/btn overflow-hidden bg-black text-white font-black py-6 text-2xl border-4 border-white transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] uppercase tracking-widest active:translate-y-0 active:shadow-none disabled:opacity-50`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" /> PROCESSSING...
                        </>
                      ) : (
                        <>
                          ASCEND IMMEDIATELY <Zap className="w-6 h-6 fill-white" />
                        </>
                      )}
                    </span>
                  </button>
                  {error && (
                    <p className="text-red-600 font-black uppercase text-xs text-center animate-shake">
                      {error}
                    </p>
                  )}
                  <p className="text-[10px] text-neutral-500 font-mono text-center uppercase">
                    Your card on file will be charged ${price}/mo (prorated for this month).
                  </p>
                </div>
              ) : (
                <div className="border-4 border-black">
                  <JerkstoreCheckoutForm priceId={priceId || ""} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className={`border-t-4 border-black p-3 text-center ${isSavage ? 'bg-black' : 'bg-white'}`}>
          <p className="font-mono text-[9px] font-bold text-neutral-500 uppercase">© 2026 PROXIMAL COAST LLC • NO REFUNDS FOR DAMAGED EGOS</p>
        </div>
      </div>
    </div>
  );
}

