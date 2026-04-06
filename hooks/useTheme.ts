'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '@/store/preferencesStore';
import type { ThemeMode } from '@/lib/types';

export function useTheme() {
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const cycleTheme = usePreferencesStore((s) => s.cycleTheme);

  const isDark = theme === 'dark' || theme === 'amoled' || theme === 'dynamic';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return {
    theme,
    setTheme: (t: ThemeMode) => setTheme(t),
    cycleTheme,
    isDark,
  };
}
