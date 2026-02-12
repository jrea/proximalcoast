
'use client';

import React from 'react';
import { useRefocusStore } from '../_store/store';
import { Trash2, ZoomIn, Video } from 'lucide-react';

export function PropertiesPanel() {
  const selectedKeyframeId = useRefocusStore((state) => state.selectedKeyframeId);
  const keyframes = useRefocusStore((state) => state.keyframes);
  // We use upsertKeyframe for auto-keyframing on changes
  const upsertKeyframe = useRefocusStore((state) => state.upsertKeyframe);
  const deleteKeyframe = useRefocusStore((state) => state.deleteKeyframe);
  const getCurrentTransform = useRefocusStore((state) => state.getCurrentTransform);

  const selectedKeyframe = keyframes.find((k) => k.id === selectedKeyframeId);

  // If no keyframe selected, we use the current interpolated values
  // This allows "Scrub & Edit" workflow
  const displayValues = selectedKeyframe
    ? { scale: selectedKeyframe.scale, x: selectedKeyframe.x, y: selectedKeyframe.y }
    : getCurrentTransform();

  const handleUpdate = (updates: { scale?: number, x?: number, y?: number }) => {
    upsertKeyframe(updates);
  };

  return (
    <div className="w-80 border-l border-neutral-800 bg-neutral-900 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <ZoomIn className="w-4 h-4 text-blue-500" />
          Zoom Properties
        </h2>

        {/* Only show delete if actually selected */}
        <div className="flex gap-2">
          <button
            onClick={() => upsertKeyframe({ scale: 1, x: 50, y: 50 })}
            className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded transition-colors"
            title="Reset Scale and Pan"
          >
            Reset All
          </button>
          {selectedKeyframe && (
            <button
              onClick={() => deleteKeyframe(selectedKeyframe.id)}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-500 transition-colors"
              title="Delete Keyframe"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Scale Control */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-neutral-400">Scale</label>
            <span className="text-xs font-mono bg-neutral-800 px-2 py-0.5 rounded text-white">
              {displayValues.scale.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={displayValues.scale}
            onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
            className="w-full accent-blue-500 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Position Controls (X/Y) */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-neutral-400">Focus Position</label>
            <button
              onClick={() => handleUpdate({ x: 50, y: 50 })}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Visual Joystick */}
          <div className="aspect-video bg-neutral-950 rounded border border-neutral-800 relative cursor-crosshair group overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            {/* Center marker */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-white/20 rounded-full" />

            {/* Draggable Handle Area (Overlay) */}
            <div
              className="absolute inset-0 z-10"
              onMouseMove={(e) => {
                if (e.buttons === 1) { // Left click drag
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  handleUpdate({ x, y });
                }
              }}
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                handleUpdate({ x, y });
              }}
            />

            {/* The Dot representing current X/Y */}
            <div
              className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
              style={{ left: `${displayValues.x}%`, top: `${displayValues.y}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Pan X (%)</label>
              <input
                type="number"
                value={Math.round(displayValues.x)}
                onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white font-mono focus:border-blue-500 transition-colors outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Pan Y (%)</label>
              <input
                type="number"
                value={Math.round(displayValues.y)}
                onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white font-mono focus:border-blue-500 transition-colors outline-none"
              />
            </div>
          </div>
        </div>

        {/* Audio Mix */}
        <div className="pt-4 border-t border-neutral-800 space-y-4">
          <h3 className="text-sm font-medium text-neutral-400">Audio Mix</h3>

          {/* Original Audio Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Original Video</span>
              <span>{(useRefocusStore.getState().videoVolume * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0" max="1" step="0.05"
              value={useRefocusStore((state) => state.videoVolume)}
              onChange={(e) => useRefocusStore.getState().setVideoVolume(parseFloat(e.target.value))}
              className="w-full accent-neutral-500 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Music</span>
              <span>{(useRefocusStore((state) => state.musicVolume) * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0" max="1" step="0.05"
              value={useRefocusStore((state) => state.musicVolume)}
              onChange={(e) => useRefocusStore.getState().setMusicVolume(parseFloat(e.target.value))}
              className="w-full accent-blue-500 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Easing (Future) */}
        <div className="pt-4 border-t border-neutral-800 opacity-50 pointer-events-none">
          <label className="text-sm font-medium text-neutral-400 mb-2 block">Easing</label>
          <div className="flex gap-2">
            <button className="flex-1 bg-neutral-800 py-1.5 rounded text-xs text-white border border-blue-500/50">Linear</button>
            <button className="flex-1 bg-neutral-800 py-1.5 rounded text-xs text-neutral-500">Ease Out</button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-neutral-800 text-[10px] text-neutral-600 font-mono text-center">
        {selectedKeyframe ? `ID: ${selectedKeyframe.id.slice(0, 8)}` : 'Interpolated (Auto-Key on Edit)'}
      </div>
    </div>
  );
}
