'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { playTrack, pauseAudio, resumeAudio } from '@/lib/audio';

interface ControlsProps {
  size?: 'sm' | 'md' | 'lg';
  showShuffle?: boolean;
  showRepeat?: boolean;
}

export default function Controls({ size = 'md', showShuffle = true, showRepeat = true }: ControlsProps) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);

  const iconSizes = { sm: 16, md: 20, lg: 24 };
  const playIconSizes = { sm: 20, md: 28, lg: 36 };
  const playBtnSizes = { sm: 36, md: 48, lg: 60 };
  const iconSize = iconSizes[size];
  const playIconSize = playIconSizes[size];
  const playBtnSize = playBtnSizes[size];

  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const handleNext = () => {
    const state = usePlayerStore.getState();
    state.next();
    const newState = usePlayerStore.getState();
    if (newState.currentTrack && newState.currentTrack.id !== currentTrack?.id) {
      playTrack(newState.currentTrack);
    }
  };

  const handlePrev = () => {
    const state = usePlayerStore.getState();
    state.prev();
    const newState = usePlayerStore.getState();
    if (newState.currentTrack) {
      playTrack(newState.currentTrack);
    }
  };

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: size === 'lg' ? '16px' : size === 'md' ? '12px' : '8px',
    }}>
      {showShuffle && (
        <button
          className={`btn-control ${isShuffle ? 'active' : ''}`}
          onClick={toggleShuffle}
          title="Shuffle (S)"
          aria-label="Toggle shuffle"
        >
          <Shuffle size={iconSize} />
        </button>
      )}

      <button
        className="btn-control"
        onClick={handlePrev}
        title="Previous (Shift+←)"
        aria-label="Previous track"
      >
        <SkipBack size={iconSize} fill="currentColor" />
      </button>

      <button
        className="btn-play"
        onClick={handlePlayPause}
        style={{ width: playBtnSize, height: playBtnSize }}
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="pause"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Pause size={playIconSize} fill="white" />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Play size={playIconSize} fill="white" style={{ marginLeft: '2px' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <button
        className="btn-control"
        onClick={handleNext}
        title="Next (Shift+→)"
        aria-label="Next track"
      >
        <SkipForward size={iconSize} fill="currentColor" />
      </button>

      {showRepeat && (
        <button
          className={`btn-control ${repeatMode !== 'none' ? 'active' : ''}`}
          onClick={cycleRepeat}
          title={`Repeat: ${repeatMode} (R)`}
          aria-label={`Repeat mode: ${repeatMode}`}
        >
          <RepeatIcon size={iconSize} />
        </button>
      )}
    </div>
  );
}
