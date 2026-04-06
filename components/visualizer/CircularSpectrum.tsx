'use client';

import React, { useRef, useEffect } from 'react';

interface CircularSpectrumProps {
  isPlaying: boolean;
  size: number;
  radius: number;
  trackId?: string;
}

// Shared audio context + analyser so we only create once
let sharedCtx: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let sharedData: Uint8Array | null = null;
let sharedSource: MediaElementAudioSourceNode | null = null;

function getOrCreateAnalyser(): { analyser: AnalyserNode; data: Uint8Array } | null {
  try {
    if (!sharedCtx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      sharedCtx = new AC();
    }
    if (sharedCtx.state === 'suspended') sharedCtx.resume();

    if (!sharedAnalyser) {
      sharedAnalyser = sharedCtx.createAnalyser();
      sharedAnalyser.fftSize = 512;
      sharedAnalyser.smoothingTimeConstant = 0.8;
      sharedData = new Uint8Array(sharedAnalyser.frequencyBinCount);
    }

    // Find Howler's audio element and connect if not yet done
    if (!sharedSource) {
      const audioEls = Array.from(document.querySelectorAll('audio'));
      const el = audioEls[audioEls.length - 1];
      if (el) {
        sharedSource = sharedCtx.createMediaElementSource(el);
        sharedSource.connect(sharedAnalyser);
        sharedAnalyser.connect(sharedCtx.destination);
      }
    }

    if (sharedAnalyser && sharedData) {
      return { analyser: sharedAnalyser, data: sharedData };
    }
  } catch (e) {
    // ignore — fallback will handle it
  }
  return null;
}

// Derive a vivid HSL color from a track id string
function colorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 90%, 60%)`;
}

export default function CircularSpectrum({
  isPlaying,
  size,
  radius,
  trackId = 'default',
}: CircularSpectrumProps) {
  const color = colorFromId(trackId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const audioRef = useRef<{ analyser: AnalyserNode; data: Uint8Array } | null>(null);

  useEffect(() => {
    if (isPlaying && !audioRef.current) {
      audioRef.current = getOrCreateAnalyser();
    }
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const BARS = 180;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Try to get audio ref if not yet connected
      if (isPlaying && !audioRef.current) {
        audioRef.current = getOrCreateAnalyser();
      }

      // Build amplitude array
      const amplitudes = new Float32Array(BARS);
      const t = Date.now() / 1000;

      if (audioRef.current) {
        audioRef.current.analyser.getByteFrequencyData(
          audioRef.current.data as Uint8Array<ArrayBuffer>
        );
        const raw = audioRef.current.data;
        // Check if we actually have signal
        const sum = raw.reduce((a, b) => a + b, 0);

        if (sum > 0) {
          for (let i = 0; i < BARS; i++) {
            const idx = Math.floor((i / BARS) * raw.length * 0.7);
            amplitudes[i] = Math.min(1, (raw[idx] / 255) * 2.5);
          }
        } else {
          // No real signal — use animated fake
          for (let i = 0; i < BARS; i++) {
            amplitudes[i] = isPlaying
              ? Math.abs(Math.sin(t * 4 + i * 0.18) * Math.cos(t * 2.5 + i * 0.09)) * 0.85
              : 0;
          }
        }
      } else {
        // No analyser yet — animated fake
        for (let i = 0; i < BARS; i++) {
          amplitudes[i] = isPlaying
            ? Math.abs(Math.sin(t * 4 + i * 0.18) * Math.cos(t * 2.5 + i * 0.09)) * 0.85
            : 0;
        }
      }

      if (isPlaying) rotationRef.current += 0.005;
      const rot = rotationRef.current;

      // Draw bars radiating from circle
      for (let i = 0; i < BARS; i++) {
        const v = amplitudes[i];
        const angle = (i / BARS) * Math.PI * 2 + rot - Math.PI / 2;
        const barLen = v * radius * 0.7 + 1;

        const x1 = cx + Math.cos(angle) * (radius - 1);
        const y1 = cy + Math.sin(angle) * (radius - 1);
        const x2 = cx + Math.cos(angle) * (radius + barLen);
        const y2 = cy + Math.sin(angle) * (radius + barLen);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.5 + v * 0.5;
        ctx.shadowBlur = 8 + v * 16;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.restore();
      }

      // Always-visible glow ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
      ctx.stroke();
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, radius, color, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: 'block', pointerEvents: 'none' }}
    />
  );
}
