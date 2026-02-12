'use client';

import React, { useState } from 'react';
import { useRefocusStore } from './_store/store';
import { VideoPreview } from './_components/video-preview';
import { Timeline } from './_components/timeline';
import { PropertiesPanel } from './_components/properties-panel';
import { AudioPlayer } from './_components/audio-player';
import { Plus, Scissors, Hash, Terminal, Box, Disc, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

// TRON Legacy Defined Colors
const COLORS = {
  identityBlue: '#6FC3DF',
  neonTeal: '#28E7FF',
  rinzlerOrange: '#FF8F00',
  deepGridBlack: '#02090E'
};

export default function RefocusPage() {
  const videoSrc = useRefocusStore((state) => state.videoSrc);
  const setVideo = useRefocusStore((state) => state.setVideo);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    if (file) {
      const url = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.onloadedmetadata = () => {
        setVideo(url, tempVideo.duration);
      };
      tempVideo.src = url;
    }
  };

  if (!videoSrc) {
    return (
      <div
        className={cn(
          "h-screen w-full text-white flex flex-col items-center justify-center p-8 transition-all duration-300 font-mono selection:bg-[#28E7FF] selection:text-[#02090E] overflow-hidden perspective-[1000px]",
          isDragging ? "bg-[#050d14]" : "bg-[#02090E]"
        )}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith('video/')) {
            handleFile(file);
          }
        }}
      >
        {/* TRON Legacy Dual-Tone Grid Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[linear-gradient(rgba(40,231,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(40,231,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px] transform rotateX-[60deg]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#FF8F00]/5 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-[#28E7FF]/10 to-transparent" />
        </div>

        <div className="relative w-full max-w-2xl flex flex-col items-center">
          {/* Legacy Brand Unit */}
          <div className="mb-20 flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-[#28E7FF] flex items-center justify-center shadow-[0_0_30px_rgba(40,231,255,0.4)] group-hover:shadow-[0_0_60px_rgba(40,231,255,0.6)] transition-all duration-700 bg-[#02090E]">
                <div className="absolute w-28 h-28 rounded-full border border-[#FF8F00]/20 animate-[spin_20s_linear_infinite]" />
                <Disc className="w-10 h-10 text-[#6FC3DF] drop-shadow-[0_0_10px_#6FC3DF]" />
              </div>
            </div>

            <div className="flex flex-col items-center pt-8">
              <span className="text-[11px] font-black uppercase tracking-[0.8em] text-[#28E7FF] mb-4 drop-shadow-[0_0_5px_#28E7FF]">VIDEO_PROCESSING // STABLE_CORE</span>
              <h1 className="text-8xl font-black italic tracking-[-0.15em] leading-none transform skew-x-[-12deg] relative flex items-baseline">
                <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">SLICE</span>
                <span className="flex tracking-[-0.3em] ml-1">
                  <span className="text-[#FF8F00] drop-shadow-[0_0_15px_#FF8F00]">/</span>
                  <span className="text-[#28E7FF] drop-shadow-[0_0_15px_#28E7FF]">/</span>
                </span>
              </h1>
            </div>
          </div>

          <div className="w-full relative transform skew-x-[-12deg] mb-16">
            <div className="absolute inset-0 bg-[#28E7FF]/5 border border-[#28E7FF]/20 -z-10 blur-sm" />
            <label className="flex-1 bg-[#02090E]/80 border-2 border-[#28E7FF]/40 hover:border-[#28E7FF] text-[#28E7FF] hover:text-white transition-all px-12 py-10 cursor-pointer group flex flex-col items-center gap-4 text-center shadow-[0_0_40px_rgba(40,231,255,0.1)] hover:shadow-[0_0_60px_rgba(40,231,255,0.2)]">
              <div className="transform skew-x-[12deg] flex flex-col items-center">
                <Plus className="w-10 h-10 mb-6 group-hover:rotate-90 transition-transform duration-500 text-[#28E7FF] drop-shadow-[0_0_10px_#28E7FF]" />
                <div className="text-sm font-black uppercase tracking-[0.4em]">UPLOAD_VIDEO</div>
                <div className="text-[10px] uppercase tracking-widest mt-3 opacity-40 text-[#FF8F00]">Select source file //</div>
              </div>
              <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="grid grid-cols-2 w-full gap-8 transform skew-x-[-12deg]">
            <div className="bg-[#02090E]/60 border border-[#28E7FF]/20 p-8 flex flex-col gap-3 hover:border-[#28E7FF] transition-all group relative">
              <div className="absolute top-0 right-0 w-8 h-[1px] bg-[#28E7FF] shadow-[0_0_5px_#28E7FF]" />
              <div className="transform skew-x-[12deg] flex flex-col">
                <span className="text-[10px] text-[#28E7FF] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> SMART_ZOOM
                </span>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold group-hover:text-white/80 transition-colors tracking-tighter">Automatic subject tracking. /</p>
              </div>
            </div>
            <div className="bg-[#02090E]/60 border border-[#FF8F00]/20 p-8 flex flex-col gap-3 hover:border-[#FF8F00] transition-all group relative">
              <div className="absolute top-0 right-0 w-8 h-[1px] bg-[#FF8F00] shadow-[0_0_5px_#FF8F00]" />
              <div className="transform skew-x-[12deg] flex flex-col">
                <span className="text-[10px] text-[#FF8F00] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Box className="w-3 h-3" /> EXPORT_VIDEO
                </span>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold group-hover:text-white/80 transition-colors tracking-tighter">Render and download clip. /</p>
              </div>
            </div>
          </div>

          <div className="mt-24 text-[10px] text-[#6FC3DF]/30 uppercase tracking-[0.5em] flex items-center gap-6">
            <div className="w-2 h-2 bg-[#28E7FF] rounded-full shadow-[0_0_8px_#28E7FF] animate-ping" />
            <span>ISO_STABLE // V1.0.4</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full bg-[#02090E] text-white flex flex-col overflow-hidden font-mono selection:bg-[#28E7FF] selection:text-[#02090E]"
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      {/* Legacy Dual-Tone Header */}
      <header className="h-16 flex items-center justify-between px-10 bg-[#02090E] border-b border-[#28E7FF]/20 z-50 shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-full border-2 border-[#28E7FF] flex items-center justify-center shadow-[0_0_15px_rgba(40,231,255,0.2)] bg-[#02090E]">
              <Disc className="w-5 h-5 text-[#6FC3DF] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center tracking-[-0.15em] leading-none font-black italic">
                <span className="text-xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">SLICE</span>
                <span className="flex tracking-[-0.3em] ml-0.5">
                  <span className="text-xl text-[#FF8F00] drop-shadow-[0_0_5px_#FF8F00]">/</span>
                  <span className="text-xl text-[#28E7FF] drop-shadow-[0_0_5px_#28E7FF]">/</span>
                </span>
              </div>
              <span className="text-[9px] text-[#6FC3DF]/40 tracking-[0.4rem] font-bold uppercase mt-1">SLICE_SYSTEM // D-GRID</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button
            className="group flex items-center gap-3 text-[10px] font-black border border-[#28E7FF]/40 text-white px-8 py-2 transition-all uppercase tracking-widest hover:bg-[#28E7FF] hover:text-[#02090E] transform skew-x-[-12deg] shadow-[0_0_15px_rgba(40,231,255,0.1)] hover:shadow-[0_0_30px_#28E7FF]"
            onClick={() => window.location.reload()}
          >
            <div className="transform skew-x-[12deg] flex items-center gap-3 font-bold">
              <Plus className="w-4 h-4" />
              <span>NEW_PROJECT</span>
            </div>
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Subtle Ambient Grid */}
        <div className="absolute inset-0 bg-[#28E7FF]/[0.02] bg-[size:100px_100px] [background-image:linear-gradient(to_right,rgba(40,231,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(40,231,255,0.05)_1px,transparent_1px)] pointer-events-none" />

        <div className="flex-1 flex flex-col min-w-0 bg-[#02090E] relative">
          <div className="flex-1 p-12 flex items-center justify-center overflow-hidden relative">
            <div className="aspect-video w-full max-w-6xl bg-[#02090E] border border-[#28E7FF]/20 relative shadow-[0_0_100px_rgba(40,231,255,0.05)] z-10">
              <VideoPreview />
            </div>
          </div>

          <div className="h-auto shrink-0 z-10 border-t border-[#28E7FF]/20 bg-[#02090E] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <Timeline />
            <AudioPlayer />
          </div>
        </div>

        <PropertiesPanel />
      </div>
    </div>
  );
}
