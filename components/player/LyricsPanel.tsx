'use client';

import React from 'react';
import { X, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';

export default function LyricsPanel() {
  const isLyricsOpen = usePlayerStore((s) => s.isLyricsOpen);
  const toggleLyrics = usePlayerStore((s) => s.toggleLyrics);
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  // Placeholder lyrics since we don't have .lrc or .txt files yet
  const placeholderLyrics = [
    "[00:00.00] (Instrumental Intro)",
    "[00:15.00] Walking down the neon street",
    "[00:20.00] Raindrops falling to the beat",
    "[00:25.00] Echoes of a distant dream",
    "[00:30.00] Nothing's quite what it may seem",
    "[00:35.00] Midnight drive under the stars",
    "[00:40.00] Healing up these old-time scars",
    "[00:45.00] (Synth Solo)",
    "[01:10.00] Every turn a brand new light",
    "[01:15.00] Chasing shadows through the night",
    "[01:20.00] Lost in rhythms, found in sound",
    "[01:25.00] Looking for what can be found",
    "[01:30.00] Midnight drive under the stars",
    "[01:35.00] Healing up these old-time scars",
    "[01:40.00] (Outro)",
    "[02:10.00] End of track"
  ];

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {isLyricsOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            inset: '80px 20px 20px',
            zIndex: 10,
            background: 'var(--player-bg)',
            backdropFilter: 'blur(30px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Music2 size={18} color="var(--accent)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Lyrics</h3>
            </div>
            <button className="btn-control" onClick={toggleLyrics}>
              <X size={20} />
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          }}>
            {placeholderLyrics.map((line, idx) => {
              const text = line.replace(/\[.*\]/, '').trim();
              return (
                <p
                  key={idx}
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: idx === 3 ? 'var(--text-primary)' : 'var(--text-muted)', // Simulating active line 
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                  }}
                >
                  {text}
                </p>
              );
            })}
            
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              Lyrics synced for demo purposes
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
