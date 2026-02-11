"use client";

import { useState } from "react";
import { LevelSlider } from "@overmake/_components/level-slider";
import { EstimateDisplay } from "@overmake/_components/estimate-display";
import { cn } from "@/lib/utils";

import { PLANS, THEMES } from "@overmake/constants";

export default function OvermakePage() {
  const [task, setTask] = useState("");
  const [level, setLevel] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // Using any for simplicity with raw JSON parsing, refine later

  const isLuxury = level > PLANS.DIYER.maxLevel;
  const isTrash = level <= PLANS.BUSHFIX.maxLevel;

  const themeClass = cn(
    isLuxury && `theme-${THEMES.LUXURY} bg-neutral-950 text-white`,
    isTrash && `theme-${THEMES.TRASH} bg-yellow-50 text-red-900`,
    !isLuxury && !isTrash && `theme-${THEMES.STANDARD} bg-white text-gray-900`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/sites/overmake/api/generate-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, level }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate estimate");
      }

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let textBuffer = "";

      while (!done) {
        // @ts-ignore
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        textBuffer += chunkValue;

        // This is a simplified "streaming" view. 
        // For structured JSON, real streaming parsing is hard.
        // We'll just wait for full completion to parse JSON, 
        // but maybe show raw text progress if we want?
        // Let's just accumulate for now.
      }

      // Try to find the JSON block
      let jsonStr = textBuffer;
      const jsonStart = textBuffer.indexOf('{');
      const jsonEnd = textBuffer.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = textBuffer.substring(jsonStart, jsonEnd + 1);
      }

      try {
        const parsed = JSON.parse(jsonStr);
        setResult(parsed);
      } catch (e) {
        console.error("Failed to parse JSON response", e);
        // Fallback display if JSON fails
        setResult({
          proposal: textBuffer,
          bom: [],
          totalCost: "Unknown"
        });
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong. The estimate was too complex for our servers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-1000 p-4 md:p-12", themeClass)}>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className={cn("text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4",
            isLuxury && "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-700",
            isTrash && "rotate-2 drop-shadow-md text-red-600 underline decoration-wavy"
          )}>
            Overmake
          </h1>
          <p className="text-xl opacity-75 max-w-2xl mx-auto">
            {isLuxury ? "Precision Engineering for the Discerning Few." :
              isTrash ? "WE FIX IT GOOD. NO REFUNDS." :
                "Professional Estimation Services."}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12 mb-16">
          <div className="space-y-4">
            <label className="block text-center text-sm font-bold uppercase tracking-wider opacity-50">
              What needs doing?
            </label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. Make a sandwich, Change a lightbulb..."
              className={cn("w-full text-center text-3xl md:text-5xl font-bold bg-transparent border-b-4 focus:outline-none transition-all placeholder:opacity-20",
                isLuxury && "border-white/20 focus:border-yellow-500 placeholder:text-white",
                isTrash && "border-red-900/50 focus:border-red-600 placeholder:text-red-900 font-mono",
                !isLuxury && !isTrash && "border-gray-200 focus:border-black"
              )}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-center text-sm font-bold uppercase tracking-wider opacity-50">
              Complexity Level
            </label>
            <LevelSlider value={level} onChange={setLevel} />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading || !task}
              className={cn("px-12 py-6 text-2xl font-bold uppercase tracking-widest transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                isLuxury && "bg-white text-black hover:bg-yellow-400",
                isTrash && "bg-red-600 text-yellow-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2",
                !isLuxury && !isTrash && "bg-black text-white hover:bg-gray-800 rounded-lg"
              )}
            >
              {loading ? "Calculating..." : "Generate Estimate"}
            </button>
          </div>
        </form>

        <EstimateDisplay data={result} isLoading={loading} level={level} />

      </div>
    </div>
  );
}
