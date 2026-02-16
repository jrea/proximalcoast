"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRef } from "react";
import { Loader2, Zap, Copy, Check, Share2, ThumbsUp, ThumbsDown, Trophy } from "lucide-react";
// import { toBlob } from "html-to-image";
import { AccessModal } from "./access-modal";
import { Logo } from "./logo";
import { ShareCard, type ShareCardHandle } from "./share-card";
import { HeatLevelSelector } from "./heat-level-selector";
import { BUTTON_LABELS, TOPIC_LABELS, STANDARD_LANGUAGES, PREMIUM_LANGUAGES, RANDOM_TOPICS, HeatLevel, HEAT_LEVELS, LOADING_MESSAGES } from "../constants";
import { cn } from "@/lib/utils";
import { LoginButton } from "./login-button";

import { usePostHog } from 'posthog-js/react';

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
  const posthog = usePostHog();
  const [language, setLanguage] = useState("English");
  const [isEmail, setIsEmail] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [showSavageUpsell, setShowSavageUpsell] = useState(false);
  const [isBooming, setIsBooming] = useState(false);
  const [useReasoning, setUseReasoning] = useState(false);

  const isTrial = plan === "trial";
  const [heatLevel, setHeatLevel] = useState<HeatLevel>(isTrial ? HeatLevel.MILD : HeatLevel.SPICY);
  const [isRandomizing, setIsRandomizing] = useState(false);


  const handleRandomTopic = () => {
    posthog?.capture('random_topic_selected');
    setIsRandomizing(true);
    let count = 0;
    const interval = setInterval(() => {
      setInput(RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)]);
      count++;
      if (count > 10) {
        clearInterval(interval);
        setIsRandomizing(false);
      }
    }, 50);
  };

  const [guestHandle, setGuestHandle] = useState<string | null>(null);
  const [handleInput, setHandleInput] = useState("");

  useEffect(() => {
    // Check for guest handle cookie
    const match = document.cookie.match(new RegExp('(^| )x-jerkstore-handle=([^;]+)'));
    if (match) {
      setGuestHandle(match[2]);
    }
  }, []);



  const [buttonLabel, setButtonLabel] = useState(initialButtonLabel);
  const [topicLabel, setTopicLabel] = useState(initialTopicLabel);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<ShareCardHandle>(null);

  const triggerBoom = () => {
    setIsBooming(true);
    setTimeout(() => {
      setIsBooming(false);
      setShowSavageUpsell(true);
    }, 800);
  };

  const [displayText, setDisplayText] = useState("");
  const [input, setInput] = useState("");
  const [roasts, setRoasts] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasViewedAll, setHasViewedAll] = useState(true);
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(false);
  const lastPromptRef = useRef({ topic: "", isEmail: false, language: "", heatLevel: "spicy" });

  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleRate = async (content: string, weight: number) => {
    // Optimistic update
    setRatings(prev => ({ ...prev, [content]: weight }));

    try {
      await fetch("/api/rate-insult", {
        method: "POST",
        body: JSON.stringify({
          content,
          weight,
          topic: lastPromptRef.current.topic // Pass topic for better matching
        })
      });
      posthog?.capture('insult_rated', { weight, topic: lastPromptRef.current.topic });
    } catch (e) {
      console.error("Failed to rate", e);
      // Revert if failed? Nah, it's fine.
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const { object, submit, isLoading, error } = useObject({
    api: "/api/generate-insult",
    schema: z.object({
      roasts: z.array(z.string()).length(5),
    }),
    onFinish: ({ object }: { object?: { roasts?: string[] } }) => {
      if (object?.roasts) {
        setRoasts(object.roasts);
        setCurrentIndex(0);
        setHasViewedAll(false);
      }
      // Check for new handle on finish
      setTimeout(() => {
        const match = document.cookie.match(new RegExp('(^| )x-jerkstore-handle=([^;]+)'));
        if (match) {
          setGuestHandle(match[2]);
        }
      }, 1000); // Small delay to ensure cookie is set by browser
    },
  });

  useEffect(() => {
    if (object?.roasts) {
      // During streaming, show the current roast being typed or the first one
      const current = object.roasts[currentIndex] || object.roasts[0] || "";
      setDisplayText(current);
    }
  }, [object, currentIndex]);

  const [loadingMessage, setLoadingMessage] = useState("Initializing hate...");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((isLoading || isSimulatingLoading)) {
      setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      interval = setInterval(() => {
        setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading, isSimulatingLoading]);

  const onGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActive) {
      posthog?.capture('insult_generation_blocked', { plan });
      setShowAccessModal(true);
      return;
    }

    const currentPrompt = { topic: input, isEmail, language, heatLevel }; // Include heatLevel


    // Otherwise, perform real generation
    setRoasts([]);
    setCurrentIndex(0);
    setDisplayText("");
    setHasViewedAll(false);

    posthog?.capture('insult_generated', {
      topic: input,
      language,
      isEmail,
      heatLevel,
      plan
    });

    submit({
      language,
      isEmail,
      topic: input,
      heatLevel, // Pass to API
      useReasoning, // Pass reasoning flag
      username: !guestHandle ? handleInput : undefined, // Only send if we don't have one
    });

    lastPromptRef.current = currentPrompt;
    // Cycle labels
    setButtonLabel(BUTTON_LABELS[Math.floor(Math.random() * BUTTON_LABELS.length)]);
    setTopicLabel(TOPIC_LABELS[Math.floor(Math.random() * TOPIC_LABELS.length)]);
    setCopied(false);
  };



  const copyImage = async () => {
    if (!shareCardRef.current) return;
    posthog?.capture('roast_copied_image', { topic: input });
    setIsCopying(true);
    try {
      // Create an offscreen canvas for rendering
      const canvas = document.createElement("canvas");

      // Draw to the canvas
      await shareCardRef.current.drawToCanvas(canvas);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png", 1.0);
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
  // isTrial is already declared above

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
        {isSavage ? "GOD MODE" : isElite ? "ELITE" : isStandard ? "STANDARD" : "ONE PUMP CHUMP"}
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



        <form onSubmit={onGenerate} className="space-y-6 sm:space-y-8 relative z-10">

          {/* Heat Level Selector */}


          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-end">
              <label className={cn(
                "block font-black text-lg sm:text-xl uppercase tracking-tight",
                isSavage ? "text-white drop-shadow-md" : isElite ? "text-black" : (isStandard || isTrial) ? "text-neutral-500" : "text-neutral-400"
              )}>
                {topicLabel}
              </label>
              <div className="text-[10px] font-mono font-bold uppercase text-right opacity-50">
                {HEAT_LEVELS.find(h => h.value === heatLevel)?.desc}
              </div>
            </div>

            <div className="relative">
              <input
                className={cn(
                  "w-full p-4 sm:p-5 pr-12 border-4 border-black font-mono text-lg sm:text-xl focus:outline-none transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  isSavage ? "bg-white text-black placeholder:text-neutral-400 focus:ring-4 focus:ring-black" :
                    "bg-white text-black focus:ring-4 focus:ring-yellow-400"
                )}
                value={input}
                onChange={handleInputChange}
                placeholder="e.g. My boss, or a resignation email..."
              />
              <button
                type="button"
                onClick={handleRandomTopic}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl hover:scale-110 active:scale-95 transition-transform"
                title="Random Topic"
              >
                🎲
              </button>
              <HeatLevelSelector
                heatLevel={heatLevel}
                setHeatLevel={setHeatLevel}
                className="absolute -bottom-[46px] right-[2px] z-20 border-t-0"
                isTrial={isTrial}
                onLockedClick={() => setShowAccessModal(true)}
                useReasoning={useReasoning}
                setUseReasoning={setUseReasoning}
                isSavage={isSavage}
              />
            </div>
          </div>

          {!isActive && !guestHandle && (
            <div className="relative">
              <label className={cn(
                "block font-black text-xs sm:text-sm uppercase tracking-tight mb-1",
                isSavage ? "text-white" : "text-neutral-500"
              )}>
                Claim Handle (Optional)
              </label>
              <input
                className={cn(
                  "w-full p-3 border-4 border-black font-mono text-sm focus:outline-none transition-all duration-300",
                  isSavage ? "bg-white text-black" : "bg-white text-black focus:ring-2 focus:ring-yellow-400"
                )}
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="e.g. Failure_King_99 (Wrap in ' ' if spaces needed? No, standard string)"
                maxLength={20}
              />
              <div className="text-[10px] text-neutral-400 mt-1 uppercase font-bold">
                Leave blank for auto-generated shame.
              </div>
            </div>
          )}

          {guestHandle && !isActive && (
            <div className={cn(
              "text-center font-mono text-xs uppercase tracking-widest opacity-50",
              isSavage ? "text-white" : "text-neutral-500"
            )}>
              Roasting as: <span className="font-bold border-b-2 border-black/20">{guestHandle}</span>
            </div>
          )}


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
                onChange={(e) => {
                  setIsEmail(e.target.checked);
                  posthog?.capture('feature_toggled', { feature: 'max_effort', enabled: e.target.checked });
                }}
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
            type="submit"
            disabled={isLoading || isSimulatingLoading || !input.trim()}
            className={cn(
              "w-full font-black text-xl sm:text-3xl py-4 sm:py-6 border-4 border-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase relative group overflow-hidden",
              isSavage ? "bg-black text-white hover:-translate-y-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" :
                isElite ? "bg-red-600 text-white hover:bg-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" :
                  "bg-neutral-300 text-neutral-500 hover:bg-neutral-400"
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
              {(isLoading || isSimulatingLoading) ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="min-w-[200px] text-left">{isSavage ? "SUMMONING THE ABYSS..." : loadingMessage}</span>
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
            {error.message?.includes("limit reached") ? (
              <>
                <p className="font-black uppercase mb-2">Eternal limit reached. Sign up for more.</p>
                <LoginButton
                  text="SIGN UP"
                  variant="login"
                  reason="limit"
                  className="w-full sm:w-auto text-center bg-black text-white px-6 py-3 font-black text-lg not-italic shadow-[2px_2px_0px_0px_rgba(255,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                />
              </>
            ) : (
              <p>{error.message}</p>
            )}
          </div>
        )}

        {(displayText || isLoading) && (
          <div
            ref={resultRef}
            className={cn(
              "mt-8 sm:mt-10 p-4 sm:p-8 font-mono text-lg sm:text-xl leading-relaxed relative overflow-visible border-4 border-black transition-all duration-700",
              isSavage ? "bg-black/60 backdrop-blur-xl text-white border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] sm:shadow-[0_0_50px_rgba(0,0,0,0.5)]" :
                isElite ? "bg-white text-black shadow-[4px_4px_0px_0px_rgba(34,197,94,0.2)] sm:shadow-[8px_8px_0px_0px_rgba(34,197,94,0.2)]" :
                  "bg-neutral-50 text-neutral-400 border-dashed shadow-none"
            )}
          >






            <p className={cn("whitespace-pre-wrap text-sm sm:text-xl", isSavage && "drop-shadow-md")}>
              {displayText}
            </p>







            {/* Result Switcher - Tabs Style Bottom Left */}
            {roasts.length > 1 && !isSimulatingLoading && (
              <div className="flex absolute -bottom-[34px] sm:-bottom-[42px] left-0 gap-1">
                {roasts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setDisplayText(roasts[idx]);
                    }}
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-black text-xs sm:text-sm border-2 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none",
                      currentIndex === idx
                        ? (isSavage
                          ? "bg-white text-black border-white"
                          : "bg-black text-white border-black")
                        : (isSavage
                          ? "bg-neutral-900 text-white border-white/20 hover:bg-neutral-800"
                          : "bg-white text-black border-black hover:bg-neutral-100")
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Rating Icons - Inside Bottom Right */}
            {displayText && !isSimulatingLoading && (
              <div className="flex absolute bottom-3 right-3 gap-3">
                {/* Thumbs Down (-1) */}
                <button
                  disabled={ratings[displayText] !== undefined}
                  onClick={() => handleRate(displayText, -1)}
                  className={cn(
                    "transition-all duration-200 p-1 rounded-full hover:bg-black/5 active:scale-95",
                    ratings[displayText] === -1 ? "text-black opacity-100 scale-110" : "text-neutral-400 opacity-50 hover:opacity-100 hover:text-black"
                  )}
                  title="Weak sauce (-1)"
                >
                  {ratings[displayText] === -1 ? (
                    <ThumbsDown className="w-5 h-5 sm:w-6 sm:h-6 fill-black" />
                  ) : (
                    <ThumbsDown className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>

                {/* Thumbs Up (+1) */}
                <button
                  disabled={ratings[displayText] !== undefined}
                  onClick={() => handleRate(displayText, ratings[displayText] === 1 ? 0 : 1)}
                  className={cn(
                    "transition-all duration-200 p-1 rounded-full hover:bg-black/5 active:scale-95",
                    ratings[displayText] === 1 ? "text-black opacity-100 scale-110" : "text-neutral-400 opacity-50 hover:opacity-100 hover:text-black"
                  )}
                  title="Solid burn (+1)"
                >
                  {ratings[displayText] === 1 ? (
                    <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-black" />
                  ) : (
                    <ThumbsUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>

                {/* God Tier (+2) */}
                <button
                  disabled={ratings[displayText] !== undefined}
                  onClick={() => handleRate(displayText, ratings[displayText] === 2 ? 0 : 2)}
                  className={cn(
                    "transition-all duration-200 p-1 rounded-full hover:bg-yellow-500/10 active:scale-95 relative w-8 h-8 flex items-center justify-center",
                    ratings[displayText] === 2 ? "text-yellow-500 opacity-100 scale-110" : "text-neutral-400 opacity-50 hover:opacity-100 hover:text-yellow-500"
                  )}
                  title="GOD TIER (+2)"
                >
                  {ratings[displayText] === 2 ? (
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-500" />
                  ) : (
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Bar - Outside the Card */}
        {displayText && !isLoading && (
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end items-center w-full">
            {!isEmail && (
              <button
                onClick={copyImage}
                disabled={isCopying}
                className={cn(
                  "px-4 py-2 font-black text-xs uppercase transition-all duration-300 flex items-center justify-center gap-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  isSavage ? "bg-purple-600 text-white" : "bg-yellow-400 text-black",
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
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayText)} #jerkstore`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog?.capture('roast_shared_x', { topic: input })}
              className={cn(
                "px-4 py-2 font-black text-xs uppercase transition-all duration-300 flex items-center justify-center gap-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                "bg-black text-white"
              )}
            >
              Post to X <Share2 className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
