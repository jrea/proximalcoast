
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRefocusStore } from '../_store/store';
import { cn } from '@/lib/utils';
import { Command, MousePointer2 } from 'lucide-react';

export function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for interaction
  const [isHovering, setIsHovering] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Subscribe to changes
  const videoSrc = useRefocusStore((state) => state.videoSrc);
  const isPlaying = useRefocusStore((state) => state.isPlaying);
  const videoVolume = useRefocusStore((state) => state.videoVolume);
  const segments = useRefocusStore((state) => state.segments); // for gap jumping

  // Actions
  const play = useRefocusStore((state) => state.play);
  const pause = useRefocusStore((state) => state.pause);
  const splitSegment = useRefocusStore((state) => state.splitSegment);
  const addKeyframe = useRefocusStore((state) => state.addKeyframe);
  const deleteSegment = useRefocusStore((state) => state.deleteSegment);
  const selectedSegmentId = useRefocusStore((state) => state.selectedSegmentId);
  const updateKeyframe = useRefocusStore((state) => state.updateKeyframe);
  const getKeyframeAtCurrentTime = () => {
    // Helper to find the keyframe responsible for current state to allow editing
    // Ideally, we find the CLOSEST keyframe (within threshold?) or just add a new one if none?
    // For "Scroll to scale", typically you want to influence the *current* zoom. 
    // If there is no keyframe, it creates one. If there is, it updates it.
    // BUT, store.addKeyframe logic handles "find existing or create new".
    // So we can technically just call updators IF we know the ID, or use addKeyframe logic.
    // Let's create a custom action in store or just use existing.
    // Since `addKeyframe` updates `selectedKeyframeId`, we can call that, then update.
    return useRefocusStore.getState().selectedKeyframeId;
  };


  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input is focused
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
          const selKey = useRefocusStore.getState().selectedKeyframeId;
          if (selSeg) deleteSegment(selSeg);
          // if (selKey) deleteKeyframe(selKey); // Ambiguous if both selected?
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // --- Mouse Interaction (Scale/Pan) ---

  const handleWheel = (e: React.WheelEvent) => {
    if (!videoSrc) return;
    // e.deltaY > 0 means scale DOWN, < 0 means scale UP
    const store = useRefocusStore.getState();
    const { currentTime, keyframes, getSourceTime } = store;

    // Logic: 
    // 1. Find or Create Keyframe at current time
    store.addKeyframe(); // This selects it or creates it

    // 2. Get the new selected keyframe
    const newId = useRefocusStore.getState().selectedKeyframeId;
    if (!newId) return;

    const kf = useRefocusStore.getState().keyframes.find(k => k.id === newId);
    if (!kf) return;

    // 3. Calc new scale
    const delta = e.deltaY * -0.001; // Sensitivity
    const newScale = Math.max(1, Math.min(10, kf.scale + delta));

    updateKeyframe(newId, { scale: newScale });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !videoSrc) return;
    isDragging.current = true;

    // Ensure we have a keyframe to edit
    useRefocusStore.getState().addKeyframe(); // Select/Create
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

    // Calculate Delta
    // Need to sense container size to map pixels to %?
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Movement in %
    // Moving mouse RIGHT should move Pan X (Focus Point) RIGHT?
    // or Drag the VIDEO?
    // Typically "Grab and Move" means dragging the content.
    // If I drag content RIGHT, the focus point moves LEFT relative to content.
    // Let's assume natural dragging (drag video).
    // Drag Video Right -> Transform X moves + ?
    // Transform is `translate(50 - x)`. 
    // If x gets SMALLER, translate gets BIGGER (Right).
    // So dragging Right -> x should decrease.

    // Sensitivity: 100% = full width.
    const deltaX_px = e.clientX - dragStart.current.x;
    const deltaY_px = e.clientY - dragStart.current.y;

    const deltaX_pct = (deltaX_px / rect.width) * 100;
    const deltaY_pct = (deltaY_px / rect.height) * 100;

    // Inverse for natural drag
    const newX = dragStart.current.panX - deltaX_pct;
    const newY = dragStart.current.panY - deltaY_pct;

    updateKeyframe(id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };


  // --- Export Logic ---
  const isExporting = useRefocusStore((state) => state.isExporting);
  const setIsExporting = useRefocusStore((state) => state.setIsExporting);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!isExporting || !videoRef.current) return;

    const video = videoRef.current;

    // Create canvas if needed (we use a hidden one for export)
    // Actually we need to explicitly create one or use a ref.
    // Let's create one dynamically or use the ref if we add it to JSX.
    // We'll add a hidden canvas to JSX.
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("No canvas found");
      setIsExporting(false);
      return;
    }

    // Setup Export
    const store = useRefocusStore.getState();
    store.pause();
    store.seek(0); // Reset to start

    // Setup Canvas Resolution (match video)
    // Wait for video to be ready? It should be loaded.
    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Start Recorder
    const stream = canvas.captureStream(30); // 30 FPS
    const options = { mimeType: 'video/webm;codecs=vp9' };

    try {
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `refocus-export-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      recorder.start();
      store.play(); // Start Playback loop which will drive the render
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed: " + (err as any).message);
      setIsExporting(false);
    }

    return () => {
      // Cleanup if component unmounts mid-export
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isExporting]);

  // --- Playback Loop ---
  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      const video = videoRef.current;
      const container = containerRef.current;

      if (video && container) {
        const store = useRefocusStore.getState();
        const { currentTime, segments, getSourceTime, isExporting } = store;

        // We use store.isPlaying as the source of truth for "should be playing"
        const isStorePlaying = store.isPlaying;

        if (isStorePlaying) {
          let currentSourceTime = video.currentTime;

          // Check for manual seek (Video drift vs Store target)
          const expectedSourceTime = getSourceTime(currentTime);

          // If we drifted significantly, it's likely a user seek.
          // Reduced threshold to 0.25s to catch small scrubs, relying on epsilon to avoid gap false positives.
          if (Math.abs(expectedSourceTime - currentSourceTime) > 0.25) {
            video.currentTime = expectedSourceTime;
            // Crucial: Update our local time to match expected, ensuring we tick() with the NEW time,
            // not the old lagging video time. This handles browser async video updates.
            currentSourceTime = expectedSourceTime;
          }

          // Gap Jumping logic
          const currentSegmentIndex = segments.findIndex(s => currentSourceTime >= s.start && currentSourceTime < s.end);

          if (currentSegmentIndex !== -1) {
            const seg = segments[currentSegmentIndex];
            // Lookahead for end of segment (50ms)
            if (seg.end - currentSourceTime < 0.05) {
              const nextSegment = segments[currentSegmentIndex + 1];
              if (nextSegment) {
                // Jump to slightly inside the next segment to avoid boundary ambiguity
                const jumpTo = nextSegment.start + 0.01;
                video.currentTime = jumpTo;
                store.tick(jumpTo);
              } else {
                store.tick(currentSourceTime);
                if (currentSourceTime >= store.sourceDuration - 0.1) {
                  store.pause();
                  // Logic for Stop Export handled implicitly by store.pause() -> isPlaying false?
                  // We need to detect "End of Export"
                }
              }
            } else {
              store.tick(currentSourceTime);
            }
          } else {
            const nextSegment = segments.find(s => s.start > currentSourceTime);
            if (nextSegment) {
              const jumpTo = nextSegment.start + 0.01;
              video.currentTime = jumpTo;
              store.tick(jumpTo);
            } else {
              store.pause();
            }
          }
        } else {
          // Store is Paused. 
          // Sync Video Element to Store Time exactly.
          const targetSourceTime = getSourceTime(currentTime);
          // We use a small threshold to avoid fighting floating point
          if (Math.abs(video.currentTime - targetSourceTime) > 0.05) {
            video.currentTime = targetSourceTime;
          }

          // Also ensure video is actually paused (redundant to useEffect but safe)
          if (!video.paused) {
            video.pause();
          }

          // If Exporting ended (isPlaying -> false), stop recorder
          if (isExporting && !isStorePlaying && currentTime > 0) {
            // We paused, likely finished? Or user paused?
            // If we are at the end, stop recorder.
            // Assume pause during export = done.
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
          }
        }

        // Apply Transform
        const { scale, x, y } = store.getCurrentTransform();
        container.style.transform = `translate(${50 - x}%, ${50 - y}%) scale(${scale})`;

        // Render to Export Canvas if Exporting
        if (isExporting) {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx) {
            const w = canvas.width;
            const h = canvas.height;

            // Clear
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, w, h);

            // Apply Transform Matrix
            ctx.save();
            // 1. Center Origin
            ctx.translate(w / 2, h / 2);

            // 2. Apply Pan 
            // x,y are percentages of the container where focus is.
            // 50,50 is center.
            // If focus is 60,60 (right-down), we need to shift image LEFT-UP.
            // Translate X = (50 - x)% * Width
            // Translate Y = (50 - y)% * Height
            const panX = ((50 - x) / 100) * w;
            const panY = ((50 - y) / 100) * h;

            ctx.translate(panX, panY);

            // 3. Apply Scale
            ctx.scale(scale, scale);

            // 4. Draw Image Centered
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

  // Sync Volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = videoVolume;
    }
  }, [videoVolume]);

  // Sync Video Time (Aggressive)
  // Ensures scrubbing while paused updates the video frame immediately
  useEffect(() => {
    const unsub = useRefocusStore.subscribe((state) => {
      // Don't aggression sync if exporting, let loop handle it
      if (!state.isPlaying && !state.isExporting && videoRef.current) {
        const targetTime = state.getSourceTime(state.currentTime);
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.05) {
          videoRef.current.currentTime = targetTime;
        }
      }
    });
    return () => unsub();
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      useRefocusStore.getState().setDuration(videoRef.current.duration);
    }
  };

  if (!videoSrc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-lg text-neutral-500">
        <p className="mb-2 text-lg font-medium">No video selected</p>
        <p className="text-sm">Upload a video to get started</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden rounded-lg shadow-xl ring-1 ring-white/10 group select-none"
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
        style={{ transform: 'translate(0, 0) scale(1)' }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          className="max-w-full max-h-full object-contain pointer-events-none"
          playsInline
          // muted removed, controlled by volume
          onLoadedMetadata={handleLoadedMetadata}
          crossOrigin="anonymous"
        />
      </div>

      {/* Hidden Canvas for Export */}
      <canvas ref={canvasRef} className="hidden pointer-events-none" />

      {/* Exporting Overlay */}
      {isExporting && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-white">
          <div className="text-2xl font-bold mb-2">Rendering Video...</div>
          <div className="text-sm text-white/50">Please wait while the video plays through.</div>
        </div>
      )}

      {/* Overlay UI */}
      <div className={cn(
        "absolute top-4 left-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs text-white/50 font-mono pointer-events-none transition-opacity duration-300",
        isHovering && !isExporting ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="bg-white/20 px-1 rounded text-white">X</span> Split</span>
          <span className="flex items-center gap-1"><span className="bg-white/20 px-1 rounded text-white">I</span> Zoom</span>
          <span className="flex items-center gap-1"><span className="bg-white/20 px-1 rounded text-white">Ws</span> Scale</span>
          <span className="flex items-center gap-1"><MousePointer2 className="w-3 h-3" /> Pan</span>
        </div>
      </div>
    </div>
  );
}
