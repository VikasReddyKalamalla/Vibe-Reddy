'use client';

import React, { useState } from 'react';
import { Music, LayoutGrid, List, BarChart3, Heart, Home, User } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import SearchBar from '@/components/library/SearchBar';
import TrackCard from '@/components/library/TrackCard';
import TrackList from '@/components/library/TrackList';
import MoodSelector from '@/components/mood/MoodSelector';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { usePreferencesStore } from '@/store/preferencesStore';
import AudioVisualizer from '@/components/visualizer/AudioVisualizer';

export default function HomePage() {
  const viewMode = useLibraryStore((s) => s.viewMode);
  const setViewMode = useLibraryStore((s) => s.setViewMode);
  const sortBy = useLibraryStore((s) => s.sortBy);
  const setSort = useLibraryStore((s) => s.setSort);
  const favoritesOnly = useLibraryStore((s) => s.favoritesOnly);
  const toggleFavoritesOnly = useLibraryStore((s) => s.toggleFavoritesOnly);
  const getFilteredTracks = useLibraryStore((s) => s.getFilteredTracks);
  const searchQuery = useLibraryStore((s) => s.searchQuery);
  const activeMood = useLibraryStore((s) => s.activeMood);
  const activeFilter = useLibraryStore((s) => s.activeFilter);
  const trendingView = useLibraryStore((s) => s.trendingView);
  const setTrendingView = useLibraryStore((s) => s.setTrendingView);
  const resetFilters = useLibraryStore((s) => s.resetFilters);

  const filteredTracks = getFilteredTracks();
  const [logoOpen, setLogoOpen] = useState(false);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
    }}>
      {/* Background visualizer */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: 0,
        right: 0,
        height: '200px',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <AudioVisualizer width={1200} height={200} opacity={0.08} />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px 20px',
      }}>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '24px',
          padding: '12px 0',
        }}>
          {/* Left: Logo and Home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/images/vibereddy-logo.png"
                alt="VibeReddy"
                onClick={() => setLogoOpen(true)}
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  cursor: 'zoom-in',
                  transition: 'transform 0.2s',
                }}
              />
              <h1
                onClick={() => setTrendingView(true)}
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.5px',
                  cursor: 'pointer',
                }}
              >
                VibeReddy
              </h1>
            </div>

            <button
              className={`btn-control-sm ${trendingView ? 'active' : ''}`}
              onClick={() => resetFilters()}
              title="Home / Trending"
              style={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                boxShadow: '0 2px 8px var(--shadow)',
              }}
            >
              <Home size={20} />
            </button>
          </div>

          <div style={{ flex: 1, maxWidth: '500px' }}>
            <SearchBar />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Profile Button */}
            <button
              onClick={() => usePreferencesStore.getState().toggleProfile?.()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, var(--accent), #ff8fb1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 77, 141, 0.3)',
                color: 'white',
              }}
              title="View Profile"
            >
              <User size={20} />
            </button>

            <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }} />
            <ThemeToggle />
            <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }} />
            <button
              className={`btn-control ${viewMode === 'grid' && !trendingView ? 'active' : ''}`}
              onClick={() => { setViewMode('grid'); setTrendingView(false); }}
              title="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`btn-control ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => { setViewMode('list'); setTrendingView(false); }}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>
        </header>

        {/* Mood Selector */}
        <div style={{ marginBottom: '20px' }}>
          <MoodSelector />
        </div>

        {/* Filter bar */}
        {!trendingView && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className={`btn-control ${favoritesOnly ? 'active' : ''}`}
                onClick={toggleFavoritesOnly}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-lg)',
                  border: favoritesOnly ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: favoritesOnly ? 'var(--accent-subtle)' : 'transparent',
                }}
              >
                <Heart size={14} fill={favoritesOnly ? 'var(--accent)' : 'none'} />
                Favorites
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Sort:</span>
              <div style={{ position: 'relative' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSort(e.target.value as typeof sortBy)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    padding: '8px 36px 8px 16px',
                    borderRadius: '24px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 500,
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: '140px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px var(--shadow)',
                  }}
                >
                  <option value="title">Title</option>
                  <option value="artist">Artist</option>
                  <option value="album">Album</option>
                  <option value="playCount">Most Played</option>
                  <option value="recentlyAdded">Recently Added</option>
                  <option value="duration">Duration</option>
                </select>
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-primary)',
                }}>
                  <Music size={14} style={{ opacity: 0.5 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Title */}
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '16px',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {trendingView ? (
            <>
              <BarChart3 size={20} color="var(--accent)" />
              Trending Now
            </>
          ) : searchQuery ? (
            `Search Results for "${searchQuery}"`
          ) : favoritesOnly ? (
            'Your Favorites'
          ) : activeMood ? (
            `Vibing: ${activeMood.charAt(0).toUpperCase() + activeMood.slice(1)}`
          ) : activeFilter ? (
            `Genre: ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`
          ) : (
            'Library'
          )}
        </h2>

        {/* Track count */}
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}>
          {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        {/* Content */}
        {filteredTracks.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            color: 'var(--text-muted)',
          }}>
            <Music size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>
              {searchQuery ? 'No tracks found' : 'Your library is empty'}
            </p>
            <p style={{ fontSize: '13px' }}>
              {searchQuery
                ? 'Try a different search term'
                : 'Add MP3 files to public/music/ to get started'}
            </p>
          </div>
        ) : viewMode === 'grid' || trendingView ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: trendingView
              ? 'repeat(auto-fill, minmax(110px, 1fr))'
              : 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: trendingView ? '12px' : '16px',
            gridAutoRows: 'max-content',
          }}>
            {filteredTracks.map((track, idx) => (
              <TrackCard
                key={track.id}
                track={track}
                index={idx}
                allTracks={filteredTracks}
                compact={trendingView}
              />
            ))}
          </div>
        ) : (
          <TrackList tracks={filteredTracks} />
        )}
      </div>

      {/* Logo Lightbox */}
      {logoOpen && (
        <div
          onClick={() => setLogoOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <img
              src="/images/vibereddy-logo.png"
              alt="VibeReddy"
              style={{
                width: 'min(80vw, 480px)',
                height: 'min(80vw, 480px)',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 0 80px rgba(204,68,255,0.4), 0 32px 64px rgba(0,0,0,0.6)',
                border: '3px solid rgba(255,255,255,0.08)',
              }}
            />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
