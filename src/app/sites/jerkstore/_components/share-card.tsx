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
              isTrial ? "font-[family-name:var(--font-comic)] text-[#a98467]" : "font-[family-name:var(--font-fraunces)]"
            )}>
              {"{displayText || \"Calculating damage...\"}"}
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 flex flex-col items-center text-center">
        {isSavage ? (
          <div className="relative w-full flex flex-col items-center pb-12 pt-16">
            <div className="relative flex items-center justify-center p-12">
              {/* Orbital Text - Now static and tighter */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-20 pointer-events-none overflow-visible">
                <svg className="w-full h-full overflow-visible" viewBox="-10 -10 120 120">
                  <path id="footerCurve" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
                  <text className="fill-white text-[10px] font-black uppercase tracking-[0.4em]">
                    <textPath xlinkHref="#footerCurve">SAVAGE STATUS • VERIFIED ROAST • POWERED BY • </textPath>
                  </text>
                </svg>
              </div>

              {/* Logo Card */}
              <div className="relative z-10 bg-white p-8 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4),0_0_0_12px_rgba(255,255,255,0.2)] border-[6px] border-black rotate-[-3deg]">
                <Logo iconOnly={true} iconClassName="w-16 h-16 text-purple-600 fill-purple-200 stroke-[4px]" />
                <div className="absolute -bottom-4 -right-4 bg-white text-purple-600 font-black px-4 py-1.5 text-xs uppercase border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[10deg] skew-x-[-10deg]">
                  SAVAGE
                </div>
              </div>
            </div>

            <div className="text-center group mt-6">
              <div className="text-6xl font-[family-name:var(--font-bebas)] tracking-[0.1em] uppercase mb-1">JERKSTORE</div>
              <div className="text-xs font-mono font-bold uppercase tracking-[0.4em] opacity-40">jerkstore.proximalcoast.com</div>
            </div>
          </div>
        ) : isElite ? (
          <div className="w-full">
            <div className="bg-black text-yellow-400 p-8 border-[6px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/10 rotate-45 translate-x-24 -translate-y-24" />
              <div className="flex justify-between items-center relative z-10 text-left">
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-[0.3em] opacity-50 uppercase mb-1 relative">
                    Elite Verification
                    <span className="absolute -bottom-1 -right-6 bg-black text-white px-2 py-0.5 text-[8px] skew-x-[-10deg] border border-white/20">ELITE</span>
                  </span>
                  <span className="text-4xl font-[family-name:var(--font-syne)] font-extrabold uppercase tracking-tight">JERKSTORE ROAST</span>
                </div>
                <Logo iconOnly={true} iconClassName="w-12 h-12 text-yellow-400 stroke-[4px]" />
              </div>
            </div>
            <div className="text-xs font-mono font-bold uppercase tracking-widest opacity-40">
              jerkstore.proximalcoast.com
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6 bg-white/10 backdrop-blur-sm p-10 border-[6px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <Logo
              iconClassName="w-16 h-16"
              textClassName="text-5xl font-[family-name:var(--font-bebas)] uppercase tracking-widest text-black"
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
