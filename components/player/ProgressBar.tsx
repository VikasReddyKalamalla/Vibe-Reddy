'use client';

import React, { useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { seekAudio } from '@/lib/audio';
import { formatTime } from '@/lib/utils';

interface ProgressBarProps {
  variant?: 'mini' | 'full';
  showTime?: boolean;
}

export default function ProgressBar({ variant = 'mini', showTime = false }: ProgressBarProps) {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const barRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration === 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const seekTime = percentage * duration;
      seekAudio(seekTime);
    },
    [duration]
  );

  const handleDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.buttons !== 1 || !barRef.current || duration === 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const seekTime = percentage * duration;
      seekAudio(seekTime);
    },
    [duration]
  );

  if (variant === 'mini') {
    return (
      <div
        ref={barRef}
        className="seek-bar"
        onClick={handleSeek}
        onMouseMove={handleDrag}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
      >
        <div className="seek-bar-fill" style={{ width: `${progress}%` }} />
        <div className="seek-bar-thumb" style={{ left: `${progress}%` }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div
        ref={barRef}
        className="seek-bar"
        onClick={handleSeek}
        onMouseMove={handleDrag}
        style={{ height: '6px', marginBottom: showTime ? '8px' : '0' }}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
      >
        <div className="seek-bar-fill" style={{ width: `${progress}%` }} />
        <div className="seek-bar-thumb" style={{ left: `${progress}%`, opacity: 1 }} />
      </div>
      {showTime && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
        }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
}
