"use client";

import { useCompletion } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AccessModal } from "./access-modal";
import { Logo } from "./logo";
import { BUTTON_LABELS, TOPIC_LABELS } from "../constants";

export function InsultGenerator({
  isPaidBypass,
  isActive,
  initialButtonLabel,
  initialTopicLabel
}: {
  isPaidBypass?: boolean;
  isActive?: boolean;
  initialButtonLabel: string;
  initialTopicLabel: string;
}) {
  const [language, setLanguage] = useState("English");
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [buttonLabel, setButtonLabel] = useState(initialButtonLabel);
  const [topicLabel, setTopicLabel] = useState(initialTopicLabel);

  const [displayText, setDisplayText] = useState("");
  const { completion, input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
    api: "/api/generate-insult",
    body: {
      language,
      paid: isPaidBypass,
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
    if (!isActive && !isPaidBypass) {
      e.preventDefault();
      setShowAccessModal(true);
      return;
    }
    handleSubmit(e);
    // Cycle labels
    setButtonLabel(BUTTON_LABELS[Math.floor(Math.random() * BUTTON_LABELS.length)]);
    setTopicLabel(TOPIC_LABELS[Math.floor(Math.random() * TOPIC_LABELS.length)]);
  };

  return (
    <>
      {showAccessModal && <AccessModal onClose={() => setShowAccessModal(false)} />}
      <div className="w-full max-w-2xl mx-auto p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <Logo className="mb-6" textClassName="text-4xl font-black uppercase tracking-tighter italic" />

        <form onSubmit={onGenerate} className="space-y-4">
          <div>
            <label className="block font-bold text-xl mb-2 uppercase">{topicLabel}</label>
            <input
              className="w-full p-4 border-4 border-black font-mono text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400"
              value={input}
              onChange={handleInputChange}
              placeholder="e.g. My coding skills..."
            />
          </div>

          <div>
            <label className="block font-bold text-xl mb-2 uppercase">Language</label>
            <select
              className="w-full p-4 border-4 border-black font-mono text-lg bg-white focus:outline-none focus:ring-4 focus:ring-yellow-400"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Chinese">Chinese (中文)</option>
            </select>
          </div>

          <button
            disabled={isLoading}
            className="w-full bg-red-600 text-white font-black text-2xl py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 uppercase"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> Cooking...
              </span>
            ) : (
              buttonLabel
            )}
          </button>
        </form>

        {error && (
          <div className="mt-8 p-4 border-4 border-black bg-red-100 text-red-600 font-bold uppercase text-sm">
            Error: {error.message || "Failed to generate roast. Try again, coward."}
          </div>
        )}

        {(displayText || isLoading) && (
          <div className="mt-8 p-6 border-4 border-black bg-yellow-300 font-mono text-lg leading-relaxed shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-black text-white text-[10px] font-black uppercase tracking-widest">
              Official Verdict
            </div>

            <h3 className="font-black text-xl mb-4 border-b-4 border-black pb-2 uppercase flex items-center gap-2">
              Result: {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </h3>

            <p className="whitespace-pre-wrap min-h-[3em]">
              {displayText || (isLoading && "Sharpening the knife...")}
            </p>

            {displayText && !isLoading && (
              <div className="mt-6 flex justify-end">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white px-4 py-2 font-black text-xs uppercase hover:bg-neutral-800 transition-all flex items-center gap-2"
                >
                  Post to X
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
