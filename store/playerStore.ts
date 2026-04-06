'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track, RepeatMode } from '@/lib/types';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  duration: number;
  currentTime: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  queue: Track[];
  queueIndex: number;
  queueHistory: Track[];
  isFullPlayerOpen: boolean;
  isQueueOpen: boolean;
  isLyricsOpen: boolean;

  // Actions
  setTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  next: () => void;
  prev: () => void;
  setRepeat: (mode: RepeatMode) => void;
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  addToQueue: (track: Track) => void;
  addToQueueNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  playFromQueue: (index: number) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToHistory: (track: Track) => void;
  toggleFullPlayer: () => void;
  toggleQueue: () => void;
  toggleLyrics: () => void;
  setFullPlayerOpen: (open: boolean) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      volume: 0.75,
      isMuted: false,
      duration: 0,
      currentTime: 0,
      repeatMode: 'none',
      isShuffle: false,
      queue: [],
      queueIndex: -1,
      queueHistory: [],
      isFullPlayerOpen: false,
      isQueueOpen: false,
      isLyricsOpen: false,

      setTrack: (track) => {
        const state = get();
        if (state.currentTrack) {
          set((s) => ({
            queueHistory: [state.currentTrack!, ...s.queueHistory].slice(0, 50),
          }));
        }
        set({
          currentTrack: track,
          currentTime: 0,
          duration: track.duration,
        });
      },

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      resume: () => set({ isPlaying: true }),

      togglePlay: () => {
        const state = get();
        if (state.currentTrack) {
          set({ isPlaying: !state.isPlaying });
        }
      },

      seek: (time) => {
        const state = get();
        const clampedTime = Math.max(0, Math.min(time, state.duration));
        set({ currentTime: clampedTime });
      },

      setVolume: (volume) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
      },

      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

      next: () => {
        const state = get();
        if (state.queue.length === 0) return;

        let nextIndex: number;

        if (state.repeatMode === 'one') {
          set({ currentTime: 0 });
          return;
        }

        if (state.isShuffle) {
          nextIndex = Math.floor(Math.random() * state.queue.length);
        } else {
          nextIndex = state.queueIndex + 1;
          if (nextIndex >= state.queue.length) {
            if (state.repeatMode === 'all') {
              nextIndex = 0;
            } else {
              set({ isPlaying: false });
              return;
            }
          }
        }

        const nextTrack = state.queue[nextIndex];
        if (nextTrack) {
          if (state.currentTrack) {
            set((s) => ({
              queueHistory: [state.currentTrack!, ...s.queueHistory].slice(0, 50),
            }));
          }
          set({
            currentTrack: nextTrack,
            queueIndex: nextIndex,
            currentTime: 0,
            duration: nextTrack.duration,
            isPlaying: true,
          });
        }
      },

      prev: () => {
        const state = get();
        if (state.currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }
        if (state.queue.length === 0) return;

        let prevIndex = state.queueIndex - 1;
        if (prevIndex < 0) {
          if (state.repeatMode === 'all') {
            prevIndex = state.queue.length - 1;
          } else {
            set({ currentTime: 0 });
            return;
          }
        }

        const prevTrack = state.queue[prevIndex];
        if (prevTrack) {
          set({
            currentTrack: prevTrack,
            queueIndex: prevIndex,
            currentTime: 0,
            duration: prevTrack.duration,
            isPlaying: true,
          });
        }
      },

      setRepeat: (mode) => set({ repeatMode: mode }),
      cycleRepeat: () => {
        const modes: RepeatMode[] = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(get().repeatMode);
        set({ repeatMode: modes[(currentIndex + 1) % modes.length] });
      },

      toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),

      setDuration: (duration) => set({ duration }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),

      addToQueue: (track) =>
        set((s) => ({ queue: [...s.queue, track] })),

      addToQueueNext: (track) =>
        set((s) => {
          const newQueue = [...s.queue];
          newQueue.splice(s.queueIndex + 1, 0, track);
          return { queue: newQueue };
        }),

      removeFromQueue: (index) =>
        set((s) => {
          const newQueue = s.queue.filter((_, i) => i !== index);
          let newIndex = s.queueIndex;
          if (index < s.queueIndex) newIndex--;
          if (index === s.queueIndex && newIndex >= newQueue.length) {
            newIndex = newQueue.length - 1;
          }
          return { queue: newQueue, queueIndex: newIndex };
        }),

      reorderQueue: (from, to) =>
        set((s) => {
          const newQueue = [...s.queue];
          const [item] = newQueue.splice(from, 1);
          newQueue.splice(to, 0, item);

          let newIndex = s.queueIndex;
          if (from === s.queueIndex) {
            newIndex = to;
          } else if (from < s.queueIndex && to >= s.queueIndex) {
            newIndex--;
          } else if (from > s.queueIndex && to <= s.queueIndex) {
            newIndex++;
          }

          return { queue: newQueue, queueIndex: newIndex };
        }),

      clearQueue: () => set({ queue: [], queueIndex: -1 }),

      playFromQueue: (index) => {
        const state = get();
        const track = state.queue[index];
        if (track) {
          if (state.currentTrack) {
            set((s) => ({
              queueHistory: [state.currentTrack!, ...s.queueHistory].slice(0, 50),
            }));
          }
          set({
            currentTrack: track,
            queueIndex: index,
            currentTime: 0,
            duration: track.duration,
            isPlaying: true,
          });
        }
      },

      setQueue: (tracks, startIndex = 0) =>
        set({
          queue: tracks,
          queueIndex: startIndex,
          currentTrack: tracks[startIndex] || null,
          currentTime: 0,
          duration: tracks[startIndex]?.duration || 0,
          isPlaying: true,
        }),

      addToHistory: (track) =>
        set((s) => ({
          queueHistory: [track, ...s.queueHistory].slice(0, 50),
        })),

      toggleFullPlayer: () => set((s) => ({ isFullPlayerOpen: !s.isFullPlayerOpen })),
      toggleQueue: () => set((s) => ({ isQueueOpen: !s.isQueueOpen })),
      toggleLyrics: () => set((s) => ({ isLyricsOpen: !s.isLyricsOpen })),
      setFullPlayerOpen: (open) => set({ isFullPlayerOpen: open }),
    }),
    {
      name: 'player-state',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
        queue: state.queue,
        queueIndex: state.queueIndex,
        queueHistory: state.queueHistory,
      }),
    }
  )
);
