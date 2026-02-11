"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LevelSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

import { getLevelDescription } from "@overmake/constants";

export function LevelSlider({ value, onChange, className }: LevelSliderProps) {
  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="flex justify-between mb-2 font-mono text-sm uppercase tracking-widest">
        <span>Trash</span>
        <span>Luxury</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-black dark:accent-white"
      />
      <div className="text-center mt-4 font-bold text-xl uppercase">
        Level {value}: {getLevelDescription(value)}
      </div>
    </div>
  );
}

