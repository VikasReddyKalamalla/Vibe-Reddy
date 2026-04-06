'use client';

import { Howl } from 'howler';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import type { Track } from '@/lib/types';

let currentHowl: Howl | null = null;
let animationFrameId: number | null = null;
let playStartTime: number | null = null;
let hasCountedPlay = false;
let currentTrackId: string | null = null;

function updateProgress(): void {
  if (currentHowl && currentHowl.playing()) {
    const seek = currentHowl.seek() as number;
    usePlayerStore.getState().setCurrentTime(seek);
    animationFrameId = requestAnimationFrame(updateProgress);
  }
}

export function getHowlInstance(): Howl | null {
  return currentHowl;
}

export function playTrack(track: Track): void {
  // Unload previous
  if (currentHowl) {
    currentHowl.off(); // remove all listeners before unload
    currentHowl.unload();
    currentHowl = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  playStartTime = null;
  hasCountedPlay = false;
  currentTrackId = track.id;

  const store = usePlayerStore.getState();
  store.setTrack(track);

  const howl = new Howl({
    src: [track.src],
    html5: true,
    volume: store.isMuted ? 0 : store.volume,
    onplay: () => {
      // Guard: only update state if this is still the active howl
      if (currentHowl !== howl) return;
      usePlayerStore.getState().setIsPlaying(true);
      playStartTime = Date.now();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateProgress);
    },
    onpause: () => {
      if (currentHowl !== howl) return;
      usePlayerStore.getState().setIsPlaying(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
    onstop: () => {
      if (currentHowl !== howl) return;
      usePlayerStore.getState().setIsPlaying(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
    onend: () => {
      if (currentHowl !== howl) return;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      const currentTrack = usePlayerStore.getState().currentTrack;
      if (currentTrack && !hasCountedPlay) {
        useLibraryStore.getState().incrementPlayCount(currentTrack.id);
        useLibraryStore.getState().updateLastPlayed(currentTrack.id);
        hasCountedPlay = true;
      }

      const playerState = usePlayerStore.getState();
      if (playerState.repeatMode === 'one') {
        howl.seek(0);
        howl.play();
      } else {
        // next() updates the store's currentTrack — we need to play it
        const prevIndex = playerState.queueIndex;
        playerState.next();
        const newState = usePlayerStore.getState();
        // Only play if index actually changed and there's a new track
        if (newState.currentTrack && newState.queueIndex !== prevIndex) {
          playTrack(newState.currentTrack);
        }
      }
    },
    onload: () => {
      if (currentHowl !== howl) return;
      const duration = howl.duration() || track.duration;
      usePlayerStore.getState().setDuration(duration);
    },
    onloaderror: (_id, error) => {
      console.error('Audio load error for', track.title, ':', error);
      if (currentHowl !== howl) return;
      usePlayerStore.getState().setIsPlaying(false);
    },
    onseek: () => {
      if (currentHowl !== howl) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateProgress);
    },
  });

  currentHowl = howl;
  howl.play();
}

export function pauseAudio(): void {
  if (currentHowl) {
    currentHowl.pause();
    // Force state update in case onpause doesn't fire immediately
    usePlayerStore.getState().setIsPlaying(false);
  }
}

export function resumeAudio(): void {
  if (currentHowl) {
    currentHowl.play();
    // Force state update — onplay will confirm it
    usePlayerStore.getState().setIsPlaying(true);
  }
}

export function seekAudio(time: number): void {
  if (currentHowl) {
    currentHowl.seek(time);
    usePlayerStore.getState().setCurrentTime(time);
  }
}

export function setAudioVolume(volume: number): void {
  if (currentHowl) {
    currentHowl.volume(volume);
  }
}

export function toggleMuteAudio(): void {
  const state = usePlayerStore.getState();
  if (currentHowl) {
    currentHowl.volume(state.isMuted ? state.volume : 0);
  }
}

// Play count after 30s
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (playStartTime && !hasCountedPlay) {
      const elapsed = (Date.now() - playStartTime) / 1000;
      if (elapsed >= 30) {
        const currentTrack = usePlayerStore.getState().currentTrack;
        if (currentTrack) {
          useLibraryStore.getState().incrementPlayCount(currentTrack.id);
          useLibraryStore.getState().updateLastPlayed(currentTrack.id);
          hasCountedPlay = true;
        }
      }
    }
  }, 1000);
}

// Volume/mute sync
if (typeof window !== 'undefined') {
  usePlayerStore.subscribe((state, prevState) => {
    if (!currentHowl) return;
    if (state.volume !== prevState.volume || state.isMuted !== prevState.isMuted) {
      currentHowl.volume(state.isMuted ? 0 : state.volume);
    }
  });
}
