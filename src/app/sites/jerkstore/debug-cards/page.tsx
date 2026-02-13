"use client";

import { ShareCard, type ShareCardHandle } from "../_components/share-card";
import { useRef } from "react";

export default function DebugCardsPage() {
  if (process.env.NODE_ENV === "production") {
    return <div>Not found</div>;
  }

  const testCases = [
    {
      title: "Standard - Short",
      props: {
        input: "Dave",
        displayText: "You're a muffin.",
        isSavage: false,
        isElite: false,
        isTrial: false,
      },
    },
    {
      title: "Standard - Long",
      props: {
        input: "The entire marketing team",
        displayText:
          "You are the human equivalent of a participation trophy. Everyone knows you exist, but no one is proud of you.",
        isSavage: false,
        isElite: false,
        isTrial: false,
      },
    },
    {
      title: "Savage - Medium",
      props: {
        input: "Karen from HR",
        displayText:
          "Your personality is like a wet sock. Unpleasant to be around and wildly difficult to remove from the situation.",
        isSavage: true,
        isElite: false,
        isTrial: false,
      },
    },
    {
      title: "Elite - Long",
      props: {
        input: "CEO Brad",
        displayText:
          "Listen here you corporate shill. Your vision is as narrow as your tie and as bleak as the Q3 earnings report you're trying to hide.",
        isSavage: false,
        isElite: true,
        isTrial: false,
      },
    },
    {
      title: "Trial - Short",
      props: {
        input: "Trial User",
        displayText: "Pay up, dimwit.",
        isSavage: false,
        isElite: false,
        isTrial: true,
      },
    },
    {
      title: "Trial - Long",
      props: {
        input: "Cheapskate",
        displayText: "Imagine being so cheap you can't even afford a proper insult. You are the digital equivalent of a dine-and-dash.",
        isSavage: false,
        isElite: false,
        isTrial: true,
      },
    },
    {
      title: "Long Prompt - Standard",
      props: {
        input: "The guy who constantly leaves passive-aggressive notes in the breakroom about the community oat milk",
        displayText: "Your notes have more personality than you do.",
        isSavage: false,
        isElite: false,
        isTrial: false,
      },
    },
    {
      title: "Savage - Long Everything",
      props: {
        input: "That one developer who insists on using a custom Vim configuration that no one else can read or maintain",
        displayText: "Your code is like a basement flooded with toxic waste: even if I could get in, I wouldn't want to touch anything. You're not a 'wizard', you're just a liability with a mechanical keyboard fetish.",
        isSavage: true,
        isElite: false,
        isTrial: false,
      },
    },
  ];

  const refs = useRef<(ShareCardHandle | null)[]>([]);

  const downloadCard = async (index: number, title: string) => {
    const handle = refs.current[index];
    if (!handle) return;

    const canvas = document.createElement("canvas");
    await handle.drawToCanvas(canvas);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `debug-${title.toLowerCase().replace(/\s+/g, "-")}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Share Card Debug</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {testCases.map((testCase, index) => (
          <div key={index} className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{testCase.title}</h2>
              <button
                onClick={() => downloadCard(index, testCase.title)}
                className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
              >
                Download
              </button>
            </div>
            <div className="relative border border-gray-300 shadow-lg origin-top-left scale-[0.25] w-[800px] h-[200px] overflow-visible bg-white">
              {/* We need to override the absolute positioning for the debug view so it renders locally */}
              <div className="relative w-full h-full">
                <ShareCard
                  {...testCase.props}
                  ref={(el) => { refs.current[index] = el; }}
                  className="relative top-auto left-auto z-auto opacity-100 pointer-events-auto shadow-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
