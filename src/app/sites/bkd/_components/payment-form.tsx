"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export function PaymentForm({
  subscriptionId,
  user,
  onSuccess,
  onCancel,
}: {
  subscriptionId: string;
  user?: { email: string } | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    // 1. Submit the elements first to validate and get data
    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message ?? "Validation failed");
      setLoading(false);
      return;
    }

    // Confirm payment. Billing details are sent to Stripe with the PaymentElement.
    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?success=true&subscription_id=${subscriptionId}`,
      },
    });

    if (confirmErr) {
      setError(confirmErr.message ?? "Payment failed");
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bkd-shoji-enter">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="bkd-mono text-[10px] uppercase tracking-[0.3em] font-bold">Payment Information</h3>
          <p className="bkd-body text-[10px] opacity-40 italic">Enter your card details and contact information to start your membership.</p>
        </div>

        <div className="bg-white border border-[var(--bkd-border)] p-6 shadow-sm">
          <PaymentElement
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  email: user?.email || '',
                }
              },
              fields: {
                billingDetails: "auto",
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#BC241C]/5 border border-[#BC241C] text-[#BC241C] bkd-mono text-[10px]">
          &gt;_ ERROR: {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="bkd-btn-secondary flex-1"
        >
          Go Back
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className={`bkd-btn-primary flex-1 py-5 text-sm tracking-[0.15em] relative overflow-hidden ${loading ? 'bkd-loading text-white/50' : ''}`}
        >
          <span className="relative z-10">
            {loading ? "Opening the Dojo..." : "Ready to Begin"}
          </span>
          <div className="bkd-btn-progress" />
        </button>
      </div>

      <p className="bkd-body text-[10px] opacity-40 text-center leading-relaxed italic">
        Your payment is secure. You can cancel your membership at any time from your dashboard.
      </p>
    </form>
  );
}
