'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRefocusStore } from '../_store/store';
import { cn } from '@/lib/utils';
import { Activity, Terminal, Disc, Download, Plus } from 'lucide-react';

const ExportOverlay = () => {
  const currentTime = useRefocusStore((state) => state.currentTime);
  const getProjectDuration = useRefocusStore((state) => state.getProjectDuration);
  const setIsExporting = useRefocusStore((state) => state.setIsExporting);

  const duration = getProjectDuration();
  const progress = Math.min(100, Math.max(0, (currentTime / (duration || 1)) * 100));

  return (
    <div className="absolute inset-0 z-50 bg-[#02090E] flex flex-col items-center justify-center text-white space-y-12 sm:space-y-16 p-4 selection:bg-[#28E7FF] selection:text-[#02090E]">
      {/* TRON Legacy Grid Floor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(40,231,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(40,231,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent:70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#FF8F00]/10 to-transparent" />
      </div>

      <div className="flex flex-col items-center space-y-4 sm:space-y-6 relative text-center">
        <div className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-[#28E7FF] drop-shadow-[0_0_8px_#28E7FF]">VIDEO_EXPORT // UPLOAD_SEQUENCE</div>
        <div className="text-4xl sm:text-8xl font-black italic tracking-tighter transform skew-x-[-12deg] flex items-center gap-2 sm:gap-4 group">
          RENDERING<span className="text-[#28E7FF] drop-shadow-[0_0_15px_#28E7FF]">/</span><span className="text-[#FF8F00] drop-shadow-[0_0_15px_#FF8F00]">GRID</span>
        </div>
      </div>

      <div className="w-full max-w-[600px] relative transform skew-x-[-12deg] px-4">
        <div className="h-2 w-full bg-white/5 border border-white/5 relative overflow-hidden">
          <div
            className="h-full bg-[#28E7FF] shadow-[0_0_20px_#28E7FF] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between mt-6 text-[9px] sm:text-[11px] font-black text-[#28E7FF]/60 uppercase tracking-[0.3em] transform skew-x-[12deg]">
          <div className="flex items-center gap-2 sm:gap-3">
            <Disc className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-[#6FC3DF]" />
            <span>RENDERING_FRAMES //</span>
          </div>
          <span className="text-[#6FC3DF] italic font-mono">{progress.toFixed(2)}%</span>
        </div>
      </div>

      <button
        onClick={() => setIsExporting(false)}
        className="group relative px-8 sm:px-12 py-3 sm:py-4 transform skew-x-[-12deg] transition-all hover:bg-[#FF8F00]/20"
      >
        <div className="absolute inset-0 border border-[#FF8F00]/30 group-hover:border-[#FF8F00] transition-colors" />
        <div className="relative transform skew-x-[12deg] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-[#FF8F00] drop-shadow-[0_0_5px_rgba(255,143,0,0.5)]">
          CANCEL_RENDER //
        </div>
      </button>
    </div>
  );
};

export function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // --- Audio Handling Refs ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const videoSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // State
  const [isHovering, setIsHovering] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Store Subscriptions
  const videoSrc = useRefocusStore((state) => state.videoSrc);
  const isPlaying = useRefocusStore((state) => state.isPlaying);
  const isExporting = useRefocusStore((state) => state.isExporting);
  const currentTime = useRefocusStore((state) => state.currentTime);
  const videoVolume = useRefocusStore((state) => state.videoVolume);
  const segments = useRefocusStore((state) => state.segments);

  // Actions
  const play = useRefocusStore((state) => state.play);
  const pause = useRefocusStore((state) => state.pause);
  const splitSegment = useRefocusStore((state) => state.splitSegment);
  const addKeyframe = useRefocusStore((state) => state.addKeyframe);
  const deleteSegment = useRefocusStore((state) => state.deleteSegment);
  const updateKeyframe = useRefocusStore((state) => state.updateKeyframe);
  const setIsExporting = useRefocusStore((state) => state.setIsExporting);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          useRefocusStore.getState().isPlaying ? pause() : play();
          break;
        case 'x':
          splitSegment();
          break;
        case 'i':
          addKeyframe();
          break;
        case 'delete':
        case 'backspace':
          const selSeg = useRefocusStore.getState().selectedSegmentId;
          if (selSeg) deleteSegment(selSeg);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [play, pause, splitSegment, addKeyframe, deleteSegment]);

  // --- Audio Context Initialization ---
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        // @ts-ignore
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
    };
    initAudio();
  }, []);

  // --- Mouse Interaction ---
  const handleWheel = (e: React.WheelEvent) => {
    if (!videoSrc) return;
    const store = useRefocusStore.getState();
    store.addKeyframe();
    const newId = useRefocusStore.getState().selectedKeyframeId;
    if (!newId) return;

    const kf = useRefocusStore.getState().keyframes.find(k => k.id === newId);
    if (!kf) return;

    const delta = e.deltaY * -0.001;
    const newScale = Math.max(1, Math.min(10, kf.scale + delta));
    updateKeyframe(newId, { scale: newScale });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !videoSrc) return;
    isDragging.current = true;

    useRefocusStore.getState().addKeyframe();
    const id = useRefocusStore.getState().selectedKeyframeId;
    const kf = useRefocusStore.getState().keyframes.find(k => k.id === id);

    if (kf) {
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: kf.x,
        panY: kf.y
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const id = useRefocusStore.getState().selectedKeyframeId;
    if (!id) return;

    const kf = useRefocusStore.getState().keyframes.find(k => k.id === id);
    if (!kf) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const deltaX_px = e.clientX - dragStart.current.x;
    const deltaY_px = e.clientY - dragStart.current.y;

    const deltaX_pct = ((deltaX_px / rect.width) * 100) / kf.scale;
    const deltaY_pct = ((deltaY_px / rect.height) * 100) / kf.scale;

    updateKeyframe(id, {
      x: dragStart.current.panX - deltaX_pct,
      y: dragStart.current.panY - deltaY_pct
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const [isReadyToRecord, setIsReadyToRecord] = useState(false);

  // --- Export Logic ---
  useEffect(() => {
    if (!isExporting || !videoRef.current || !canvasRef.current) {
      setIsReadyToRecord(false);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const store = useRefocusStore.getState();

    // Ensure metadata is loaded
    if (video.videoWidth === 0) {
      console.log('Export: Waiting for video metadata...');
      const checkMetadata = () => {
        if (video.videoWidth > 0) {
          setIsExporting(true); // Re-trigger effect
        } else {
          setTimeout(checkMetadata, 100);
        }
      };
      checkMetadata();
      return;
    }

    // 1. Setup Canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    console.log(`Export: Canvas sized to ${canvas.width}x${canvas.height}`);

    // 2. Prepare for start
    store.pause();
    store.seek(0);

    const executeExport = async () => {
      try {
        console.log('Export: Initializing stream and recorder...');
        const stream = canvas.captureStream(30);
        const actx = audioCtxRef.current;

        if (actx) {
          if (actx.state === 'suspended') await actx.resume();
          const dest = actx.createMediaStreamDestination();
          if (!videoSourceRef.current) {
            try {
              videoSourceRef.current = actx.createMediaElementSource(video);
              videoSourceRef.current.connect(actx.destination);
            } catch (e) { console.warn('Audio source connection warning:', e); }
          }
          if (videoSourceRef.current) videoSourceRef.current.connect(dest);
          const mixedTracks = dest.stream.getAudioTracks();
          if (mixedTracks.length > 0) stream.addTrack(mixedTracks[0]);
        }

        // Check for supported types
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm';

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          console.log(`Export: Recording stopped. Chunks: ${chunksRef.current.length}`);
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `slice-dice-${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
          }
          setIsExporting(false);
          store.pause();
          store.seek(0);
        };

        recorder.start();
        store.play();
        console.log('Export: Playback and recording started.');
        setIsReadyToRecord(true);
      } catch (err) {
        console.error('Export failed:', err);
        setIsExporting(false);
      }
    };

    // Give it a tiny moment to ensure seek(0) and pause() have settled in the DOM
    const t = setTimeout(executeExport, 100);
    return () => {
      clearTimeout(t);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isExporting, setIsExporting]);

  // Handle automatic completion
  useEffect(() => {
    const duration = useRefocusStore.getState().getProjectDuration();
    if (isExporting && isReadyToRecord && (!isPlaying || currentTime >= duration - 0.05)) {
      console.log('Export: Reached end of project. Finalizing...');
      setIsExporting(false);
    }
  }, [isPlaying, isExporting, isReadyToRecord, currentTime, setIsExporting]);

  // --- Sync Video Playback ---
  useEffect(() => {
    const video = videoRef.current;
    if (video && videoSrc) {
      if (isPlaying && video.paused) video.play().catch(() => { });
      else if (!isPlaying && !video.paused) video.pause();
    }
  }, [isPlaying, videoSrc]);

  // --- Main Render Loop ---
  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      const video = videoRef.current;
      const container = containerRef.current;
      if (video && container) {
        const store = useRefocusStore.getState();
        const { currentTime, segments, getSourceTime } = store;
        const isStorePlaying = store.isPlaying;

        if (isStorePlaying) {
          let cst = video.currentTime;
          const est = getSourceTime(currentTime);
          if (Math.abs(est - cst) > 0.25) { video.currentTime = est; cst = est; }
          const currentSegmentIndex = segments.findIndex(s => cst >= s.start && cst < s.end);
          if (currentSegmentIndex !== -1) {
            if (segments[currentSegmentIndex].end - cst < 0.05) {
              const next = segments[currentSegmentIndex + 1];
              if (next) { video.currentTime = next.start + 0.01; store.tick(next.start + 0.01); }
              else { store.tick(cst); if (cst >= store.sourceDuration - 0.1) store.pause(); }
            } else store.tick(cst);
          } else store.pause();
        } else {
          const target = getSourceTime(currentTime);
          if (Math.abs(video.currentTime - target) > 0.05) video.currentTime = target;
        }

        const { scale, x, y } = store.getCurrentTransform();
        container.style.transform = `translate(${(50 - x) * scale}%, ${(50 - y) * scale}%) scale(${scale})`;

        if (isExporting && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;
            ctx.fillStyle = "#02090E";
            ctx.fillRect(0, 0, w, h);
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.scale(scale, scale);
            ctx.translate(((50 - x) / 100) * w, ((50 - y) / 100) * h);
            ctx.translate(-w / 2, -h / 2);
            ctx.drawImage(video, 0, 0, w, h);
            ctx.restore();
          }
        }
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isExporting]);

  useEffect(() => { if (videoRef.current) videoRef.current.volume = videoVolume; }, [videoVolume]);

  useEffect(() => {
    const unsub = useRefocusStore.subscribe((state) => {
      if (!state.isPlaying && !state.isExporting && videoRef.current) {
        const target = state.getSourceTime(state.currentTime);
        if (Math.abs(videoRef.current.currentTime - target) > 0.05) videoRef.current.currentTime = target;
      }
    });
    return () => unsub();
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) useRefocusStore.getState().setDuration(videoRef.current.duration);
  };

  if (!videoSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#02090E] text-[#6FC3DF]/10 font-black italic text-5xl sm:text-9xl tracking-tighter select-none transform skew-x-[-12deg]">
        VIEWER//
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full bg-[#02090E] overflow-hidden group select-none cursor-grab active:cursor-grabbing transform-gpu border border-[#28E7FF]/20"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); isDragging.current = false; }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        ref={containerRef}
        className="absolute w-full h-full flex items-center justify-center origin-center will-change-transform"
      >
        <video
          ref={videoRef}
          src={videoSrc}
          className="max-w-full max-h-full object-contain pointer-events-none"
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          crossOrigin="anonymous"
        />
      </div>

      <canvas ref={canvasRef} className="hidden pointer-events-none" />
      {isExporting && <ExportOverlay />}

      {/* Legacy HUD */}
      <div className="absolute inset-0 pointer-events-none font-mono">

        {/* Optical HUD Frames - Cyan Bloom */}
        <div className="absolute top-0 left-0 w-16 sm:w-32 h-16 sm:h-32 border-t-2 border-l-2 border-[#28E7FF]/20 sm:group-hover:border-[#28E7FF] transition-all duration-700 shadow-[inset_0_0_20px_rgba(40,231,255,0.05)]" />
        <div className="absolute top-0 right-0 w-16 sm:w-32 h-16 sm:h-32 border-t-2 border-r-2 border-[#FF8F00]/20 sm:group-hover:border-[#FF8F00] transition-all duration-700 shadow-[inset_0_0_20px_rgba(255,143,0,0.05)]" />

        {/* Top-Right: Trace Status - Orange Bloom */}
        <div className="absolute top-4 sm:top-10 right-4 sm:right-10 flex flex-col items-end space-y-3 opacity-10 sm:opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="bg-[#FF8F00]/5 border border-[#FF8F00]/30 text-[#FF8F00] px-3 sm:px-6 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 sm:gap-3 transform skew-x-[-12deg] shadow-[0_0_15px_rgba(255,143,0,0.2)]">
            <div className="transform skew-x-[12deg] flex items-center gap-2 sm:gap-3">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              SYSTEM_ACTIVE // V1.0
            </div>
          </div>
        </div>

        {/* Bottom-Left: Grid Interface */}
        <div className="absolute bottom-4 sm:bottom-10 left-4 sm:left-10 opacity-0 group-hover:opacity-100 transition-all duration-1000 transform translate-y-4 group-hover:translate-y-0 hidden sm:block">
          <div className="bg-[#02090E]/80 backdrop-blur-md border border-[#28E7FF]/20 p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#28E7FF] opacity-30 shadow-[0_0_8px_#28E7FF]" />

            <div className="text-[11px] font-black text-[#28E7FF] uppercase tracking-[0.5em] mb-8 flex items-center justify-between border-b border-[#28E7FF]/10 pb-4">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-[#6FC3DF]" />
                SHORTCUT_GUIDE
              </div>
              <span className="text-[#6FC3DF]/30">V1.0</span>
            </div>

            <div className="flex gap-10">
              {[
                { key: 'X', label: 'Slice', color: '#FF8F00' },
                { key: 'I', label: 'Mark', color: '#6FC3DF' },
                { key: 'DEL', label: 'Derez', color: '#FF8F00' },
              ].map((item) => (
                <div key={item.key} className="flex flex-col items-center gap-4 group/key">
                  <div
                    className="w-12 h-12 bg-[#02090E] border flex items-center justify-center text-[12px] font-black transform skew-x-[-12deg] transition-all shadow-[0_0_10px_rgba(255,255,255,0.05)] group-hover/key:shadow-[0_0_20px_var(--hover-color)]"
                    style={{
                      borderColor: `${item.color}40`,
                      color: item.color,
                      ['--hover-color' as any]: item.color
                    }}
                  >
                    <div className="transform skew-x-[12deg]">{item.key}</div>
                  </div>
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-[#28E7FF]/10 flex flex-col gap-3">
              <div className="flex items-center gap-4 text-[10px] text-[#6FC3DF]/40 font-black uppercase tracking-widest">
                <span className="w-6 h-[1px] bg-[#28E7FF] shadow-[0_0_5px_#28E7FF]" />
                <span>MOD_DRAG // POSITION</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-[#6FC3DF]/40 font-black uppercase tracking-widest">
                <span className="w-6 h-[1px] bg-[#28E7FF] shadow-[0_0_5px_#28E7FF]" />
                <span>MOD_SCROLL // MAGNIFY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
