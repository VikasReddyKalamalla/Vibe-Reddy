'use client';

import React, { useEffect, useState } from 'react';
import PlayerBar from '@/components/player/PlayerBar';
import FullPlayer from '@/components/player/FullPlayer';
import ProfileView from '@/components/profile/ProfileView';
import QueueDrawer from '@/components/queue/QueueDrawer';
import IntroScreen from '@/components/intro/IntroScreen';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useMediaSession } from '@/hooks/useMediaSession';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function AppShell({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  useMediaSession();

  const theme = usePreferencesStore((s) => s.theme);
  const [showIntro, setShowIntro] = useState(true);

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {showIntro && <IntroScreen onFinished={() => setShowIntro(false)} />}
      <main style={{ paddingBottom: '96px' }}>
        {children}
      </main>
      <PlayerBar />
      <FullPlayer />
      <QueueDrawer />
      <ProfileView />
    </div>
  );
}
