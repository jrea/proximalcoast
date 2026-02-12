
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface ZoomKeyframe {
  id: string;
  time: number; // Source Time (seconds)
  scale: number;
  x: number;
  y: number;
  ease: 'linear' | 'ease-in-out' | 'step';
}

export interface VideoSegment {
  id: string;
  start: number; // Source Start Time
  end: number;   // Source End Time
}

export interface ExportSettings {
  width: number;
  height: number;
  targetSizeMB: number | null; // null means auto/high quality
  bitrate: number; // kbps
}

export interface PlayerState {
  // Video Source
  videoSrc: string | null;
  audioSrc: string | null;
  sourceDuration: number;
  videoWidth: number;
  videoHeight: number;

  // Segments
  segments: VideoSegment[];

  // Playback
  currentTime: number;
  isPlaying: boolean;
  isExporting: boolean;
  playbackRate: number;
  videoVolume: number;
  musicVolume: number;

  // Export Settings
  exportSettings: ExportSettings;
  isExportSettingsOpen: boolean;

  // Zoom Data
  keyframes: ZoomKeyframe[];
  selectedKeyframeId: string | null;
  selectedSegmentId: string | null;

  // Actions
  setVideo: (src: string, duration: number, width: number, height: number) => void;
  setAudio: (src: string) => void;
  setVideoVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setDuration: (duration: number) => void;
  play: () => void;
  pause: () => void;
  setIsExporting: (isExporting: boolean) => void;
  setExportSettings: (settings: Partial<ExportSettings>) => void;
  setIsExportSettingsOpen: (isOpen: boolean) => void;
  seek: (projectTime: number) => void;
  tick: (sourceTime: number) => void;

  // Segment CRUD
  splitSegment: () => void;
  deleteSegment: (id: string) => void;
  selectSegment: (id: string | null) => void;

  // Keyframe CRUD
  addKeyframe: () => void;
  updateKeyframe: (id: string, updates: Partial<ZoomKeyframe>) => void;
  upsertKeyframe: (updates: Partial<ZoomKeyframe>) => void;
  deleteKeyframe: (id: string) => void;
  selectKeyframe: (id: string | null) => void;

  // Helpers
  getProjectDuration: () => number;
  getSourceTime: (projectTime: number) => number;
  getProjectTime: (sourceTime: number) => number;
  getCurrentTransform: () => { scale: number; x: number; y: number };
}

// Helper: Linear Interpolation
const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};

// Helper: Easing
const easeInOutQuad = (t: number) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export const useRefocusStore = create<PlayerState>((set, get) => ({
  videoSrc: null,
  audioSrc: null,
  sourceDuration: 0,
  videoWidth: 0,
  videoHeight: 0,
  segments: [],
  currentTime: 0,
  isPlaying: false,
  isExporting: false,
  playbackRate: 1,
  videoVolume: 1,
  musicVolume: 0.5,
  exportSettings: {
    width: 1280,
    height: 720,
    targetSizeMB: null,
    bitrate: 5000,
  },
  isExportSettingsOpen: false,
  keyframes: [],
  selectedKeyframeId: null,
  selectedSegmentId: null,

  setVideo: (src, duration, width, height) => {
    const initialKeyframe: ZoomKeyframe = {
      id: uuidv4(),
      time: 0,
      scale: 1,
      x: 50,
      y: 50,
      ease: 'ease-in-out',
    };

    const initialSegment: VideoSegment = {
      id: uuidv4(),
      start: 0,
      end: duration
    };

    set({
      videoSrc: src,
      audioSrc: null,
      sourceDuration: duration,
      videoWidth: width,
      videoHeight: height,
      currentTime: 0,
      isPlaying: false,
      isExporting: false,
      keyframes: [initialKeyframe],
      segments: [initialSegment],
      selectedKeyframeId: null,
      selectedSegmentId: null,
      exportSettings: {
        width: width > 1280 ? 1280 : width,
        height: height > 720 ? 720 : height,
        targetSizeMB: null,
        bitrate: 5000,
      }
    });
  },

  setAudio: (src) => set({ audioSrc: src }),

  setVideoVolume: (volume) => set({ videoVolume: volume }),
  setMusicVolume: (volume) => set({ musicVolume: volume }),

  setDuration: (duration) => set({ sourceDuration: duration }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setExportSettings: (settings) => set((state) => ({
    exportSettings: { ...state.exportSettings, ...settings }
  })),
  setIsExportSettingsOpen: (isOpen) => set({ isExportSettingsOpen: isOpen }),

  seek: (projectTime) => {
    const duration = get().getProjectDuration();
    const newTime = Math.max(0, Math.min(projectTime, duration));

    // When seeking manually, do we intentionally deselect keyframes to allow auto-keyframing at new pos?
    // Probably yes, unless user explicitly clicked a keyframe (which sets selection).
    // But seek() is called by Timeline click.
    // Let's clear selection on seek to be safe, so subsequent edits create new keyframes.
    // UNLESS the user clicked a Keyframe dot, which calls selectKeyframe() AND seek().
    // We should let selectKeyframe win.
    // So seek() itself shouldn't aggressively clear, but let's see.
    set({ currentTime: newTime });
  },

  tick: (sourceTime) => {
    const { selectedKeyframeId, keyframes, getProjectTime } = get();

    // Auto-deselect if playback drifts
    let newSelectedId = selectedKeyframeId;
    if (selectedKeyframeId) {
      const kf = keyframes.find(k => k.id === selectedKeyframeId);
      if (kf && Math.abs(kf.time - sourceTime) > 0.1) {
        newSelectedId = null;
      }
    }

    // Map Source Time -> Project Time for UI updates
    const projectTime = getProjectTime(sourceTime);
    if (projectTime !== -1) {
      set({ currentTime: projectTime, selectedKeyframeId: newSelectedId });
    }
  },

  // --- Segments ---

  splitSegment: () => {
    const { segments, currentTime, getSourceTime } = get();
    const sourceTime = getSourceTime(currentTime);

    // Find segment containing this source time
    const segmentIndex = segments.findIndex(s => sourceTime >= s.start && sourceTime < s.end);
    if (segmentIndex === -1) return;

    const segment = segments[segmentIndex];

    // Don't split if too close to edges (< 0.1s)
    if (sourceTime - segment.start < 0.1 || segment.end - sourceTime < 0.1) return;

    const newSegment1: VideoSegment = {
      ...segment,
      end: sourceTime
    };
    const newSegment2: VideoSegment = {
      id: uuidv4(),
      start: sourceTime,
      end: segment.end
    };

    const newSegments = [...segments];
    newSegments.splice(segmentIndex, 1, newSegment1, newSegment2);

    set({ segments: newSegments, selectedSegmentId: newSegment2.id });
  },

  deleteSegment: (id) => {
    const { segments } = get();
    if (segments.length <= 1) return; // Don't delete the last segment (or clear video?)

    const newSegments = segments.filter(s => s.id !== id);
    set({ segments: newSegments, selectedSegmentId: null, currentTime: 0 }); // Reset time to avoid invalid state
  },

  selectSegment: (id) => set({ selectedSegmentId: id }),

  // --- Keyframes ---

  addKeyframe: () => {
    const { currentTime, keyframes, getCurrentTransform, getSourceTime } = get();
    const sourceTime = getSourceTime(currentTime);

    const existing = keyframes.find(k => Math.abs(k.time - sourceTime) < 0.05);
    if (existing) {
      set({ selectedKeyframeId: existing.id });
      return;
    }

    const currentTransform = getCurrentTransform();

    const newKeyframe: ZoomKeyframe = {
      id: uuidv4(),
      time: sourceTime,
      scale: currentTransform.scale,
      x: currentTransform.x,
      y: currentTransform.y,
      ease: 'ease-in-out',
    };

    const updatedKeyframes = [...keyframes, newKeyframe].sort((a, b) => a.time - b.time);

    set({
      keyframes: updatedKeyframes,
      selectedKeyframeId: newKeyframe.id
    });
  },

  updateKeyframe: (id, updates) => {
    const { keyframes } = get();
    const updatedKeyframes = keyframes.map(k =>
      k.id === id ? { ...k, ...updates } : k
    ).sort((a, b) => a.time - b.time);

    set({ keyframes: updatedKeyframes });
  },

  upsertKeyframe: (updates) => {
    const { selectedKeyframeId, keyframes, currentTime, getSourceTime, getCurrentTransform } = get();

    // 1. If we have a selected keyframe, update it.
    if (selectedKeyframeId) {
      const updatedKeyframes = keyframes.map(k =>
        k.id === selectedKeyframeId ? { ...k, ...updates } : k
      ).sort((a, b) => a.time - b.time);
      set({ keyframes: updatedKeyframes });
      return;
    }

    // 2. No selection. Check if a keyframe exists nearby?
    const sourceTime = getSourceTime(currentTime);
    const existing = keyframes.find(k => Math.abs(k.time - sourceTime) < 0.05);

    if (existing) {
      // Update existing (and select it?)
      // Yes, implicit selection makes sense
      const updatedKeyframes = keyframes.map(k =>
        k.id === existing.id ? { ...k, ...updates } : k
      ).sort((a, b) => a.time - b.time);
      set({ keyframes: updatedKeyframes, selectedKeyframeId: existing.id });
      return;
    }

    // 3. Create new keyframe
    const currentTransform = getCurrentTransform();
    const newKeyframe: ZoomKeyframe = {
      id: uuidv4(),
      time: sourceTime,
      scale: currentTransform.scale,
      x: currentTransform.x,
      y: currentTransform.y,
      ease: 'ease-in-out',
      ...updates // Override with new values
    };

    const updatedKeyframes = [...keyframes, newKeyframe].sort((a, b) => a.time - b.time);

    set({
      keyframes: updatedKeyframes,
      selectedKeyframeId: newKeyframe.id
    });
  },

  deleteKeyframe: (id) => {
    set((state) => ({
      keyframes: state.keyframes.filter(k => k.id !== id),
      selectedKeyframeId: state.selectedKeyframeId === id ? null : state.selectedKeyframeId
    }));
  },

  selectKeyframe: (id) => set({ selectedKeyframeId: id }),

  // --- Helpers ---

  getProjectDuration: () => {
    const { segments } = get();
    return segments.reduce((acc, s) => acc + (s.end - s.start), 0);
  },

  getSourceTime: (projectTime) => {
    const { segments } = get();
    let currentP = 0;

    for (const seg of segments) {
      const duration = seg.end - seg.start;
      // Check if projectTime falls within this segment's project duration
      if (projectTime >= currentP && projectTime <= currentP + duration) {
        return seg.start + (projectTime - currentP);
      }
      currentP += duration;
    }
    // Fallback: End of last segment
    if (segments.length > 0) {
      return segments[segments.length - 1].end;
    }
    return 0;
  },

  getProjectTime: (sourceTime) => {
    const { segments } = get();
    let currentP = 0;

    for (const seg of segments) {
      const duration = seg.end - seg.start;
      // Check if sourceTime is within this segment
      if (sourceTime >= seg.start && sourceTime <= seg.end) {
        return currentP + (sourceTime - seg.start);
      }
      currentP += duration;
    }
    return -1; // Not in any active segment
  },

  getCurrentTransform: () => {
    const { currentTime, keyframes, getSourceTime, getProjectTime } = get();
    const sourceTime = getSourceTime(currentTime);

    // Filter out keyframes that are effectively "deleted" (not in any active segment)
    // This allows keyframes to span across cuts smoothly.
    const activeKeyframes = keyframes.filter(k => getProjectTime(k.time) !== -1);

    if (activeKeyframes.length === 0) return { scale: 1, x: 50, y: 50 };

    let prevKeyframe = activeKeyframes[0];
    let nextKeyframe = activeKeyframes[activeKeyframes.length - 1];

    if (sourceTime < activeKeyframes[0].time) {
      return {
        scale: activeKeyframes[0].scale,
        x: activeKeyframes[0].x,
        y: activeKeyframes[0].y
      };
    }

    // Find bounding keyframes
    for (let i = 0; i < activeKeyframes.length; i++) {
      if (activeKeyframes[i].time <= sourceTime) {
        prevKeyframe = activeKeyframes[i];
      } else {
        nextKeyframe = activeKeyframes[i];
        break;
      }
    }

    // If sourceTime is past the last keyframe
    if (sourceTime >= prevKeyframe.time && prevKeyframe === activeKeyframes[activeKeyframes.length - 1]) {
      return {
        scale: prevKeyframe.scale,
        x: prevKeyframe.x,
        y: prevKeyframe.y
      };
    }

    const duration = nextKeyframe.time - prevKeyframe.time;

    if (duration <= 0) return { scale: prevKeyframe.scale, x: prevKeyframe.x, y: prevKeyframe.y };

    const progress = (sourceTime - prevKeyframe.time) / duration;

    // Clamp progress to 0-1 just in case
    const safeProgress = Math.max(0, Math.min(1, progress));

    let t = safeProgress;
    if (prevKeyframe.ease === 'ease-in-out') {
      t = easeInOutQuad(safeProgress);
    } else if (prevKeyframe.ease === 'step') {
      t = 0;
    }

    return {
      scale: lerp(prevKeyframe.scale, nextKeyframe.scale, t),
      x: lerp(prevKeyframe.x, nextKeyframe.x, t),
      y: lerp(prevKeyframe.y, nextKeyframe.y, t),
    };
  }
}));
