"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "./payment-form";
import { LucideLock, LucideShieldCheck, LucideScrollText, LucideUsers, LucideMountainSnow, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function SubscribeButton({
  user,
  initialStatus,
  priceAmount,
  priceCurrency
}: {
  user?: { email: string } | null,
  initialStatus?: string | null,
  priceAmount?: number,
  priceCurrency?: string
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

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
        setClientSecret(data.clientSecret);
        setSubscriptionId(data.subscriptionId);
      } else if (data.restored) {
        window.location.href = "/?success=true";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // AUTO-RESUME: If the server detected an incomplete sub, trigger the checkout flow on mount
  useEffect(() => {
    if (initialStatus === "incomplete") {
      startCheckout();
    }
  }, [initialStatus]);

  if (clientSecret) {
    return (
      <div className="w-full max-w-xl mx-auto py-6 md:py-12 bkd-shoji-enter">
        <div className="bg-white border border-[var(--bkd-border)] p-4 md:p-10 shadow-2xl">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "flat" as const,
                variables: {
                  fontFamily: '"Inter", sans-serif',
                  colorBackground: "#F7F2E8",
                  colorText: "#1A1A1B",
                  colorPrimary: "#BC241C",
                  colorDanger: "#BC241C",
                  borderRadius: "0px",
                  spacingUnit: "4px",
                },
                rules: {
                  '.Input': {
                    border: '1px solid #D1C7B7',
                    boxShadow: 'none',
                  },
                  '.Input:focus': {
                    border: '1px solid #BC241C',
                    boxShadow: 'none',
                  },
                  '.Label': {
                    fontFamily: '"Inter", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    fontSize: '11px',
                    fontWeight: '700',
                    opacity: '0.7',
                    marginBottom: '8px',
                  }
                }
              },
            }}
          >
            <PaymentForm
              subscriptionId={subscriptionId!}
              user={user}
              onSuccess={() => { }}
              onCancel={() => setClientSecret(null)}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-12 bkd-shoji-enter">

      {/* Premium Commitment Card */}
      <div className="bkd-card-header group">
        <span className="bg-text opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-700">BUSHIN</span>

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 px-2">
            <h2 className="bkd-h2 md:bkd-h1 uppercase tracking-[0.1em] md:tracking-[0.15em] text-balance">Monthly Membership</h2>
            <p className="bkd-mono text-[9px] md:text-[10px] opacity-40 uppercase tracking-[0.4em] font-bold">Dojo Training</p>
          </div>

          <div className="bkd-card-detail bg-[var(--bkd-surface)]/50 w-full text-center py-10 relative">
            <div className="mb-6 flex items-baseline justify-center gap-2">
              <span className="bkd-h1 text-4xl">
                {priceAmount
                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: priceCurrency || 'USD', maximumFractionDigits: 0 }).format(priceAmount / 100)
                  : '$150'}
              </span>
              <span className="bkd-mono text-[10px] opacity-50 uppercase tracking-widest">/ Month</span>
            </div>

            <div className="h-px bg-[var(--bkd-border)] w-2/3 mx-auto mb-8 opacity-50" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 px-4 md:px-8">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#BC241C]" />
                <div className="text-left">
                  <p className="bkd-mono text-[9px] font-bold uppercase tracking-wider">Monday</p>
                  <p className="bkd-body text-[10px] opacity-50">7:00 – 8:00 pm</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#BC241C]" />
                <div className="text-left">
                  <p className="bkd-mono text-[9px] font-bold uppercase tracking-wider">Wednesday</p>
                  <p className="bkd-body text-[10px] opacity-50">7:00 – 8:00 pm</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-[var(--bkd-border)] w-2/3 mx-auto mt-8 opacity-30" />
            <p className="bkd-mono text-[9px] opacity-40 uppercase tracking-wider text-center pt-4 pb-2">
              5230 N. Virginia Dare Trail · Kitty Hawk, NC 27949
            </p>
          </div>

          <div className="w-full space-y-8 pt-4">
            <button
              onClick={startCheckout}
              disabled={loading}
              className={`bkd-btn-primary w-full py-6 text-lg tracking-[0.2em] relative overflow-hidden ${loading ? 'bkd-loading text-white/50' : ''}`}
            >
              <span className="relative z-10">
                {loading ? "Opening the Dojo..." : "Begin Your Training"}
              </span>
              <div className="bkd-btn-progress" />
            </button>
            <div className="flex items-center justify-center gap-4 opacity-5">
              <div className="h-px w-12 bg-black" />
              <div className="w-1 h-1 rounded-full bg-black" />
              <div className="h-px w-12 bg-black" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-[#BC241C]/5 border border-[#BC241C] text-[#BC241C] bkd-mono text-[11px] text-center shadow-sm">
          &gt;_ SYSTEM_ERROR: {error}
        </div>
      )}

      {user && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-10 border-t border-[var(--bkd-border)] border-dashed bkd-shoji-enter" style={{ animationDelay: '0.4s' }}>
          <span className="opacity-30 bkd-mono text-[9px] uppercase tracking-[0.2em] font-bold shrink-0">
            Session: <span className="text-[#BC241C]/60 truncate max-w-[150px] inline-block align-bottom">{user.email}</span>
          </span>
          <div className="hidden sm:block w-px h-3 bg-[var(--bkd-border)]" />
          <button
            onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
            className="bkd-mono text-[9px] uppercase tracking-[0.2em] font-bold opacity-30 hover:opacity-100 hover:text-[#BC241C] transition-all flex items-center gap-1.5 group/logout"
          >
            <LogOut className="w-3 h-3 group-hover/logout:-translate-x-0.5 transition-transform" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
