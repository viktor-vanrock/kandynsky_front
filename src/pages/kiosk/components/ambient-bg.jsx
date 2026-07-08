import React from 'react';

// ambient-bg.jsx — Ambient "video" background layer (CSS-only, runs behind every screen)
// Pure CSS/SVG animation; no real video file. Designed to feel like a slow-moving
// volumetric loop — drifting blobs, flowing grid, particle dust.

const AmbientBG = ({ tint = '#3F81FD', intensity = 1 }) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden', pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Deep base gradient — replaces flat #0A0A0A */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 110% 80% at 20% 0%, ${tint}10 0%, transparent 55%),
                     radial-gradient(ellipse 90% 70% at 90% 100%, ${tint}0E 0%, transparent 60%),
                     #050507`,
      }} />

      {/* Slow drifting blob A */}
      <div style={{
        position: 'absolute',
        top: '-20%', left: '-10%',
        width: '70%', height: '70%',
        background: `radial-gradient(circle at 50% 50%, ${tint}40 0%, ${tint}10 35%, transparent 65%)`,
        filter: 'blur(80px)',
        opacity: 0.7 * intensity,
        animation: 'amb-drift-a 28s ease-in-out infinite',
        mixBlendMode: 'screen',
      }} />

      {/* Slow drifting blob B */}
      <div style={{
        position: 'absolute',
        bottom: '-25%', right: '-15%',
        width: '70%', height: '70%',
        background: `radial-gradient(circle at 50% 50%, #F9B2FD30 0%, #F9B2FD08 40%, transparent 65%)`,
        filter: 'blur(90px)',
        opacity: 0.55 * intensity,
        animation: 'amb-drift-b 36s ease-in-out infinite',
        mixBlendMode: 'screen',
      }} />

      {/* Subtle mint accent */}
      <div style={{
        position: 'absolute',
        top: '40%', left: '60%',
        width: '40%', height: '40%',
        background: `radial-gradient(circle at 50% 50%, #24F2BF22 0%, transparent 60%)`,
        filter: 'blur(70px)',
        opacity: 0.4 * intensity,
        animation: 'amb-drift-c 44s ease-in-out infinite',
        mixBlendMode: 'screen',
      }} />

      {/* Flow lines — moving stripes evoking print head paths */}
      <svg
        style={{ position: 'absolute', inset: 0, opacity: 0.10 * intensity }}
        width="100%" height="100%"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="flowline" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"  stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[12, 22, 36, 48, 58, 72, 82, 92].map((y, i) => (
          <line
            key={i}
            x1="0" x2="100%"
            y1={`${y}%`} y2={`${y}%`}
            stroke="url(#flowline)"
            strokeWidth="1"
            style={{
              animation: `amb-flow ${18 + i * 2}s linear infinite`,
              animationDelay: `${-i * 1.4}s`,
              transformOrigin: 'center',
            }}
          />
        ))}
      </svg>

      {/* Static dot pattern with fade */}
      <svg
        style={{ position: 'absolute', inset: 0, opacity: 0.5 }}
        width="100%" height="100%"
      >
        <defs>
          <pattern id="amb-dot" width="64" height="64" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="rgba(255,255,255,0.045)" />
          </pattern>
          <radialGradient id="amb-dot-fade" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="1" />
          </radialGradient>
          <mask id="amb-dot-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect width="100%" height="100%" fill="url(#amb-dot-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#amb-dot)" mask="url(#amb-dot-mask)" />
      </svg>

      {/* Floating dust particles */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 14 }).map((_, i) => {
          const left = (i * 71) % 100;
          const top  = (i * 53 + 17) % 100;
          const size = 2 + (i % 3);
          const dur  = 18 + (i * 3) % 22;
          return (
            <span key={i} style={{
              position: 'absolute',
              left: `${left}%`, top: `${top}%`,
              width: size, height: size, borderRadius: '50%',
              background: i % 4 === 0 ? tint : '#fff',
              opacity: 0.18 + (i % 5) * 0.04,
              boxShadow: i % 4 === 0 ? `0 0 ${size * 4}px ${tint}` : `0 0 ${size * 3}px rgba(255,255,255,0.4)`,
              animation: `amb-float-${i % 3} ${dur}s ease-in-out infinite`,
              animationDelay: `${-i * 1.7}s`,
            }} />
          );
        })}
      </div>

      {/* Vignette so foreground content reads */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};

export { AmbientBG };
