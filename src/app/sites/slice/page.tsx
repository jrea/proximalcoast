'use client';

import React, { useState } from 'react';
import { useRefocusStore } from './_store/store';
import { VideoPreview } from './_components/video-preview';
import { Timeline } from './_components/timeline';
import { PropertiesPanel } from './_components/properties-panel';
import { AudioPlayer } from './_components/audio-player';
import { Plus, Scissors, Hash, Terminal, Box, Disc, Activity, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IdentityDisk } from './_components/identity-disk';

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
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);

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
        setVideo(url, tempVideo.duration, tempVideo.videoWidth, tempVideo.videoHeight);
      };
      tempVideo.src = url;
    }
  };

  if (!videoSrc) {
    return (
      <div
        className={cn(
          "min-h-screen w-full text-white flex flex-col items-center transition-all duration-300 font-mono selection:bg-[#28E7FF] selection:text-[#02090E] overflow-x-hidden overflow-y-auto perspective-[1000px]",
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
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[linear-gradient(rgba(40,231,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(40,231,255,0.06)_1px,transparent_1px)] bg-[size:60px_60px] transform rotateX-[60deg]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#FF8F00]/5 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-[#28E7FF]/10 to-transparent" />
        </div>

        {/* Dynamic Scanline Effect */}
        <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(transparent_50%,#28E7FF_50%)] bg-[size:100%_4px] animate-[scan_10s_linear_infinite]" />

        <div className="relative z-20 w-full max-w-5xl flex flex-col items-center px-6 py-12 sm:py-24">
          {/* Legacy Brand Unit */}
          <div className="mb-12 sm:mb-20 flex flex-col items-center space-y-4">
            <div className="relative group perspective-[1000px]">
              <IdentityDisk size="lg" className="group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="flex flex-col items-center pt-8">
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.8em] text-[#28E7FF] mb-4 drop-shadow-[0_0_5px_#28E7FF]">VIDEO_PROCESSING // STABLE_CORE</span>
              <h1 className="text-6xl sm:text-8xl font-black italic tracking-[-0.15em] leading-none transform skew-x-[-12deg] relative flex items-baseline">
                <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">SLICE</span>
                <span className="flex tracking-[-0.3em] ml-1">
                  <span className="text-[#FF8F00] drop-shadow-[0_0_15px_#FF8F00]">/</span>
                  <span className="text-[#28E7FF] drop-shadow-[0_0_15px_#28E7FF]">/</span>
                </span>
              </h1>
              <p className="mt-8 text-[#6FC3DF] text-sm sm:text-base font-bold uppercase tracking-[0.2em] text-center max-w-lg leading-relaxed">
                The most efficient way to add <span className="text-[#28E7FF]">professional motion</span> to your footage.
              </p>
            </div>
          </div>

          {/* Upload Primary Action */}
          <div className="w-full max-w-2xl relative transform skew-x-[-12deg] mb-24 cursor-pointer group">
            <div className="absolute inset-0 bg-[#28E7FF]/5 border border-[#28E7FF]/20 -z-10 blur-sm group-hover:bg-[#28E7FF]/10 transition-colors" />
            <label className="flex-1 bg-[#02090E]/80 border-2 border-[#28E7FF]/40 hover:border-[#28E7FF] text-[#28E7FF] hover:text-white transition-all px-8 sm:px-12 py-12 sm:py-16 cursor-pointer flex flex-col items-center gap-4 text-center shadow-[0_0_40px_rgba(40,231,255,0.1)] hover:shadow-[0_0_60px_rgba(40,231,255,0.2)]">
              <div className="transform skew-x-[12deg] flex flex-col items-center">
                <Plus className="w-12 h-12 sm:w-16 sm:h-16 mb-8 group-hover:rotate-90 transition-transform duration-500 text-[#28E7FF] drop-shadow-[0_0_15px_#28E7FF]" />
                <div className="text-xl sm:text-2xl font-black uppercase tracking-[0.4em]">DROP_VIDEO_HERE_TO_START</div>
                <div className="text-[10px] sm:text-[12px] uppercase tracking-[0.5em] mt-6 opacity-40 text-[#FF8F00] font-black italic underline underline-offset-8">NO_LOGIN_REQUIRED // 100%_FREE</div>
              </div>
              <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
            </label>
          </div>

          {/* Feature Grid - SEO/AEO Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-6 sm:gap-10 mb-32">
            {[
              {
                icon: <Activity className="w-6 h-6" />,
                title: "PRO_PAN_&_ZOOM",
                desc: "Expert-grade Ken Burns effects with intuitive keyframe controls. Master the motion of every frame with sub-pixel precision.",
                color: "#28E7FF"
              },
              {
                icon: <Disc className="w-6 h-6" />,
                title: "ADD_MUSIC",
                desc: "Sync your visuals with a soundtrack. Upload audio files to create fully immersive video experiences instantly.",
                color: "#6FC3DF"
              },
              {
                icon: <Terminal className="w-6 h-6" />,
                title: "ZERO_FRICTION",
                desc: "No accounts. No credit cards. No watermarks. Just professional video editing directly in your web browser.",
                color: "#FF8F00"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-[#02090E]/60 border border-white/5 p-8 sm:p-10 flex flex-col gap-6 hover:border-[#28E7FF]/40 transition-all group relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-12 h-[2px]" style={{ backgroundColor: feature.color, boxShadow: `0 0 10px ${feature.color}` }} />
                <div className="flex flex-col h-full">
                  <div className="mb-6 p-3 w-fit border border-white/10" style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-4" style={{ color: feature.color }}>
                    {feature.title}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed uppercase font-bold tracking-tight group-hover:text-white/80 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Value Proposition Section */}
          <section className="w-full max-w-4xl bg-[#28E7FF]/[0.02] border border-[#28E7FF]/10 p-10 sm:p-16 mb-32 relative overflow-hidden">
            <div className="absolute top-0 left-0 p-2 bg-[#28E7FF]/20 text-[8px] font-black uppercase tracking-[0.4em]">CORE_SYSTEM_ADVANTAGE</div>
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-4">
                  <Box className="w-8 h-8 text-[#FF8F00]" />
                  Why Edit with SLICE//
                </h2>
                <div className="space-y-6 text-sm text-white/60 leading-relaxed font-bold uppercase tracking-tight">
                  <p>
                    Stop fighting with complex video software. <span className="text-white">SLICE//</span> is a high-performance, browser-native tool built specifically for creators who need to add professional motion and music to their videos <span className="text-[#28E7FF]">instantly</span>.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <li className="flex items-center gap-3 border-l-2 border-[#28E7FF] pl-4">
                      <span className="text-[#28E7FF]">01</span> HIGH_RES_EXPORTS
                    </li>
                    <li className="flex items-center gap-3 border-l-2 border-[#28E7FF] pl-4">
                      <span className="text-[#28E7FF]">02</span> BROWSER_ONLY_LOGIC
                    </li>
                    <li className="flex items-center gap-3 border-l-2 border-[#28E7FF] pl-4">
                      <span className="text-[#28E7FF]">03</span> KEYFRAME_PRECISION
                    </li>
                    <li className="flex items-center gap-3 border-l-2 border-[#28E7FF] pl-4">
                      <span className="text-[#28E7FF]">04</span> INSTANT_PREVIEW
                    </li>
                  </ul>
                </div>
              </div>
              <div className="shrink-0 w-32 h-32 opacity-20 hidden md:block">
                <div className="w-full h-full border-[10px] border-[#28E7FF] animate-pulse rounded-full" />
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="w-full max-w-3xl mb-32">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-[0.5em] text-[#FF8F00] text-center mb-16">COMMON_QUERIES // FAQ</h2>
            <div className="space-y-8">
              {[
                {
                  q: "Is SLICE// actually free?",
                  a: "Yes. Completely. There are no hidden fees, subscriptions, or watermarks. We believe professional tools should be accessible to everyone."
                },
                {
                  q: "Do I need to sign up to use it?",
                  a: "No accounts required. Just drop your file and start editing. We don't store your data because we don't need it."
                },
                {
                  q: "How secure is my data?",
                  a: "Your video never leaves your computer. All processing, editing, and rendering happen 100% in your local browser environment."
                },
                {
                  q: "Can I add background music?",
                  a: "Absolutely. SLICE// supports audio track overlays, allowing you to sync music with your pan and zoom motion for a polished final product."
                }
              ].map((faq, i) => (
                <div key={i} className="border-b border-white/5 pb-8">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#28E7FF] mb-3">{faq.q}</h4>
                  <p className="text-xs text-white/40 leading-relaxed font-bold uppercase tracking-tight">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Terminal */}
          <footer className="w-full border-t border-white/5 pt-16 flex flex-col items-center gap-8 text-center text-[9px] sm:text-[10px] text-[#6FC3DF]/30 uppercase tracking-[0.5em]">
            <div className="flex items-center gap-6">
              <div className="w-2 h-2 bg-[#28E7FF] rounded-full shadow-[0_0_8px_#28E7FF] animate-ping" />
              <span>ISO_STABLE // PROXIMAL_COAST_SYSTEMS // {new Date().getFullYear()}</span>
            </div>
            <div className="max-w-md text-white/10 italic leading-loose">
              DATA_ENCRYPTION_ACTIVE // ZERO_KNOWLEDGE_ARCHITECTURE // THE_GRID_IS_REAL
            </div>
          </footer>
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
      <header className="h-16 flex items-center justify-between px-4 sm:px-10 bg-[#02090E] border-b border-[#28E7FF]/20 z-50 shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3 sm:gap-5">
            <IdentityDisk size="sm" />
            <div className="flex flex-col">
              <div className="flex items-center tracking-[-0.15em] leading-none font-black italic">
                <span className="text-lg sm:text-xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">SLICE</span>
                <span className="flex tracking-[-0.3em] ml-0.5">
                  <span className="text-lg sm:text-xl text-[#FF8F00] drop-shadow-[0_0_5px_#FF8F00]">/</span>
                  <span className="text-lg sm:text-xl text-[#28E7FF] drop-shadow-[0_0_5px_#28E7FF]">/</span>
                </span>
              </div>
              <span className="hidden sm:block text-[9px] text-[#6FC3DF]/40 tracking-[0.4rem] font-bold uppercase mt-1">SLICE_SYSTEM // D-GRID</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-8">
          <button
            onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
            className={cn(
              "flex items-center justify-center p-2 border border-[#28E7FF]/40 text-[#28E7FF] transition-all transform skew-x-[-12deg]",
              isPropertiesOpen && "bg-[#28E7FF]/10 border-[#28E7FF]"
            )}
            title="Toggle Properties"
          >
            <div className="transform skew-x-[12deg]">
              <Sliders className="w-5 h-5" />
            </div>
          </button>
          <button
            className="group flex items-center gap-3 text-[10px] font-black border border-[#28E7FF]/40 text-white px-4 sm:px-8 py-2 transition-all uppercase tracking-widest hover:bg-[#28E7FF] hover:text-[#02090E] transform skew-x-[-12deg] shadow-[0_0_15px_rgba(40,231,255,0.1)] hover:shadow-[0_0_30px_#28E7FF]"
            onClick={() => window.location.reload()}
          >
            <div className="transform skew-x-[12deg] flex items-center gap-3 font-bold">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">NEW_PROJECT</span>
            </div>
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden relative">
        {/* Subtle Ambient Grid */}
        <div className="absolute inset-0 bg-[#28E7FF]/[0.02] bg-[size:100px_100px] [background-image:linear-gradient(to_right,rgba(40,231,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(40,231,255,0.05)_1px,transparent_1px)] pointer-events-none" />

        <div className="flex-1 flex flex-col min-w-0 bg-[#02090E] relative overflow-hidden">
          <div className="flex-1 p-4 sm:p-12 flex items-center justify-center overflow-hidden relative">
            <div className="aspect-video w-full max-w-6xl bg-[#02090E] border border-[#28E7FF]/20 relative shadow-[0_0_100px_rgba(40,231,255,0.05)] z-10 transition-all duration-500">
              <VideoPreview />
            </div>
          </div>

          <div className="h-auto shrink-0 z-10 border-t border-[#28E7FF]/20 bg-[#02090E] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <Timeline />
            <AudioPlayer />
          </div>
        </div>

        {isPropertiesOpen && (
          <div className="fixed inset-0 sm:relative sm:inset-auto z-[60] sm:z-10 bg-[#02090E] sm:bg-transparent transition-all overflow-hidden flex justify-end">
            <div className="w-full sm:w-[360px] h-full flex flex-col bg-[#02090E] relative border-l border-[#28E7FF]/20">
              {/* Mobile Close Button */}
              <button
                onClick={() => setIsPropertiesOpen(false)}
                className="sm:hidden absolute top-6 right-6 z-[70] w-10 h-10 flex items-center justify-center border border-[#28E7FF]/40 text-[#28E7FF]"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
              <PropertiesPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
