"use client";

import { useState, useEffect } from "react";
import { Skull, ChevronLeft, ChevronRight, Quote, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePostHog } from 'posthog-js/react';

interface Insult {
  content: string;
  topic: string | null;
}

interface InsultCarouselProps {
  insults: Insult[];
  variant?: "default" | "dark";
  title?: string;
  subtitle?: string;
}

export function InsultCarousel({ insults, variant = "default", title, subtitle }: InsultCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const posthog = usePostHog();

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insults.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, insults.length]);

  const next = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % insults.length);
    posthog?.capture('insult_carousel_next');
  };

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + insults.length) % insults.length);
    posthog?.capture('insult_carousel_prev');
  };

  const currentInsult = insults[currentIndex];

  if (!currentInsult) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-12 relative group/container">
      {/* Decorative Elements */}
      <div className="absolute -top-6 -left-6 text-neutral-200 pointer-events-none">
        <Skull className={cn("w-24 h-24 rotate-[-15deg]", variant === "dark" ? "opacity-10 text-white" : "opacity-50")} />
      </div>
      <div className="absolute -bottom-6 -right-6 text-neutral-200 pointer-events-none">
        <Quote className={cn("w-24 h-24 rotate-[15deg]", variant === "dark" ? "opacity-10 text-white" : "opacity-50")} />
      </div>

      <div className={cn(
        "relative border-4 border-black p-8 md:p-12 overflow-hidden transition-colors",
        variant === "dark" ? "bg-black text-white border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]" : "bg-white text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      )}>

        {/* Header */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
              {title ? (
                <span dangerouslySetInnerHTML={{ __html: title }} />
              ) : (
                <>Sample the <span className="text-red-600">Minor Damage</span></>
              )}
            </h3>
            <p className={cn("font-mono text-[10px] font-bold uppercase tracking-widest mt-1", variant === "dark" ? "text-neutral-500" : "text-neutral-400")}>
              {subtitle ? subtitle : <>Safety Mode: ON • <span className="text-red-600">Rated G for Cowards</span></>}
            </p>
          </div>
          <div className={cn("hidden md:block font-mono text-xs font-bold px-2 py-1", variant === "dark" ? "bg-white text-black" : "bg-black text-white")}>
            {currentIndex + 1} / {insults.length}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[200px] flex items-center justify-center text-center relative z-10">
          <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300" key={currentIndex}>
            <div className="mb-4">
              <span className={cn(
                "border-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide",
                variant === "dark" ? "bg-neutral-900 border-neutral-800 text-neutral-400" : "bg-neutral-100 border-neutral-200 text-neutral-500"
              )}>
                Topic: {currentInsult.topic || "Everything"}
              </span>
            </div>
            <p className="text-2xl md:text-4xl font-black leading-tight italic">
              "{currentInsult.content}"
            </p>
          </div>
        </div>

        {/* Navigation & CTA */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className={cn(
                "p-3 border-4 hover:-translate-x-1 transition-all active:translate-x-0",
                variant === "dark" ? "border-white bg-black hover:bg-neutral-900 text-white" : "border-black bg-white hover:bg-neutral-100 text-black"
              )}
              aria-label="Previous Insult"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className={cn(
                "p-3 border-4 hover:translate-x-1 transition-all active:translate-x-0",
                variant === "dark" ? "border-white bg-black hover:bg-neutral-900 text-white" : "border-black bg-white hover:bg-neutral-100 text-black"
              )}
              aria-label="Next Insult"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <span className="md:hidden font-mono text-xs font-bold text-neutral-400 ml-2">
              {currentIndex + 1}/{insults.length}
            </span>
          </div>

          <Link
            href="/sign-in"
            className={cn(
              "flex items-center gap-3 px-6 py-3 font-black uppercase text-lg border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group",
              variant === "dark"
                ? "bg-white text-black border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]"
                : "bg-red-600 text-white border-black"
            )}
          >
            <Lock className="w-5 h-5 group-hover:animate-pulse" />
            <span>Feel the Burn</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
