'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { Play, Heart } from 'lucide-react';
import type { Track } from '@/lib/types';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { playTrack } from '@/lib/audio';
import { formatTime } from '@/lib/utils';

interface TrackListProps {
  tracks: Track[];
}

export default function TrackList({ tracks }: TrackListProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);

  const handlePlay = useCallback((track: Track, index: number) => {
    usePlayerStore.getState().setQueue(tracks, index);
    playTrack(track);
    usePlayerStore.getState().setFullPlayerOpen(true);
  }, [tracks]);

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px 48px 1fr 1fr 80px 60px 40px',
        gap: '12px',
        padding: '8px 12px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '4px',
      }}>
        <span>#</span>
        <span />
        <span>Title</span>
        <span>Album</span>
        <span>Mood</span>
        <span style={{ textAlign: 'right' }}>Duration</span>
        <span />
      </div>

      {/* Rows */}
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        return (
          <div
            key={track.id}
            onClick={() => handlePlay(track, index)}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 48px 1fr 1fr 80px 60px 40px',
              gap: '12px',
              padding: '8px 12px',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              background: isCurrentTrack ? 'var(--accent-subtle)' : 'transparent',
              transition: 'background 0.15s',
            }}
            className="track-list-row"
          >
            {/* Number / Play icon */}
            <span style={{
              fontSize: '13px',
              color: isCurrentTrack ? 'var(--accent)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {isCurrentTrack && isPlaying ? (
                <div className="eq-bars">
                  <div className="eq-bar" />
                  <div className="eq-bar" />
                  <div className="eq-bar" />
                </div>
              ) : (
                <span className="track-number">{index + 1}</span>
              )}
            </span>

            {/* Thumbnail */}
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
                loading={index < 10 ? 'eager' : 'lazy'}
              />
            </div>

            {/* Title + Artist */}
            <div style={{ minWidth: 0 }}>
              <p className="truncate" style={{
                fontSize: '13px',
                fontWeight: 500,
                color: isCurrentTrack ? 'var(--accent)' : 'var(--text-primary)',
              }}>
                {track.title}
              </p>
              <p className="truncate" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {track.artist}
              </p>
            </div>

            {/* Album */}
            <p className="truncate" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {track.album}
            </p>

            {/* Mood */}
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
              {track.mood.slice(0, 1).map((m) => (
                <span key={m} style={{
                  padding: '1px 6px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  background: 'var(--bg-glass)',
                  color: 'var(--text-muted)',
                  textTransform: 'capitalize',
                }}>
                  {m}
                </span>
              ))}
            </div>

            {/* Duration */}
            <span style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textAlign: 'right',
              fontFamily: 'monospace',
            }}>
              {formatTime(track.duration)}
            </span>

            {/* Favorite */}
            <button
              className="btn-control"
              onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
              style={{ padding: '4px' }}
              aria-label="Toggle favorite"
            >
              <Heart size={14} fill={track.favorite ? 'var(--accent)' : 'none'} color={track.favorite ? 'var(--accent)' : 'var(--text-muted)'} />
            </button>
          </div>
        );
      })}

      <style jsx>{`
        .track-list-row:hover {
          background: var(--bg-glass) !important;
        }
        .track-list-row:hover .track-number {
          display: none;
        }
      `}</style>
    </div>
  );
}
