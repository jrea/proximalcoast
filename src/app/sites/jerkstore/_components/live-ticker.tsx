"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const MOCK_VICTIMS = [
  "My Ex's Mixtape", "Crypto Bros", "My Boss", "HR Department",
  "The IRS", "My Cat", "Generic Tech Startups", "LinkedIn Influencers",
  "My Gym Crush", "Landlords", "Paper Straws", "Slow Wi-Fi",
  "People Who Clap When The Plane Lands", "My Own Reflection",
  "This Website", "The Metaverse", "NFTs"
];

export function LiveTicker() {
  return (
    <div className="bg-black text-white overflow-hidden py-1 border-b-4 border-black relative z-[60]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 mx-4">
            <span className="font-mono font-bold text-xs uppercase tracking-widest opacity-80">
              Target Acquired:
            </span>
            <span className="font-black italic uppercase text-sm">
              {MOCK_VICTIMS[i % MOCK_VICTIMS.length]}
            </span>
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
