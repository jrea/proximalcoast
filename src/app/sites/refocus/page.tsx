
'use client';

import React, { useState } from 'react';
import { useRefocusStore } from './_store/store';
import { VideoPreview } from './_components/video-preview';
import { Timeline } from './_components/timeline';
import { PropertiesPanel } from './_components/properties-panel';
import { AudioPlayer } from './_components/audio-player';
import { UploadCloud } from 'lucide-react';

export default function RefocusPage() {
  const videoSrc = useRefocusStore((state) => state.videoSrc);
  const setVideo = useRefocusStore((state) => state.setVideo);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      // Create a temporary video element to get duration
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
        className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-8"
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            const tempVideo = document.createElement('video');
            tempVideo.preload = 'metadata';
            tempVideo.onloadedmetadata = () => {
              setVideo(url, tempVideo.duration);
            };
            tempVideo.src = url;
          }
        }}
      >
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Refocus</h1>
        <p className="text-neutral-400 mb-8">Video Zoom Editor</p>

        <label className="flex flex-col items-center justify-center w-full max-w-lg h-64 border-2 border-neutral-800 border-dashed rounded-xl cursor-pointer hover:bg-neutral-900/50 hover:border-neutral-600 transition-all group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-12 h-12 mb-4 text-neutral-600 group-hover:text-blue-500 transition-colors" />
            <p className="mb-2 text-sm text-neutral-400"><span className="font-semibold text-white">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-neutral-500">MP4, MOV up to 100MB</p>
          </div>
          <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
        </label>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full bg-black text-white flex flex-col overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      {/* Header */}
      <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950">
        <div className="font-bold tracking-tight flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full" /> Refocus
        </div>
        <div className="flex items-center gap-4">
          <button className="text-xs font-medium bg-white text-black px-3 py-1.5 rounded hover:bg-neutral-200" onClick={() => window.location.reload()}>
            New Project
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Viewport */}
        <div className="flex-1 flex flex-col min-w-0 bg-neutral-950/50 relative">
          <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
            <div className="aspect-video w-full max-w-5xl bg-black rounded shadow-2xl relative">
              <VideoPreview />
            </div>
          </div>

          {/* Timeline Area */}
          <div className="h-auto shrink-0 z-10">
            <Timeline />
            <AudioPlayer />
          </div>
        </div>

        {/* Right: Properties */}
        <PropertiesPanel />
      </div>
    </div>
  );
}
