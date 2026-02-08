"use client";

import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";
import { Loader2, Flame } from "lucide-react";

export function InsultGenerator() {
  const [language, setLanguage] = useState("English");

  const { completion, input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    api: "/api/generate-insult",
    body: {
      language,
    },
  });

  return (
    <div className="max-w-xl mx-auto p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h1 className="text-4xl font-black uppercase mb-6 tracking-tighter flex items-center gap-2">
        <Flame className="w-8 h-8" />
        Jerkstore
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold text-xl mb-2 uppercase">Topic to Roast</label>
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
            "Destroy Me"
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
  );
}
