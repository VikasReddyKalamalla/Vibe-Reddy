'use client';

import React from 'react';
import { X, GripVertical, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { playTrack } from '@/lib/audio';
import { formatTime } from '@/lib/utils';
import type { Track } from '@/lib/types';

export default function QueueDrawer() {
  const isQueueOpen = usePlayerStore((s) => s.isQueueOpen);
  const toggleQueue = usePlayerStore((s) => s.toggleQueue);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const queueHistory = usePlayerStore((s) => s.queueHistory);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);

  const upcomingTracks = queue.slice(queueIndex + 1);

  const handlePlayFromQueue = (track: Track, idx: number) => {
    usePlayerStore.getState().playFromQueue(queueIndex + 1 + idx);
    playTrack(track);
  };

  return (
    <AnimatePresence>
      {isQueueOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleQueue}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 55,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: '80px',
              width: 'min(380px, 100vw)',
              zIndex: 56,
              background: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Queue</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {upcomingTracks.length > 0 && (
                  <button
                    className="btn-control"
                    onClick={clearQueue}
                    title="Clear queue"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button className="btn-control" onClick={toggleQueue}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
              {/* Now Playing */}
              {currentTrack && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    paddingLeft: '8px',
                  }}>
                    Now Playing
                  </p>
                  <QueueItem track={currentTrack} isNowPlaying />
                </div>
              )}

              {/* Next Up */}
              {upcomingTracks.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    paddingLeft: '8px',
                  }}>
                    Next Up · {upcomingTracks.length} tracks
                  </p>
                  {upcomingTracks.map((track, idx) => (
                    <QueueItem
                      key={`upcoming-${track.id}-${idx}`}
                      track={track}
                      onPlay={() => handlePlayFromQueue(track, idx)}
                      onRemove={() => removeFromQueue(queueIndex + 1 + idx)}
                    />
                  ))}
                </div>
              )}

              {/* History */}
              {queueHistory.length > 0 && (
                <div>
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    paddingLeft: '8px',
                  }}>
                    History
                  </p>
                  {queueHistory.slice(0, 10).map((track, idx) => (
                    <QueueItem
                      key={`history-${track.id}-${idx}`}
                      track={track}
                      isHistory
                      onPlay={() => {
                        usePlayerStore.getState().setTrack(track);
                        playTrack(track);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!currentTrack && upcomingTracks.length === 0 && queueHistory.length === 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                }}>
                  <p>Queue is empty</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Add tracks to get started</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface QueueItemProps {
  track: Track;
  isNowPlaying?: boolean;
  isHistory?: boolean;
  onPlay?: () => void;
  onRemove?: () => void;
}

function QueueItem({ track, isNowPlaying, isHistory, onPlay, onRemove }: QueueItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        borderRadius: 'var(--radius-sm)',
        background: isNowPlaying ? 'var(--accent-subtle)' : 'transparent',
        opacity: isHistory ? 0.5 : 1,
        cursor: onPlay ? 'pointer' : 'default',
        transition: 'background 0.15s',
      }}
      onClick={onPlay}
    >
      {!isNowPlaying && !isHistory && (
        <GripVertical size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, cursor: 'grab' }} />
      )}

      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '6px',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <Image
          src={track.cover}
          alt={track.title}
          width={40}
          height={40}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="truncate" style={{
          fontSize: '13px',
          fontWeight: 500,
          color: isNowPlaying ? 'var(--accent)' : 'var(--text-primary)',
        }}>
          {track.title}
        </p>
        <p className="truncate" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {track.artist}
        </p>
      </div>

      <span style={{
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontFamily: 'monospace',
        flexShrink: 0,
      }}>
        {formatTime(track.duration)}
      </span>

      {onRemove && (
        <button
          className="btn-control"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ padding: '4px' }}
          aria-label="Remove from queue"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
