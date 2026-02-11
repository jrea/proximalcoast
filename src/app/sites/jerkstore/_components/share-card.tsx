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
        "p-4 pb-0 font-sans flex flex-col justify-between border-[8px] border-black overflow-hidden relative w-[450px] h-[800px]",
        "absolute top-0 left-0 -z-50 opacity-1 pointer-events-none", // Hidden but renderable for capture
        isSavage ? "bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white" :
          isElite ? "bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 text-black" :
            isTrial ? "bg-[#4b3621] text-[#a98467] border-[#2a1d15]" :
              "bg-white text-black"
      )}
    >
      {/* SVG Texture Pattern for Savage (CORS-safe) */}
      {isSavage && (
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none animate-pulse mix-blend-overlay">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      )}

      {isElite && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-100%] animate-[savage-shimmer_4s_infinite_linear]" />
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

        <div className="w-full space-y-12">
          <div className="space-y-4">
            <div className={cn(
              "p-6 border-4 border-black font-mono text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
              isSavage ? "bg-white/10 backdrop-blur-md text-white border-white/20" :
                isTrial ? "bg-[#3d2b1f] text-white/50 border-[#2a1d15]" : "bg-white text-black"
            )}>
              {input || "Unnamed Victim"}
            </div>
          </div>

          <div className="space-y-4">
            <div className={cn(
              "text-3xl font-black italic leading-tight",
              isTrial ? "font-[family-name:var(--font-comic)] text-[#a98467]" : "font-[family-name:var(--font-fraunces)]",
              isSavage && "drop-shadow-lg"
            )}>
              "{displayText || "Calculating damage..."}"
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 flex flex-col items-center text-center">
        {isSavage ? (
          <div className="relative w-full flex flex-col items-center pb-8 pt-12">
            <div className="relative flex items-center justify-center p-8">
              {/* Orbital Text */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-20 pointer-events-none overflow-visible">
                <svg className="w-full h-full animate-[spin_15s_linear_infinite] overflow-visible" viewBox="-10 -10 120 120">
                  <path id="footerCurve" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
                  <text className="fill-white text-[8px] font-black uppercase tracking-[0.4em]">
                    <textPath xlinkHref="#footerCurve">SAVAGE STATUS • VERIFIED ROAST • POWERED BY • </textPath>
                  </text>
                </svg>
              </div>

              {/* Logo Card */}
              <div className="relative z-10 bg-white p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_0_8px_rgba(255,255,255,0.2)] border-4 border-black rotate-[-3deg]">
                <Logo iconOnly={true} iconClassName="w-12 h-12 text-purple-600 fill-purple-200 stroke-[3px]" />
                <div className="absolute -bottom-3 -right-3 bg-white text-purple-600 font-black px-3 py-1 text-[10px] uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[10deg] skew-x-[-10deg]">
                  SAVAGE
                </div>
              </div>
            </div>

            <div className="text-center group mt-4">
              <div className="text-4xl font-[family-name:var(--font-bebas)] tracking-widest uppercase drop-shadow-lg mb-1">JERKSTORE</div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] opacity-40">jerkstore.proximalcoast.com</div>
            </div>
          </div>
        ) : isElite ? (
          <div className="w-full">
            <div className="bg-black text-yellow-400 p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden mb-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rotate-45 translate-x-16 -translate-y-16" />
              <div className="flex justify-between items-center relative z-10 text-left">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black tracking-[0.3em] opacity-50 uppercase mb-0.5 relative">
                    Elite Verification
                    <span className="absolute -bottom-1 -right-4 bg-black text-white px-1 py-0.5 text-[6px] skew-x-[-10deg] border border-white/20">ELITE</span>
                  </span>
                  <span className="text-2xl font-[family-name:var(--font-syne)] font-extrabold uppercase tracking-tight">JERKSTORE ROAST</span>
                </div>
                <Logo iconOnly={true} iconClassName="w-8 h-8 text-yellow-400 stroke-[3px]" />
              </div>
            </div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">
              jerkstore.proximalcoast.com
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4 bg-white/10 backdrop-blur-sm p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Logo
              iconClassName="w-10 h-10"
              textClassName="text-3xl font-[family-name:var(--font-bebas)] uppercase tracking-widest text-black"
            />
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">
              jerkstore.proximalcoast.com
            </div>
          </div>
        )}
      </footer>
    </div>
  );
});

ShareCard.displayName = "ShareCard";
