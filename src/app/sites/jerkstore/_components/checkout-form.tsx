"use client";

import { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function JerkstoreCheckoutForm({ priceId }: { priceId: string }) {
  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session
    return fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId: priceId || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE,
        siteSlug: "jerkstore",
      }),
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const options = { fetchClientSecret };

  return (
    <div id="checkout" className="border-4 border-black p-4 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
