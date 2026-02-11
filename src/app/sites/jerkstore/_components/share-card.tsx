"use client";

import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ShareCardProps {
  input: string;
  displayText: string;
  isSavage: boolean;
  isElite: boolean;
  isTrial: boolean;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({
  input,
  displayText,
  isSavage,
  isElite,
  isTrial
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "p-12 pb-0 font-sans flex flex-col justify-between border-[12px] border-black overflow-hidden relative w-[800px] h-[1000px]",
        "absolute top-0 left-0 -z-50 opacity-1 pointer-events-none", // Hidden but renderable for capture
        isSavage ? "bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white" :
          isElite ? "bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 text-black" :
            isTrial ? "bg-[#4b3621] text-[#a98467] border-[#2a1d15]" :
              "bg-white text-black"
      )}
    >

      {isElite && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-100%] animate-[savage-shimmer_6s_infinite_linear]" />
        </div>
      )}

      {isTrial && (
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden select-none">
          {/* Chaotic Emojis */}
          <div className="absolute inset-0 grayscale opacity-40">
            {[...Array(12)].map((_, i) => (
              <span
                key={`emoji-${i}`}
                className="absolute text-[120px] blur-[1px]"
                style={{
                  top: `${(i * 17) % 100}%`,
                  left: `${(i * 23) % 100}%`,
                  transform: `rotate(${(i * 45) % 360}deg) scale(${0.8 + (i % 3) * 0.2})`,
                }}
              >
                {i % 2 === 0 ? "💩" : "😭"}
              </span>
            ))}
          </div>
          {/* Tiled Background Text */}
          <div className="absolute inset-0 flex flex-col justify-around py-20 uppercase font-black text-[10px] tracking-[0.5em] text-white opacity-20 -rotate-12 scale-150">
            {[...Array(10)].map((_, k) => (
              <div key={`text-${k}`} className="whitespace-nowrap translate-x-[-10%]">
                I'M ONLY ON THE TRIAL • I'M ONLY ON THE TRIAL • I'M ONLY ON THE TRIAL • I'M ONLY ON THE TRIAL
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0 pointer-events-none">
            {[...Array(16)].map((_, j) => (
              <div
                key={`stink-${j}`}
                className="stink-line"
                style={{
                  left: `${(j * 8) % 100}%`,
                  animationDelay: `${j * 0.2}s`,
                  opacity: 0.5
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center">

        <div className="w-full space-y-16">
          <div className="space-y-6">
            <div className={cn(
              "p-8 border-[6px] border-black font-mono text-4xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]",
              isSavage ? "bg-white/10 backdrop-blur-md text-white border-white/20" :
                isTrial ? "bg-[#3d2b1f] text-white/50 border-[#2a1d15]" : "bg-white text-black"
            )}>
              {input || "Unnamed Victim"}
            </div>
          </div>

          <div className="space-y-6">
            <div className={cn(
              "text-5xl font-black italic leading-[1.15]",
              isTrial ? "font-[family-name:var(--font-comic)] text-[#a98467]" : "font-[family-name:var(--font-fraunces)]"
            )}>
              {displayText || "Calculating damage..."}
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 flex flex-col items-center text-center">
        {isSavage ? (
          <div className="relative w-full flex flex-col items-center pb-8 pt-10">
            <div className="relative flex items-center justify-center p-8">
              {/* Logo Card */}
              <div className="relative z-10 bg-white p-6 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_8px_rgba(255,255,255,0.2)] border-[4px] border-black rotate-[-3deg]">
                <Logo iconOnly={true} iconClassName="w-12 h-12 text-purple-600 fill-purple-200 stroke-[4px]" />
                <div className="absolute -bottom-3 -right-3 bg-white text-purple-600 font-black px-3 py-1 text-[10px] uppercase border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[10deg] skew-x-[-10deg]">
                  SAVAGE
                </div>
              </div>
            </div>

            <div className="text-center group mt-4">
              <div className="text-5xl font-[family-name:var(--font-bebas)] tracking-[0.1em] uppercase mb-1">JERKSTORE</div>
              <div className="text-xs font-mono font-bold uppercase tracking-[0.4em] opacity-40">jerkstore.proximalcoast.com</div>
            </div>
          </div>
        ) : isElite ? (
          <div className="w-full mt-auto">
            <div className="bg-black text-yellow-400 p-6 border-[6px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rotate-45 translate-x-16 -translate-y-16" />
              <div className="flex justify-between items-center relative z-10 text-left">
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-[0.3em] opacity-50 uppercase mb-1 relative">
                    Elite Verification
                    <span className="absolute -bottom-1 -right-6 bg-black text-white px-2 py-0.5 text-[8px] skew-x-[-10deg] border border-white/20">ELITE</span>
                  </span>
                  <span className="text-3xl font-[family-name:var(--font-syne)] font-extrabold uppercase tracking-tight">JERKSTORE ROAST</span>
                </div>
                <Logo iconOnly={true} iconClassName="w-10 h-10 text-yellow-400 stroke-[4px]" />
              </div>
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest opacity-40">
              jerkstore.proximalcoast.com
            </div>
          </div>
        ) : (
          <div className="w-full mt-auto flex flex-col items-center gap-4 bg-white/10 backdrop-blur-sm p-8 border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Logo
              iconClassName="w-12 h-12"
              textClassName="text-4xl font-[family-name:var(--font-bebas)] uppercase tracking-widest text-black"
            />
            <div className="text-xs font-mono font-bold uppercase tracking-widest opacity-40">
              jerkstore.proximalcoast.com
            </div>
          </div>
        )}
      </footer>
    </div>
  );
});

ShareCard.displayName = "ShareCard";
