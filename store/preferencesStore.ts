'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode, VisualizerMode } from '@/lib/types';

interface PreferencesState {
  theme: ThemeMode;
  accentColor: string;
  visualizerMode: VisualizerMode;
  visualizerEnabled: boolean;
  showKeyboardHints: boolean;
  isProfileOpen: boolean;

  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
  setAccentColor: (color: string) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  toggleVisualizer: () => void;
  toggleKeyboardHints: () => void;
  toggleProfile: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      accentColor: '#E8593C',
      visualizerMode: 'bars',
      visualizerEnabled: true,
      showKeyboardHints: false,
      isProfileOpen: false,

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      cycleTheme: () => {
        const themes: ThemeMode[] = ['dark', 'light', 'amoled'];
        const currentIndex = themes.indexOf(get().theme === 'dynamic' ? 'dark' : get().theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        set({ theme: nextTheme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', nextTheme);
        }
      },

      setAccentColor: (color) => {
        set({ accentColor: color });
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--accent', color);
        }
      },

      setVisualizerMode: (mode) => set({ visualizerMode: mode }),
      toggleVisualizer: () => set((s) => ({ visualizerEnabled: !s.visualizerEnabled })),
      toggleKeyboardHints: () => set((s) => ({ showKeyboardHints: !s.showKeyboardHints })),
      toggleProfile: () => set((s) => ({ isProfileOpen: !s.isProfileOpen })),
    }),
    {
      name: 'preferences-state',
    }
  )
);
