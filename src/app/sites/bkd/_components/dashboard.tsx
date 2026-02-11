"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Settings2, LogOut, AlertTriangle, CheckCircle2 } from "lucide-react";

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
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (initialSubscription && subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
      setLoading(false);
      return;
    }

    async function fetchSubscription() {
      try {
        const res = await fetch("/api/subscription-status?siteSlug=bkd");
        const data = await res.json();

        // If still no subscription or bad status, try a forced sync via API
        if (!data.subscription || (data.subscription.status !== 'active' && data.subscription.status !== 'trialing')) {
          console.log("[Dashboard] Status looks bad, trying to sync...");
          // We don't have a dedicated "POST /api/sync" yet, but we can trigger it in GET if needed
          // For now, if BKDContent (parent) handled it, we just trust the fetch.
          // If we really want to be aggressive, we'd add a sync endpoint.
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
    if (!confirm("Are you sure you want to cancel your membership? You will keep access until the end of your billing period.")) return;

    setCancelling(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "bkd" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessage({ type: 'success', text: "Your membership has been set to cancel." });
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Membership Card */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-neutral-100 shadow-2xl shadow-black/5 relative group">
        {/* Belt Color Decorative Strip */}
        <div className="h-2 w-full flex">
          <div className="h-full flex-1 bg-white border-b border-neutral-100" title="White Belt" />
          <div className="h-full flex-1 bg-yellow-400" title="Yellow Belt" />
          <div className="h-full flex-1 bg-green-600" title="Green Belt" />
          <div className="h-full flex-1 bg-blue-600" title="Blue Belt" />
          <div className="h-full flex-1 bg-amber-900" title="Brown Belt" />
          <div className="h-full flex-1 bg-black" title="Black Belt" />
        </div>

        <div className="p-8 sm:p-10 space-y-8">
          {/* Header & Status */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-green-400/20 blur-xl rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative px-6 py-2 bg-neutral-900 text-white rounded-full flex items-center gap-2 border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Active Member</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic scale-y-110 leading-none">
                {subscription?.plan || 'Standard'} Membership
              </h2>
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">
                Official BKD Karatedo Student
              </p>
            </div>
          </div>

          {/* Pricing & Features Grid */}
          <div className="grid grid-cols-1 gap-4 bg-neutral-50/50 rounded-3xl p-6 border border-neutral-100/50">
            <div className="text-center">
              <span className="text-4xl font-black tracking-tighter leading-none">
                {subscription?.priceAmount
                  ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: subscription.priceCurrency || 'USD',
                    maximumFractionDigits: 0
                  }).format(subscription.priceAmount / 100)
                  : '$150'}
              </span>
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-widest ml-1">/ Month</span>
            </div>

            <div className="h-px bg-neutral-200/50 w-full" />

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-neutral-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                <span className="text-[10px] font-bold uppercase tracking-wider">All Sessions</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Belt Testing</span>
              </div>
            </div>
          </div>

          {/* Renewal Info / Management */}
          <div className="space-y-4">
            {subscription?.expiresAt && !subscription.cancelAtPeriodEnd && (
              <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-50 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest">Next Renewal</span>
                <span className="text-xs font-black text-neutral-900 italic">
                  {new Date(subscription.expiresAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}

            {subscription?.cancelAtPeriodEnd && (
              <div className="w-full py-4 px-6 bg-amber-50 rounded-2xl flex items-center gap-4 text-amber-900 border border-amber-100">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Ending Soon</p>
                  <p className="text-xs font-bold mt-1">Access valid until {new Date(subscription.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-2xl animate-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="text-xs font-black uppercase text-center tracking-wider">{message.text}</p>
              </div>
            )}

            {!subscription?.cancelAtPeriodEnd && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full py-3 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all duration-300"
              >
                {cancelling ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processing...
                  </div>
                ) : "Request Cancellation"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center space-y-4 pt-4">
        <div className="flex flex-col items-center gap-1 opacity-60">
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.4em] font-black">Authorized Member</p>
          <p className="text-[12px] font-black uppercase italic tracking-tighter text-neutral-900">{session?.user.email}</p>
        </div>

        <button
          onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
          className="group inline-flex items-center gap-2 px-6 py-2 rounded-full border border-neutral-200 hover:border-black hover:bg-black hover:text-white transition-all duration-300"
        >
          <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Secure Sign Out</span>
        </button>
      </div>
    </div>
  );
}
