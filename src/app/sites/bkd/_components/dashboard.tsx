"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  status: string;
  cancelAtPeriodEnd: boolean;
  expiresAt: string;
  plan: string;
  priceAmount?: number | null;
  priceCurrency?: string | null;
}

export function ManageMembership({ initialSubscription }: { initialSubscription?: Subscription | null }) {
  const { data: session } = authClient.useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(initialSubscription || null);
  const [loading, setLoading] = useState(!initialSubscription);
  const [cancelling, setCancelling] = useState(false);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    if (initialSubscription && subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
      setLoading(false);
      return;
    }

    async function fetchSubscription() {
      try {
        const res = await fetch("/api/subscription-status?siteSlug=bkd");
        const data = await res.json();

        if (!data.subscription || (data.subscription.status !== 'active' && data.subscription.status !== 'trialing')) {
          console.log("[Dashboard] Status looks bad, trying to sync...");
        }

        if (data.subscription) {
          setSubscription(data.subscription);
        }
      } catch (err) {
        console.error("Failed to fetch subscription", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubscription();
  }, [initialSubscription]);

  const handleCancel = async () => {
    toast.custom((toastId) => (
      <div className="bg-[#F7F2E8] border border-[#D1C7B7] shadow-2xl w-[calc(100vw-2rem)] max-w-md mx-auto p-8">
        <p className="bkd-mono text-[11px] font-bold uppercase tracking-[0.3em] mb-2">Pause Training?</p>
        <p className="bkd-body text-sm opacity-60 mb-8 leading-relaxed">
          You'll keep access until the end of your current billing period.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => { toast.dismiss(toastId); doCancel(); }}
            className="bkd-btn-primary text-[11px] px-6 py-3 flex-1"
          >
            Yes, Pause
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="bkd-btn-secondary text-[11px] px-6 py-3 flex-1"
          >
            Keep Training
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  const doCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "bkd" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Training paused. Access continues until end of billing period.", {
        style: { background: '#F7F2E8', border: '1px solid #D1C7B7', borderRadius: 0, fontFamily: 'monospace', fontSize: '11px' }
      });
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
    } catch (err: any) {
      toast.error(err.message, {
        style: { background: '#F7F2E8', border: '1px solid #BC241C', borderRadius: 0, fontFamily: 'monospace', fontSize: '11px' }
      });
    } finally {
      setCancelling(false);
    }
  };

  const doResume = async () => {
    setResuming(true);
    try {
      const res = await fetch("/api/reactivate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "bkd" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Welcome back. Training resumed.", {
        style: { background: '#F7F2E8', border: '1px solid #D1C7B7', borderRadius: 0, fontFamily: 'monospace', fontSize: '11px' }
      });
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: false } : null);
    } catch (err: any) {
      toast.error(err.message, {
        style: { background: '#F7F2E8', border: '1px solid #BC241C', borderRadius: 0, fontFamily: 'monospace', fontSize: '11px' }
      });
    } finally {
      setResuming(false);
    }
  };

  if (loading) {
    return (
      <svg className="bkd-enso-loader opacity-50 w-8 h-8" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" /></svg>
    );
  }

  return (
    <div className="w-full space-y-8 bkd-shoji-enter relative z-20">
      <div className="bkd-card-header active">
        <span className={`bg-text transition-all duration-500 ${subscription?.cancelAtPeriodEnd ? 'blur-sm' : ''}`}>{subscription?.plan || 'Bushin'}</span>

        <div className="text-center space-y-2 mb-10">
          <h2 className="bkd-h1 uppercase tracking-[0.15em]">
            Monthly Membership
          </h2>
          <p className="bkd-mono text-[10px] opacity-50 mt-2">
            Active Status
          </p>
        </div>

        <div className="bkd-card-detail bg-[var(--bkd-surface)] text-center mb-8 relative">
          <div className="mb-4 flex items-baseline justify-center gap-2">
            <span className="bkd-h1">
              {subscription?.priceAmount
                ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: subscription.priceCurrency || 'USD',
                  maximumFractionDigits: 0
                }).format(subscription.priceAmount / 100)
                : '$150'}
            </span>
            <span className="bkd-mono text-[10px] opacity-50 uppercase tracking-widest">/ Month</span>
          </div>

          <div className="h-px bg-[var(--bkd-border)] w-2/3 mx-auto my-6 opacity-50" />

          <div className="grid grid-cols-2 gap-6 px-8">
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

        <div className="space-y-4">
          {subscription?.expiresAt && !subscription.cancelAtPeriodEnd && (
            <div className="flex items-center justify-between border-b border-[var(--bkd-border)] pb-4 px-2">
              <span className="bkd-mono text-[10px]">Billing Cycle Ends</span>
              <span className="bkd-mono text-[10px] font-bold border border-[var(--bkd-border)] px-4 py-1.5 bg-white/30">
                {new Date(subscription.expiresAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}
              </span>
            </div>
          )}

          {subscription?.cancelAtPeriodEnd && (
            <div className="w-full relative overflow-hidden bg-[var(--bkd-surface)]/60 backdrop-blur-md border border-[var(--bkd-border)] py-10 px-8 text-center">
              {/* Blurred 休 (rest) watermark — intentionally visible through the frost */}
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 bkd-vertical-text text-[100px] select-none pointer-events-none font-black leading-none text-[#BC241C]"
                style={{ opacity: 0.12 }}
              >
                休
              </span>
              <div className="relative z-10 space-y-3">
                <p className="bkd-mono text-[9px] uppercase tracking-[0.5em] opacity-40 font-bold">
                  Until Your Return
                </p>
                <p className="bkd-h2 text-xl">
                  {new Date(subscription.expiresAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="bkd-body text-[11px] opacity-40 italic">
                  Your membership remains active until then.
                </p>
              </div>
            </div>
          )}

          {subscription?.cancelAtPeriodEnd && (
            <button
              onClick={doResume}
              disabled={resuming}
              className={`bkd-btn-primary w-full mt-4 relative overflow-hidden ${resuming ? 'bkd-loading text-white/50' : ''}`}
            >
              <span className="relative z-10">
                {resuming ? "Resuming..." : "Resume Training"}
              </span>
              <div className="bkd-btn-progress" />
            </button>
          )}

          {!subscription?.cancelAtPeriodEnd && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className={`bkd-btn-secondary w-full mt-4 relative overflow-hidden ${cancelling ? 'bkd-loading text-[#BC241C]/50' : ''}`}
            >
              <span className="relative z-10">
                {cancelling ? "Pausing Training..." : "Pause My Training"}
              </span>
              <div className="bkd-btn-progress opacity-20" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 pt-12 border-t border-[var(--bkd-border)] border-dashed">
        <div className="flex items-center gap-3">
          <p className="bkd-mono text-[9px] opacity-30 uppercase tracking-[0.2em] font-bold">Authorized:</p>
          <p className="bkd-mono text-[10px] font-bold text-[#BC241C]/60 truncate max-w-[150px]">
            {session?.user.email}
          </p>
        </div>
        <div className="w-px h-3 bg-[var(--bkd-border)]" />
        <button
          onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
          className="bkd-mono text-[9px] uppercase tracking-[0.2em] font-bold opacity-30 hover:opacity-100 hover:text-[#BC241C] transition-all flex items-center gap-1.5 group/logout"
        >
          <LogOut className="w-3 h-3 group-hover/logout:-translate-x-0.5 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
}
