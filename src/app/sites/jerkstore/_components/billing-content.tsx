"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Zap, Check, Coins } from "lucide-react";
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

interface BillingContentProps {
  creditBalance: number;
}

function CheckoutForm({ clientSecret, onCancel, onSuccess }: { clientSecret: string, onCancel: () => void, onSuccess: () => void }) {
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
    <form onSubmit={handleSubmit} className="bg-white border-4 border-black p-4 mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
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
        {loading ? <Loader2 className="animate-spin" /> : "Pay $1.00"}
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

export function BillingContent({ creditBalance }: BillingContentProps) {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(creditBalance);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (isSuccess) {
      router.refresh();
      toast.success("PAYMENT RECEIVED. TANK REFILLED.");
    }
  }, [isSuccess, router]);

  const handlePurchase = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout/credits", {
        method: "POST"
      });
      const data = await res.json();

      if (data.success) {
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

            {/* Purchase Options */}
            <div className="border-4 border-black p-6 bg-yellow-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative group hover:-translate-y-1 transition-transform">
              <div className="absolute -top-4 -right-4 bg-red-600 text-white px-4 py-1 font-black uppercase text-xs rotate-12 border-2 border-black">Best Value</div>

              <h3 className="text-2xl font-black uppercase italic mb-2">Refill Tank</h3>
              <div className="flex justify-between items-end mb-4 border-b-4 border-black pb-4">
                <div>
                  <div className="text-4xl font-black">$1.00</div>
                  <div className="font-mono font-bold text-black uppercase">50 Credits</div>
                </div>
                <Zap className="w-12 h-12 text-black" />
              </div>

              {clientSecret ? (
                <div className="bg-white border-4 border-black p-4 mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
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
                      onCancel={() => setClientSecret(null)}
                      onSuccess={() => {
                        toast.success("PAYMENT RECEIVED. TANK REFILLED.");
                        setClientSecret(null);
                        router.refresh();
                      }}
                    />
                  </Elements>
                </div>
              ) : (
                <>
                  <ul className="space-y-2 font-mono text-xs font-bold uppercase mb-6">
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4" /> Instant Delivery</li>
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4" /> Never Expire</li>
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4" /> Support the Roast</li>
                  </ul>

                  <button
                    onClick={handlePurchase}
                    disabled={checkoutLoading}
                    className="w-full py-4 border-4 border-black font-black uppercase bg-black text-white hover:bg-neutral-800 transition-colors text-xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? <Loader2 className="animate-spin" /> : "Buy Now"}
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
