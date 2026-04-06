'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { pauseAudio, resumeAudio, seekAudio, playTrack } from '@/lib/audio';

export default function PlayerBar() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const isFullPlayerOpen = usePlayerStore((s) => s.isFullPlayerOpen);
  const toggleFullPlayer = usePlayerStore((s) => s.toggleFullPlayer);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const tracks = useLibraryStore((s) => s.tracks);

  if (!currentTrack || isFullPlayerOpen) return null;

  const isFavorite = tracks.find((t) => t.id === currentTrack.id)?.favorite ?? false;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = usePlayerStore.getState();
    const prevId = state.currentTrack?.id;
    state.next();
    const newState = usePlayerStore.getState();
    if (newState.currentTrack && newState.currentTrack.id !== prevId) {
      playTrack(newState.currentTrack);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = usePlayerStore.getState();
    state.prev();
    const newState = usePlayerStore.getState();
    if (newState.currentTrack) {
      playTrack(newState.currentTrack);
    }
  };
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) pauseAudio();
    else resumeAudio();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    seekAudio((val / 100) * duration);
  };

  return (
    <div 
      onClick={toggleFullPlayer}
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(90vw, 480px)',
        zIndex: 50,
        background: '#f8f8f8',
        borderRadius: '12px',
        padding: '12px 24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        color: '#1a1a1a',
      }}
    >
      {/* Time and Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, opacity: 0.6 }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      {/* Custom Progress Bar */}
      <div style={{ position: 'relative', width: '100%', height: 16, display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            height: 2,
            background: '#ddd',
            accentColor: '#1a1a1a',
            cursor: 'pointer',
            zIndex: 2
          }}
        />
        {/* Handle square visualization could be added here if needed to perfectly match image 2 */}
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
        <button style={{ background: 'none', border: 'none', color: '#1a1a1a', cursor: 'pointer' }}>
          <Volume2 size={18} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button 
            onClick={handlePrev}
            style={{ background: 'none', border: 'none', color: '#1a1a1a', cursor: 'pointer' }}
          >
            <SkipBack size={20} fill="#1a1a1a" />
          </button>
          
          <button 
            onClick={handlePlayPause}
            style={{ 
              width: 40, 
              height: 40, 
              background: '#1a1a1a', 
              borderRadius: '8px', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" style={{ marginLeft: 2 }} />}
          </button>

          <button 
            onClick={handleNext}
            style={{ background: 'none', border: 'none', color: '#1a1a1a', cursor: 'pointer' }}
          >
            <SkipForward size={20} fill="#1a1a1a" />
          </button>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(currentTrack.id); }}
          style={{ background: 'none', border: 'none', color: isFavorite ? '#ff4d8d' : '#1a1a1a', cursor: 'pointer' }}
        >
          <Heart size={18} fill={isFavorite ? '#ff4d8d' : 'none'} />
        </button>
      </div>
      
      {/* Hidden Track title indicator for mini-player logic (optional) */}
      <div style={{ position: 'absolute', top: -30, left: 0, right: 0, textAlign: 'center', opacity: 0.8, pointerEvents: 'none' }}>
        <p style={{ fontSize: 13, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          Playing: <b>{currentTrack.title}</b>
        </p>
      </div>
    </div>
  );
}
