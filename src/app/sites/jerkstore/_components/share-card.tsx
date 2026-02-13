"use client";

import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { forwardRef, useRef, useImperativeHandle } from "react";
import { drawCardToCanvas } from "../_lib/draw-card";

interface ShareCardProps {
  input: string;
  displayText: string;
  isSavage: boolean;
  isElite: boolean;
  isTrial: boolean;
  isEmail?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface ShareCardHandle {
  drawToCanvas: (canvas: HTMLCanvasElement) => Promise<void>;
}

export const ShareCard = forwardRef<ShareCardHandle, ShareCardProps>(({
  input,
  displayText,
  isSavage,
  isElite,
  isTrial,
  isEmail = false,
  className,
  style
}, ref) => {
  const divRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    drawToCanvas: async (canvas: HTMLCanvasElement) => {
      await drawCardToCanvas(canvas, {
        input,
        displayText,
        isSavage,
        isElite,
        isTrial,
        isEmail
      });
    }
  }));

  return (
    <div
      ref={divRef}
      style={style}
      className={cn(
        "font-sans flex flex-col justify-between border-[12px] border-black overflow-hidden relative w-[800px] h-[1000px]",
        "absolute top-0 left-0 -z-50 opacity-1 pointer-events-none", // Hidden but renderable for capture
        isSavage ? "bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 text-white" :
          isElite ? "bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 text-black" :
            isTrial ? "bg-[#4b3621] text-[#a98467] border-[#2a1d15]" :
              "bg-white text-black",
        className
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
        </div>
      )}

      {/* North Zone: Input Box (Less Prominent) */}
      <div className="relative z-10 w-full flex-shrink-0 flex flex-col justify-end pb-2 pt-6 px-6">
        <div className={cn(
          "inline-block self-start px-4 py-3 border-[4px] border-black font-mono text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg] transition-all",
          isSavage ? "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-white/10" :
            isTrial ? "bg-[#3d2b1f] text-white/50 border-[#2a1d15]" : "bg-white text-black"
        )}>
          <span className="opacity-50 text-[0.6em] uppercase tracking-wider mr-2">Targeting:</span>
          {input || "Unnamed Victim"}
        </div>
      </div>

      {/* Middle Zone: Roast Text (Vertically Centered & Scaled) */}
      <div className="relative z-10 flex-grow flex flex-col justify-center px-6 py-2">
        <div className={cn(
          "font-black italic leading-[0.9] break-words hyphens-auto text-balance tracking-tight",
          isEmail ? "text-sm" :
            displayText.length > 500 ? "text-4xl" :
              displayText.length > 300 ? "text-5xl" :
                displayText.length > 200 ? "text-6xl" :
                  displayText.length > 100 ? "text-7xl" :
                    displayText.length > 50 ? "text-8xl" : "text-9xl",
          isTrial ? "font-[family-name:var(--font-comic)] text-[#a98467]" : "font-[family-name:var(--font-fraunces)]",
          isSavage ? "text-white" : "text-black"
        )}>
          {displayText ? (
            displayText
          ) : (
            <span className="opacity-30">Waiting for roast...</span>
          )}
        </div>
      </div>

      {/* South Zone: Minimal Watermark */}
      <footer className="relative z-10 flex items-center justify-center p-6 mt-auto">
        <Logo
          className={cn(
            "opacity-70",
            isSavage || isTrial ? "text-white" : "text-black"
          )}
          iconClassName="w-4 h-4 text-red-600"
        />
      </footer>
    </div>
  );
});

ShareCard.displayName = "ShareCard";
