"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, ShieldAlert, X, ChevronLeft, Loader2, Zap } from "lucide-react";
import { LoginButton } from "./login-button";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import { usePostHog } from 'posthog-js/react';

export function AccessModal({
  onClose,
  isActive = false,
  onSuccess,
  title = "Sign In Required",
  description = "You need a free account to unlock this feature. We need to know who to blame for the damage."
}: {
  onClose?: () => void,
  isActive?: boolean,
  onSuccess?: () => void,
  title?: string,
  description?: string
}) {
  const posthog = usePostHog();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 italic min-h-screen">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => {
          posthog?.capture('modal_closed', { reason: 'backdrop_click' });
          onClose?.();
        }}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg border-4 sm:border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 bg-neutral-100">
        {/* Header Strip */}
        <div className="bg-black text-white p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <span className="font-black uppercase tracking-tighter text-lg sm:text-xl">
              Verification
            </span>
          </div>
          <button
            onClick={() => {
              posthog?.capture('modal_closed', { reason: 'close_button' });
              onClose?.();
            }}
            className="hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3px]" />
          </button>
        </div>

        <div className="p-8 sm:p-12 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-black uppercase mb-4 tracking-tighter leading-none">
                {title}
              </h2>
              <p className="text-sm sm:text-base font-bold font-mono text-neutral-600 max-w-sm mx-auto">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <LoginButton
                text="Create Free Account"
                className="w-full py-4 text-xl font-black uppercase bg-black text-white hover:bg-neutral-800 transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-2"
              />
              <p className="text-center text-xs font-mono font-bold text-neutral-400 uppercase">
                Already have one? <LoginButton text="Log in" className="underline hover:text-black" />
              </p>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="border-t-4 border-black p-3 text-center bg-white">
          <p className="font-mono text-[9px] font-bold text-neutral-500 uppercase">© 2026 PROXIMAL COAST LLC • NO REFUNDS FOR DAMAGED EGOS</p>
        </div>
      </div>
    </div>,
    document.body
  );
}

