"use client";

import React from "react";

export function GundamSidebar() {
  return (
    <>
      <aside
        className="fixed left-0 top-0 h-full w-24 sm:w-32 bg-white dark:bg-[#080808] border-r border-zinc-200 dark:border-zinc-800 z-40 hidden md:flex flex-col items-center py-20"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 92%, 60% 100%, 0 100%)"
        }}
      >
        {/* --- WING ZERO CORE ARMOR --- */}
        {/* Boxy Chest Plate (Cobalt) */}
        <div className="absolute top-0 right-0 w-[4px] h-48 bg-[#1d429a] opacity-90" />

        {/* Red Waist/Feet Doodads */}
        <div className="absolute top-[160px] right-0 w-[4px] h-12 bg-[#bc1e22]" />
        <div className="absolute bottom-0 left-0 w-full h-10 bg-[#bc1e22] opacity-80"
          style={{ clipPath: 'polygon(0 25%, 100% 0, 100% 100%, 0 100%)' }} />

        <div className="flex flex-col items-center justify-between h-full relative z-10 w-full px-4">
          {/* Top Metadata & Model Number */}
          <div className="flex flex-col items-center gap-1.5 opacity-60">
            <span className="text-[6px] font-black tracking-[0.8em] text-zinc-500 uppercase">Celestial_Zero</span>
            <div className="flex flex-col items-center leading-none">
              <span className="text-[10px] font-black text-[#1d429a] dark:text-blue-400 tracking-tighter">XXXG-00W0</span>
              <span className="text-[7px] font-bold text-zinc-400">PREVENTER</span>
            </div>
          </div>

          {/* Vertical Branding with FULL-LENGTH DIAGONAL SLASH */}
          <div className="relative group/brand flex flex-col items-center justify-center py-20 w-full h-full overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Shared container for both layers */}
              <div className="relative whitespace-nowrap">
                <h1 className="[writing-mode:vertical-rl] rotate-180 text-[3.2rem] sm:text-[4.2rem] lg:text-[4.8rem] font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100 leading-none transform -skew-y-1 uppercase invisible px-4">
                  Proximal Coast
                </h1>

                {/* Segment 1 (GRAY base / Left side) */}
                <h1 className="[writing-mode:vertical-rl] rotate-180 text-[3.2rem] sm:text-[4.2rem] lg:text-[4.8rem] font-black italic tracking-tighter text-zinc-400 dark:text-zinc-600 leading-none transform -skew-y-1 uppercase absolute inset-0 z-10 px-4"
                  style={{ clipPath: 'polygon(0 0, 70% 0, 30% 100%, 0 100%)' }}>
                  Proximal Coast
                </h1>

                {/* Segment 2 (WHITE/COBALT / Right side + Offset) */}
                <h1 className="[writing-mode:vertical-rl] rotate-180 text-[3.2rem] sm:text-[4.2rem] lg:text-[4.8rem] font-black italic tracking-tighter text-zinc-300 dark:text-white leading-none transform -skew-y-1 uppercase absolute inset-0 z-20 px-4 translate-x-1 -translate-y-1 shadow-[2px_2px_0_rgba(29,66,154,0.3)]"
                  style={{ clipPath: 'polygon(70% 0, 100% 0, 100% 100%, 30% 100%)' }}>
                  Proximal <span className="text-[#1d429a] dark:text-blue-400">Coast</span>
                </h1>

                {/* Geometric White Tactical Cut Line */}
                <div className="absolute inset-0 z-30 pointer-events-none translate-x-1 -translate-y-1"
                  style={{
                    clipPath: 'polygon(65% 0, 71% 0, 31% 100%, 25% 100%)',
                    background: 'white'
                  }}
                />
              </div>

              {/* Angle Cut Line Decoration - Spans background */}
              <div className="absolute inset-y-0 left-1/2 w-[1px] h-full bg-blue-500/10 z-30 pointer-events-none transform -translate-x-[50%] skew-x-[-3.5deg]" />
            </div>
          </div>

          {/* Status Indicator & Sensor Eye */}
          <div className="flex flex-col gap-6 items-center">
            {/* Main Search Eye Glow */}
            <div className="relative">
              <div className="w-2 h-2 bg-[#00f5d4] rounded-sm animate-pulse shadow-[0_0_12px_rgba(0,245,212,0.8)]" />
              <div className="absolute inset-0 w-2 h-2 bg-[#00f5d4] blur-[4px] opacity-40" />
            </div>

            <div className="w-[1px] h-20 bg-gradient-to-b from-[#00f5d4] to-transparent opacity-30" />
            <div className="[writing-mode:vertical-rl] rotate-180 text-[7px] font-black tracking-[0.8em] text-zinc-400 uppercase">
              System_Zero
            </div>
          </div>
        </div>

        {/* Feather Motifs (Geometric Wing Sprites) */}
        <div className="absolute top-[30%] -right-2 w-16 h-[1px] bg-blue-500/20 rotate-[30deg]" />
        <div className="absolute top-[35%] -right-4 w-20 h-[1px] bg-blue-500/15 rotate-[25deg]" />
        <div className="absolute top-[40%] -right-2 w-12 h-[1px] bg-blue-500/10 rotate-[40deg]" />

        {/* Internal Panel Details */}
        <div className="absolute inset-x-0 bottom-[18%] h-[1px] bg-zinc-200 dark:bg-zinc-800 opacity-30 px-4" />
        <div className="absolute left-[30%] bottom-[12%] w-6 h-[1px] bg-zinc-400 opacity-20 rotate-45" />
      </aside>

      {/* FIXED ARMOR PLATE - Outside aside to bypass clip-path */}
      <div
        className="fixed top-24 left-24 sm:left-32 w-16 h-44 bg-zinc-50 dark:bg-zinc-100 shadow-2xl z-50 hidden md:block"
        style={{ clipPath: 'polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)' }}
      >
        {/* Glowing Gold Core - Flushed to left edge */}
        <div
          className="absolute inset-y-0 left-0 w-3 bg-gradient-to-b from-[#f0c419] via-[#f0c419] to-[#d4af37] shadow-[0_10px_20px_rgba(240,196,25,0.3)]"
          style={{ clipPath: 'polygon(0% 0%, 100% 10%, 100% 90%, 0% 100%)' }}
        />
      </div>
    </>
  );
}
