'use client';

import React from 'react';
import { useLibraryStore } from '@/store/libraryStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { usePlayerStore } from '@/store/playerStore';
import moodsData from '@/data/moods.json';
import type { Mood } from '@/lib/types';

const moods = moodsData.moods as Mood[];

export default function MoodSelector() {
  const activeMood = useLibraryStore((s) => s.activeMood);
  const setMood = useLibraryStore((s) => s.setMood);
  const setAccentColor = usePreferencesStore((s) => s.setAccentColor);
  const activeFilter = useLibraryStore((s) => s.activeFilter);
  const setFilter = useLibraryStore((s) => s.setFilter);
  const tracks = useLibraryStore((s) => s.tracks);

  const genres = Array.from(new Set(tracks.map(t => t.genre)))
    .sort()
    .slice(0, 3); // Limit to top 3 genres to maintain 10 total filters

  const handleMoodSelect = (moodId: string | null) => {
    setMood(moodId);

    if (moodId) {
      const mood = moods.find((m) => m.id === moodId);
      if (mood) {
        // Load mood tracks into queue
        const moodTracks = tracks.filter((t) => t.mood.includes(moodId));
        if (moodTracks.length > 0) {
          usePlayerStore.getState().setQueue(moodTracks, 0);
        }
      }
    }
  };

  const genreIcons: Record<string, string> = {
    ambient: '🌌',
    classical: '🎻',
    electronic: '🎹',
    pop: '🎤',
    rock: '🎸',
    jazz: '🎷',
    lofi: '☕',
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
      paddingBottom: '8px',
      paddingRight: '20px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
      <button
        className={`mood-pill ${!activeMood && !activeFilter ? 'active' : ''}`}
        style={(!activeMood && !activeFilter) ? {
          background: 'var(--accent)',
          borderColor: 'transparent',
          color: 'white',
          padding: '6px 16px',
        } : {
          padding: '6px 16px',
        }}
        onClick={() => {
          handleMoodSelect(null);
          setFilter(null);
        }}
      >
        All
      </button>

      {moods.map((mood) => (
        <button
          key={mood.id}
          className={`mood-pill ${activeMood === mood.id ? 'active' : ''}`}
          style={activeMood === mood.id ? {
            background: mood.color,
            borderColor: 'transparent',
            color: 'white',
            transform: 'scale(1.05)',
            boxShadow: `0 4px 12px ${mood.color}40`,
            padding: '6px 16px',
          } : {
            padding: '6px 16px',
          }}
          onClick={() => {
            handleMoodSelect(mood.id);
            setFilter(null);
          }}
          title={mood.description}
        >
          <span style={{ marginRight: '6px' }}>{mood.icon}</span>
          <span>{mood.label}</span>
        </button>
      ))}

      <div style={{
        width: '1px',
        height: '24px',
        background: 'var(--border)',
        margin: '0 8px',
        alignSelf: 'center',
        flexShrink: 0
      }} />

      {genres.map((genre) => (
        <button
          key={genre}
          className={`mood-pill ${activeFilter === genre ? 'active' : ''}`}
          style={activeFilter === genre ? {
            background: 'var(--accent)',
            borderColor: 'transparent',
            color: 'white',
            padding: '6px 16px',
            transform: 'scale(1.05)',
          } : {
            padding: '6px 16px',
          }}
          onClick={() => {
            setFilter(activeFilter === genre ? null : genre);
            setMood(null);
          }}
        >
          <span style={{ marginRight: '6px' }}>{genreIcons[genre.toLowerCase()] || '🎵'}</span>
          <span>{genre.charAt(0).toUpperCase() + genre.slice(1)}</span>
        </button>
      ))}
    </div>
  );
}
