'use client';

import React, { useRef, MouseEvent, useEffect } from 'react';
import { useRefocusStore } from '../_store/store';
import { cn } from '@/lib/utils';
import { Play, Pause, Plus, Trash2, Scissors, Music, Download, ChevronRight, Hash, Slash, Square, Circle } from 'lucide-react';

export function Timeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const wasPlayingRef = useRef(false);

  const duration = useRefocusStore((state) => state.getProjectDuration());
  const currentTime = useRefocusStore((state) => state.currentTime);
  const isPlaying = useRefocusStore((state) => state.isPlaying);
  const keyframes = useRefocusStore((state) => state.keyframes);
  const selectedKeyframeId = useRefocusStore((state) => state.selectedKeyframeId);
  const segments = useRefocusStore((state) => state.segments);
  const selectedSegmentId = useRefocusStore((state) => state.selectedSegmentId);

  const play = useRefocusStore((state) => state.play);
  const pause = useRefocusStore((state) => state.pause);
  const seek = useRefocusStore((state) => state.seek);
  const addKeyframe = useRefocusStore((state) => state.addKeyframe);
  const selectKeyframe = useRefocusStore((state) => state.selectKeyframe);
  const splitSegment = useRefocusStore((state) => state.splitSegment);
  const deleteSegment = useRefocusStore((state) => state.deleteSegment);
  const selectSegment = useRefocusStore((state) => state.selectSegment);
  const getProjectTime = useRefocusStore((state) => state.getProjectTime);

  const getTimeFromEvent = (e: MouseEvent | globalThis.MouseEvent) => {
    if (!timelineRef.current || duration === 0) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    return percent * duration;
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    wasPlayingRef.current = useRefocusStore.getState().isPlaying;
    if (wasPlayingRef.current) pause();
    seek(getTimeFromEvent(e));
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    seek(getTimeFromEvent(e));
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        if (wasPlayingRef.current) play();
      }
    };
    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging.current) return;
      seek(getTimeFromEvent(e));
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [duration, seek, play, pause]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      useRefocusStore.getState().setAudio(url);
    }
  };

  return (
    <div className="w-full bg-[#02090E] border-t border-[#28E7FF]/20 select-none font-mono">

      {/* Legacy Dual-Tone Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 sm:px-10 py-3 sm:py-5 bg-[#02090E] gap-4 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-16 w-full lg:w-auto pb-2 lg:pb-0">
          <div className="flex items-center">
            <button
              onClick={() => isPlaying ? pause() : play()}
              className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-[#02090E] border-2 border-[#28E7FF] text-[#28E7FF] hover:bg-[#28E7FF] hover:text-[#02090E] transition-all transform skew-x-[-12deg] shadow-[0_0_20px_rgba(40,231,255,0.2)] hover:shadow-[0_0_40px_#28E7FF] shrink-0"
            >
              <div className="transform skew-x-[12deg]">
                {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />}
              </div>
            </button>
          </div>

          <div className="flex flex-col border-l border-[#28E7FF]/20 pl-4 sm:pl-10 shrink-0">
            <div className="text-[9px] sm:text-[10px] text-[#6FC3DF]/60 uppercase tracking-[0.4em] font-black mb-1 flex items-center gap-2">
              CHRONO_LOCK // {isPlaying ? "ACTIVE" : "STANDBY"}
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-widest leading-none flex items-baseline gap-2 italic">
              {formatTime(currentTime)}
              <span className="text-[#28E7FF] opacity-30">/</span>
              <span className="text-white/30 text-base sm:text-lg">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={addKeyframe}
              className="px-4 sm:px-8 py-2 bg-[#02090E] border border-[#6FC3DF]/30 text-[9px] sm:text-[10px] font-black text-[#6FC3DF] hover:border-[#28E7FF] hover:text-[#28E7FF] transition-all uppercase tracking-widest transform skew-x-[-12deg] hover:shadow-[0_0_15px_rgba(40,231,255,0.1)]"
              title="Add Key (I)"
            >
              <div className="transform skew-x-[12deg]">ADD_KEY</div>
            </button>
            <button
              onClick={splitSegment}
              className="px-4 sm:px-8 py-2 bg-[#02090E] border border-[#FF8F00]/40 text-[9px] sm:text-[10px] font-black text-[#FF8F00] hover:border-[#FF8F00] hover:bg-[#FF8F00]/5 transition-all uppercase tracking-widest transform skew-x-[-12deg] hover:shadow-[0_0_15px_rgba(255,143,0,0.1)]"
              title="Split (X)"
            >
              <div className="transform skew-x-[12deg]">SLICE</div>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-8 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 sm:gap-8">
            <label className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 bg-[#02090E] border border-[#6FC3DF]/20 text-[9px] sm:text-[10px] font-black text-[#6FC3DF]/60 hover:text-[#6FC3DF] hover:border-[#6FC3DF] transition-all cursor-pointer uppercase tracking-widest transform skew-x-[-12deg] group">
              <div className="transform skew-x-[12deg] flex items-center gap-2 sm:gap-4">
                <Music className="w-3 h-3 sm:w-4 sm:h-4 text-[#6FC3DF]/40 group-hover:text-[#6FC3DF]" />
                <span className="hidden sm:inline">IMPORT_AUDIO</span>
                <span className="sm:hidden">AUDIO</span>
              </div>
              <input type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} />
            </label>

            {selectedSegmentId && (
              <button
                onClick={() => deleteSegment(selectedSegmentId)}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-[#FF8F00]/40 text-[#FF8F00] hover:bg-[#FF8F00] hover:text-[#02090E] transition-all transform skew-x-[-12deg] shadow-[0_0_20px_rgba(255,143,0,0.1)]"
              >
                <div className="transform skew-x-[12deg]"><Trash2 className="w-4 h-4" /></div>
              </button>
            )}
          </div>

          <button
            onClick={() => useRefocusStore.getState().setIsExportSettingsOpen(true)}
            className="flex items-center gap-3 sm:gap-5 px-6 sm:px-12 py-3 sm:py-4 bg-[#FF8F00] text-[#02090E] font-black text-[10px] sm:text-[12px] hover:shadow-[0_0_40px_rgba(255,143,0,0.4)] hover:scale-105 transition-all uppercase tracking-[0.2em] sm:tracking-[0.4em] transform skew-x-[-12deg]"
          >
            <div className="transform skew-x-[12deg] flex items-center gap-3 sm:gap-5">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              EXPORT
            </div>
          </button>
        </div>
      </div>

      {/* Grid Ruler */}
      <div className="h-6 bg-[#01060a] border-y border-[#28E7FF]/10 w-full relative overflow-hidden">
        <div className="absolute inset-0 flex items-center opacity-10">
          {Array.from({ length: 140 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-full w-px bg-[#28E7FF]/10",
                i % 10 === 0 ? "h-full bg-[#28E7FF]/20" : "h-1/3"
              )}
              style={{ left: `${(i / 140) * 100}%`, position: 'absolute' }}
            />
          ))}
        </div>
        <div
          className="absolute top-0 bottom-0 w-[4px] bg-[#28E7FF] z-30 shadow-[0_0_15px_#28E7FF]"
          style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#28E7FF] shadow-[0_0_10px_#28E7FF]" />
        </div>
      </div>

      {/* Track Workspace */}
      <div className="p-3 sm:p-6 bg-[#02090E] relative overflow-hidden">
        {/* Very subtle secondary grid */}
        <div className="absolute inset-0 bg-[#28E7FF]/[0.01] pointer-events-none" />

        <div
          ref={timelineRef}
          className="relative h-24 sm:h-32 bg-[#02090E]/50 border border-[#28E7FF]/10 cursor-pointer group overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          {/* Segments */}
          <div className="absolute inset-0 flex pointer-events-none p-1 sm:p-2 gap-1 sm:gap-2">
            {segments.map((segment) => {
              const widthPercent = ((segment.end - segment.start) / duration) * 100;
              return (
                <div
                  key={segment.id}
                  className={cn(
                    "h-full relative transition-all duration-300 pointer-events-auto group/clip flex flex-col justify-between overflow-hidden",
                    selectedSegmentId === segment.id
                      ? "bg-[#28E7FF]/10 border-2 border-[#28E7FF] shadow-[0_0_30px_rgba(40,231,255,0.1)]"
                      : "bg-[#28E7FF]/5 border border-[#28E7FF]/10 hover:border-[#28E7FF]/40"
                  )}
                  style={{ width: `${widthPercent}%` }}
                  onClick={(e) => { e.stopPropagation(); selectSegment(segment.id); }}
                >
                  <div className={cn(
                    "p-2 sm:p-4 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] italic truncate",
                    selectedSegmentId === segment.id ? "text-[#28E7FF] drop-shadow-[0_0_8px_#28E7FF]" : "text-[#6FC3DF]/30 group-hover/clip:text-[#6FC3DF]/60"
                  )}>
                    CLIP_{segment.id.slice(0, 4)}
                  </div>
                  <div className="p-2 sm:p-4 text-[8px] sm:text-[10px] text-[#FF8F00]/10 uppercase font-black italic tracking-widest group-hover/clip:text-[#FF8F00]/30 transition-colors self-end hidden sm:block">
                    SEG_LINK //
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keyframes */}
          {keyframes.map((kf) => {
            const projectTime = getProjectTime(kf.time);
            if (projectTime === -1) return null;
            return (
              <div
                key={kf.id}
                onClick={(e) => { e.stopPropagation(); selectKeyframe(kf.id); seek(projectTime); }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 border-2 transition-all duration-300 z-50 cursor-pointer pointer-events-auto",
                  selectedKeyframeId === kf.id
                    ? "bg-white border-[#28E7FF] scale-125 shadow-[0_0_30px_#28E7FF]"
                    : "bg-[#02090E] border-[#6FC3DF]/40 hover:border-[#28E7FF] hover:scale-110"
                )}
                style={{ left: `${(projectTime / (duration || 1)) * 100}%`, transform: 'translate(-50%, -50%) rotate(45deg)' }}
              />
            );
          })}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-[2px] sm:w-[4px] bg-[#28E7FF] z-[60] pointer-events-none shadow-[0_0_20px_#28E7FF]"
            style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-4 sm:px-10 py-3 sm:py-5 bg-[#02090E] text-[9px] sm:text-[11px] font-black text-[#6FC3DF]/20 uppercase tracking-[0.3em] sm:tracking-[0.5em] flex justify-between border-t border-[#28E7FF]/10">
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <Circle className="w-1.5 h-1.5 sm:w-2 sm:h-2 fill-[#28E7FF] animate-ping" />
            <span>NODAL_BUFFER // OK</span>
          </div>
          <span className="hidden sm:inline">O_FORMAT: GRID_ISO</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 italic">
          <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>SYSTEM // 01-X-SLICE</span>
        </div>
      </div>
    </div>
  );
}
