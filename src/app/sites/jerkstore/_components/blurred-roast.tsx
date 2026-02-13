"use client";

import { usePostHog } from 'posthog-js/react';
import Link from "next/link";
import { cn } from "@/lib/utils";

const BAD_WORDS = ["goddamn", "fucked", "syphilis-ridden", "syphilitic", "lobotomized"];

export function BlurredRoast({ text }: { text: string }) {
  const posthog = usePostHog();
  const words = text.split(/(\s+)/);
  return (
    <>
      {words.map((word, i) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, "");
        if (BAD_WORDS.includes(cleanWord) && word.length > 0) {
          return (
            <Link
              key={i}
              href="/billing"
              className="inline-block cursor-pointer select-none bg-neutral-200 px-1 rounded mx-0.5 hover:bg-red-100 border-b-2 border-transparent hover:border-red-600 transition-all group/word"
              title="Click to unlock with Pro"
              onClick={() => posthog?.capture('blurred_roast_click', { word: cleanWord })}
            >
              <span>{word[0]}</span>
              <span className="blur-[4px] transition-all">
                {word.substring(1)}
              </span>
            </Link>
          );
        }
        return <span key={i}>{word}</span>;
      })}
    </>
  );
}
