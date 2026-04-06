'use client';

import { useEffect, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { seekAudio } from '@/lib/audio';

export function useKeyboardShortcuts(): void {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable) {
      return;
    }

    const state = usePlayerStore.getState();

    switch (e.key) {
      case ' ':
        e.preventDefault();
        state.togglePlay();
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (e.shiftKey) {
          state.next();
        } else {
          const newTime = Math.min(state.currentTime + 5, state.duration);
          seekAudio(newTime);
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (e.shiftKey) {
          state.prev();
        } else {
          const newTime = Math.max(state.currentTime - 5, 0);
          seekAudio(newTime);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        state.setVolume(Math.min(state.volume + 0.05, 1));
        break;

      case 'ArrowDown':
        e.preventDefault();
        state.setVolume(Math.max(state.volume - 0.05, 0));
        break;

      case 'm':
      case 'M':
        e.preventDefault();
        state.toggleMute();
        break;

      case 'l':
      case 'L':
        e.preventDefault();
        state.toggleLyrics();
        break;

      case 'q':
      case 'Q':
        e.preventDefault();
        state.toggleQueue();
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        state.toggleFullPlayer();
        break;

      case 's':
      case 'S':
        e.preventDefault();
        state.toggleShuffle();
        break;

      case 'r':
      case 'R':
        e.preventDefault();
        state.cycleRepeat();
        break;

      case '/':
        e.preventDefault();
        const searchBar = document.getElementById('search-bar');
        if (searchBar) searchBar.focus();
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
