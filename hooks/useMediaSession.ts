'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { seekAudio } from '@/lib/audio';

export function useMediaSession(): void {
  const positionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const unsubscribe = usePlayerStore.subscribe((state, prevState) => {
      // Update metadata when track changes
      if (state.currentTrack && state.currentTrack.id !== prevState.currentTrack?.id) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: state.currentTrack.title,
          artist: state.currentTrack.artist,
          album: state.currentTrack.album,
          artwork: [
            { src: state.currentTrack.cover, sizes: '96x96', type: 'image/jpeg' },
            { src: state.currentTrack.cover, sizes: '256x256', type: 'image/jpeg' },
            { src: state.currentTrack.cover, sizes: '512x512', type: 'image/jpeg' },
          ],
        });
      }

      // Update playback state
      if (state.isPlaying !== prevState.isPlaying) {
        navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
      }
    });

    // Register action handlers
    navigator.mediaSession.setActionHandler('play', () => {
      usePlayerStore.getState().resume();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      usePlayerStore.getState().pause();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      usePlayerStore.getState().next();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      usePlayerStore.getState().prev();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seekAudio(details.seekTime);
      }
    });

    navigator.mediaSession.setActionHandler('seekforward', () => {
      const state = usePlayerStore.getState();
      seekAudio(Math.min(state.currentTime + 10, state.duration));
    });

    navigator.mediaSession.setActionHandler('seekbackward', () => {
      const state = usePlayerStore.getState();
      seekAudio(Math.max(state.currentTime - 10, 0));
    });

    // Update position state every second
    positionIntervalRef.current = setInterval(() => {
      const state = usePlayerStore.getState();
      if (state.isPlaying && state.currentTrack) {
        navigator.mediaSession.setPositionState({
          duration: state.duration,
          playbackRate: 1,
          position: state.currentTime,
        });
      }
    }, 1000);

    return () => {
      unsubscribe();
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    };
  }, []);
}
