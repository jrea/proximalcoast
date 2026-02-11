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
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: checkoutClientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      <button
        onClick={startCheckout}
        disabled={loading}
        className="group w-full py-5 px-8 bg-black text-white rounded-2xl font-black text-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            Start Training
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {error && (
        <p className="text-red-500 text-xs font-bold text-center italic">{error}</p>
      )}

      {user && (
        <p className="text-center text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
          Signed in as {user.email}
        </p>
      )}
    </div>
  );
}
