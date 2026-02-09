"use client";

import { useCompletion } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { Loader2, Flame } from "lucide-react";
import { AccessModal } from "./access-modal";

const BUTTON_LABELS = [
  "Roast it, Broseph",
  "Destroy Me, No Cap",
  "Circle Back to My Failures",
  "Leverage My Insecurities",
  "SKIBIDI TOILET (REVERSE)",
  "Touch Grass, Then Roast",
  "Ratio This Man",
  "Financial Ruin Awaits",
  "Psychic Attack: INITIATE",
  "Negative Aura Detection",
  "Skill Issue Verified",
  "Slay Me (Legally)",
  "Main Character Syndrome",
  "Fanum Tax My Self-Esteem",
  "Gaslight Me, King",
  "Cancel Me Harder",
  "NPC Energy Detected",
  "I'm the Problem, It's Me",
  "Corporate Synergy: PAIN",
  "End My Career",
  "Humiliate Me for $5",
  "Nepo Baby Verification",
  "It's Giving Mid",
  "Caught in 8K (HDR)",
  "Rent Free in My Head",
  "Mewing Until Roasted",
  "Boomer Cringe Alert",
  "Toxic Trait Checker",
  "Unsubscribe from Sanity",
  "Harder, AI Daddy"
];

const TOPIC_LABELS = [
  "Topic to Roast",
  "Target for Elimination",
  "Victim Name",
  "Subject of Failure",
  "Who's Catching These Hands?",
  "Identity to Deconstruct",
  "Ego to Deflate",
  "Your Mid Friend's Name",
  "Corporate Entity to Slander",
  "Self-Sabotage Subject",
  "Roast Recipient",
  "Future Therapist's Notes",
  "Entry for the Burn Book",
  "Negative Aura Source",
  "Skill Issue Candidate",
  "NPC Designated for Roasting",
  "Chief Failure Officer",
  "Main Character to Cancel",
  "Source of Chronic Cringe",
  "Input for Aggression",
  "Who Hurt You?",
  "Roast Material",
  "Psychological Target",
  "Mid Take Provocation",
  "L + Ratio Recipient",
  "Victim of Logic",
  "Delulu Patient Zero",
  "Rent Free Tenant",
  "Bore-ish Behavior Source",
  "Desiccated Soul ID"
];

export function InsultGenerator({
  isPaidBypass,
  isActive
}: {
  isPaidBypass?: boolean;
  isActive?: boolean;
}) {
  const [language, setLanguage] = useState("English");
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Destroy Me");
  const [topicLabel, setTopicLabel] = useState("Topic to Roast");

  // Pick random labels on mount to avoid hydration mismatch
  useEffect(() => {
    const randomButton = BUTTON_LABELS[Math.floor(Math.random() * BUTTON_LABELS.length)];
    const randomTopic = TOPIC_LABELS[Math.floor(Math.random() * TOPIC_LABELS.length)];
    setButtonLabel(randomButton);
    setTopicLabel(randomTopic);
  }, []);

  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: "/api/generate-insult",
    body: {
      language,
      paid: isPaidBypass,
    },
  });

  const onGenerate = (e: React.FormEvent) => {
    if (!isActive && !isPaidBypass) {
      e.preventDefault();
      setShowAccessModal(true);
      return;
    }
    handleSubmit(e);
  };

  return (
    <>
      {showAccessModal && <AccessModal onClose={() => setShowAccessModal(false)} />}
      <div className="w-full max-w-2xl mx-auto p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black uppercase mb-6 tracking-tighter flex items-center gap-2">
          <Flame className="w-8 h-8" />
          Jerkstore
        </h1>

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

        {completion && (
          <div className="mt-8 p-6 border-4 border-black bg-yellow-300 font-mono text-lg leading-relaxed shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black text-xl mb-4 border-b-4 border-black pb-2 uppercase">Verdict:</h3>
            <p className="whitespace-pre-wrap">{completion}</p>
          </div>
        )}
      </div>
    </>
  );
}
