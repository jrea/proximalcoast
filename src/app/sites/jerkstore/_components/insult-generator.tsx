"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import { useCallback, useState, useEffect, useId } from "react";
import { useRef } from "react";
import { Loader2, Zap, Check, Share2, ThumbsUp, ThumbsDown, Trophy, X, Dices, Image as ImageIcon, Clipboard, Lock } from "lucide-react";
// import { toBlob } from "html-to-image";
import { AccessModal } from "./access-modal";
import { ShareCard, type ShareCardHandle } from "./share-card";
import { HeatLevelSelector } from "./heat-level-selector";
import { BUTTON_LABELS, TOPIC_LABELS, STANDARD_LANGUAGES, PREMIUM_LANGUAGES, RANDOM_TOPICS, HeatLevel, HEAT_LEVELS, LOADING_MESSAGES, CREDIT_COSTS } from "../constants";
import { cn } from "@/lib/utils";
import { LoginButton } from "./login-button";
import styles from "./insult-generator.module.css";

import { useJerkstoreAnalytics } from "../_lib/analytics-client";

export function InsultGenerator({
  isActive,
  plan,
  initialButtonLabel,
  initialTopicLabel,
  isHomePage = false,
  areFeaturesLocked = false,
  credits,
  initialTopic = "",
}: {
  isActive?: boolean;
  plan: string;
  initialButtonLabel: string;
  initialTopicLabel: string;
  isHomePage?: boolean;
  areFeaturesLocked?: boolean;
  credits?: number;
  initialTopic?: string;
}) {
  const posthog = useJerkstoreAnalytics();
  const formId = useId();
  const topicRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Focus only when the field is already visible on a desktop keyboard.
    if (isHomePage && window.matchMedia("(min-width: 700px) and (pointer: fine)").matches) {
      const field = topicRef.current;
      const bounds = field?.getBoundingClientRect();
      if (bounds && bounds.top >= 0 && bounds.bottom <= window.innerHeight) {
        field?.focus({ preventScroll: true });
      }
    }
  }, [isHomePage]);
  const [language, setLanguage] = useState("English");
  const [isEmail, setIsEmail] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessModalContent, setAccessModalContent] = useState({ title: "Sign In Required", description: "You need a free account to unlock this feature. We need to know who to blame for the damage." });

  const openAccessModal = (feature: string) => {
    let title = "Sign In Required";
    let desc = "You need a free account to unlock this feature. We need to know who to blame for the damage.";

    if (feature === 'nuclear') {
      title = "WARNING: NUCLEAR OPTION";
      desc = "This is a profanity-laden master class for spewing unimaginable liquid fire-ass at your enemies. You have been warned. We can't give this away because it's illegal. Probably.";
    } else if (feature === 'language_premium') {
      title = "Speak in Tongues";
      desc = "Unlock access to premium languages and roast people in ways they won't even understand until they use Google Translate.";
    }

    setAccessModalContent({ title, description: desc });
    setShowAccessModal(true);
  };
  const [useReasoning, setUseReasoning] = useState(false);

  const isTrial = credits !== undefined ? credits < 50 : plan === "trial";
  const [heatLevel, setHeatLevel] = useState<HeatLevel>(isTrial ? HeatLevel.MILD : HeatLevel.SPICY);
  const [isRandomizing, setIsRandomizing] = useState(false);


  /* Guest handle logic removed per user request */



  const [buttonLabel, setButtonLabel] = useState(initialButtonLabel);
  const [topicLabel, setTopicLabel] = useState(initialTopicLabel);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<ShareCardHandle>(null);

  const [displayText, setDisplayText] = useState("");
  const [input, setInput] = useState(initialTopic);
  const [roasts, setRoasts] = useState<string[]>([]);
  const [generatedTopic, setGeneratedTopic] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setHasViewedAll] = useState(true);
  const [isSimulatingLoading] = useState(false);
  const lastPromptRef = useRef({ topic: "", isEmail: false, language: "", heatLevel: "spicy" });

  const handleRandomTopic = useCallback(() => {
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
  }, [posthog]);

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingError, setRatingError] = useState("");

  const handleRate = async (content: string, weight: number) => {
    const previous = ratings[content];
    setRatingError("");
    // Optimistic update
    setRatings(prev => ({ ...prev, [content]: weight }));

    try {
      const response = await fetch("/api/rate-insult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          weight,
          topic: lastPromptRef.current.topic // Pass topic for better matching
        })
      });
      if (!response.ok) throw new Error("Rating was not saved");
      posthog?.capture('insult_rated', { weight });
    } catch (e) {
      console.error("Failed to rate", e);
      setRatings(prev => { const updated = { ...prev }; if (previous === undefined) delete updated[content]; else updated[content] = previous; return updated; });
      setRatingError("Your rating was not saved. Try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const { object, submit, isLoading, error } = useObject({
    api: "/api/generate-insult",
    schema: z.object({
      roasts: z.array(z.string().trim().min(1)).min(1).max(5),
    }),
    onFinish: ({ object }: { object?: { roasts?: string[] } }) => {
      if (object?.roasts) {
        const choices = lastPromptRef.current;
        posthog?.capture('insult_generation_completed', { resultCount: object.roasts.length, language: choices.language, heatLevel: choices.heatLevel, isEmail: choices.isEmail });
        setRoasts(object.roasts);
        setDisplayText(object.roasts[0] ?? "");
        setCurrentIndex(0);
        setHasViewedAll(false);
      }
    },
    onError: error => {
      setDisplayText("");
      posthog.capture("insult_generation_failed", { category: /allowance|credits|limit/i.test(error.message) ? "allowance" : "unavailable" });
    },
  });

  useEffect(() => {
    if (object?.roasts) {
      // During streaming, show the current roast being typed or the first one
      const current = object.roasts[currentIndex] || object.roasts[0] || "";
      let active = true;
      queueMicrotask(() => {
        if (active) setDisplayText(current);
      });
      return () => {
        active = false;
      };
    }
  }, [object, currentIndex]);

  const [loadingMessage, setLoadingMessage] = useState("Initializing hate...");

  useEffect(() => {
    let initialMessageTimeout: ReturnType<typeof setTimeout> | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;
    if ((isLoading || isSimulatingLoading)) {
      initialMessageTimeout = setTimeout(() => {
        setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 0);
      interval = setInterval(() => {
        setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 2000);
    }
    return () => {
      if (initialMessageTimeout) clearTimeout(initialMessageTimeout);
      if (interval) clearInterval(interval);
    };
  }, [isLoading, isSimulatingLoading]);

  const onGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !input.trim()) return;
    if (!isActive) {
      posthog?.capture('insult_generation_blocked', { plan });
      setShowAccessModal(true);
      return;
    }

    const currentPrompt = { topic: input, isEmail, language, heatLevel }; // Include heatLevel
    setGeneratedTopic(currentPrompt.topic);


    // Otherwise, perform real generation
    setRoasts([]);
    setCurrentIndex(0);
    setDisplayText("");
    setHasViewedAll(false);

    posthog?.capture('insult_generation_started', {
      language,
      isEmail,
      heatLevel,
      plan
    });

    lastPromptRef.current = currentPrompt;
    submit({
      language,
      isEmail,
      topic: input,
      heatLevel, // Pass to API
      useReasoning, // Pass reasoning flag
    });

    // Cycle labels
    setButtonLabel(BUTTON_LABELS[Math.floor(Math.random() * BUTTON_LABELS.length)]);
    setTopicLabel(TOPIC_LABELS[Math.floor(Math.random() * TOPIC_LABELS.length)]);
    setCopied(false);
  };



  const [textCopied, setTextCopied] = useState(false);

  const copyText = async () => {
    if (!displayText) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(displayText);
        setTextCopied(true);
        setTimeout(() => setTextCopied(false), 2000);
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = displayText;
        document.body.appendChild(textArea);
        textArea.select();
        const copiedSuccessfully = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (!copiedSuccessfully) throw new Error("Clipboard copy was not completed");
        setTextCopied(true);
        setTimeout(() => setTextCopied(false), 2000);
      }
      posthog?.capture('roast_copied_text', { language, heatLevel, isEmail });
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleShare = async () => {
    if (!displayText) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Jerkstore Roast',
          text: displayText,
          url: window.location.origin,
        });
        posthog?.capture('roast_shared_native', { language, heatLevel, isEmail });
      } catch (err) {
        // Ignore abort errors
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback to copying text if web share not available
      copyText();
    }
  };

  const copyImage = async () => {
    if (!shareCardRef.current) return;
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
            posthog?.capture('roast_copied_image', { language, heatLevel, isEmail });
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
        posthog?.capture('roast_image_downloaded', { language, heatLevel, isEmail });

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("[Jerkstore] Copy failed:", err);
    } finally {
      setIsCopying(false);
    }
  };

  const [sliderValue, setSliderValue] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val === 100) {
      setIsEmail(true);
      posthog?.capture('feature_toggled', { feature: 'max_effort', enabled: true });
    } else {
      if (isEmail) {
        setIsEmail(false);
        posthog?.capture('feature_toggled', { feature: 'max_effort', enabled: false });
      }
    }
  };

  const handleSliderRelease = () => {
    if (sliderValue < 100) {
      setSliderValue(0);
    }
  };

  const isSavage = credits !== undefined ? credits >= 600 : plan === "savage";
  const isElite = credits !== undefined ? (credits >= 275 && credits < 600) : plan === "elite";
  const isStandard = credits !== undefined ? (credits >= 50 && credits < 275) : plan === "standard";
  // isTrial is already declared above

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <style jsx global>{`
        @keyframes savage-float {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
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

      {showAccessModal &&
        <AccessModal
          isActive={isActive}
          onClose={() => setShowAccessModal(false)}
          title={accessModalContent.title}
          description={accessModalContent.description}
        />
      }
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
        isHomePage && styles.card,
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



          {/* Top Controls: Language & Max Effort (50/50) */}
          <div className="flex flex-row gap-4 items-end">

            {/* Language Selector */}
            <div className="flex-1 space-y-1 relative">
              <label htmlFor={`${formId}-language`} className={cn(
                "block font-bold text-xs uppercase tracking-tight ml-1 h-4",
                isSavage ? "text-white/80 drop-shadow-md" : isElite ? "text-black/70" : "text-neutral-400"
              )}>
                Language
              </label>
              <div className="relative h-10 sm:h-12">
                <select
                  id={`${formId}-language`}
                  className={cn(
                    "w-full h-full py-2 px-3 border-2 border-black bg-white text-black font-mono text-sm transition-all duration-300 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:ring-2 focus:ring-black cursor-pointer appearance-none",
                    // Formerly locked style removed to allow standard languages
                  )}
                  value={language}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    const isPremium = PREMIUM_LANGUAGES.some(l => l.value === selectedValue) && !STANDARD_LANGUAGES.some(l => l.value === selectedValue);

                    if (areFeaturesLocked && isPremium) {
                      posthog?.capture('feature_locked', { feature: 'language_premium' });
                      openAccessModal('language_premium');
                      // Reset to English or keep current safe value if needed, but since we didn't set state, it should stay. 
                      // However, native select might visually update. React usually handles this if value prop is constant.
                      return;
                    }
                    setLanguage(selectedValue);
                  }}
                >
                  <optgroup label="Standard Languages">
                    {STANDARD_LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Premium Languages">
                    {PREMIUM_LANGUAGES.filter(lp => !STANDARD_LANGUAGES.some(ls => ls.value === lp.value)).map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label} {areFeaturesLocked ? "🔒" : ""}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            {/* Max Effort Slider */}
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-end px-1 h-4">
                <label htmlFor={`${formId}-effort`} className={cn(
                  "block font-bold text-xs uppercase tracking-tight truncate",
                  isSavage ? "text-white" : "text-neutral-500"
                )}>
                  Max Effort
                </label>
                {isEmail && (
                  <span className={cn(
                    "text-[10px] uppercase font-black tracking-widest animate-pulse ml-2",
                    isSavage ? "text-white" : "text-red-600"
                  )}>
                    ON
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "relative h-10 sm:h-12 border-2 border-black overflow-hidden select-none transition-all duration-300",
                  isSavage ? "bg-black/40 backdrop-blur-md border-white/20" : "bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  areFeaturesLocked && "opacity-50 cursor-pointer"
                )}
                onClick={() => {
                  if (areFeaturesLocked) {
                    posthog?.capture('feature_locked', { feature: 'max_effort' });
                    setShowAccessModal(true);
                  }
                }}
              >
                {/* Progress Bar background */}
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 transition-all duration-75 ease-linear",
                    isSavage ? "bg-purple-600/50" : "bg-red-600"
                  )}
                  style={{ width: `${sliderValue}%`, opacity: sliderValue > 0 ? 1 : 0 }}
                />

                {/* Text indication */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className={cn(
                    "font-black uppercase text-[10px] sm:text-xs tracking-widest transition-opacity duration-300",
                    sliderValue > 50 ? "opacity-100 text-white drop-shadow-md" : "opacity-40 text-neutral-400"
                  )}>
                    {isEmail ? "MAX EFFORT" : areFeaturesLocked ? "LOCKED" : "SLIDE ME"}
                  </span>
                </div>

                {/* Native slider input on top */}
                <input
                  type="range"
                  id={`${formId}-effort`}
                  aria-valuetext={isEmail ? "Long roast" : "Standard roast pack"}
                  min="0"
                  max="100"
                  value={isEmail ? 100 : sliderValue}
                  onChange={(e) => {
                    if (areFeaturesLocked) return; // Handled by onClick container click for better UX or just prevent change
                    handleSliderChange(e);
                  }}
                  onTouchEnd={handleSliderRelease}
                  onMouseUp={handleSliderRelease}
                  className={cn(
                    "absolute inset-0 w-full h-full opacity-0 z-20",
                    areFeaturesLocked ? "cursor-pointer" : "cursor-ew-resize"
                  )}
                  step="1"
                  disabled={areFeaturesLocked}
                />

                {/* Visual Thumb Follower */}
                <div
                  className={cn(
                    "absolute top-0 bottom-0 w-8 sm:w-10 border-r-2 border-black flex items-center justify-center transition-all duration-75 pointer-events-none z-0",
                    "bg-white text-black"
                  )}
                  style={{ left: `${sliderValue}%`, transform: `translateX(-${sliderValue}%)` }}
                >
                  {areFeaturesLocked ? <Lock className="w-3 h-3 text-neutral-400" /> : (isEmail ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />)}
                </div>
              </div>
            </div>
          </div>



          {/* Heat Level Selector */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-end">
              <label htmlFor={`${formId}-topic`} className={cn(
                "block font-black text-lg sm:text-xl uppercase tracking-tight",
                isSavage ? "text-white drop-shadow-md" : isElite ? "text-black" : (isStandard || isTrial) ? "text-neutral-500" : "text-neutral-400"
              )}>
                {topicLabel}
              </label>
              <div className="text-[10px] font-mono font-bold uppercase text-right opacity-50">
                {HEAT_LEVELS.find(h => h.value === heatLevel)?.desc}
              </div>
            </div>

            <div className="relative mb-14 sm:mb-16">
              <div className="relative w-full">
                <input
                  ref={topicRef}
                  id={`${formId}-topic`}
                  maxLength={1000}
                  className={cn(
                    "w-full p-4 sm:p-5 pr-12 text-lg sm:text-xl font-mono border-4 border-black focus:outline-none transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    isSavage ? "bg-white text-black placeholder:text-neutral-400 focus:ring-4 focus:ring-black" :
                      "bg-white text-black focus:ring-4 focus:ring-yellow-400"
                  )}
                  value={input}
                  onFocus={() => {
                    setIsInputFocused(true);
                    posthog?.capture('input_focused');
                  }}
                  onBlur={() => setIsInputFocused(false)}
                  onChange={handleInputChange}
                  placeholder="e.g. My boss, or a resignation email..."
                />

                {input && (
                  <button
                    type="button"
                    onClick={() => setInput("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                    title="Clear Input"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRandomTopic}
                  className={cn(
                    "absolute -bottom-[46px] left-0 sm:left-auto px-1 py-1 flex items-center justify-center transition-colors hover:text-neutral-800",
                    (!isInputFocused && !isRandomizing) && "animate-rotate-pulse origin-center",
                    (isRandomizing && isHomePage) && "animate-bounce text-red-600 scale-125", // Pop effect
                    isSavage ? "text-white" : "text-neutral-500"
                  )}
                  title="Random Topic"
                >
                  <Dices className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>

                {/* Heat Level Selector - Bottom Right */}
                <HeatLevelSelector
                  heatLevel={heatLevel}
                  setHeatLevel={setHeatLevel}
                  className="absolute -bottom-[38px] lg:-bottom-[46px] right-[2px] z-20 border-t-0"
                  isTrial={isTrial}
                  onLockedClick={() => openAccessModal('nuclear')}
                  useReasoning={useReasoning}
                  setUseReasoning={setUseReasoning}
                  isSavage={isSavage}
                  areFeaturesLocked={areFeaturesLocked}
                />
              </div>
            </div>
          </div>



          <button
            type="submit"
            disabled={isLoading || isSimulatingLoading || !input.trim()}
            className={cn(
              "w-full font-black text-xl sm:text-3xl py-4 sm:py-6 border-4 border-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase relative group",
              isSavage ? "bg-black text-white hover:-translate-y-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" :
                isElite ? "bg-red-600 text-white hover:bg-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" :
                  "bg-neutral-300 text-neutral-500 hover:bg-neutral-400 font-mono",
              (isHomePage && input.trim() && roasts.length === 0 && !isLoading && !isSimulatingLoading) && "animate-irresistible-pulse shadow-xl"
            )}
          >
            <span className="relative z-10 flex flex-col items-center justify-center -space-y-1">
              <span className="flex items-center gap-2 sm:gap-3">
                {(isLoading || isSimulatingLoading) ? (
                  <>
                    <Loader2 className="animate-spin w-6 h-6 sm:w-8 sm:h-8" />
                    <span className="w-full text-center sm:text-left sm:w-auto min-w-0 sm:min-w-[200px] text-xs sm:text-base truncate px-1">{isSavage ? "SUMMONING THE ABYSS..." : loadingMessage}</span>
                  </>
                ) : (
                  <>
                    {buttonLabel} {isSavage && <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-purple-600" />}
                  </>
                )}
              </span>
              {!(isLoading || isSimulatingLoading) && (
                <span className="text-[10px] sm:text-xs font-mono font-bold opacity-60 tracking-wider">
                  {isEmail ? `(${CREDIT_COSTS.LONG_ROAST} CREDITS)` : areFeaturesLocked ? "FREE ALLOWANCE · NO SIGN-UP" : "UP TO 5 RESULTS · FREE ALLOWANCE FIRST"}
                </span>
              )}
            </span>
          </button>
          {!isActive && (
            <p className="text-center text-[10px] text-neutral-400 font-mono uppercase mt-2">
              Generates a pack of 5 roast drafts
            </p>
          )}
        </form >

        <ShareCard
          ref={shareCardRef}
          className="hidden"
          input={generatedTopic || input}
          displayText={displayText}
          isSavage={isSavage}
          isElite={isElite}
          isTrial={isTrial}
          isEmail={isEmail}
        />

        {
          error && (
            <div role="alert" className="mt-8 p-4 sm:p-6 border-4 border-black bg-red-100 text-red-600 font-bold uppercase text-xs italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-between gap-4 text-center sm:text-left">
              {/allowance|credits/i.test(error.message ?? "") ? (
                <>
                  <p className="font-black uppercase mb-2">{error.message}</p>
                  <LoginButton
                    text="Sign in for credits"
                    variant="login"
                    reason="limit"
                    className="w-full sm:w-auto text-center bg-black text-white px-6 py-3 font-black text-lg not-italic shadow-[2px_2px_0px_0px_rgba(255,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  />
                </>
              ) : (
                <p>{error.message}</p>
              )}
            </div>
          )
        }

        {ratingError && <p role="alert" className="mt-4 text-red-700 font-bold">{ratingError}</p>}

        {
          !error && (displayText || isLoading) && (
            <div
              ref={resultRef}
              className={cn(
                "mt-8 sm:mt-10 p-4 sm:p-8 pb-14 sm:pb-14 font-mono text-lg sm:text-xl leading-relaxed relative overflow-visible border-4 border-black transition-all duration-700",
                  isSavage ? "bg-black/60 backdrop-blur-xl text-white border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] sm:shadow-[0_0_50px_rgba(0,0,0,0.5)]" :
                  isElite ? "bg-white text-black shadow-[4px_4px_0px_0px_rgba(34,197,94,0.2)] sm:shadow-[8px_8px_0px_0px_rgba(34,197,94,0.2)]" :
                    "bg-neutral-50 text-neutral-700 border-dashed shadow-none"
              )}
            >






              <p role="status" aria-live="polite" aria-busy={isLoading}
                className={cn("whitespace-pre-wrap break-words text-sm sm:text-xl", isSavage && "drop-shadow-md")}>
                {displayText || loadingMessage}
              </p>







              {/* Result Switcher - Tabs Style Bottom Left */}
              {roasts.length > 1 && !isSimulatingLoading && (
                <div className="flex absolute -bottom-[34px] sm:-bottom-[42px] left-0 gap-1">
                  {roasts.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Roast ${idx + 1}`}
                      aria-pressed={currentIndex === idx}
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
          )
        }

        {/* Action Bar - Outside the Card */}
        {
          displayText && !isLoading && !error && (
            <div className="mt-12 flex flex-wrap gap-3 justify-end items-center w-full">
              {/* Copy Text */}
              <button
                onClick={copyText}
                disabled={textCopied}
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 font-black flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  textCopied ? "bg-green-500 text-white" : "bg-white text-black"
                )}
                title="Copy Text"
              >
                {textCopied ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <Clipboard className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {/* Copy Image */}
              {!isEmail && (
                <button
                  onClick={copyImage}
                  disabled={isCopying}
                  className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 font-black flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    isSavage ? "bg-purple-600 text-white" : "bg-yellow-400 text-black",
                    copied ? "bg-green-500 text-white" : ""
                  )}
                  title="Copy Image"
                >
                  {isCopying ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : copied ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>
              )}

              {/* Share / Post to X */}
              <button
                onClick={handleShare}
                className={cn(
                  "px-4 py-2 h-12 sm:h-14 font-black text-xs sm:text-sm uppercase transition-all duration-300 flex items-center justify-center gap-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  "bg-black text-white"
                )}
                title="Share"
              >
                Share <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )
        }
        {roasts.length > 0 && !isLoading && <p className="mt-4 text-sm text-black font-bold"><a href="/roasts" className="underline underline-offset-4">View all your roasts</a></p>}
      </div >
    </div >
  );
}
