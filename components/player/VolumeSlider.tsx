'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { setAudioVolume } from '@/lib/audio';

export default function VolumeSlider() {
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const [showSlider, setShowSlider] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveVolume = isMuted ? 0 : volume;

  const handleVolumeChange = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newVolume = Math.max(0, Math.min(1, x / rect.width));
      setVolume(newVolume);
      setAudioVolume(newVolume);
    },
    [setVolume]
  );

  const handleVolumeDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      handleVolumeChange(e);
    },
    [handleVolumeChange]
  );

  const VolumeIcon = isMuted || effectiveVolume === 0
    ? VolumeX
    : effectiveVolume < 0.5
      ? Volume1
      : Volume2;

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        className="btn-control"
        onClick={() => {
          toggleMute();
          if (typeof window !== 'undefined') {
            const { Howler } = require('howler');
            Howler.volume(isMuted ? volume : 0);
          }
        }}
        title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon size={18} />
      </button>

      <div
        style={{
          width: showSlider ? '80px' : '0px',
          overflow: 'hidden',
          transition: 'width 0.2s ease',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '4px',
            background: 'var(--border)',
            borderRadius: '2px',
            cursor: 'pointer',
            position: 'relative',
          }}
          onClick={handleVolumeChange}
          onMouseMove={handleVolumeDrag}
          role="slider"
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(effectiveVolume * 100)}
          tabIndex={0}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${effectiveVolume * 100}%`,
              background: 'var(--accent)',
              borderRadius: '2px',
              transition: 'width 0.1s',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: `${effectiveVolume * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '10px',
              height: '10px',
              background: 'var(--accent)',
              borderRadius: '50%',
              opacity: showSlider ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
          />
        </div>
      </div>
    </div>
  );
}
