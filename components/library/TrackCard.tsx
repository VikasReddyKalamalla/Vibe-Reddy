'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Play, Plus, Heart, ListPlus, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Track } from '@/lib/types';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { playTrack } from '@/lib/audio';
import { formatTime } from '@/lib/utils';

interface TrackCardProps {
  track: Track;
  index: number;
  allTracks: Track[];
  compact?: boolean;
}

export default function TrackCard({ track, index, allTracks, compact = false }: TrackCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const addToQueueNext = usePlayerStore((s) => s.addToQueueNext);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);

  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlay = useCallback(() => {
    usePlayerStore.getState().setQueue(allTracks, index);
    playTrack(track);
    usePlayerStore.getState().setFullPlayerOpen(true);
  }, [track, index, allTracks]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        onContextMenu={handleContextMenu}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
          border: `1px solid ${isCurrentTrack ? 'var(--accent)' : 'var(--border)'}`,
          cursor: 'pointer',
          transition: 'border-color 0.2s, transform 0.2s',
        }}
        whileHover={{ y: -4 }}
      >
        {/* Album art */}
        <div
          style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}
          onClick={handlePlay}
        >
          <Image
            src={track.cover}
            alt={track.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            loading={index < 6 ? 'eager' : 'lazy'}
          />

          {/* Hover overlay */}
          {!compact && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
              className="track-card-overlay"
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}>
                <Play size={22} fill="white" color="white" style={{ marginLeft: '2px' }} />
              </div>
            </div>
          )}

          {/* Duration badge */}
          <span style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(0,0,0,0.7)',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#fff',
          }}>
            {formatTime(track.duration)}
          </span>

          {/* Playing indicator */}
          {isCurrentTrack && (
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
            }}>
              <div className={`eq-bars ${!isPlaying ? 'paused' : ''}`}>
                <div className="eq-bar" style={{ background: '#fff' }} />
                <div className="eq-bar" style={{ background: '#fff' }} />
                <div className="eq-bar" style={{ background: '#fff' }} />
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: compact ? '6px 8px' : '10px 12px' }}>
          <p className="truncate" style={{
            fontSize: compact ? '11px' : '13px',
            fontWeight: 600,
            marginBottom: '1px',
            color: isCurrentTrack ? 'var(--accent)' : 'var(--text-primary)',
          }}>
            {track.title}
          </p>
          <p className="truncate" style={{ fontSize: compact ? '10px' : '12px', color: 'var(--text-muted)' }}>
            {track.artist}
          </p>
          {!compact && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
              {track.mood.slice(0, 2).map((m) => (
                <span key={m} style={{
                  padding: '1px 7px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  background: 'var(--bg-glass)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  textTransform: 'capitalize',
                }}>
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          div:hover .track-card-overlay {
            opacity: 1 !important;
          }
        `}</style>
      </motion.div>

      {/* Context Menu */}
      {showMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setShowMenu(false)}
          />
          <div
            className="context-menu"
            style={{ top: menuPos.y, left: menuPos.x }}
          >
            <button className="context-menu-item" onClick={() => { handlePlay(); setShowMenu(false); }}>
              <Play size={14} /> Play Now
            </button>
            <button className="context-menu-item" onClick={() => { addToQueueNext(track); setShowMenu(false); }}>
              <ListPlus size={14} /> Play Next
            </button>
            <button className="context-menu-item" onClick={() => { addToQueue(track); setShowMenu(false); }}>
              <Plus size={14} /> Add to Queue
            </button>
            <div className="context-menu-separator" />
            <button className="context-menu-item" onClick={() => { toggleFavorite(track.id); setShowMenu(false); }}>
              <Heart size={14} fill={track.favorite ? 'var(--accent)' : 'none'} />
              {track.favorite ? 'Unfavorite' : 'Favorite'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
