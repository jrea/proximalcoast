"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem("jerkstore-cookie-consent");
    if (!hasSeenBanner) {
      // Small delay for dramatic effect
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem("jerkstore-cookie-consent", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm w-[calc(100%-2rem)] md:w-auto animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-yellow-300 border-4 border-black p-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
        <button
          onClick={dismiss}
          className="absolute -top-3 -right-3 bg-red-600 text-white border-2 border-black p-1 hover:bg-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-black text-white px-4 py-2 font-black uppercase text-sm tracking-wider flex items-center gap-2">
          <Cookie className="w-4 h-4" />
          <span>Mandatory Discourtesy</span>
        </div>

        <div className="p-5">
          <h4 className="font-black uppercase text-xl mb-2 leading-none">
            WE USE COOKIES.
          </h4>
          <p className="font-mono text-sm font-bold mb-4 leading-tight">
            We use cookies to keep you logged in (even if you're a guest) and to process payments via Stripe so we can take your money. We don't want your data, it's boring. We just want to ensure you can be properly insulted and billed.
          </p>

          <button
            onClick={dismiss}
            className="w-full bg-white border-4 border-black px-4 py-2 font-black uppercase text-sm hover:bg-black hover:text-white transition-all hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            I Accept My Fate
          </button>
        </div>
      </div>
    </div>
  );
}
