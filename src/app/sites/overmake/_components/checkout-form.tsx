"use client";

import { useCallback, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { cn } from "@/lib/utils";
import { THEMES } from "@overmake/constants";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  priceId: string;
  onClose?: () => void;
  theme?: string;
}

export function OvermakeCheckoutForm({ priceId, onClose, theme }: CheckoutFormProps) {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(() => {
    return fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId: priceId,
        siteSlug: "overmake",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
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
  }, [priceId]);

  const options = { fetchClientSecret };

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="underline">Retry</button>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full min-h-[400px]",
      theme === 'luxury' && "bg-black",
      theme !== 'luxury' && "bg-white"
    )}>
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
