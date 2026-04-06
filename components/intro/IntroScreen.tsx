'use client';

import React, { useEffect, useRef, useState } from 'react';

interface IntroScreenProps {
  onFinished: () => void;
}

export default function IntroScreen({ onFinished }: IntroScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);

  const finish = () => {
    setFading(true);
    setTimeout(onFinished, 600);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — skip intro
        finish();
      });
    }

    const handleEnded = () => finish();
    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={finish}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      <video
        ref={videoRef}
        src="/vibereddy-intro.mp4"
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <span
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.45)',
          fontSize: '13px',
          letterSpacing: '0.5px',
          pointerEvents: 'none',
        }}
      >
        Click anywhere to skip
      </span>
    </div>
  );
}
