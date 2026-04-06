'use client';

import React from 'react';
import { ArrowLeft, Music, TrendingUp, Clock, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLibraryStore } from '@/store/libraryStore';
import { formatTime, formatDuration } from '@/lib/utils';

export default function StatsPage() {
  const tracks = useLibraryStore((s) => s.tracks);
  const getMostPlayed = useLibraryStore((s) => s.getMostPlayed);
  const getRecentlyPlayed = useLibraryStore((s) => s.getRecentlyPlayed);
  const getFavorites = useLibraryStore((s) => s.getFavorites);

  const mostPlayed = getMostPlayed().slice(0, 5);
  const recentlyPlayed = getRecentlyPlayed().slice(0, 5);
  const favorites = getFavorites();

  // Calculate stats
  const totalPlayCount = tracks.reduce((sum, t) => sum + t.playCount, 0);
  const totalListeningTime = tracks.reduce((sum, t) => sum + t.playCount * t.duration, 0);

  // Top artists
  const artistCounts: Record<string, number> = {};
  tracks.forEach((t) => {
    artistCounts[t.artist] = (artistCounts[t.artist] || 0) + t.playCount;
  });
  const topArtists = Object.entries(artistCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const maxArtistPlays = topArtists[0]?.[1] || 1;

  // Mood breakdown
  const moodCounts: Record<string, number> = {};
  tracks.forEach((t) => {
    t.mood.forEach((m) => {
      moodCounts[m] = (moodCounts[m] || 0) + t.playCount;
    });
  });
  const totalMoodPlays = Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1;

  const moodColors: Record<string, string> = {
    focus: '#4A90E2', chill: '#5CAD8A', hype: '#E8593C',
    sad: '#7B68EE', sleep: '#2C2C54', party: '#FF6B6B', morning: '#F7B731',
  };

  const maxPlayCount = mostPlayed[0]?.playCount || 1;

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px 20px 120px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
      }}>
        <Link href="/" style={{ display: 'flex', color: 'var(--text-muted)' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Your Stats</h1>
      </div>

      {/* Overview cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '32px',
      }}>
        <StatCard icon={<Clock size={20} />} label="Listening Time" value={formatDuration(totalListeningTime)} color="#4A90E2" />
        <StatCard icon={<Music size={20} />} label="Total Plays" value={totalPlayCount.toString()} color="#5CAD8A" />
        <StatCard icon={<Heart size={20} />} label="Favorites" value={favorites.length.toString()} color="#E8593C" />
        <StatCard icon={<TrendingUp size={20} />} label="Library Size" value={`${tracks.length} tracks`} color="#F7B731" />
      </div>

      {/* Top Tracks */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          🏆 Top Tracks
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mostPlayed.map((track, idx) => (
            <div key={track.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 700,
                color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--text-muted)',
                width: '24px',
                textAlign: 'center',
              }}>
                {idx + 1}
              </span>
              <div style={{
                width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0,
              }}>
                <Image src={track.cover} alt={track.title} width={40} height={40}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="truncate" style={{ fontSize: '13px', fontWeight: 500 }}>{track.title}</p>
                <p className="truncate" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{track.artist}</p>
              </div>
              <div style={{ width: '120px', flexShrink: 0 }}>
                <div style={{
                  height: '6px',
                  borderRadius: '3px',
                  background: 'var(--border)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(track.playCount / maxPlayCount) * 100}%`,
                    background: 'var(--accent)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', width: '50px', textAlign: 'right' }}>
                {track.playCount} plays
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Artists */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          🎤 Top Artists
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {topArtists.map(([artist, plays]) => (
            <div key={artist}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px' }}>{artist}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{plays} plays</span>
              </div>
              <div style={{
                height: '8px',
                borderRadius: '4px',
                background: 'var(--border)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(plays / maxArtistPlays) * 100}%`,
                  background: 'linear-gradient(90deg, var(--accent), #F7B731)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mood Breakdown */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          🎭 Mood Breakdown
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(moodCounts).sort(([, a], [, b]) => b - a).map(([mood, count]) => (
            <div key={mood}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{mood}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {Math.round((count / totalMoodPlays) * 100)}%
                </span>
              </div>
              <div style={{
                height: '8px',
                borderRadius: '4px',
                background: 'var(--border)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(count / totalMoodPlays) * 100}%`,
                  background: moodColors[mood] || 'var(--accent)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div style={{
      padding: '20px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ color, marginBottom: '8px' }}>{icon}</div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '20px', fontWeight: 700 }}>{value}</p>
    </div>
  );
}
