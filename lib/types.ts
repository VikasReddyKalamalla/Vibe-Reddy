export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  src: string;
  cover: string;
  mood: string[];
  genre: string;
  year: number;
  favorite: boolean;
  playCount: number;
  lastPlayed: string | null;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  trackIds: string[];
  createdAt: string;
}

export interface Mood {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  trackIds: string[];
}

export type RepeatMode = 'none' | 'one' | 'all';
export type ViewMode = 'grid' | 'list';
export type ThemeMode = 'dark' | 'light' | 'amoled' | 'dynamic';
export type VisualizerMode = 'bars' | 'wave' | 'circle';
export type SortBy = 'title' | 'artist' | 'album' | 'playCount' | 'recentlyAdded' | 'duration';
