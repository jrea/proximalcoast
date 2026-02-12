'use client';

import React from 'react';
import { useRefocusStore } from '../_store/store';
import { Trash2, ZoomIn, Video, Crosshair, RefreshCcw, Sliders, Hash, Layers, Scissors, Disc, Activity } from 'lucide-react';

export function PropertiesPanel() {
  const selectedKeyframeId = useRefocusStore((state) => state.selectedKeyframeId);
  const keyframes = useRefocusStore((state) => state.keyframes);
  const upsertKeyframe = useRefocusStore((state) => state.upsertKeyframe);
  const deleteKeyframe = useRefocusStore((state) => state.deleteKeyframe);
  const getCurrentTransform = useRefocusStore((state) => state.getCurrentTransform);

  const selectedKeyframe = keyframes.find((k) => k.id === selectedKeyframeId);

  const displayValues = selectedKeyframe
    ? { scale: selectedKeyframe.scale, x: selectedKeyframe.x, y: selectedKeyframe.y }
    : getCurrentTransform();

  const handleUpdate = (updates: { scale?: number, x?: number, y?: number }) => {
    upsertKeyframe(updates);
  };

  return (
    <div className="w-[360px] border-l border-[#28E7FF]/20 bg-[#02090E] flex flex-col h-full font-mono selection:bg-[#28E7FF] selection:text-[#02090E]">
      {/* TRON Header Area */}
      <div className="p-6 border-b border-[#28E7FF]/20 flex flex-col gap-5 bg-[#02090E] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#28E7FF]/5 transform rotate-[45deg] translate-x-16 -translate-y-16 pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <h2 className="font-black text-white text-[12px] uppercase tracking-[0.4em] flex items-center gap-3">
            <Activity className="w-5 h-5 text-[#28E7FF] drop-shadow-[0_0_8px_#28E7FF]" />
            CTRL_PAD // GRID
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => upsertKeyframe({ scale: 1, x: 50, y: 50 })}
              className="w-10 h-10 bg-[#02090E] border border-[#28E7FF]/30 hover:border-[#28E7FF] text-[#28E7FF] transition-all flex items-center justify-center transform skew-x-[-12deg] shadow-[0_0_10px_rgba(40,231,255,0.1)]"
              title="Reset"
            >
              <RefreshCcw className="w-4 h-4 transform skew-x-[12deg]" />
            </button>
            {selectedKeyframe && (
              <button
                onClick={() => deleteKeyframe(selectedKeyframe.id)}
                className="w-10 h-10 bg-[#02090E] border border-[#FF8F00]/40 text-[#FF8F00] hover:bg-[#FF8F00] hover:text-[#02090E] transition-all flex items-center justify-center transform skew-x-[-12deg] shadow-[0_0_15px_rgba(255,143,0,0.1)]"
                title="Derez"
              >
                <Trash2 className="w-4 h-4 transform skew-x-[12deg]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-12 flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Optical Magnification */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-[#28E7FF]/10 pb-3">
            <label className="text-[10px] font-black text-[#6FC3DF]/60 uppercase tracking-[0.3em]">OPTICAL_ZOOM // MAG</label>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white italic tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {displayValues.scale.toFixed(2)}
              </span>
              <span className="text-[10px] font-black text-[#28E7FF] opacity-60">X</span>
            </div>
          </div>

          <div className="relative h-12 flex items-center group">
            <div className="absolute inset-x-0 h-[2px] bg-[#28E7FF]/10" />
            <div className="absolute h-[4px] bg-[#28E7FF] shadow-[0_0_15px_#28E7FF]" style={{ left: '0', width: `${((displayValues.scale - 1) / 9) * 100}%` }} />

            <input
              type="range"
              min="1"
              max="10"
              step="0.01"
              value={displayValues.scale}
              onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
              className="w-full absolute inset-0 opacity-0 cursor-ew-resize z-20"
            />

            {/* Blade Thumb */}
            <div
              className="pointer-events-none w-1 h-10 bg-white absolute top-1/2 -translate-y-1/2 -ml-[2px] z-10 shadow-[0_0_15px_white]"
              style={{ left: `${((displayValues.scale - 1) / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Spatial Axis Control */}
        <div className="space-y-6 border-t border-[#28E7FF]/10 pt-8">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-[#6FC3DF]/60 uppercase tracking-[0.3em] flex items-center gap-3">
              <Crosshair className="w-5 h-5 text-[#28E7FF]/40" /> SPATIAL_AXIS
            </label>
            <button
              onClick={() => handleUpdate({ x: 50, y: 50 })}
              className="text-[11px] text-white hover:text-[#28E7FF] transition-all font-black uppercase tracking-widest bg-[#28E7FF]/5 px-4 py-1 transform skew-x-[-12deg] border border-[#28E7FF]/20 hover:shadow-[0_0_15px_rgba(40,231,255,0.1)]"
            >
              <div className="transform skew-x-[12deg]">CENTER //</div>
            </button>
          </div>

          <div className="relative">
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t border-l border-[#28E7FF]/60" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b border-r border-[#FF8F00]/60" />

            <div className="aspect-square w-full bg-[#01060a] border border-[#28E7FF]/20 relative cursor-crosshair group overflow-hidden shadow-inner">
              {/* Micro Grid */}
              <div className="absolute inset-0 opacity-[0.05] bg-[size:25px_25px] [background-image:linear-gradient(to_right,rgba(40,231,255,1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(40,231,255,1)_1px,transparent_1px)]" />

              <div
                className="absolute inset-0 z-10"
                onMouseMove={(e) => {
                  if (e.buttons === 1) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
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

              {/* Reticle */}
              <div
                className="absolute w-12 h-12 pointer-events-none transition-all duration-75 flex items-center justify-center"
                style={{ left: `${displayValues.x}%`, top: `${displayValues.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="absolute w-full h-[1px] bg-[#28E7FF]/40 border-b border-[#28E7FF]/10 shadow-[0_0_8px_rgba(40,231,255,0.2)]" />
                <div className="absolute h-full w-[1px] bg-[#28E7FF]/40 border-r border-[#28E7FF]/10 shadow-[0_0_8px_rgba(40,231,255,0.2)]" />
                <div className="w-2 h-2 rounded-full border border-[#28E7FF] bg-white shadow-[0_0_20px_#28E7FF]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#02090E] border border-[#28E7FF]/10 p-4 transform skew-x-[-12deg] hover:border-[#28E7FF]/60 transition-all group">
              <div className="transform skew-x-[12deg] flex flex-col gap-1">
                <span className="text-[10px] text-[#6FC3DF]/40 uppercase font-black group-hover:text-[#6FC3DF]/80 transition-colors">LONG_X //</span>
                <span className="text-2xl font-black text-white italic tracking-tighter drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">{Math.round(displayValues.x)}</span>
              </div>
            </div>
            <div className="bg-[#02090E] border border-[#28E7FF]/10 p-4 transform skew-x-[-12deg] hover:border-[#28E7FF]/60 transition-all group">
              <div className="transform skew-x-[12deg] flex flex-col gap-1">
                <span className="text-[10px] text-[#6FC3DF]/40 uppercase font-black group-hover:text-[#6FC3DF]/80 transition-colors">LAT_Y //</span>
                <span className="text-2xl font-black text-white italic tracking-tighter drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]">{Math.round(displayValues.y)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amplitude Mixer */}
        <div className="pt-8 border-t border-[#28E7FF]/10 space-y-8">
          <h3 className="text-[10px] font-black text-[#6FC3DF]/60 uppercase tracking-[0.4em] flex items-center gap-3">
            <Disc className="w-5 h-5 text-[#28E7FF]/40" /> AMP_SIGNAL_MIX //
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] text-[#6FC3DF]/40 font-black uppercase tracking-widest italic">VIDEO_AUDIO //</span>
              <span className="text-[10px] font-black text-[#28E7FF] tracking-widest font-mono drop-shadow-[0_0_5px_rgba(40,231,255,0.3)]">{(useRefocusStore.getState().videoVolume * 100).toFixed(0)}dB</span>
            </div>
            <div className="relative h-1 bg-[#28E7FF]/10">
              <div className="absolute h-full bg-[#28E7FF] shadow-[0_0_15px_#28E7FF]" style={{ width: `${useRefocusStore.getState().videoVolume * 100}%` }} />
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={useRefocusStore((state) => state.videoVolume)}
                onChange={(e) => useRefocusStore.getState().setVideoVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] text-[#FF8F00]/40 font-black uppercase tracking-widest italic">MUSIC_VOLUME //</span>
              <span className="text-[10px] font-black text-[#FF8F00] tracking-widest font-mono drop-shadow-[0_0_5px_rgba(255,143,0,0.3)]">{(useRefocusStore((state) => state.musicVolume) * 100).toFixed(0)}dB</span>
            </div>
            <div className="relative h-1 bg-[#FF8F00]/10">
              <div className="absolute h-full bg-[#FF8F00] shadow-[0_0_15px_#FF8F00]" style={{ width: `${useRefocusStore.getState().musicVolume * 100}%` }} />
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={useRefocusStore((state) => state.musicVolume)}
                onChange={(e) => useRefocusStore.getState().setMusicVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#28E7FF]/5 border-t border-[#28E7FF]/10 text-[10px] text-[#6FC3DF]/30 font-black text-center tracking-[0.5em] uppercase">
        MOD_CORE // SEQUENCER_GRID
      </div>
    </div>
  );
}
