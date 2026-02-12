
'use client';

import React, { useEffect, useRef } from 'react';
import { useRefocusStore } from '../_store/store';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const audioSrc = useRefocusStore((state) => state.audioSrc);
  const isPlaying = useRefocusStore((state) => state.isPlaying);
  const musicVolume = useRefocusStore((state) => state.musicVolume);
  // We need to subscribe to currentTime to handle drifts and seeks
  const currentTime = useRefocusStore((state) => state.currentTime);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    if (isPlaying && audio.paused) {
      audio.play().catch(console.error);
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    // Sync Check
    // This runs on every tick from the store (which is driven by VideoPreview loop)
    // So ~60 times a second if playing.
    // If store says 5.0 and audio is 5.0, good.
    // If store says 10.0 (jumped gap) and audio is 5.0, we MUST seek.

    const diff = Math.abs(audio.currentTime - currentTime);

    // If difference is large (> 0.2s), snap to it.
    // Small drifts are natural, but gaps are large.
    if (diff > 0.2) {
      audio.currentTime = currentTime;
    }
  }, [currentTime, audioSrc]);

  if (!audioSrc) return null;

  return (
    <audio
      ref={audioRef}
      id="slice-music-player"
      src={audioSrc}
      preload="auto"
      crossOrigin="anonymous"
      className="hidden" // Headless player
    />
  );
}
