'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track, Playlist, SortBy } from '@/lib/types';
import tracksData from '@/data/tracks.json';
import playlistsData from '@/data/playlists.json';

interface LibraryState {
  tracks: Track[];
  playlists: Playlist[];
  searchQuery: string;
  activeFilter: string | null;
  activeMood: string | null;
  sortBy: SortBy;
  viewMode: 'grid' | 'list';
  favoritesOnly: boolean;
  trendingView: boolean;

  // Actions
  setSearch: (query: string) => void;
  setFilter: (filter: string | null) => void;
  setMood: (mood: string | null) => void;
  setSort: (sort: SortBy) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setTrendingView: (trending: boolean) => void;
  toggleFavoritesOnly: () => void;
  resetFilters: () => void;
  toggleFavorite: (trackId: string) => void;
  incrementPlayCount: (trackId: string) => void;
  updateLastPlayed: (trackId: string) => void;

  // Computed
  getFilteredTracks: () => Track[];
  getMostPlayed: () => Track[];
  getRecentlyPlayed: () => Track[];
  getFavorites: () => Track[];
  getNeverPlayed: () => Track[];
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      tracks: tracksData.tracks as Track[],
      playlists: playlistsData.playlists as Playlist[],
      searchQuery: '',
      activeFilter: null,
      activeMood: null,
      sortBy: 'title',
      viewMode: 'grid',
      favoritesOnly: false,
      trendingView: false,

      setSearch: (query) => set({ searchQuery: query, trendingView: false }),
      setFilter: (filter) => set({ activeFilter: filter, trendingView: false }),
      setMood: (mood) => set({ activeMood: mood, trendingView: false }),
      setSort: (sort) => set({ sortBy: sort, trendingView: false }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setTrendingView: (trending) => set({
        trendingView: trending,
        // Reset other filters when entering trending view
        searchQuery: trending ? '' : get().searchQuery,
        activeMood: trending ? null : get().activeMood,
        activeFilter: trending ? null : get().activeFilter,
        favoritesOnly: trending ? false : get().favoritesOnly,
      }),
      toggleFavoritesOnly: () => set((s) => ({ favoritesOnly: !s.favoritesOnly, trendingView: false })),
      resetFilters: () => set({
        searchQuery: '',
        activeFilter: null,
        activeMood: null,
        favoritesOnly: false,
        trendingView: true, // Default to trending view on reset
      }),

      toggleFavorite: (trackId) =>
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === trackId ? { ...t, favorite: !t.favorite } : t
          ),
        })),

      incrementPlayCount: (trackId) =>
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === trackId ? { ...t, playCount: t.playCount + 1 } : t
          ),
        })),

      updateLastPlayed: (trackId) =>
        set((s) => ({
          tracks: s.tracks.map((t) =>
            t.id === trackId
              ? { ...t, lastPlayed: new Date().toISOString() }
              : t
          ),
        })),

      getFilteredTracks: () => {
        const state = get();
        // Trending view logic - if trending, show all tracks but sorted by playcount or just random high-traffic ones
        if (state.trendingView) {
          return [...state.tracks]
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, 300); // Expanded for larger library
        }

        let filtered = [...state.tracks];

        // Search filter
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (t) =>
              t.title.toLowerCase().includes(query) ||
              t.artist.toLowerCase().includes(query) ||
              t.album.toLowerCase().includes(query) ||
              t.genre.toLowerCase().includes(query)
          );
        }

        // Mood filter
        if (state.activeMood) {
          filtered = filtered.filter((t) => t.mood.includes(state.activeMood!));
        }

        // Genre filter
        if (state.activeFilter) {
          filtered = filtered.filter((t) => t.genre === state.activeFilter);
        }

        // Favorites only
        if (state.favoritesOnly) {
          filtered = filtered.filter((t) => t.favorite);
        }

        // Sort
        filtered.sort((a, b) => {
          switch (state.sortBy) {
            case 'title':
              return a.title.localeCompare(b.title);
            case 'artist':
              return a.artist.localeCompare(b.artist);
            case 'album':
              return a.album.localeCompare(b.album);
            case 'playCount':
              return b.playCount - a.playCount;
            case 'duration':
              return a.duration - b.duration;
            case 'recentlyAdded':
              return b.year - a.year;
            default:
              return 0;
          }
        });

        return filtered;
      },

      getMostPlayed: () => {
        const state = get();
        return [...state.tracks]
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, 20);
      },

      getRecentlyPlayed: () => {
        const state = get();
        return [...state.tracks]
          .filter((t) => t.lastPlayed)
          .sort(
            (a, b) =>
              new Date(b.lastPlayed!).getTime() -
              new Date(a.lastPlayed!).getTime()
          )
          .slice(0, 50);
      },

      getFavorites: () => {
        return get().tracks.filter((t) => t.favorite);
      },

      getNeverPlayed: () => {
        return get().tracks.filter((t) => t.playCount === 0);
      },
    }),
    {
      name: 'library-state-v2',
      partialize: (state) => ({
        playlists: state.playlists,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
      }),
    }
  )
);
