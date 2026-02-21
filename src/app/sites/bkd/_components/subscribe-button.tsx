"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function SubscribeButton({ user }: { user?: { email: string } | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null);

  const startCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (data.clientSecret) {
        setCheckoutClientSecret(data.clientSecret);
      } else if (data.restored) {
        window.location.href = "/?success=true";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkoutClientSecret) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-stone-900/40 backdrop-blur-3xl rounded-3xl shadow-[0_10px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/5 overflow-hidden text-stone-200 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
        <div className="relative z-10 p-4">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: checkoutClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <button
        onClick={startCheckout}
        disabled={loading}
        className="group w-full py-5 px-8 bg-stone-200 text-stone-900 rounded-full font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white active:scale-95 border border-transparent relative overflow-hidden"
      >
        <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent transform -skew-x-[25deg] group-hover:animate-[blade-glint_1.5s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-center gap-3 w-full">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          ) : (
            <>
              Initialize Protocol
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </>
          )}
        </div>
      </button>

      {error && (
        <p className="text-red-200 text-[10px] font-black uppercase tracking-widest text-center bg-red-950/40 py-3 rounded-xl border border-red-500/30">{error}</p>
      )}

      {user && (
        <p className="text-center text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] border border-white/5 bg-stone-900/40 rounded-full py-3 shadow-inner relative overflow-hidden">
          <span className="absolute left-0 top-0 w-1 h-full bg-emerald-500 opacity-50"></span>
          Session Linked : {user.email}
        </p>
      )}
    </div>
  );
}
