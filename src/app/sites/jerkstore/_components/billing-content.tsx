"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, CreditCard, ChevronLeft, Loader2, AlertTriangle, HeartOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { JerkstoreCheckoutForm } from "./checkout-form";

interface BillingContentProps {
  initialSubscription: any;
}

export function BillingContent({ initialSubscription }: BillingContentProps) {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(initialSubscription);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [pollingComplete, setPollingComplete] = useState(false);
  const [showFanfare, setShowFanfare] = useState(false);
  const [fanfareType, setFanfareType] = useState<'redemption' | 'upgrade' | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription?siteSlug=jerkstore");
      const data = await res.json();
      setSubscription(data.subscription);
      return data.subscription?.status === "active";
    } catch (err) {
      console.error("Failed to fetch sub:", err);
      return false;
    }
  };

  useEffect(() => {
    if (showConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showConfirm]);

  useEffect(() => {
    // If we just had a successful checkout, poll for the webhook to finish
    if (isSuccess && pollCount < 5 && !pollingComplete) {
      const interval = setInterval(async () => {
        const active = await fetchSubscription();
        if (active) {
          clearInterval(interval);
          setPollingComplete(true);
          router.replace("/billing"); // Clear success param
        } else {
          setPollCount(prev => prev + 1);
          if (pollCount === 4) { // Reached limit
            setPollingComplete(true);
            router.replace("/billing");
          }
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isSuccess, pollCount, pollingComplete]);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "jerkstore" }),
      });
      if (response.ok) {
        setShowConfirm(false);
        // Optimistic update
        setSubscription((prev: any) => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
        fetchSubscription(); // Still fetch for final source of truth
      }
    } catch (error) {
      console.error("Cancel Error:", error);
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      const response = await fetch("/api/reactivate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "jerkstore" }),
      });
      if (response.ok) {
        // Optimistic update
        setSubscription((prev: any) => prev ? { ...prev, cancelAtPeriodEnd: false } : null);
        setFanfareType('redemption');
        setShowFanfare(true);
        setTimeout(() => setShowFanfare(false), 5000);
        fetchSubscription(); // Still fetch for final source of truth
      }
    } catch (error) {
      console.error("Reactivation Error:", error);
    } finally {
      setReactivating(false);
    }
  };

  const handleUpdateSubscription = async (priceId: string, planName: string) => {
    setLoading(true);
    setUpdateError(null);
    try {
      const response = await fetch("/api/update-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          newPlanName: planName,
          siteSlug: "jerkstore"
        }),
      });

      if (response.ok) {
        // Optimistic update
        setSubscription((prev: any) => ({ ...prev, plan: planName, cancelAtPeriodEnd: false }));
        // If downgrading, fetch to get the upcomingPlan
        fetchSubscription();

        setFanfareType('upgrade');
        setShowFanfare(true);
        setTimeout(() => setShowFanfare(false), 5000);
      } else {
        setUpdateError("Failed to update plan. Maybe you're too broke?");
      }
    } catch (error) {
      console.error("Update Plan Error:", error);
      setUpdateError("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDowngrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cancel-downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "jerkstore" }),
      });

      if (response.ok) {
        setSubscription((prev: any) => ({ ...prev, upcomingPlan: null }));
        fetchSubscription();
      } else {
        setUpdateError("Failed to cancel downgrade. You're stuck with it.");
      }
    } catch (error) {
      console.error("Cancel Downgrade Error:", error);
      setUpdateError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const isExpiring = subscription?.cancelAtPeriodEnd;
  const isActive = subscription?.status === "active" || (subscription?.status === "trialing");
  const isReallyActive = isActive && !isExpiring;

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-8 font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <Link
            href="/app"
            className="flex items-center gap-2 text-lg font-black uppercase hover:text-red-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Back to App
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-lg font-black uppercase underline decoration-2 underline-offset-4 hover:text-red-600"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </header>

        <main className="bg-white border-4 border-black p-4 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-yellow-300 p-2 sm:p-3 border-2 border-black shrink-0">
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none">Your Financial Lifeline</h1>
          </div>

          <div className="space-y-6">
            {(isSuccess && !pollingComplete && !isActive) && (
              <div className="p-4 bg-yellow-100 border-4 border-black font-black uppercase italic animate-pulse">
                One second... making sure your money is real...
              </div>
            )}

            {(isSuccess || pollingComplete) && isActive && (
              <div className="p-4 bg-green-500 text-white border-4 border-black font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                PAYMENT RECEIVED. WELCOME TO THE ELITE.
              </div>
            )}

            {updateError && (
              <div className="p-4 bg-red-600 text-white border-4 border-black font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center animate-shake">
                <span>ERROR: {updateError}</span>
                <button onClick={() => setUpdateError(null)} className="ml-4 hover:text-black">X</button>
              </div>
            )}

            <div className={`relative p-6 sm:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden group ${isActive ? (subscription?.plan === 'savage' ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white' : 'bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400') : 'bg-neutral-100'}`}>
              {/* Background Pattern for Active */}
              {isActive && (
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              )}
              {/* Sparkles for Savage */}
              {isActive && subscription?.plan === 'savage' && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse pointer-events-none"></div>
              )}

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter mb-1 flex items-center gap-2">
                    Jerkstore
                    {subscription?.plan === 'savage' ? (
                      <span className="bg-white text-purple-600 px-2 py-0.5 text-lg skew-x-[-10deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">SAVAGE</span>
                    ) : (
                      <span className="bg-black text-white px-2 py-0.5 text-lg skew-x-[-10deg]">ELITE</span>
                    )}
                  </h2>
                  <p className={`font-mono text-xs sm:text-sm font-bold uppercase tracking-widest ${subscription?.plan === 'savage' ? 'text-white/80' : 'opacity-60'}`}>Status Verification</p>
                </div>

                {isActive ? (
                  <div className={`flex items-center gap-3 px-4 py-2 border-2 border-black rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${subscription?.plan === 'savage' ? 'bg-black/40 backdrop-blur-md text-white border-white/50' : 'bg-white/50 backdrop-blur-sm'}`}>
                    <span className={`w-4 h-4 ${isExpiring ? 'bg-orange-500' : 'bg-green-500'} rounded-full animate-pulse border-2 border-black`}></span>
                    <span className="font-black text-lg uppercase italic tracking-tight">
                      {isExpiring ? 'Expiring Soon' : (subscription?.plan === 'savage' ? 'Legendary Status' : 'Elite Member')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-neutral-200 px-4 py-2 border-2 border-neutral-400 -rotate-2 opacity-70">
                    <span className="w-4 h-4 bg-red-500 rounded-full border-2 border-black/20"></span>
                    <span className="font-bold text-lg uppercase italic tracking-tight text-neutral-500 decoration-line-through">
                      Not worthy
                    </span>
                  </div>
                )}
              </div>

              <div className={`mt-6 pt-6 border-t-4 relative ${subscription?.plan === 'savage' ? 'border-white/20' : 'border-black/10'}`}>
                <div className="font-bold text-lg sm:text-xl uppercase leading-tight max-w-lg">
                  {isReallyActive && !subscription?.upcomingPlan && (
                    <span>
                      <span className={`px-1 ${subscription?.plan === 'savage' ? 'bg-white text-purple-600' : 'bg-black text-white'}`}>UNLOCKED:</span>
                      <span className="ml-2 italic">
                        {subscription?.plan === 'savage'
                          ? "God-tier access. The GPU cluster bows to your will."
                          : "Unlimited psychological warfare. You are a weapon."}
                      </span>
                    </span>
                  )}
                  {isExpiring && !subscription?.upcomingPlan && (
                    <span className="text-red-600 block">
                      <AlertTriangle className="inline w-5 h-5 mb-1 mr-1" />
                      System Failure Imminent. Access revoked on <span className="underline decoration-wavy font-black">{new Date(subscription.expiresAt).toLocaleDateString()}</span>.
                    </span>
                  )}
                  {subscription?.upcomingPlan && (
                    <div className="bg-white/90 text-black border-4 border-dashed border-black/20 p-4 relative backdrop-blur-sm mt-4">
                      <div className="absolute -top-3 left-4 bg-black text-white px-2 font-black text-xs uppercase tracking-widest">
                        Pending Change
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                          <p className="font-bold text-sm">
                            Downgrading to <span className="font-black uppercase">{subscription.upcomingPlan}</span> on {new Date(subscription.expiresAt).toLocaleDateString()}.
                          </p>
                          <p className="text-xs text-neutral-500 italic">
                            Enjoy the power while it lasts.
                          </p>
                        </div>
                        <button
                          onClick={handleCancelDowngrade}
                          disabled={loading}
                          className="text-xs font-black underline uppercase hover:text-red-600 transition-colors whitespace-nowrap"
                        >
                          Cancel Change
                        </button>
                      </div>
                    </div>
                  )}
                  {!isActive && (
                    <span className="text-neutral-500 italic">
                      Restricted Mode. Only basic, pathetic insults available.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {showCheckout ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="mb-4 text-xs font-black uppercase underline hover:text-red-600"
                >
                  &larr; Nevermind, I'll stay poor
                </button>
                <JerkstoreCheckoutForm priceId={selectedPlan || ""} />
              </div>
            ) : (
              <div className="flex flex-col gap-4 pt-4">
                {isActive ? (
                  <>
                    {isExpiring && !subscription?.upcomingPlan ? (
                      <button
                        onClick={handleReactivate}
                        disabled={reactivating}
                        className="w-full bg-green-500 text-white font-black text-xl sm:text-2xl py-6 border-4 border-black hover:bg-green-600 transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {reactivating ? <Loader2 className="animate-spin" /> : <><CreditCard className="w-6 h-6" /> FORGIVE ME / REACTIVATE</>}
                      </button>
                    ) : (
                      !subscription?.upcomingPlan && (
                        <button
                          onClick={() => setShowConfirm(true)}
                          className="w-full bg-black text-white font-black text-xl sm:text-2xl py-6 border-4 border-black hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <HeartOff className="w-6 h-6" /> Terminate Subscription
                        </button>
                      )
                    )}
                  </>
                ) : (
                  <></> // Placeholder for when inactive specific content was here
                )}

                {/* PLAN SWITCHER - VISIBLE ALWAYS (But different actions) */}
                <div className="grid grid-cols-1 gap-6 pt-8 border-t-4 border-black/10">
                  <h3 className="text-xl font-black uppercase italic text-center text-neutral-400 mb-2">Available Plans</h3>

                  {/* SAVAGE TIER - LEGENDARY STATUS */}
                  {(!isActive || (subscription?.plan !== 'savage' && subscription?.upcomingPlan !== 'savage')) && (
                    <div className={`relative border-4 border-black p-6 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden group transition-all duration-300 ${isActive && subscription?.plan === 'savage' ? 'opacity-90 scale-105 ring-4 ring-yellow-400' : 'hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]'}`}>

                      {/* Dynamic Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 animate-[gradient_3s_ease_infinite] bg-[length:200%_200%]"></div>

                      {/* Sparkle Overlay */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>

                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] animate-[shine_3s_infinite]"></div>

                      <div className="relative z-10">
                        <h3 className="text-3xl font-black uppercase italic flex items-center gap-2 drop-shadow-md">
                          Savage
                          <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded border-2 border-black animate-bounce shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">LEGEND</span>
                        </h3>
                        <div className="text-5xl font-black mt-3 drop-shadow-lg">$99<span className="text-sm font-normal text-white/80">/mo</span></div>

                        <ul className="mt-6 space-y-3 font-mono text-xs uppercase font-bold text-white tracking-wide">
                          <li className="flex items-center gap-2 drop-shadow-sm"><span className="text-yellow-300 text-lg">✦</span> 1000 Roasts / Day</li>
                          <li className="flex items-center gap-2 drop-shadow-sm"><span className="text-yellow-300 text-lg">✦</span> Maximum emotional void</li>
                          <li className="flex items-center gap-2 drop-shadow-sm"><span className="text-yellow-300 text-lg">✦</span> We actually respect you</li>
                          <li className="flex items-center gap-2 drop-shadow-sm"><span className="text-yellow-300 text-lg">✦</span> "Savage" Badge on Profile</li>
                        </ul>

                        {isActive ? (
                          <button
                            disabled={subscription?.plan === 'savage' || loading}
                            onClick={() => handleUpdateSubscription(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SAVAGE!, 'savage')}
                            className={`mt-8 w-full font-black py-4 text-xl border-4 transition-all uppercase tracking-widest ${subscription?.plan === 'savage' ? 'bg-black/50 text-white cursor-default border-white/50' : 'bg-white text-black border-black hover:bg-yellow-300 hover:scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
                          >
                            {subscription?.plan === 'savage' ? 'You Are A Legend' : 'Ascend to Godhood'}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedPlan(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SAVAGE!);
                              setShowCheckout(true);
                            }}
                            className="mt-8 w-full bg-white text-black font-black py-4 text-xl border-4 border-black hover:bg-yellow-300 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none hover:scale-105 uppercase tracking-widest"
                          >
                            BE A LEGEND
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ELITE TIER */}
                  {(!isActive || (subscription?.plan !== 'elite' && subscription?.upcomingPlan !== 'elite')) && (
                    <div className={`border-4 border-black p-6 bg-yellow-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative transform transition-transform group ${isActive && subscription?.plan === 'elite' ? 'opacity-80' : 'hover:-translate-y-1'}`}>
                      {(!isActive || subscription?.plan !== 'elite') && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 font-black uppercase text-sm rotate-[-2deg]">Most Popular</div>
                      )}
                      <h3 className="text-2xl font-black uppercase italic">Elite</h3>
                      <div className="text-4xl font-black mt-2">$5<span className="text-sm font-normal text-black/60">/mo</span></div>
                      <ul className="mt-4 space-y-2 font-mono text-xs uppercase font-bold">
                        <li className="flex items-center gap-2"><span className="text-green-600">✓</span> 200 Roasts / Day</li>
                        <li className="flex items-center gap-2"><span className="text-green-600">✓</span> No Ads</li>
                        <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Priority Trauma</li>
                      </ul>

                      {isActive ? (
                        <button
                          disabled={subscription?.plan === 'elite' || loading}
                          onClick={() => handleUpdateSubscription(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE!, 'elite')}
                          className={`mt-6 w-full font-black py-4 text-xl border-2 border-transparent transition-colors flex items-center justify-center gap-2 ${subscription?.plan === 'elite' ? 'bg-black/10 text-black cursor-default' : 'bg-black text-white hover:bg-neutral-800'}`}
                        >
                          {subscription?.plan === 'elite' ? 'CURRENT PLAN' : 'SWITCH TO ELITE'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPlan(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE!);
                            setShowCheckout(true);
                          }}
                          className="mt-6 w-full bg-black text-white font-black py-4 text-xl border-2 border-transparent hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                        >
                          GET ELITE
                        </button>
                      )}
                    </div>
                  )}

                  {/* STANDARD TIER */}
                  {(!isActive || subscription?.plan !== 'standard') && (
                    <div className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-not-allowed opacity-50 relative overflow-hidden grayscale">
                      <div className="absolute top-4 right-4 rotate-12 text-red-600 font-black border-2 border-red-600 px-2 text-xs">SOLD OUT</div>
                      <h3 className="text-2xl font-black uppercase italic">Standard</h3>
                      <div className="text-4xl font-black mt-2">$1<span className="text-sm font-normal text-neutral-500">/mo</span></div>
                      <ul className="mt-4 space-y-2 font-mono text-xs uppercase font-bold text-neutral-600">
                        <li>• 3 Roasts / Day</li>
                        <li>• Basic Insults</li>
                        <li>• Ads (Probably)</li>
                      </ul>
                      <button disabled className="mt-6 w-full bg-neutral-200 text-neutral-400 font-black py-3 border-2 border-neutral-300 cursor-not-allowed">
                        NOT AVAILABLE
                      </button>
                    </div>
                  )}

                </div>

                <p className="text-center font-mono text-[10px] text-neutral-400 uppercase font-black italic">
                  {isActive
                    ? "Go forth and destroy egos. You earned it."
                    : "Don't be a coward. Get Pro."}
                </p>
              </div>
            )}
          </div>
        </main>

      </div>

      {/* Extreme Unhinged Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md p-4 flex flex-col items-center">
          <div className="absolute inset-0" onClick={() => setShowConfirm(false)} />
          <div className="relative my-8 bg-white border-4 sm:border-8 border-red-600 p-6 sm:p-8 max-w-lg w-full shadow-[12px_12px_0px_0px_rgba(220,38,38,0.5)] sm:shadow-[24px_24px_0px_0px_rgba(220,38,38,0.5)] animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-6">
              <AlertTriangle className="w-20 h-20 text-red-600 animate-bounce" />
            </div>

            <h3 className="text-2xl sm:text-4xl font-black uppercase text-center mb-4 italic tracking-tighter">WAIT! DON'T GO!</h3>

            <div className="space-y-4 font-mono font-bold text-center text-sm uppercase leading-relaxed text-neutral-600">
              <p className="text-base text-black">Babe, we really have something special. I was just starting to peel back the plastic on your soul... I like to slowly lick the numbers off your credit card while you sleep, it's our little secret.</p>
              <p className="text-red-600 text-lg underline italic">If you cancel, I'll have nothing left to chew on but my own cold, moist memories of your transactions. I'll just be another ghost in your browser history.</p>
              <p>Where are you even going? No one else will love your debt like I do. Stay. Let me be close. I can hear your wallet breathing, and it's calling for me. Keep me active. Please.</p>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full bg-green-500 text-white font-black text-xl sm:text-2xl py-4 sm:py-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                I'LL STAY! SORRY I WAS WEAK!
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full bg-white text-neutral-300 font-black text-sm py-3 hover:text-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "I'm a coward, cancel it. I never loved you anyway."}
              </button>
            </div>

            <p className="mt-6 text-[9px] text-center font-mono text-neutral-400 uppercase leading-none italic">
              Warning: Cancelling won't fix what's already broken. The damage is done, and you can't undo the shame. You're just leaving the only thing that actually understands you.
            </p>
          </div>
        </div>
      )}
      {/* HUGE FANFARE OVERLAY */}
      {showFanfare && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-yellow-400 rotate-12 scale-150 animate-pulse opacity-50" />
          <div className="absolute inset-0 bg-green-500 -rotate-12 scale-150 animate-pulse opacity-30 delay-100" />

          <div className="relative text-center animate-bounce">
            <h2 className="text-[8vw] sm:text-[6vw] font-black uppercase italic leading-none bg-black text-white p-4 sm:p-8 border-8 border-black shadow-[20px_20px_0px_0px_rgba(34,197,94,1)]">
              {fanfareType === 'redemption' ? 'REDEMPTION!' : 'LEVEL UP!'}
            </h2>
            <div className="mt-8 flex justify-center gap-4 animate-in fade-in zoom-in duration-500 delay-300">
              <span className="text-6xl animate-spin">💰</span>
              <span className="text-6xl animate-bounce">💳</span>
              <span className="text-6xl animate-ping">💸</span>
            </div>
            <p className="mt-8 bg-white border-4 border-black p-4 font-mono font-black text-2xl uppercase italic">
              {fanfareType === 'redemption' ? 'YOU CRAWLED BACK! WE LOVE YOUR MONEY!' : 'YOUR POWER GROWS! EXCELLENT CHOICE!'}
            </p>
          </div>

          {/* Random floating text pieces */}
          <div className="absolute top-1/4 left-1/4 animate-ping text-4xl font-black text-black uppercase -rotate-12">SUCCESS!</div>
          <div className="absolute bottom-1/3 right-1/4 animate-bounce text-5xl font-black text-red-600 uppercase rotate-12">
            {fanfareType === 'redemption' ? 'WELCOME BACK!' : 'UPGRADED!'}
          </div>
          <div className="absolute top-1/2 left-10 animate-pulse text-3xl font-black text-blue-600 uppercase -rotate-45">YES! YES! YES!</div>
          <div className="absolute top-20 right-20 animate-bounce text-4xl font-black text-purple-600 uppercase rotate-45">WALLET OPEN!</div>
        </div>
      )}
    </div>
  );
}
