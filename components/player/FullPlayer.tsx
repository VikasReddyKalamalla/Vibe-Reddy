'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { 
  X, Heart, Share2, MoreHorizontal,
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { playTrack, pauseAudio, resumeAudio, seekAudio } from '@/lib/audio';
import CircularSpectrum from '@/components/visualizer/CircularSpectrum';

export default function FullPlayer() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isFullPlayerOpen = usePlayerStore((s) => s.isFullPlayerOpen);
  const setFullPlayerOpen = usePlayerStore((s) => s.setFullPlayerOpen);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const tracks = useLibraryStore((s) => s.tracks);

  const isFavorite = currentTrack
    ? tracks.find((t) => t.id === currentTrack.id)?.favorite ?? false
    : false;

  const nextTracks = queue.slice(queueIndex + 1, queueIndex + 11);
  const relatedTracks = tracks
    .filter(t => t.genre === currentTrack?.genre && t.id !== currentTrack?.id)
    .slice(0, 5);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) pauseAudio();
    else resumeAudio();
  };

  const handleTrackClick = (track: any) => {
    const idx = tracks.findIndex(t => t.id === track.id);
    usePlayerStore.getState().setQueue(tracks, idx);
    setTimeout(() => playTrack(track), 0);
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence mode="wait">
      {isFullPlayerOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: '#12121A',
            color: 'white',
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          {/* Background - Blurred Album Art */}
          <div style={{
            position: 'absolute',
            inset: '-50px',
            backgroundImage: `url(${currentTrack.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(80px) brightness(0.2)',
            transform: 'scale(1.2)',
            zIndex: 0,
            transition: 'background-image 0.8s ease'
          }} />

          {/* Header */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 0,
            right: 0,
            padding: '0 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                <Image src="https://picsum.photos/id/64/100/100" alt="Avatar" width={40} height={40} />
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 4 }}>Playlist</p>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Daily Mix</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => setFullPlayerOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
            {/* Left Content - Player Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '100px 40px 40px' }}>
              
              {/* Circular Player Area */}
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ position: 'relative', width: 440, height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  
                  {/* Circular Audio Spectrum — larger canvas, centered via negative offset */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 3,
                  }}>
                    <CircularSpectrum
                      isPlaying={isPlaying}
                      size={660}
                      radius={155}
                      trackId={currentTrack.id}
                    />
                  </div>


                  {/* Album Cover Circle */}
                  <div style={{ 
                    width: 240, 
                    height: 240, 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    position: 'relative',
                    boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                    zIndex: 2
                  }}>
                    <Image src={currentTrack.cover} alt={currentTrack.title} width={240} height={240} style={{ objectFit: 'cover' }} />
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      background: 'rgba(0,0,0,0.3)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <button 
                        onClick={handlePlayPause}
                        style={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: '50%', 
                          background: currentTrack.title === 'Solitaires' ? '#ff4d8d' : '#E8593C', 
                          border: 'none', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'white',
                          boxShadow: `0 0 20px ${currentTrack.title === 'Solitaires' ? 'rgba(255, 77, 141, 0.4)' : 'rgba(232, 89, 60, 0.4)'}`
                        }}>
                        {isPlaying ? <Pause size={40} fill="white" /> : <Play size={40} fill="white" style={{ marginLeft: 6 }} />}
                      </button>
                    </div>
                  </div>

                  {/* Playback Controls Side */}
                  <button onClick={() => { const s = usePlayerStore.getState(); const id = s.currentTrack?.id; s.prev(); const ns = usePlayerStore.getState(); if (ns.currentTrack) playTrack(ns.currentTrack); }} style={{ position: 'absolute', left: -60, background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><SkipBack size={48} fill="currentColor" /></button>
                  <button onClick={() => { const s = usePlayerStore.getState(); const id = s.currentTrack?.id; s.next(); const ns = usePlayerStore.getState(); if (ns.currentTrack && ns.currentTrack.id !== id) playTrack(ns.currentTrack); }} style={{ position: 'absolute', right: -60, background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}><SkipForward size={48} fill="currentColor" /></button>
                  
                  {/* Sub Controls */}
                  <button onClick={toggleShuffle} style={{ position: 'absolute', left: 40, bottom: 40, background: 'none', border: 'none', color: isShuffle ? '#ff4d8d' : 'white', cursor: 'pointer', opacity: 0.8 }}><Shuffle size={20} /></button>
                  <button onClick={cycleRepeat} style={{ position: 'absolute', right: 40, bottom: 40, background: 'none', border: 'none', color: repeatMode !== 'none' ? '#ff4d8d' : 'white', cursor: 'pointer', opacity: 0.8 }}><Repeat size={20} /></button>
                  
                  <div style={{ position: 'absolute', bottom: 10, fontSize: 14, opacity: 0.8 }}>{formatTime(currentTime)}</div>
                </div>
              </div>

              {/* Bottom Track Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Seek Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.5, marginBottom: 6 }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={duration > 0 ? (currentTime / duration) * 100 : 0}
                    onChange={(e) => seekAudio((parseFloat(e.target.value) / 100) * duration)}
                    style={{
                      width: '100%',
                      height: 4,
                      accentColor: '#E8593C',
                      cursor: 'pointer',
                      borderRadius: 2,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }}>
                      {Array.from({length: 10}).map((_, i) => (
                        <div key={i} style={{ width: 4, height: isPlaying ? (8 + i * 3) : 4, background: i % 2 === 0 ? '#cc44ff' : '#e080ff', borderRadius: 2, transition: 'height 0.2s' }} />
                      ))}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{currentTrack.title}</h2>
                      <p style={{ opacity: 0.5 }}>{currentTrack.artist}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <button onClick={() => toggleFavorite(currentTrack.id)} style={{ background: 'none', border: 'none', color: isFavorite ? '#ff4d8d' : 'white', cursor: 'pointer' }}>
                      <Heart size={24} fill={isFavorite ? '#ff4d8d' : 'none'} />
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Share2 size={24} /></button>
                    <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><MoreHorizontal size={24} /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Sidebar */}
            <div style={{ 
              width: 320, 
              borderLeft: '1px solid rgba(255,255,255,0.1)', 
              display: 'flex', 
              flexDirection: 'column',
              padding: '100px 24px 40px',
              background: 'rgba(0,0,0,0.2)',
              overflowY: 'auto'
            }}>
              <div style={{ marginBottom: 40 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, opacity: 0.5, marginBottom: 20 }}>Next up</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {nextTracks.map(t => (
                    <div 
                      key={t.id} 
                      onClick={(e) => { e.stopPropagation(); handleTrackClick(t); }}
                      style={{ 
                        display: 'flex', 
                        gap: 12, 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'background 0.2s'
                      }}
                      className="sidebar-track-item"
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                        <Image src={t.cover} alt={t.title} width={44} height={44} style={{ objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                        <p style={{ fontSize: 11, opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.artist}</p>
                        <p style={{ fontSize: 10, color: '#ff4d8d' }}>{formatTime(t.duration)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, opacity: 0.5, marginBottom: 20 }}>Related</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {relatedTracks.map(t => (
                    <div 
                      key={t.id} 
                      onClick={(e) => { e.stopPropagation(); handleTrackClick(t); }}
                      style={{ 
                        display: 'flex', 
                        gap: 12, 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'background 0.2s'
                      }}
                      className="sidebar-track-item"
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                        <Image src={t.cover} alt={t.title} width={44} height={44} style={{ objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                        <p style={{ fontSize: 11, opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.artist}</p>
                        <p style={{ fontSize: 10, color: '#ff4d8d' }}>{formatTime(t.duration)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <style jsx>{`
            .sidebar-track-item:hover {
              background: rgba(255,255,255,0.05);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
