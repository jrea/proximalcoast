"use client";

import { useCompletion } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { Loader2, Zap } from "lucide-react";
import { AccessModal } from "./access-modal";
import { Logo } from "./logo";
import { BUTTON_LABELS, TOPIC_LABELS } from "../constants";
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
  };

  const isSavage = plan === "savage";
  const isElite = plan === "elite";
  const isStandard = plan === "standard";
  const isTrial = plan === "trial";

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <style jsx global>{`
        @keyframes savage-shimmer {
          0% { transform: skewX(-12deg) translateX(-100%); }
          100% { transform: skewX(-12deg) translateX(200%); }
        }
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
        "absolute -top-4 -right-4 px-6 py-2 font-black uppercase text-sm border-4 border-black z-10 transition-transform duration-500",
        isSavage && "bg-white text-purple-600 animate-[savage-float_3s_infinite] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        isElite && "bg-black text-white rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        isStandard && "bg-neutral-600 text-white rotate-0 shadow-none opacity-100",
        isTrial && "bg-neutral-200 text-neutral-500 rotate-0 shadow-none opacity-100"
      )}>
        {isSavage ? "GOD MODE" : isElite ? "ELITE" : isStandard ? "STANDARD" : "FAILURE"}
      </div>


      <div className={cn(
        "p-8 border-4 transition-all duration-700 relative overflow-hidden",
        isBooming && "booming-box",
        isSavage ? "savage-gradient border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white" :
          isElite ? "bg-yellow-300 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black" :
            "bg-white border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] text-neutral-400"
      )}>

        {/* Animated Background Textures for Savage */}
        {isSavage && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] animate-[savage-shimmer_3s_infinite_linear]"></div>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>
        )}

        <Logo
          className="mb-10 relative z-10"
          textClassName={cn(
            "text-4xl font-black uppercase tracking-tighter italic",
            isSavage ? "text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)]" : "text-black"
          )}
        />

        <form onSubmit={onGenerate} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className={cn(
                "block font-black text-xl uppercase tracking-tight",
                isSavage ? "text-white drop-shadow-md" : isElite ? "text-black" : (isStandard || isTrial) ? "text-neutral-500" : "text-neutral-400"
              )}>
                {topicLabel}
              </label>
              {isSavage && <span className="bg-white text-black px-2 py-0.5 text-[10px] font-black skew-x-[-12deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">INFINITY UNLOCKED</span>}
            </div>
            <input
              className={cn(
                "w-full p-5 border-4 border-black font-mono text-xl focus:outline-none transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                isSavage ? "bg-white text-black placeholder:text-neutral-400 focus:ring-4 focus:ring-black" :
                  "bg-white text-black focus:ring-4 focus:ring-yellow-400"
              )}
              value={input}
              onChange={handleInputChange}
              placeholder="e.g. My boss, or a resignation email..."
            />
          </div>

          <div className="space-y-3">
            <label className={cn(
              "block font-black text-xl uppercase tracking-tight",
              isSavage ? "text-white drop-shadow-md" : isElite ? "text-black" : "text-neutral-400"
            )}>
              Language
            </label>
            <select
              className="w-full p-5 border-4 border-black bg-white text-black font-mono text-xl transition-all duration-300 focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:ring-4 focus:ring-black"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Chinese">Chinese (中文)</option>
            </select>
          </div>

          <div
            onClick={() => plan !== "savage" && triggerBoom()}
            className={cn(
              "flex items-center gap-4 p-5 border-4 transition-all duration-500 relative group overflow-hidden",
              isSavage ? "bg-black/40 backdrop-blur-md border-white/20 cursor-default shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]" :
                "bg-neutral-100 border-black cursor-pointer hover:bg-neutral-200"
            )}
          >
            <input
              type="checkbox"
              id="email-mode"
              checked={isEmail}
              disabled={plan !== "savage"}
              onChange={(e) => setIsEmail(e.target.checked)}
              className={cn(
                "w-8 h-8 border-4 border-black appearance-none cursor-pointer relative transition-all duration-300",
                "checked:after:content-['✓'] checked:after:absolute checked:after:font-black checked:after:text-center checked:after:w-full checked:after:leading-[1.4rem]",
                isSavage ? "bg-white border-white checked:after:text-purple-600" : "checked:bg-red-600",
                "disabled:cursor-not-allowed disabled:bg-neutral-400 disabled:pointer-events-none"
              )}
            />
            <div className="flex flex-col flex-grow">
              <label
                htmlFor={isSavage ? "email-mode" : undefined}
                className={cn(
                  "font-black uppercase text-sm select-none cursor-pointer tracking-tight",
                  isSavage ? "text-white" : "text-neutral-500"
                )}
              >
                Maximum effort (300+ words)
              </label>
              {isSavage && <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest mt-0.5 font-bold">Max Tokens Activated</span>}
            </div>

            {plan !== "savage" && (
              <span className="bg-red-600 text-white text-[10px] px-3 py-1.5 font-black animate-pulse whitespace-nowrap border-2 border-black">
                UPGRADE
              </span>
            )}
          </div>

          <button
            disabled={isLoading || !input.trim()}
            className={cn(
              "w-full font-black text-3xl py-6 border-4 border-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase relative group overflow-hidden",
              isSavage ? "bg-black text-white hover:-translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" :
                isElite ? "bg-red-600 text-white hover:bg-red-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" :
                  "bg-neutral-300 text-neutral-500 hover:bg-neutral-400"
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-8 h-8" /> {isSavage ? "SUMMONING THE ABYSS..." : "Cooking..."}
                </>
              ) : (
                <>
                  {buttonLabel} {isSavage && <Zap className="w-8 h-8 fill-purple-600" />}
                </>
              )}
            </span>
          </button>
        </form>

        {error && (
          <div className="mt-8 p-6 border-4 border-black bg-red-100 text-red-600 font-bold uppercase text-sm italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>Error: {error.message || "Failed to generate roast. Try again, coward."}</span>
            {error.message?.includes("limit reached") && (
              <a href="/billing"
                className="whitespace-nowrap bg-black text-white px-6 py-3 font-black text-lg not-italic shadow-[2px_2px_0px_0px_rgba(255,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                PAY UP, CHUMP
              </a>
            )}
          </div>
        )}

        {(displayText || isLoading) && (
          <div className={cn(
            "mt-10 p-8 font-mono text-xl leading-relaxed relative overflow-hidden border-4 border-black transition-all duration-700",
            isSavage ? "bg-black/60 backdrop-blur-xl text-white border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]" :
              isElite ? "bg-white text-black shadow-[8px_8px_0px_0px_rgba(34,197,94,0.2)]" :
                "bg-neutral-50 text-neutral-400 border-dashed"
          )}>
            <div className={cn(
              "absolute top-0 right-0 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em]",
              isSavage ? "bg-white text-purple-600" : "bg-black text-white"
            )}>
              {isSavage ? "DEIFIC VERDICT" : "Official Verdict"}
            </div>

            <h3 className={cn(
              "font-black text-2xl mb-6 border-b-4 pb-4 uppercase flex items-center gap-3",
              isSavage ? "border-white/20 text-white" : "border-black text-black"
            )}>
              {isSavage ? <Zap className="w-6 h-6 fill-white" /> : null}
              Result: {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            </h3>

            <p className={cn("whitespace-pre-wrap", isSavage && "drop-shadow-md")}>
              {displayText || (isLoading && (isSavage ? "Fracturing the victim's timeline..." : "Sharpening the knife..."))}
            </p>

            {displayText && !isLoading && (
              <div className="mt-10 flex justify-end">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "px-6 py-3 font-black text-sm uppercase transition-all duration-300 flex items-center gap-3 border-4 border-black",
                    isSavage ? "bg-white text-black hover:bg-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-black text-white hover:bg-neutral-800"
                  )}
                >
                  Share the Carnage <Zap className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
