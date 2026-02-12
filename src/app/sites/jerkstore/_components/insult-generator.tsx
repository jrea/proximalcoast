"use client";

import { useCompletion } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { Loader2, Zap, Copy, Check, Share2 } from "lucide-react";
import { toBlob } from "html-to-image";
import { AccessModal } from "./access-modal";
import { Logo } from "./logo";
import { ShareCard } from "./share-card";
import { BUTTON_LABELS, TOPIC_LABELS, STANDARD_LANGUAGES, PREMIUM_LANGUAGES } from "../constants";
import { cn } from "@/lib/utils";

export function InsultGenerator({
  isActive,
  plan,
  initialButtonLabel,
  initialTopicLabel
}: {
  isActive?: boolean;
  plan: string;
  initialButtonLabel: string;
  initialTopicLabel: string;
}) {
  const [language, setLanguage] = useState("English");
  const [isEmail, setIsEmail] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showSavageUpsell, setShowSavageUpsell] = useState(false);
  const [isBooming, setIsBooming] = useState(false);
  const [buttonLabel, setButtonLabel] = useState(initialButtonLabel);
  const [topicLabel, setTopicLabel] = useState(initialTopicLabel);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const triggerBoom = () => {
    setIsBooming(true);
    setTimeout(() => {
      setIsBooming(false);
      setShowSavageUpsell(true);
    }, 800);
  };

  const [displayText, setDisplayText] = useState("");
  const { completion, input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
    api: "/api/generate-insult",
    body: {
      language,
      isEmail,
    },
    streamProtocol: "text",
    onFinish: (final) => {
      console.log("[Jerkstore] Stream finished. Final length:", final.length);
    },
    onError: (err) => {
      console.error("[Jerkstore] Stream error:", err);
    }
  });

  useEffect(() => {
    if (completion) {
      setDisplayText(completion);
    }
  }, [completion]);

  useEffect(() => {
    if (completion) {
      console.log("[Jerkstore] New roast content chunk:", completion.length);
    }
  }, [completion]);

  const onGenerate = (e: React.FormEvent) => {
    if (!isActive) {
      e.preventDefault();
      setShowAccessModal(true);
      return;
    }
    handleSubmit(e);
    // Cycle labels
    setButtonLabel(BUTTON_LABELS[Math.floor(Math.random() * BUTTON_LABELS.length)]);
    setTopicLabel(TOPIC_LABELS[Math.floor(Math.random() * TOPIC_LABELS.length)]);
    setCopied(false);
  };

  const copyImage = async () => {
    if (!shareCardRef.current) return;
    setIsCopying(true);
    try {
      // Small delay to ensure any layout changes settle
      await new Promise(resolve => setTimeout(resolve, 200));

      const blob = await toBlob(shareCardRef.current, {
        backgroundColor: "transparent", // Allow gradients to render correctly
        cacheBust: true,
        pixelRatio: 2, // High quality, better performance/compatibility
        width: 800,
        height: 1000,
        style: {
          opacity: "1",
          visibility: "visible",
          position: "relative",
          left: "0",
          top: "0",
        }
      });

      if (blob) {
        const canCopy = navigator.clipboard && typeof ClipboardItem !== "undefined";

        if (canCopy) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob,
              }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
          } catch (copyErr) {
            console.error("[Jerkstore] Clipboard write failed, falling back to download:", copyErr);
          }
        }

        // Fallback: Download the image
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `jerkstore-roast-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);

        // Show a brief "Downloaded" state if copy failed
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("[Jerkstore] Copy failed:", err);
    } finally {
      setIsCopying(false);
    }
  };

  const isSavage = plan === "savage";
  const isElite = plan === "elite";
  const isStandard = plan === "standard";
  const isTrial = plan === "trial";

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <style jsx global>{`
        @keyframes savage-float {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }
        @keyframes savage-boom {
          0% { transform: scale(1) translate(0, 0) rotate(0); }
          5% { transform: scale(0.85) translate(0, 20px) rotate(0); } /* Hammer impact */
          10% { transform: scale(1.15) translate(0, -30px) rotate(-1deg); } /* Massive rebound */
          15% { transform: scale(1.1) translate(-20px, 15px) rotate(2deg); }
          25% { transform: scale(1.05) translate(20px, -15px) rotate(-2deg); }
          35% { transform: scale(1.02) translate(-15px, 10px) rotate(1deg); }
          45% { transform: scale(1.01) translate(15px, -10px) rotate(-1deg); }
          60% { transform: scale(1) translate(-10px, 5px) rotate(0); }
          100% { transform: scale(1) translate(0, 0) rotate(0); }
        }
        @keyframes savage-flash {
          0% { background: white; opacity: 0; filter: blur(0px); }
          5% { background: white; opacity: 1; filter: blur(5px); }
          15% { background: white; opacity: 0.9; filter: blur(2px); }
          100% { background: transparent; opacity: 0; filter: blur(0px); }
        }
        @keyframes inception-distortion {
          0% { filter: contrast(1) brightness(1) saturate(1); }
          5% { filter: contrast(5) brightness(3) saturate(2); }
          15% { filter: contrast(3) brightness(2) saturate(1.5); }
          100% { filter: contrast(1) brightness(1) saturate(1); }
        }
        .booming-box {
          animation: savage-boom 0.8s cubic-bezier(.17,.67,.09,.99) both, inception-distortion 0.8s ease-out both;
        }
        .savage-gradient {
          background: linear-gradient(135deg, #9333ea, #db2777, #2563eb);
          background-size: 200% 200%;
          animation: gradient-shift 5s ease infinite;
        }
        @keyframes fluid-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .nasty-gradient {
          background: linear-gradient(135deg, #3d2b1f 0%, #5c4033 50%, #2a1d15 100%);
          background-size: 200% 200%;
          animation: fluid-shift 12s ease infinite;
          border-color: #2a1d15 !important;
        }
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
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Full screen flash effect */}
      {isBooming && (
        <div className="fixed inset-0 z-[200] pointer-events-none animate-[savage-flash_0.8s_ease-out]" />
      )}

      {showAccessModal && <AccessModal isActive={isActive} onClose={() => setShowAccessModal(false)} />}
      {showSavageUpsell && (
        <AccessModal
          tier="savage"
          isActive={isActive}
          onClose={() => setShowSavageUpsell(false)}
          onSuccess={() => window.location.assign("/app?success=true")}
        />
      )}

      {/* Tier Badge */}
      <div className={cn(
        "absolute -top-3 right-0 sm:-top-4 sm:-right-4 px-3 sm:px-6 py-1 sm:py-2 font-black uppercase text-[10px] sm:text-sm border-4 border-black z-20 transition-transform duration-500",
        isSavage && "bg-white text-purple-600 animate-[savage-float_3s_infinite] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        isElite && "bg-black text-white rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        isStandard && "bg-neutral-600 text-white rotate-0 shadow-none opacity-100",
        isTrial && "bg-neutral-200 text-neutral-500 rotate-0 shadow-none opacity-100"
      )}>
        {isSavage ? "GOD MODE" : isElite ? "ELITE" : isStandard ? "STANDARD" : "FAILURE"}
      </div>


      <div className={cn(
        "p-4 sm:p-8 border-4 transition-all duration-700 relative overflow-hidden",
        isBooming && "booming-box",
        isSavage ? "savage-gradient border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white" :
          isElite ? "bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-400 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black" :
            "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] text-neutral-400"
      )}>

        {/* Animated Background Textures for Savage */}
        {isSavage && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] animate-[savage-shimmer_3s_infinite_linear]"></div>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>
        )}
        {isElite && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-[savage-shimmer_4s_infinite_linear]"></div>
          </div>
        )}

        <Logo
          className="mb-6 sm:mb-10 relative z-10 scale-90 sm:scale-100 origin-left"
          textClassName={cn(
            "text-2xl sm:text-4xl font-black uppercase tracking-tighter italic",
            isSavage ? "text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)]" : "text-black"
          )}
        />

        <form onSubmit={onGenerate} className="space-y-6 sm:space-y-8 relative z-10">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-end">
              <label className={cn(
                "block font-black text-lg sm:text-xl uppercase tracking-tight",
                isSavage ? "text-white drop-shadow-md" : isElite ? "text-black" : (isStandard || isTrial) ? "text-neutral-500" : "text-neutral-400"
              )}>
                {topicLabel}
              </label>
              {isSavage && <span className="bg-white text-black px-2 py-0.5 text-[8px] sm:text-[10px] font-black skew-x-[-12deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">INFINITY UNLOCKED</span>}
            </div>
            <input
              className={cn(
                "w-full p-4 sm:p-5 border-4 border-black font-mono text-lg sm:text-xl focus:outline-none transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                isSavage ? "bg-white text-black placeholder:text-neutral-400 focus:ring-4 focus:ring-black" :
                  "bg-white text-black focus:ring-4 focus:ring-yellow-400"
              )}
              value={input}
              onChange={handleInputChange}
              placeholder="e.g. My boss, or a resignation email..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1 space-y-2 sm:space-y-3">
              <label className={cn(
                "block font-black text-lg sm:text-xl uppercase tracking-tight",
                isSavage ? "text-white drop-shadow-md" : isElite ? "text-black" : "text-neutral-400"
              )}>
                Language
              </label>
              <select
                className="w-full p-4 sm:p-5 border-4 border-black bg-white text-black font-mono text-lg sm:text-xl transition-all duration-300 focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-4 focus:ring-black cursor-pointer"
                value={language}
                onChange={(e) => {
                  const val = e.target.value;
                  const isPremiumLang = !STANDARD_LANGUAGES.some(l => l.value === val);
                  if (isPremiumLang && !isElite && !isSavage) {
                    triggerBoom();
                  } else {
                    setLanguage(val);
                  }
                }}
              >
                <optgroup label="Standard Languages">
                  {STANDARD_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Premium Languages (Elite/Savage)">
                  {PREMIUM_LANGUAGES.filter(lp => !STANDARD_LANGUAGES.some(ls => ls.value === lp.value)).map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label} {!isElite && !isSavage && "🔒"}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div
              onClick={() => !isSavage && triggerBoom()}
              className={cn(
                "flex-1 flex items-center gap-3 sm:gap-4 p-4 sm:p-5 border-4 transition-all duration-500 relative group overflow-hidden h-[68px] sm:h-[84px]",
                isSavage ? "bg-black/40 backdrop-blur-md border-white/20 cursor-default shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]" :
                  "bg-neutral-100 border-black cursor-pointer hover:bg-neutral-200"
              )}
            >
              <input
                type="checkbox"
                id="email-mode"
                checked={isEmail}
                disabled={!isSavage}
                onChange={(e) => setIsEmail(e.target.checked)}
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 border-4 border-black appearance-none cursor-pointer relative transition-all duration-300 shrink-0",
                  "checked:after:content-['✓'] checked:after:absolute checked:after:font-black checked:after:text-center checked:after:w-full checked:after:leading-[1.1rem] sm:checked:after:leading-[1.4rem]",
                  isSavage ? "bg-white border-white checked:after:text-purple-600" : "checked:bg-red-600",
                  "disabled:cursor-not-allowed disabled:bg-neutral-400"
                )}
              />
              <div className="flex flex-col flex-grow">
                <label
                  htmlFor={isSavage ? "email-mode" : undefined}
                  className={cn(
                    "font-black uppercase text-xs sm:text-sm select-none cursor-pointer tracking-tight",
                    isSavage ? "text-white" : "text-neutral-500"
                  )}
                >
                  Maximum effort (300+ words)
                </label>
                {isSavage && <span className="text-[8px] sm:text-[10px] font-mono text-white/70 uppercase tracking-widest mt-0.5 font-bold line-clamp-1">Max Tokens Activated</span>}
              </div>

              {!isSavage && (
                <span className="bg-red-600 text-white text-[8px] sm:text-[10px] px-2 sm:px-3 py-1 sm:py-1.5 font-black animate-pulse whitespace-nowrap border-2 border-black">
                  UPGRADE
                </span>
              )}
            </div>
          </div>

          <button
            disabled={isLoading || !input.trim()}
            className={cn(
              "w-full font-black text-xl sm:text-3xl py-4 sm:py-6 border-4 border-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase relative group overflow-hidden",
              isSavage ? "bg-black text-white hover:-translate-y-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" :
                isElite ? "bg-red-600 text-white hover:bg-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" :
                  "bg-neutral-300 text-neutral-500 hover:bg-neutral-400"
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6 sm:w-8 sm:h-8" /> {isSavage ? "SUMMONING THE ABYSS..." : "Cooking..."}
                </>
              ) : (
                <>
                  {buttonLabel} {isSavage && <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-purple-600" />}
                </>
              )}
            </span>
          </button>
        </form>

        <ShareCard
          ref={shareCardRef}
          input={input}
          displayText={displayText}
          isSavage={isSavage}
          isElite={isElite}
          isTrial={isTrial}
          isEmail={isEmail}
        />

        {error && (
          <div className="mt-8 p-4 sm:p-6 border-4 border-black bg-red-100 text-red-600 font-bold uppercase text-xs italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-between gap-4 text-center sm:text-left">
            <span>Error: {error.message || "Failed to generate roast. Try again, coward."}</span>
            {error.message?.includes("limit reached") && (
              <a href="/billing"
                className="w-full sm:w-auto text-center bg-black text-white px-6 py-3 font-black text-lg not-italic shadow-[2px_2px_0px_0px_rgba(255,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                PAY UP, CHUMP
              </a>
            )}
          </div>
        )}

        {(displayText || isLoading) && (
          <div
            ref={resultRef}
            className={cn(
              "mt-8 sm:mt-10 p-4 sm:p-8 font-mono text-lg sm:text-xl leading-relaxed relative overflow-hidden border-4 border-black transition-all duration-700",
              isSavage ? "bg-black/60 backdrop-blur-xl text-white border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] sm:shadow-[0_0_50px_rgba(0,0,0,0.5)]" :
                isElite ? "bg-white text-black shadow-[4px_4px_0px_0px_rgba(34,197,94,0.2)] sm:shadow-[8px_8px_0px_0px_rgba(34,197,94,0.2)]" :
                  "bg-neutral-50 text-neutral-400 border-dashed shadow-none"
            )}
          >
            {/* Watermark */}
            <div className={cn(
              "absolute bottom-0 right-4 text-[8px] sm:text-[10px] font-black uppercase opacity-20 pointer-events-none select-none tracking-widest flex items-center gap-1",
              isSavage ? "text-white" : "text-black"
            )}>
              <Logo className="scale-50 origin-right" iconOnly={true} />
              JERKSTORE.PROXIMALCOAST.COM
            </div>



            <p className={cn("whitespace-pre-wrap text-sm sm:text-xl", isSavage && "drop-shadow-md")}>
              {displayText}
            </p>

            {displayText && !isLoading && (
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center">
                {!isEmail && (
                  <button
                    onClick={copyImage}
                    disabled={isCopying}
                    className={cn(
                      "px-4 sm:px-6 py-2 sm:py-3 font-black text-xs sm:text-sm uppercase transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 border-4 border-black",
                      isSavage ? "bg-purple-600 text-white hover:bg-purple-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" :
                        "bg-yellow-400 text-black hover:bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                      copied ? "bg-green-500 text-white" : ""
                    )}
                  >
                    {isCopying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : copied ? (
                      <>Copied! <Check className="w-4 h-4" /></>
                    ) : (
                      <>Copy Image <Copy className="w-4 h-4" /></>
                    )}
                  </button>
                )}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "px-4 sm:px-6 py-2 sm:py-3 font-black text-xs sm:text-sm uppercase transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 border-4 border-black",
                    isSavage ? "bg-white text-black hover:bg-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-black text-white hover:bg-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  )}
                >
                  Post to X <Share2 className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
