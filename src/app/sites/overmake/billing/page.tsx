"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { OvermakeCheckoutForm } from "@overmake/_components/checkout-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PLANS, SITE_SLUG, THEMES } from "@overmake/constants";

const PLANS_LIST = [
  { ...PLANS.BUSHFIX, priceId: process.env[PLANS.BUSHFIX.priceIdEnvVar] || "price_dummy_bushfix" },
  { ...PLANS.DIYER, priceId: process.env[PLANS.DIYER.priceIdEnvVar] || "price_dummy_diyer" },
  { ...PLANS.SUCCESSION, priceId: process.env[PLANS.SUCCESSION.priceIdEnvVar] || "price_dummy_succession" },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const selectedPlanData = PLANS_LIST.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link href={`/sites/${SITE_SLUG}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Generator
        </Link>

        <header className="text-center mb-16">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Upgrade Your Toolkit</h1>
          <p className="text-xl text-neutral-500">Choose your level of incompetence.</p>
        </header>

        {selectedPlan ? (
          <div className="max-w-4xl mx-auto bg-white p-8 shadow-2xl rounded-xl relative overflow-hidden">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black"
            >
              Change Plan
            </button>
            <h2 className="text-2xl font-bold mb-8 text-center uppercase">Checkout: <span className="text-blue-600">{selectedPlanData?.name}</span></h2>
            <OvermakeCheckoutForm priceId={selectedPlanData?.priceId || ""} theme={selectedPlanData?.theme} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {PLANS_LIST.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 cursor-pointer group",
                  plan.theme === THEMES.TRASH && "bg-yellow-50 border-4 border-dashed border-red-500 rotate-1 shadow-sm hover:shadow-md",
                  plan.theme === THEMES.LUXURY && "bg-neutral-900 text-white border border-gold-500 shadow-2xl hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]",
                  plan.theme === THEMES.STANDARD && "bg-white border text-black shadow-lg hover:shadow-xl"
                )}
                onClick={() => handleSelect(plan.id)}
              >
                <h3 className={cn("text-3xl font-black uppercase mb-2",
                  plan.theme === THEMES.TRASH && "font-mono",
                  plan.theme === THEMES.LUXURY && "font-serif text-yellow-400",
                  plan.theme === THEMES.STANDARD && "font-sans"
                )}>{plan.name}</h3>

                <div className="text-4xl font-bold mb-4">{plan.price}</div>
                <p className={cn("mb-8 text-sm opacity-80", plan.theme === 'trash' ? "font-mono" : "")}>{plan.description}</p>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm font-bold">
                      <span className={cn("w-2 h-2 rounded-full",
                        plan.theme === THEMES.TRASH && "bg-red-500",
                        plan.theme === THEMES.LUXURY && "bg-yellow-400",
                        plan.theme === THEMES.STANDARD && "bg-blue-500"
                      )}></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={cn("w-full py-4 font-black uppercase tracking-widest transition-colors",
                  plan.theme === THEMES.TRASH && "bg-red-600 text-yellow-100 hover:bg-red-700 font-mono",
                  plan.theme === THEMES.LUXURY && "bg-white text-black hover:bg-yellow-100",
                  plan.theme === THEMES.STANDARD && "bg-black text-white hover:bg-neutral-800"
                )}>
                  Select
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
