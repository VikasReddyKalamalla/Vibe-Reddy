'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, Music, Clock, BarChart2, Headphones,
  User, Disc, TrendingUp, Play, ChevronLeft, Pause
} from 'lucide-react';
import Image from 'next/image';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { playTrack, pauseAudio, resumeAudio } from '@/lib/audio';
import { formatTime } from '@/lib/utils';
import type { Track } from '@/lib/types';

type FilterView = null | 'tracks' | 'favorites' | 'albums' | 'album-detail' | 'genre';

export default function ProfileView() {
  const isProfileOpen = usePreferencesStore((s) => s.isProfileOpen);
  const toggleProfile = usePreferencesStore((s) => s.toggleProfile);
  const tracks = useLibraryStore((s) => s.tracks);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const [filterView, setFilterView] = useState<FilterView>(null);
  const [filterLabel, setFilterLabel] = useState('');
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);

  const favoriteTracks = useMemo(() => tracks.filter(t => t.favorite), [tracks]);
  const topTracks = useMemo(() => [...tracks].sort((a, b) => b.playCount - a.playCount).slice(0, 5), [tracks]);
  const recentTracks = useMemo(() =>
    [...tracks].filter(t => t.lastPlayed)
      .sort((a, b) => new Date(b.lastPlayed!).getTime() - new Date(a.lastPlayed!).getTime())
      .slice(0, 5), [tracks]);
  const totalPlayCount = useMemo(() => tracks.reduce((s, t) => s + t.playCount, 0), [tracks]);
  const totalMinutes = useMemo(() => Math.floor(tracks.reduce((s, t) => s + t.duration, 0) / 60), [tracks]);

  const genres = useMemo(() => {
    const map: Record<string, number> = {};
    tracks.forEach(t => { map[t.genre] = (map[t.genre] || 0) + t.playCount + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([g]) => g);
  }, [tracks]);

  const albums = useMemo(() => {
    const seen = new Set<string>();
    return tracks.filter(t => { if (seen.has(t.album)) return false; seen.add(t.album); return true; }).slice(0, 4);
  }, [tracks]);

  const allAlbums = useMemo(() => {
    const map: Record<string, { cover: string; artist: string; year: number; count: number }> = {};
    tracks.forEach(t => {
      if (!map[t.album]) map[t.album] = { cover: t.cover, artist: t.artist, year: t.year, count: 0 };
      map[t.album].count++;
    });
    return Object.entries(map).map(([name, info]) => ({ name, ...info }));
  }, [tracks]);

  // Filtered tracks for drill-down panel
  const filteredTracks = useMemo(() => {
    if (filterView === 'tracks') return [...tracks].sort((a, b) => b.playCount - a.playCount);
    if (filterView === 'favorites') return favoriteTracks;
    if (filterView === 'genre' && activeGenre) return tracks.filter(t => t.genre === activeGenre);
    if (filterView === 'album-detail' && activeAlbum) return tracks.filter(t => t.album === activeAlbum);
    return [];
  }, [filterView, tracks, favoriteTracks, activeGenre, activeAlbum]);

  const handlePlay = (track: Track, queue?: Track[]) => {
    const q = queue || tracks;
    const idx = q.findIndex(t => t.id === track.id);
    usePlayerStore.getState().setQueue(q, idx);
    playTrack(track);
  };

  const handlePlayPause = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (currentTrack?.id === track.id) {
      isPlaying ? pauseAudio() : resumeAudio();
    } else {
      handlePlay(track);
    }
  };

  const openFilter = (view: FilterView, label: string, genre?: string) => {
    setFilterView(view);
    setFilterLabel(label);
    if (genre) setActiveGenre(genre);
  };

  const closeFilter = () => { setFilterView(null); setActiveGenre(null); setActiveAlbum(null); };

  if (!isProfileOpen) return null;

  const heroCover = topTracks[0]?.cover || '';

  return (
    <AnimatePresence>
      <motion.div
        key="profile-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}
        onClick={toggleProfile}
      >
        <motion.div
          key="profile-panel"
          initial={{ scale: 0.95, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '1100px', height: '88vh',
            background: 'var(--bg-primary)', borderRadius: '20px',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            color: 'var(--text-primary)', position: 'relative',
          }}
        >
          {/* Close */}
          <button onClick={toggleProfile} style={{
            position: 'absolute', top: 20, right: 20, zIndex: 30,
            background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <X size={18} />
          </button>

          {/* Hero Banner */}
          <div style={{ position: 'relative', height: '200px', flexShrink: 0, overflow: 'hidden' }}>
            {heroCover && (
              <div style={{
                position: 'absolute', inset: '-20px',
                backgroundImage: `url(${heroCover})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'blur(24px) brightness(0.3)', transform: 'scale(1.1)',
              }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, var(--bg-primary))' }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '0 40px 20px', display: 'flex', alignItems: 'flex-end', gap: '20px',
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), #ff8fb1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: '3px solid rgba(255,255,255,0.1)',
              }}>
                <User size={38} color="white" />
              </div>
              <div style={{ paddingBottom: '4px' }}>
                <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Profile</p>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Vikas Reddy</h1>
                <p style={{ fontSize: 12, opacity: 0.55, marginTop: 3 }}>
                  {favoriteTracks.length} liked · {tracks.length} tracks · {totalPlayCount.toLocaleString()} plays
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar — each is clickable */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {[
              { icon: <Music size={15} />, label: 'Tracks', value: tracks.length, action: () => openFilter('tracks', 'All Tracks') },
              { icon: <Heart size={15} />, label: 'Favorites', value: favoriteTracks.length, action: () => openFilter('favorites', 'Liked Songs') },
              { icon: <Headphones size={15} />, label: 'Total Plays', value: totalPlayCount.toLocaleString(), action: () => openFilter('tracks', 'Most Played') },
              { icon: <Clock size={15} />, label: 'Minutes', value: totalMinutes.toLocaleString(), action: () => openFilter('tracks', 'All Tracks') },
              { icon: <Disc size={15} />, label: 'Albums', value: albums.length, action: () => openFilter('albums', 'Albums') },
            ].map((stat, i) => (
              <button key={i} onClick={stat.action} style={{
                flex: 1, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '10px',
                borderRight: i < 4 ? '1px solid var(--border)' : 'none',
                background: 'transparent', border: 'none',
                color: 'var(--text-primary)', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
                className="profile-stat-btn"
              >
                <span style={{ color: 'var(--accent)' }}>{stat.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ fontSize: 11, opacity: 0.45, marginTop: 2 }}>{stat.label}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Main scrollable area */}
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>

            {/* Drill-down panel slides over main content */}
            <AnimatePresence>
              {filterView && (
                <motion.div
                  key="filter-panel"
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    background: 'var(--bg-primary)', overflowY: 'auto', padding: '28px 40px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <button onClick={filterView === 'album-detail' ? () => { setFilterView('albums'); setFilterLabel('Albums'); setActiveAlbum(null); } : closeFilter} style={{
                      background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-primary)',
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer',
                    }}>
                      <ChevronLeft size={18} />
                    </button>
                    <h2 style={{ fontSize: 20, fontWeight: 700 }}>{filterLabel}</h2>
                    <span style={{ fontSize: 13, opacity: 0.4 }}>
                      {filterView === 'albums' ? `${allAlbums.length} albums` : `${filteredTracks.length} tracks`}
                    </span>
                  </div>

                  {/* Albums grid view */}
                  {filterView === 'albums' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: '20px',
                    }}>
                      {allAlbums.map(album => (
                        <div key={album.name} onClick={() => {
                          setActiveAlbum(album.name);
                          setFilterView('album-detail');
                          setFilterLabel(album.name);
                        }} style={{ cursor: 'pointer' }} className="album-card">
                          <div style={{
                            borderRadius: '10px', overflow: 'hidden',
                            aspectRatio: '1', position: 'relative', marginBottom: '10px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                          }}>
                            <Image src={album.cover} alt={album.name} fill style={{ objectFit: 'cover' }} />
                            <div style={{
                              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'background 0.2s',
                            }} className="album-overlay">
                              <div style={{
                                width: 44, height: 44, borderRadius: '50%',
                                background: 'var(--accent)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                opacity: 0, transition: 'opacity 0.2s',
                              }} className="album-play-btn">
                                <Play size={20} fill="white" color="white" style={{ marginLeft: 2 }} />
                              </div>
                            </div>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{album.name}</p>
                          <p style={{ fontSize: 11, opacity: 0.45 }}>{album.artist} · {album.count} tracks</p>
                          <p style={{ fontSize: 10, opacity: 0.3 }}>{album.year}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Track list for all other views */}
                  {filterView !== 'albums' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {filteredTracks.map((track, idx) => {
                        const isActive = currentTrack?.id === track.id;
                        return (
                          <div key={track.id} onClick={() => handlePlay(track, filteredTracks)} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                            background: isActive ? 'var(--accent-subtle)' : 'transparent',
                            transition: 'background 0.15s',
                          }} className="profile-row">
                            <span style={{ width: 20, fontSize: 12, opacity: 0.35, textAlign: 'center', flexShrink: 0 }}>
                              {isActive && isPlaying ? <span style={{ color: 'var(--accent)' }}>▶</span> : idx + 1}
                            </span>
                            <div style={{ width: 42, height: 42, borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                              <Image src={track.cover} alt={track.title} width={42} height={42} style={{ objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: 13, fontWeight: 600,
                                color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>{track.title}</p>
                              <p style={{ fontSize: 11, opacity: 0.5 }}>{track.artist} · {track.album}</p>
                            </div>
                            <span style={{ fontSize: 11, opacity: 0.35, fontFamily: 'monospace', flexShrink: 0 }}>{formatTime(track.duration)}</span>
                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }} style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0,
                            }}>
                              <Heart size={14} fill={track.favorite ? 'var(--accent)' : 'none'} color={track.favorite ? 'var(--accent)' : 'var(--text-muted)'} />
                            </button>
                            <button onClick={(e) => handlePlayPause(e, track)} style={{
                              background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer',
                              width: 30, height: 30, borderRadius: '50%', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              color: 'var(--text-primary)',
                            }}>
                              {isActive && isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" style={{ marginLeft: 1 }} />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Default content */}
            <div style={{ padding: '28px 40px', display: 'flex', flexDirection: 'column', gap: '36px' }}>

              {/* Top Tracks + Recently Played */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

                {/* Top Tracks */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={16} color="var(--accent)" />
                      <h2 style={{ fontSize: 16, fontWeight: 700 }}>Top Tracks</h2>
                    </div>
                    <button onClick={() => openFilter('tracks', 'Most Played')} style={{
                      background: 'none', border: 'none', fontSize: 12, opacity: 0.5,
                      cursor: 'pointer', color: 'var(--text-primary)',
                    }}>See all →</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {topTracks.map((track, idx) => (
                      <TrackRow key={track.id} track={track} idx={idx} currentTrack={currentTrack}
                        isPlaying={isPlaying} onPlay={() => handlePlay(track, topTracks)}
                        onPlayPause={(e) => handlePlayPause(e, track)}
                        onFavorite={() => toggleFavorite(track.id)} showRank />
                    ))}
                  </div>
                </div>

                {/* Recently Played */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Clock size={16} color="var(--accent)" />
                    <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recently Played</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {recentTracks.length > 0 ? recentTracks.map((track, idx) => (
                      <TrackRow key={track.id} track={track} idx={idx} currentTrack={currentTrack}
                        isPlaying={isPlaying} onPlay={() => handlePlay(track, recentTracks)}
                        onPlayPause={(e) => handlePlayPause(e, track)}
                        onFavorite={() => toggleFavorite(track.id)} />
                    )) : (
                      <p style={{ fontSize: 13, opacity: 0.35, padding: '12px' }}>No recently played tracks yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Liked Songs + Albums */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

                {/* Liked Songs */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Heart size={16} color="var(--accent)" />
                      <h2 style={{ fontSize: 16, fontWeight: 700 }}>Liked Songs</h2>
                      <span style={{ fontSize: 12, opacity: 0.35 }}>{favoriteTracks.length}</span>
                    </div>
                    <button onClick={() => openFilter('favorites', 'Liked Songs')} style={{
                      background: 'none', border: 'none', fontSize: 12, opacity: 0.5,
                      cursor: 'pointer', color: 'var(--text-primary)',
                    }}>See all →</button>
                  </div>
                  {/* Mosaic */}
                  {favoriteTracks.length > 0 && (
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px',
                      borderRadius: '10px', overflow: 'hidden', marginBottom: '12px', height: '100px',
                      cursor: 'pointer',
                    }} onClick={() => openFilter('favorites', 'Liked Songs')}>
                      {favoriteTracks.slice(0, 4).map(t => (
                        <div key={t.id} style={{ position: 'relative', overflow: 'hidden' }}>
                          <Image src={t.cover} alt={t.title} fill style={{ objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {favoriteTracks.slice(0, 4).map((track, idx) => (
                      <TrackRow key={track.id} track={track} idx={idx} currentTrack={currentTrack}
                        isPlaying={isPlaying} onPlay={() => handlePlay(track, favoriteTracks)}
                        onPlayPause={(e) => handlePlayPause(e, track)}
                        onFavorite={() => toggleFavorite(track.id)} />
                    ))}
                  </div>
                </div>

                {/* Albums + Genres */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* Albums */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <Disc size={16} color="var(--accent)" />
                      <h2 style={{ fontSize: 16, fontWeight: 700 }}>Albums</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {albums.map(track => (
                        <div key={track.id} style={{ cursor: 'pointer' }} onClick={() => handlePlay(track)}>
                          <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '5px', aspectRatio: '1', position: 'relative' }}>
                            <Image src={track.cover} alt={track.album} fill style={{ objectFit: 'cover' }} />
                          </div>
                          <p style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.album}</p>
                          <p style={{ fontSize: 10, opacity: 0.4 }}>{track.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Genres — clickable pills */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <BarChart2 size={16} color="var(--accent)" />
                      <h2 style={{ fontSize: 16, fontWeight: 700 }}>Top Genres</h2>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {genres.map((g, i) => (
                        <button key={g} onClick={() => openFilter('genre', `Genre: ${g.charAt(0).toUpperCase() + g.slice(1)}`, g)} style={{
                          padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          background: i === 0 ? 'var(--accent)' : 'var(--bg-secondary)',
                          color: i === 0 ? 'white' : 'var(--text-secondary)',
                          border: '1px solid var(--border)', cursor: 'pointer',
                          textTransform: 'capitalize', transition: 'all 0.15s',
                        }} className="genre-pill">
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        .profile-row:hover { background: var(--bg-glass) !important; }
        .profile-stat-btn:hover { background: var(--bg-glass) !important; }
        .genre-pill:hover { opacity: 0.8; transform: scale(1.04); }
        .album-card:hover .album-overlay { background: rgba(0,0,0,0.4) !important; }
        .album-card:hover .album-play-btn { opacity: 1 !important; }
      `}</style>
    </AnimatePresence>
  );
}

// Reusable track row
function TrackRow({ track, idx, currentTrack, isPlaying, onPlay, onPlayPause, onFavorite, showRank }: {
  track: Track; idx: number; currentTrack: Track | null; isPlaying: boolean;
  onPlay: () => void; onPlayPause: (e: React.MouseEvent) => void;
  onFavorite: () => void; showRank?: boolean;
}) {
  const isActive = currentTrack?.id === track.id;
  return (
    <div onClick={onPlay} style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
      background: isActive ? 'var(--accent-subtle)' : 'transparent',
      transition: 'background 0.15s',
    }} className="profile-row">
      {showRank && (
        <span style={{ width: 16, fontSize: 11, opacity: 0.35, textAlign: 'center', flexShrink: 0 }}>
          {isActive && isPlaying ? <span style={{ color: 'var(--accent)' }}>▶</span> : idx + 1}
        </span>
      )}
      <div style={{ width: 38, height: 38, borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
        <Image src={track.cover} alt={track.title} width={38} height={38} style={{ objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 600,
          color: isActive ? 'var(--accent)' : 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{track.title}</p>
        <p style={{ fontSize: 11, opacity: 0.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.artist}</p>
      </div>
      <span style={{ fontSize: 11, opacity: 0.35, fontFamily: 'monospace', flexShrink: 0 }}>{formatTime(track.duration)}</span>
      <button onClick={(e) => { e.stopPropagation(); onFavorite(); }} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '3px', flexShrink: 0,
      }}>
        <Heart size={13} fill={track.favorite ? 'var(--accent)' : 'none'} color={track.favorite ? 'var(--accent)' : 'var(--text-muted)'} />
      </button>
      <button onClick={onPlayPause} style={{
        background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer',
        width: 28, height: 28, borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        color: 'var(--text-primary)',
      }}>
        {isActive && isPlaying
          ? <Pause size={12} fill="currentColor" />
          : <Play size={12} fill="currentColor" style={{ marginLeft: 1 }} />}
      </button>
    </div>
  );
}
