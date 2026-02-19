"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Coins } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
import { Logo } from "./logo";
import { JerkstoreNav } from "./nav";
import { cn } from "@/lib/utils";
import { Trash2, Infinity, Heart, Flame, Car, Zap, Skull, Crown, Check } from "lucide-react";
import { CREDIT_PACKAGES as BASE_PACKAGES } from "../constants";

interface BillingContentProps {
  creditBalance: number;
}

function CheckoutForm({ clientSecret, amount, onCancel, onSuccess }: { clientSecret: string, amount: number, onCancel: () => void, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href.split('?')[0] + '?success=true',
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {errorMessage && (
        <div className="mt-4 p-2 bg-red-100 border-2 border-red-500 text-red-700 text-xs font-bold uppercase">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-6 py-3 border-4 border-black font-black uppercase bg-black text-white hover:bg-neutral-800 transition-colors text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="animate-spin" /> : `Pay $${(amount / 100).toFixed(2)}`}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="mt-4 w-full text-center text-xs font-black uppercase text-neutral-500 hover:text-black underline"
      >
        Cancel
      </button>
    </form>
  );
}

const UI_EXTENSIONS: Record<string, any> = {
  pkg_basic: {
    features: [
      { icon: Trash2, text: "50 Roasts in the Bag" },
      { icon: Infinity, text: "Never Expire" },
      { icon: Heart, text: "Pity Support Us", color: "text-red-400 fill-red-400" },
    ],
    className: "bg-[#5c4033] text-white",
    buttonClassName: "bg-black text-white hover:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
  },
  pkg_pro: {
    features: [
      { icon: Flame, text: "275 Rounds of Ammo" },
      { icon: Car, text: "$199,995 cheaper than a Lambo" },
      { icon: Zap, text: "<strong>+25 Bonus</strong> (Math is hard)", iconColor: "fill-yellow-300 text-black" },
    ],
    className: "bg-orange-400",
    buttonClassName: "bg-black text-white hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
  },
  pkg_elite: {
    features: [
      { icon: Skull, text: "600 Roasts" },
      { icon: Heart, text: "Your Mom Loves It", color: "text-red-500 fill-red-500" },
      { icon: Crown, text: "Cheaper Than Therapy", iconColor: "fill-yellow-400 text-yellow-400" },
    ],
    className: "savage-gradient text-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
    buttonClassName: "bg-white text-black hover:bg-neutral-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
  },
};

const CREDIT_PACKAGES = BASE_PACKAGES.map(pkg => ({
  ...pkg,
  ...UI_EXTENSIONS[pkg.id]
}));

export function BillingContent({ creditBalance }: BillingContentProps) {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(creditBalance);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("pkg_pro");

  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (isSuccess) {
      router.refresh();
      toast.success("PAYMENT RECEIVED. TANK REFILLED.");
    }
  }, [isSuccess, router]);

  // Sync balance with prop changes
  useEffect(() => {
    setBalance(creditBalance);
  }, [creditBalance]);

  const selectedPackage = CREDIT_PACKAGES.find(p => p.id === selectedPackageId) || CREDIT_PACKAGES[1];

  const handlePurchase = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout/credits", {
        method: "POST",
        body: JSON.stringify({ packageId: selectedPackageId }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();

      if (data.success) {
        setBalance((b) => b + (data.creditsAdded || selectedPackage.credits));
        toast.success(data.message || "PAYMENT RECEIVED. TANK REFILLED.");
        router.refresh();
      } else if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        toast.error("Failed to start checkout. Please try again.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

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
        .savage-gradient {
          background: linear-gradient(135deg, #9333ea, #db2777, #2563eb);
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fluid-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="max-w-2xl mx-auto">
        <JerkstoreNav />

        <main className="bg-white border-4 border-black p-4 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-yellow-300 p-2 sm:p-3 border-2 border-black shrink-0">
              <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none">Credit Wallet</h1>
          </div>

          <div className="space-y-6">

            {/* Balance Card */}
            <div className="p-6 sm:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-neutral-900 text-white relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse pointer-events-none"></div>

              <h2 className="text-xl font-bold uppercase tracking-widest text-neutral-400 mb-2">Current Balance</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl sm:text-8xl font-black tracking-tighter text-yellow-400 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  {balance}
                </span>
                <span className="text-xl font-black uppercase">Credits</span>
              </div>
              <p className="mt-4 font-mono text-xs text-neutral-400 uppercase">
                1 Credit = 1 Roast (after daily free limit)
              </p>
            </div>

            {/* Package Selection */}
            {!clientSecret && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CREDIT_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={cn(
                      "relative border-4 border-black p-4 transition-all text-left group hover:-translate-y-1",
                      pkg.className,
                      selectedPackageId === pkg.id
                        ? pkg.id === "pkg_pro" ? "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] scale-[1.02] z-10" : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-[1.02] z-10"
                        : ""
                    )}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black rotate-1 z-20">
                        Popular
                      </div>
                    )}
                    {pkg.id === "pkg_elite" && (
                      <div className="absolute -top-4 inset-x-0 mx-auto w-max bg-red-600 text-white px-3 py-0.5 font-black uppercase text-[10px] -rotate-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20">
                        Best Value
                      </div>
                    )}
                    <div className="font-black uppercase italic text-lg leading-none mb-1 drop-shadow-sm">{pkg.name}</div>
                    <div className="text-2xl font-black mb-1 drop-shadow-sm">${pkg.amount / 100}</div>
                    <div className="font-mono text-xs font-bold uppercase opacity-80">{pkg.credits} Credits</div>
                  </button>
                ))}
              </div>
            )}

            {/* Purchase Options */}
            <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative transition-transform">
              <h3 className="text-xl font-black uppercase italic mb-2">Checkout</h3>
              <div className="flex justify-between items-end mb-4 border-b-4 border-black pb-4">
                <div>
                  <div className="text-4xl font-black">${selectedPackage.amount / 100}.00</div>
                  <div className="font-mono font-bold text-black uppercase">{selectedPackage.credits} Credits</div>
                </div>
                <Zap className="w-12 h-12 text-black" />
              </div>

              {clientSecret ? (
                <div className="bg-white mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#000000',
                          colorBackground: '#ffffff',
                          colorText: '#000000',
                          colorDanger: '#df1b41',
                          fontFamily: 'system-ui, sans-serif',
                          spacingUnit: '4px',
                          borderRadius: '0px',
                        },
                        rules: {
                          '.Input': {
                            border: '2px solid black',
                            borderRadius: '0px',
                            boxShadow: 'none',
                          },
                          '.Label': {
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            fontSize: '12px',
                          }
                        }
                      }
                    }}
                  >
                    <CheckoutForm
                      clientSecret={clientSecret}
                      amount={selectedPackage.amount}
                      onCancel={() => setClientSecret(null)}
                      onSuccess={() => {
                        toast.success("PAYMENT RECEIVED. TANK REFILLED.");
                        setBalance((b) => b + selectedPackage.credits);
                        setClientSecret(null);
                        router.refresh();
                      }}
                    />
                  </Elements>
                </div>
              ) : (
                <>
                  <ul className="space-y-3 font-mono text-[10px] sm:text-xs font-bold uppercase mb-8 border-t-4 border-black/10 pt-6">
                    {selectedPackage.features.map((feature: any, i: number) => (
                      <li key={i} className="flex gap-2 items-center">
                        <feature.icon className={cn("w-5 h-5 shrink-0", feature.color || feature.iconColor || "text-black")} />
                        <span dangerouslySetInnerHTML={{ __html: feature.text }} />
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handlePurchase}
                    disabled={checkoutLoading}
                    className={cn(
                      "w-full py-4 border-4 border-black font-black uppercase transition-all text-xl flex items-center justify-center gap-2",
                      selectedPackage.buttonClassName
                    )}
                  >
                    {checkoutLoading ? <Loader2 className="animate-spin" /> : "Purchase Credits"}
                  </button>
                </>
              )}
            </div>

            <div className="text-center pt-8">
              <p className="font-mono text-[10px] text-neutral-400 uppercase">
                Payments processed securely by Stripe. No refunds if you get roasted too hard.
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
