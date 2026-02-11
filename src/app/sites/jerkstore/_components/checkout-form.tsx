"use client";

import { useCallback, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function JerkstoreCheckoutForm({ planId }: { planId: string }) {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session
    return fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId: planId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.restored) {
          // Subscription was restored (e.g. cancelled but reactivated)
          window.location.reload();
          return ""; // Return empty string to prevent error in EmbeddedCheckoutProvider, though reload should happen fast
        }
        if (data.error) {
          throw new Error(data.error);
        }
        return data.clientSecret;
      })
      .catch((err) => {
        console.error("Checkout init error:", err);
        setError(err.message || "Failed to initialize checkout");
        throw err;
      });
  }, [planId]);

  const options = { fetchClientSecret };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-4 border-red-500 text-red-700 font-black uppercase text-center shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]">
        <h3 className="text-xl mb-2">Checkout Error</h3>
        <p className="font-mono text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 font-bold hover:bg-red-700 transition w-full"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div id="checkout" className="border-0 sm:border-4 border-black p-2 sm:p-4 bg-white shadow-none sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
