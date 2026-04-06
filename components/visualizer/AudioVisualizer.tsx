'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { usePreferencesStore } from '@/store/preferencesStore';
import { usePlayerStore } from '@/store/playerStore';

interface AudioVisualizerProps {
  width?: number;
  height?: number;
  opacity?: number;
}

export default function AudioVisualizer({
  width = 800,
  height = 300,
  opacity = 0.3,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const visualizerMode = usePreferencesStore((s) => s.visualizerMode);
  const visualizerEnabled = usePreferencesStore((s) => s.visualizerEnabled);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const accentColor = usePreferencesStore((s) => s.accentColor);

  const connectAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }
      
      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 512;
        analyserRef.current.smoothingTimeConstant = 0.8;
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      }

      // Try to connect to audio element
      if (!sourceRef.current) {
        const audioElements = document.querySelectorAll('audio');
        // Find the one that matches our player (Howler uses a single generic audio element usually)
        const audioEl = audioElements[audioElements.length - 1];
        if (audioEl) {
          sourceRef.current = audioContext.createMediaElementSource(audioEl);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContext.destination);
        }
      }
    } catch (err) {
      console.warn('Audio Visualizer connection failed:', err);
    }
  }, []);

  const drawBars = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, data: Uint8Array) => {
    const barCount = 64;
    const barWidth = (w / barCount) * 0.7;
    const gap = (w / barCount) * 0.3;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * data.length);
      const value = data[dataIndex] / 255;
      const barHeight = value * h * 0.9;

      const x = i * (barWidth + gap);
      const hue = (i / barCount) * 40; // warm gradient
      ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.6 + value * 0.4})`;
      
      // Using fillRect instead of roundRect for better build compatibility
      ctx.fillRect(x, h - barHeight, barWidth, barHeight);
    }
  }, []);

  const drawWave = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, data: Uint8Array) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = accentColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = accentColor;
    ctx.beginPath();

    const sliceWidth = w / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = (v * h) / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [accentColor]);

  const drawCircle = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, data: Uint8Array) => {
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) * 0.25;
    const barCount = 64;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * data.length);
      const value = data[dataIndex] / 255;
      const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
      const barLength = value * radius * 0.8;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barLength);
      const y2 = centerY + Math.sin(angle) * (radius + barLength);

      const hue = (i / barCount) * 360;
      ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${0.5 + value * 0.5})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
    ctx.strokeStyle = `${accentColor}40`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [accentColor]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    let data: any;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (analyser && dataArray) {
      if (visualizerMode === 'wave') {
        analyser.getByteTimeDomainData(dataArray as any);
      } else {
        analyser.getByteFrequencyData(dataArray as any);
      }
      data = dataArray;
    } else {
      // Fallback: generate fake data for visual effect
      const fallbackData = new Uint8Array(256);
      const time = Date.now() / 1000;
      for (let i = 0; i < fallbackData.length; i++) {
        fallbackData[i] = isPlaying
          ? Math.floor(128 + 80 * Math.sin(time * 3 + i * 0.15) * Math.cos(time * 1.5 + i * 0.08))
          : Math.floor(128 + 10 * Math.sin(time + i * 0.1));
      }
      data = fallbackData;
    }

    switch (visualizerMode) {
      case 'bars':
        drawBars(ctx, w, h, data);
        break;
      case 'wave':
        drawWave(ctx, w, h, data);
        break;
      case 'circle':
        drawCircle(ctx, w, h, data);
        break;
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [visualizerMode, isPlaying, drawBars, drawWave, drawCircle]);

  useEffect(() => {
    if (!visualizerEnabled) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    if (isPlaying) connectAudio();
    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [visualizerEnabled, isPlaying, draw, connectAudio]);

  if (!visualizerEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="visualizer-canvas"
      style={{
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
}
