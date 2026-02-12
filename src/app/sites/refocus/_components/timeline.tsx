
'use client';

import React, { useRef, MouseEvent, useEffect } from 'react';
import { useRefocusStore } from '../_store/store';
import { cn } from '@/lib/utils';
import { Play, Pause, Plus, Trash2, Scissors, Music } from 'lucide-react';

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

  // Helper to calculate time from mouse position
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

    if (wasPlayingRef.current) {
      pause();
    }

    const time = getTimeFromEvent(e);
    seek(time);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const time = getTimeFromEvent(e);
    seek(time);
  };

  // Global mouse up to catch release outside timeline
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        if (wasPlayingRef.current) {
          play();
        }
      }
    };

    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging.current) return;
      const time = getTimeFromEvent(e);
      seek(time);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [duration, seek]); // Duration needed for calc? Yes. Seek is stable? Hopefully.

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
    <div className="w-full bg-neutral-900 border-t border-neutral-800 p-4 select-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => isPlaying ? pause() : play()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-neutral-200 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <div className="font-mono text-sm text-neutral-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Music Upload (Hidden Input + Label/Button) */}
          <label className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium text-neutral-300 transition-colors border border-white/10 cursor-pointer">
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">Add Music</span>
            <input type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} />
          </label>

          <div className="w-px h-6 bg-neutral-800 mx-2" />

          <button
            onClick={splitSegment}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium text-white transition-colors border border-white/10"
            title="Split at playhead (X)"
          >
            <Scissors className="w-4 h-4" /> Split
          </button>

          {selectedSegmentId && (
            <button
              onClick={() => deleteSegment(selectedSegmentId)}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-900/50 hover:bg-red-900 rounded text-sm font-medium text-red-200 transition-colors border border-red-500/20"
              title="Delete Selected Clip (Del)"
            >
              <Trash2 className="w-4 h-4" /> Delete Clip
            </button>
          )}

          <div className="w-px h-6 bg-neutral-800 mx-2" />

          <button
            onClick={addKeyframe}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium text-white transition-colors"
            title="Add Keyframe (I)"
          >
            <Plus className="w-4 h-4" /> Add Zoom
          </button>

          <div className="w-px h-6 bg-neutral-800 mx-2" />

          <button
            onClick={() => {
              useRefocusStore.getState().setIsExporting(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-sm font-medium text-neutral-300 transition-colors border border-white/10"
            title="Export Video"
          >
            <span className="hidden sm:inline">Export Video</span>
          </button>
        </div>
      </div>

      <div
        ref={timelineRef}
        className="relative h-16 bg-neutral-950 rounded border border-neutral-800 cursor-pointer group overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Segments (Clips) */}
        <div className="absolute inset-0 flex pointer-events-none">
          {segments.map((segment) => {
            const segDuration = segment.end - segment.start;
            const widthPercent = (segDuration / duration) * 100;

            return (
              <div
                key={segment.id}
                className={cn(
                  "h-full border-r border-black/50 relative transition-colors pointer-events-auto",
                  selectedSegmentId === segment.id
                    ? "bg-neutral-800 ring-1 ring-inset ring-blue-500/50"
                    : "bg-neutral-900 hover:bg-neutral-800"
                )}
                style={{ width: `${widthPercent}%` }}
                onClick={(e) => {
                  // Only select if not dragging?
                  // If playhead moved significantly, it's a scrub.
                  // But click is mouseUp.
                  // Let's assume click is fine.
                  e.stopPropagation();
                  selectSegment(segment.id);
                  // Trigger seek implicitly via mousedown
                }}
              >
                {/* Clip ID or Info */}
                <div className="absolute top-1 left-2 text-[10px] font-mono text-neutral-600 pointer-events-none truncate max-w-full select-none">
                  {formatTime(segment.start)} - {formatTime(segment.end)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Keyframes */}
        {keyframes.map((kf) => {
          const projectTime = getProjectTime(kf.time);
          if (projectTime === -1) return null; // Keyframe is cut out

          return (
            <div
              key={kf.id}
              onClick={(e) => {
                e.stopPropagation();
                selectKeyframe(kf.id);
                seek(projectTime);
              }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border transition-transform z-20 hover:scale-125 hover:z-30 cursor-pointer",
                selectedKeyframeId === kf.id
                  ? "bg-yellow-400 border-yellow-200 z-30 scale-125 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                  : "bg-blue-500 border-blue-400 shadow-sm"
              )}
              style={{ left: `${(projectTime / (duration || 1)) * 100}%`, transform: 'translate(-50%, -50%) rotate(45deg)' }}
              title={`Scale: ${kf.scale.toFixed(1)}x`}
            />
          );
        })}

        {/* Playhead Line */}
        <div
          className="absolute top-0 w-px h-full bg-red-500 z-20 pointer-events-none"
          style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
        >
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full shadow-sm" />
        </div>
      </div>
    </div>
  );
}
