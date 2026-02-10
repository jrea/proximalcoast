"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, CreditCard, ChevronLeft, Loader2, AlertTriangle, HeartOff, Star, Zap, Gem, Banknote } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "./logo";
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
  const [fanfareTier, setFanfareTier] = useState<'elite' | 'savage' | null>(null);
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
    setUpdateError(null);
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "jerkstore" }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowConfirm(false);
        // Optimistic update
        setSubscription((prev: any) => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
        fetchSubscription(); // Still fetch for final source of truth
      } else {
        setUpdateError(data.error || "Failed to cancel subscription.");
      }
    } catch (error) {
      console.error("Cancel Error:", error);
      setUpdateError("Something went wrong while cancelling.");
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivate = async () => {
    setReactivating(true);
    setUpdateError(null);
    try {
      const response = await fetch("/api/reactivate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "jerkstore" }),
      });

      const data = await response.json();

      if (response.ok) {
        // Optimistic update
        setSubscription((prev: any) => prev ? { ...prev, cancelAtPeriodEnd: false } : null);
        setFanfareType('redemption');
        setFanfareTier(null); // Redemption is tier-agnostic or has its own style
        setShowFanfare(true);
        setTimeout(() => setShowFanfare(false), 5000);
        fetchSubscription(); // Still fetch for final source of truth
      } else {
        setUpdateError(data.error || "Failed to reactivate subscription.");
      }
    } catch (error) {
      console.error("Reactivation Error:", error);
      setUpdateError("Something went wrong while reactivating.");
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

      const data = await response.json();

      if (response.ok) {
        // Optimistic update
        setSubscription((prev: any) => ({ ...prev, plan: planName, cancelAtPeriodEnd: false }));
        // If downgrading, fetch to get the upcomingPlan
        fetchSubscription();

        setFanfareType('upgrade');
        setFanfareTier(planName === 'savage' ? 'savage' : 'elite');
        setShowFanfare(true);
        setTimeout(() => setShowFanfare(false), 5000);
      } else {
        setUpdateError(data.error || "Failed to update plan. Maybe you're too broke?");
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
    setUpdateError(null);
    try {
      const response = await fetch("/api/cancel-downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "jerkstore" }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscription((prev: any) => ({ ...prev, upcomingPlan: null }));
        fetchSubscription();
      } else {
        setUpdateError(data.error || "Failed to cancel downgrade. You're stuck with it.");
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
      <style>{`
        @keyframes stink-drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 0.4; }
          50% { transform: translateY(-40px) translateX(10px); }
          80% { opacity: 0.1; }
          100% { transform: translateY(-80px) translateX(-5px); opacity: 0; }
        }
        .stink-line {
          position: absolute;
          width: 2px;
          height: 20px;
          background: #8b4513;
          border-radius: 50%;
          filter: blur(2px);
          animation: stink-drift 3s infinite linear;
        }
        .nasty-gradient {
          background: linear-gradient(135deg, #3d2b1f 0%, #5c4033 50%, #2a1d15 100%);
          background-size: 200% 200%;
          animation: fluid-shift 12s ease infinite;
          border-color: #2a1d15 !important;
        }
        @keyframes fluid-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
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

            <div className={`relative p-6 sm:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden group ${isActive ? (subscription?.plan === 'savage' ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white' : subscription?.plan === 'trial' ? 'nasty-gradient text-yellow-200' : 'bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400') : 'bg-neutral-100'}`}>
              {isActive && subscription?.plan === 'trial' && (
                <div className="absolute inset-x-0 bottom-0 h-0 pointer-events-none">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="stink-line"
                      style={{
                        left: `${(i * 15) % 100}%`,
                        animationDelay: `${i * 0.4}s`,
                        opacity: 0.3
                      }}
                    />
                  ))}
                </div>
              )}
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
                  <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter mb-1 flex items-center gap-4">
                    <Logo iconClassName="w-6 h-6 sm:w-8 h-8" textClassName="" />
                    {subscription?.plan === 'savage' ? (
                      <span className="bg-white text-purple-600 px-2 py-0.5 text-lg skew-x-[-10deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">SAVAGE</span>
                    ) : subscription?.plan === 'elite' ? (
                      <span className="bg-black text-white px-2 py-0.5 text-lg skew-x-[-10deg]">ELITE</span>
                    ) : subscription?.plan === 'trial' ? null
                      : (
                        <span className="bg-neutral-600 text-white px-2 py-0.5 text-lg skew-x-[-10deg]">STANDARD</span>
                      )}
                  </h2>
                  <p className={`font-mono text-xs sm:text-sm font-bold uppercase tracking-widest ${subscription?.plan === 'savage' ? 'text-white/80' : 'opacity-60'}`}>Status Verification</p>
                </div>

                {isActive ? (
                  <div className={`flex items-center gap-3 px-4 py-2 border-2 border-black rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${subscription?.plan === 'savage' ? 'bg-black/40 backdrop-blur-md text-white border-white/50' : subscription?.plan === 'trial' ? 'bg-[#51361a]/40 text-[#8b4513] border-[#51361a]' : 'bg-white/50 backdrop-blur-sm'}`}>
                    <span className={`w-4 h-4 ${isExpiring ? 'bg-orange-500' : 'bg-green-500'} rounded-full animate-pulse border-2 border-black`}></span>
                    <span className="font-black text-lg uppercase italic tracking-tight whitespace-nowrap">
                      {isExpiring ? 'Expiring Soon' : (
                        subscription?.plan === 'savage' ? 'Legendary Status' :
                          subscription?.plan === 'standard' ? 'Standard Status' :
                            subscription?.plan === 'trial' ? 'Poopy Trial' : 'Elite Member'
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-neutral-200 px-4 py-2 border-2 border-neutral-400 -rotate-2 opacity-70">
                    <span className="w-4 h-4 bg-red-500 rounded-full border-2 border-black/20"></span>
                    <span className="font-bold text-lg uppercase italic tracking-tight text-neutral-500 decoration-line-through whitespace-nowrap">
                      Not worthy
                    </span>
                  </div>
                )}
              </div>

              <div className={`mt-6 pt-6 border-t-4 relative ${subscription?.plan === 'savage' ? 'border-white/20' : 'border-black/10'}`}>
                <div className="font-bold text-lg sm:text-xl uppercase leading-tight max-w-lg">
                  {isReallyActive && !subscription?.upcomingPlan && (
                    <span>
                      <span className={`px-1 ${subscription?.plan === 'savage' ? 'bg-white text-purple-600' : subscription?.plan === 'trial' ? 'bg-[#51361a] text-[#8b4513]' : 'bg-black text-white'}`}>UNLOCKED:</span>
                      <span className="ml-2 italic">
                        {subscription?.plan === 'savage'
                          ? "God-tier access. Peasants will bow to your will."
                          : subscription?.plan === 'trial'
                            ? "Bare minimum access. We're embarrassed for you."
                            : "Unlimited psychological warfare. You are a weapon."}
                      </span>
                    </span>
                  )}
                  {isExpiring && !subscription?.upcomingPlan && (
                    <div className="mt-4 p-4 bg-neutral-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                      <p className="font-black uppercase text-red-600 flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-6 h-6 animate-pulse" /> SEPARATION ANXIETY DETECTED
                      </p>
                      <p className="text-sm font-bold italic">
                        "I can feel myself fading... You're leaving on <span className="underline decoration-wavy">{new Date(subscription.expiresAt).toLocaleDateString()}</span>. Was I not good enough?"
                      </p>
                    </div>
                  )}
                  {subscription?.upcomingPlan && (
                    <div className="bg-white/90 text-black border-4 border-dashed border-black/20 p-4 relative backdrop-blur-sm mt-4">
                      <div className="absolute -top-3 left-4 bg-black text-white px-2 font-black text-xs uppercase tracking-widest">
                        Pending Change
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                          {subscription?.plan === 'savage' ? (
                            <>
                              {subscription.upcomingPlan === 'elite'
                                ? (
                                  <p className="font-bold text-sm uppercase">
                                    You are stepping down to <span className="font-black">Elite</span> on {new Date(subscription.expiresAt).toLocaleDateString()}. <span className="text-red-600 font-black animate-pulse">God status revoked.</span>
                                  </p>
                                )
                                : (
                                  <>
                                    <p className="font-bold text-sm">
                                      Downgrading to <span className="font-black uppercase">{subscription.upcomingPlan}</span> on {new Date(subscription.expiresAt).toLocaleDateString()}.
                                    </p>
                                    <p className="text-xs text-red-600 font-black italic uppercase animate-pulse">
                                      WARNING: YOU CHOSE DELETION. YOUR GOD STATUS DIES ON THIS DAY.
                                    </p>
                                  </>
                                )
                              }
                            </>
                          ) : (
                            <>
                              <p className="font-bold text-sm">
                                Downgrading to <span className="font-black uppercase">{subscription.upcomingPlan}</span> on {new Date(subscription.expiresAt).toLocaleDateString()}.
                              </p>
                              <p className="text-xs text-neutral-500 italic">
                                Enjoy the power while it lasts.
                              </p>
                            </>
                          )}
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
                    <span className="text-neutral-500 italic pt-4">
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
                        className="w-full bg-green-500 text-white font-black text-xl sm:text-2xl 5 p-6 border-4 border-black hover:bg-green-600 transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {reactivating ? <Loader2 className="animate-spin" /> : <div className="flex flex-row flex-start gap-4"><CreditCard size={40} /> <span className="text-left">TAKE ME BACK, I'VE MADE A TERRIBLE MISTAKE </span></div>}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowConfirm(true)}
                        className="w-full bg-black text-white font-black text-xl sm:text-2xl py-6 border-4 border-black hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <HeartOff className="w-6 h-6" /> Terminate Subscription
                      </button>
                    )}
                  </>
                ) : (
                  <></> // Placeholder for when inactive specific content was here
                )}
                <p className="text-center font-mono text-[10px] text-neutral-400 uppercase font-black italic">
                  {subscription.plan === 'elite' || subscription.plan === 'savage'
                    ? "Go forth and destroy egos. You earned it."
                    : ""}
                </p>

                {/* PLAN SWITCHER - VISIBLE ALWAYS (But different actions) */}
                <div className="grid grid-cols-1 gap-6 pt-8 border-t-4 border-black/10">

                  <h3 className="text-xl font-black uppercase italic text-center text-neutral-400 mb-2">Available Plans</h3>
                  <p className="text-center font-mono text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                    Upgrades are charged immediately (prorated difference). Full price kicks in on your next bill. No refunds for cowardice.
                  </p>

                  {/* SAVAGE TIER - LEGENDARY STATUS */}
                  {/* SAVAGE TIER - LEGENDARY STATUS - REDESIGNED */}
                  {(!isActive || (subscription?.plan !== 'savage' && subscription?.upcomingPlan !== 'savage')) && (
                    <div className="relative border-4 border-black p-1 sm:p-2 bg-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden group transition-all duration-300 hover:scale-[1.01] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] ring-1 ring-white/20">

                      {/* Vibrant Gradient Background (Matches Active State) */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600"></div>
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay animate-pulse"></div>

                      {/* Moving Sheen/Spotlight */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite_linear]"></div>

                      <div className="relative z-10 flex flex-col h-full p-6 sm:p-8 h-full">

                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-8 relative">
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                              {/* White Text with Sharp Black Shadow for Contrast */}
                              <h3 className="text-5xl sm:text-6xl font-black italic tracking-tighter text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)] pr-5 leading-none">
                                SAVAGE
                              </h3>
                              <span className="hidden sm:inline-block bg-black text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest border-2 border-white transform skew-x-[-12deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] animate-bounce">
                                Unbelievable Ripoff!
                              </span>
                            </div>
                            <p className="font-mono text-xs text-white uppercase tracking-[0.3em] font-bold pl-1 flex items-center gap-2 drop-shadow-md">
                              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                              The Ultimate Flex
                              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                            </p>
                          </div>

                          {/* Decorative Star/Icon */}
                          <div className="hidden sm:block absolute -top-4 -right-4">
                            <Star className="w-24 h-24 text-white/20 rotate-12 fill-white/20" />
                            <Star className="w-24 h-24 text-white/10 absolute inset-0 animate-ping duration-[3000ms]" />
                          </div>
                        </div>

                        {/* Price Section */}
                        <div className="mb-10 pl-6 flex flex-col justify-center relative">

                          <div className="flex items-baseline gap-2">
                            <span className="text-7xl font-black text-white tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">$99</span>
                            <span className="text-xl text-white font-bold uppercase drop-shadow-sm">/ mo</span>
                          </div>
                          <p className="text-xs text-white/90 font-mono mt-1 uppercase tracking-wide font-bold drop-shadow-sm">Small price for godhood.</p>
                        </div>

                        {/* Features Grid */}
                        <div className="space-y-4 mb-10 flex-grow">
                          {[
                            { text: "1000 Roasts / Day", sub: "Phenomenal Cosmic Power" },
                            { text: "Status Symbol", sub: "It's Purplink" },
                            { text: "Priority Queue", sub: "This does nothing", fake: true },
                            { text: "Mad Respect", sub: "We Pretend To Care", fake: true },
                            { text: "Secret Features", sub: "Coming Soon™", fake: true }
                          ].map((feature, i) => (
                            <div key={i} className="group/item flex items-center gap-4 p-3 bg-black/20 border border-white/20 hover:bg-black/40 hover:border-white transition-all duration-300 hover:translate-x-1 backdrop-blur-sm">
                              <div className="w-10 h-10 shrink-0 bg-white text-purple-600 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover/item:text-black group-hover/item:bg-white transition-colors">
                                <Zap className="w-5 h-5 fill-current" />
                              </div>
                              <div>
                                <div className="text-white font-black uppercase text-sm leading-none drop-shadow-sm">{feature.text}</div>
                                <div className="text-[10px] text-white/80 font-mono uppercase mt-1 group-hover/item:text-white group-hover/item:opacity-100">{feature.sub}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action Button */}
                        <button
                          disabled={loading}
                          onClick={() => {
                            if (isActive) {
                              handleUpdateSubscription(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SAVAGE!, 'savage');
                            } else {
                              setSelectedPlan(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SAVAGE!);
                              setShowCheckout(true);
                            }
                          }}
                          className="w-full relative group/btn overflow-hidden bg-black text-white font-black py-6 text-2xl border-4 border-white/50 transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] uppercase tracking-widest active:translate-y-0 active:shadow-none"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:animate-[shimmer_1s_infinite]"></div>
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {isActive ? "Upgrade & Ascend" : "Ascend Now"} <Zap className="w-6 h-6 fill-white group-hover/btn:animate-ping" />
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ELITE TIER */}
                  {(!isActive || (subscription?.plan !== 'elite' && subscription?.upcomingPlan !== 'elite')) && (
                    <div className={`border-4 border-black p-6 bg-yellow-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative transform transition-transform group ${isActive && subscription?.plan === 'elite' ? 'opacity-80' : 'hover:-translate-y-1'}`}>
                      {(!isActive || subscription?.plan !== 'elite') && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 font-black uppercase text-sm rotate-[-2deg] whitespace-nowrap">Most Popular</div>
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
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin w-5 h-5" /> PROCESSING...
                            </>
                          ) : subscription?.plan === 'elite'
                            ? 'CURRENT PLAN'
                            : (subscription?.plan === 'savage' ? 'DOWNGRADE TO ELITE (SAD)' : 'SWITCH TO ELITE')}
                        </button>
                      ) : (
                        <button
                          disabled={loading}
                          onClick={() => {
                            setSelectedPlan(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE!);
                            setShowCheckout(true);
                          }}
                          className="mt-6 w-full bg-black text-white font-black py-4 text-xl border-2 border-transparent hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "GET ELITE"}
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

                  {/* TRIAL TIER - THE POOPY ONE */}
                  {(!isActive || subscription?.plan !== 'trial') && (
                    <div className="border-4 border-black p-6 nasty-gradient text-[#8b7d13] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:rotate-1 transition-all cursor-pointer relative overflow-hidden border-dotted">
                      <div className="absolute inset-x-0 bottom-0 h-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="stink-line"
                            style={{
                              left: `${(i * 20) % 100}%`,
                              animationDelay: `${i * 0.7}s`,
                              opacity: 0.2
                            }}
                          />
                        ))}
                      </div>
                      <div className="absolute top-2 right-1 rotate-12 bg-yellow-900 text-yellow-100 px-2 text-[8px] font-mono uppercase">Lame</div>
                      <h3 className="text-xl font-bold uppercase font-mono italic flex items-center gap-2">
                        Trial (Failure) 💩
                      </h3>
                      <div className="text-3xl font-black mt-2">$0<span className="text-sm font-normal opacity-50">/evr</span></div>
                      <ul className="mt-4 space-y-1 font-mono text-[10px] uppercase font-bold text-[#8b7d13] opacity-80">
                        <li>• Only 3 Burns. Ever.</li>
                        <li>• Basic Verification Only</li>
                        <li>• No Pride remaining</li>
                      </ul>
                      <button
                        disabled={loading}
                        onClick={() => {
                          setSelectedPlan(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_FREE!);
                          setShowCheckout(true);
                        }}
                        className="mt-6 w-full bg-[#1a120d] text-[#8b7d13] font-bold py-2 border-2 border-[#8b4513] hover:bg-[#322319] transition-colors uppercase text-xs"
                      >
                        {loading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : "Accept Failure"}
                      </button>
                    </div>
                  )}

                </div>


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
      {/* HUGE FANFARE OVERLAY */}
      {showFanfare && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden pointer-events-none">
          {/* Backgrounds based on Tier/Type */}
          {fanfareType === 'redemption' && (
            <div className="absolute inset-0 bg-green-500/90 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#000_20px,#000_40px)] opacity-10"></div>
            </div>
          )}
          {fanfareType === 'upgrade' && fanfareTier === 'elite' && (
            <div className="absolute inset-0 bg-yellow-400/95 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>
            </div>
          )}
          {fanfareType === 'upgrade' && fanfareTier === 'savage' && (
            <div className="absolute inset-0 bg-purple-900/95 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 via-pink-600/50 to-blue-600/50 animate-spin-slow"></div>
            </div>
          )}

          <div className="relative text-center z-10 animate-in zoom-in-50 slide-in-from-bottom-10 duration-500 ease-out">
            {/* Main Title Badge */}
            <div className={`
              inline-block p-8 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]
              ${fanfareTier === 'savage' ? 'bg-black text-purple-400' : 'bg-white text-black'}
              ${fanfareType === 'redemption' ? 'bg-green-400 text-black' : ''}
            `}>
              <h2 className="text-[6vw] sm:text-[5vw] font-black uppercase italic leading-none tracking-tighter">
                {fanfareType === 'redemption' && 'REDEMPTION!'}
                {fanfareType === 'upgrade' && fanfareTier === 'elite' && 'ELITE STATUS!'}
                {fanfareType === 'upgrade' && fanfareTier === 'savage' && (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-pulse">
                    GOD MODE!
                  </span>
                )}
              </h2>
            </div>

            {/* Subtext */}
            <div className="mt-8 flex justify-center">
              <p className={`
                text-2xl sm:text-3xl font-mono font-bold uppercase p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                ${fanfareTier === 'savage' ? 'bg-purple-600 text-white' : 'bg-white text-black'}
              `}>
                {fanfareType === 'redemption' && "WE KNEW YOU'D CRAWL BACK."}
                {fanfareType === 'upgrade' && fanfareTier === 'elite' && "WELCOME TO THE 1%."}
                {fanfareType === 'upgrade' && fanfareTier === 'savage' && "REALITY IS NOW YOUR TOY."}
              </p>
            </div>

            {/* Icons Animation */}
            <div className="mt-12 flex justify-center gap-8">
              {fanfareType === 'redemption' && (
                <>
                  <HeartOff className="w-16 h-16 sm:w-24 sm:h-24 animate-bounce text-black" />
                  <CreditCard className="w-16 h-16 sm:w-24 sm:h-24 animate-pulse text-black" />
                </>
              )}
              {fanfareType === 'upgrade' && fanfareTier === 'elite' && (
                <>
                  <Banknote className="w-16 h-16 sm:w-24 sm:h-24 text-green-700 animate-bounce" />
                  <Gem className="w-16 h-16 sm:w-24 sm:h-24 text-blue-600 animate-pulse" />
                  <Banknote className="w-16 h-16 sm:w-24 sm:h-24 text-green-700 animate-bounce delay-100" />
                </>
              )}
              {fanfareType === 'upgrade' && fanfareTier === 'savage' && (
                <>
                  <Zap className="w-16 h-16 sm:w-24 sm:h-24 text-purple-400 animate-ping" />
                  <Star className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-400 animate-spin-slow" />
                  <Zap className="w-16 h-16 sm:w-24 sm:h-24 text-purple-400 animate-ping delay-100" />
                </>
              )}
            </div>
          </div>

          {/* Confetti / Particle Effects Overlay - Simple CSS implementation */}
          {fanfareType === 'upgrade' && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Just some floating elements for chaos */}
              <div className="absolute top-10 left-10 text-4xl animate-bounce delay-100">✨</div>
              <div className="absolute bottom-20 right-20 text-4xl animate-bounce delay-300">✨</div>
              <div className="absolute top-1/2 left-20 text-4xl animate-ping delay-500">💸</div>
              <div className="absolute top-20 right-1/3 text-4xl animate-pulse delay-200">🚀</div>
            </div>
          )}
        </div>
      )}
      <footer className="mt-12 text-center font-mono text-[10px] text-neutral-400 uppercase tracking-widest flex flex-col gap-2 relative z-10">
        <a
          href="https://x.com/jerkstore_app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-black transition-colors underline decoration-dotted underline-offset-4"
        >
          Contact: @jerkstore_app
        </a>
      </footer>
    </div>
  );
}
