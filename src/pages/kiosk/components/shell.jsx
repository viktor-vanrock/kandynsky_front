import React from 'react';
import { IconArrowLeft, IconWifi } from './icons.jsx';

// shell.jsx — общие элементы: статус-бар принтера, фон, модель-плейсхолдер

// Hero-style 3D model placeholder (animated blob — мы не рисуем реальную 3D модель)
const ModelBlob = ({ size = 320, seed = 0, variant = 'default' }) => {
  const palettes = {
    default: ['#3F81FD', '#0000FF', '#141416'],
    pink:    ['#F9B2FD', '#3F81FD', '#141416'],
    mint:    ['#24F2BF', '#3F81FD', '#141416'],
    amber:   ['#E48039', '#F9B2FD', '#141416'],
  };
  const [a, b, c] = palettes[variant] || palettes.default;
  const dx = (seed * 17) % 30 - 15;
  const dy = (seed * 31) % 30 - 15;
  return (
    <div style={{
      width: size, height: size,
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at ${40+dx}% ${40+dy}%, ${a} 0%, ${b} 40%, ${c} 75%)`,
        filter: 'blur(20px)',
        borderRadius: '50%',
        opacity: 0.9,
      }} />
      <div style={{
        position: 'absolute', inset: '15%',
        background: `radial-gradient(circle at 30% 30%, ${a}, ${b} 70%)`,
        borderRadius: '42%',
        boxShadow: `inset -20px -20px 40px rgba(0,0,0,0.5), inset 20px 20px 40px rgba(255,255,255,0.1)`,
        animation: 'breathe 3.2s ease-in-out infinite',
      }} />
    </div>
  );
};

// Большая иконка для карточки каталога (глиф, не настоящая модель)
const ModelGlyph = ({ shape = 'cube', color = '#3F81FD', size = 140 }) => {
  const shapes = {
    cube: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 10L85 28v36L50 82 15 64V28z" fill={color} opacity="0.2" />
        <path d="M50 10L85 28v36L50 82 15 64V28z" stroke={color} strokeWidth="1.5" />
        <path d="M15 28l35 18 35-18M50 46v36" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    sphere: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="36" fill={color} opacity="0.18" />
        <circle cx="50" cy="50" r="36" stroke={color} strokeWidth="1.5" />
        <ellipse cx="50" cy="50" rx="36" ry="12" stroke={color} strokeWidth="1.2" opacity="0.6" />
        <ellipse cx="50" cy="50" rx="12" ry="36" stroke={color} strokeWidth="1.2" opacity="0.6" />
      </svg>
    ),
    torus: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <ellipse cx="50" cy="55" rx="38" ry="18" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2" />
        <ellipse cx="50" cy="55" rx="20" ry="8" stroke={color} strokeWidth="1.5" fill="#0A0A0A" />
      </svg>
    ),
    pyramid: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 12L88 80H12z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
        <path d="M50 12v68M12 80l38-34 38 34" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    gear: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <g stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.18">
          <path d="M50 20v-8M50 88v-8M20 50h-8M88 50h-8M29 29l-6-6M77 77l-6-6M29 71l-6 6M77 23l-6 6" />
          <circle cx="50" cy="50" r="24" />
          <circle cx="50" cy="50" r="10" fill="#0A0A0A" />
        </g>
      </svg>
    ),
    vase: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M35 20h30v8c0 8-8 10-8 22s8 14 8 22v14H35V72c0-8 8-10 8-22S35 36 35 28z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
        <path d="M35 20h30" stroke={color} strokeWidth="2" />
      </svg>
    ),
    helmet: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M20 60c0-20 14-34 30-34s30 14 30 34v18H20z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
        <rect x="28" y="50" width="44" height="12" rx="4" fill="#0A0A0A" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    robot: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <rect x="30" y="20" width="40" height="36" rx="6" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
        <circle cx="42" cy="36" r="3" fill={color} />
        <circle cx="58" cy="36" r="3" fill={color} />
        <rect x="34" y="58" width="32" height="30" rx="3" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
        <path d="M50 12v8M22 62h-6M78 62h6" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    dino: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M25 72c0-18 12-28 25-28s25 10 25 28c0 8 0 8-6 8H31c-6 0-6 0-6-8z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
        <path d="M70 44c8-4 12-12 12-20-8 2-12 8-12 14M50 44V30M46 30h8" stroke={color} strokeWidth="1.5" />
        <circle cx="40" cy="56" r="2" fill={color} />
      </svg>
    ),
    heart: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 82S18 62 18 38a18 18 0 0132-12 18 18 0 0132 12c0 24-32 44-32 44z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    rocket: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <path d="M50 12c-12 12-18 24-18 38v22h36V50c0-14-6-26-18-38z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
        <circle cx="50" cy="42" r="6" stroke={color} strokeWidth="1.5" />
        <path d="M32 58l-8 8v8l10-2M68 58l8 8v8l-10-2M44 72l6 14 6-14" stroke={color} strokeWidth="1.5" />
      </svg>
    ),
    flower: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <g stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.2">
          <circle cx="50" cy="30" r="12" />
          <circle cx="70" cy="50" r="12" />
          <circle cx="50" cy="70" r="12" />
          <circle cx="30" cy="50" r="12" />
          <circle cx="50" cy="50" r="8" fill="#0A0A0A" />
        </g>
      </svg>
    ),
  };
  return shapes[shape] || shapes.cube;
};

// Printer pill в углу — показывает статус 3D принтера
const PrinterPill = ({ status = 'ready', onClick, lang = 'ru' }) => {
  const configs = {
    ru: {
      ready:    { dot: 'var(--mint)', label: 'Принтер готов',   sub: 'PLA · белый' },
      printing: { dot: 'var(--accent)', label: 'Идёт печать',    sub: '52% · 21 мин' },
      warmup:   { dot: 'var(--amber)', label: 'Прогрев',          sub: '68 / 210 °C' },
    },
    en: {
      ready:    { dot: 'var(--mint)', label: 'Printer ready',   sub: 'PLA · white' },
      printing: { dot: 'var(--accent)', label: 'Printing',       sub: '52% · 21 min' },
      warmup:   { dot: 'var(--amber)', label: 'Warming up',      sub: '68 / 210 °C' },
    },
  };
  const config = (configs[lang] || configs.ru)[status];
  return (
    <div
      onClick={onClick}
      className="tappable"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 14,
        padding: '14px 22px 14px 18px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 999,
        backdropFilter: 'blur(20px)',
      }}
    >
      <span style={{
        width: 10, height: 10, borderRadius: '50%',
        background: config.dot,
        boxShadow: `0 0 12px ${config.dot}`,
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="text" style={{ fontSize: 15, color: '#fff', lineHeight: 1 }}>{config.label}</span>
        <span className="text" style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1 }}>{config.sub}</span>
      </div>
      <IconWifi size={18} />
    </div>
  );
};

// Большой Kandinsky wordmark
const KandinskyMark = ({ color = '#fff', size = 40 }) => (
  <div style={{
    fontFamily: 'var(--display)', fontWeight: 300,
    fontSize: size, letterSpacing: '-0.03em',
    color, lineHeight: 1,
    display: 'inline-flex', alignItems: 'baseline', gap: size * 0.08,
  }}>
    <span>Kandinsky</span>
    <span style={{
      fontFamily: 'var(--display)', fontWeight: 300,
      color, opacity: 0.7,
    }}>3D</span>
  </div>
);

// Большой декоративный линейный фон для hero (grid-pattern)
const HeroGrid = ({ style = {} }) => (
  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
    <defs>
      <pattern id="gridp" width="56" height="56" patternUnits="userSpaceOnUse">
        <path d="M56 0H0v56" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
      </pattern>
      <radialGradient id="gridfade" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="1" />
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#gridp)" />
    <rect width="100%" height="100%" fill="url(#gridfade)" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────
// ScreenShell — единый фон + glow’ы + видео в духе главного экрана.
// Используется всеми «вторичными» экранами для визуальной связности.
// ─────────────────────────────────────────────────────────────────
const ScreenShell = ({ children }) => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
    {/* Background video + dim provided globally by App; shell stays transparent */}
    {/* Ambient glows */}
    <div style={{
      position: 'absolute', right: '-8%', top: '4%',
      width: '60%', height: '70%',
      background: 'radial-gradient(circle at 55% 50%, #3DDC8433 0%, #3DDC8411 30%, transparent 60%)',
      filter: 'blur(20px)', pointerEvents: 'none', zIndex: 1,
    }} />
    <div style={{
      position: 'absolute', left: '-10%', bottom: '-12%',
      width: '50%', height: '40%',
      background: `radial-gradient(circle at 50% 50%, #A8F0C622 0%, transparent 60%)`,
      filter: 'blur(40px)', pointerEvents: 'none', zIndex: 1,
    }} />
    <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// Glass top-bar в духе HOME: кнопка-pill «Назад» + identity-блок + printer pill.
// Заменяет старый TopBar из screens-modes.
// ─────────────────────────────────────────────────────────────────
const ScreenHeader = ({ title, subtitle, onBack, icon = null, backLabel = 'Назад' }) => (
  <header style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 18, padding: '32px 56px 8px',
    position: 'relative', zIndex: 3,
  }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18, minWidth: 0 }}>
      {/* Glassy back pill */}
      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 12,
        height: 64, padding: '0 22px 0 16px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        color: '#fff',
      }}>
        <span style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
          display: 'grid', placeItems: 'center',
        }}>
          <IconArrowLeft size={20} />
        </span>
        <span className="text" style={{ fontSize: 16, color: '#fff', letterSpacing: '0.02em' }}>{backLabel}</span>
      </button>

      {/* Identity */}
      {(title || subtitle || icon) && (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        {icon ? (
          <span style={{
            width: 56, height: 56, borderRadius: 16,
            background: `radial-gradient(circle at 38% 38%, #6FF0D8 0%, #24E0C8 22%, #1E9CE0 55%, #0E5E7A 80%, #0A3F2E 100%)`,
            color: '#fff',
            display: 'grid', placeItems: 'center',
            boxShadow: `0 0 32px rgba(36,224,200,0.45), inset 0 1px 0 rgba(255,255,255,0.25)`,
            flexShrink: 0,
          }}>
            {icon}
          </span>
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          {subtitle && (
            <div className="text" style={{
              fontSize: 12, color: 'var(--fg-dim)',
              letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1,
            }}>{subtitle}</div>
          )}
          <div className="display" style={{
            fontSize: 34, fontWeight: 300, lineHeight: 1.05,
            letterSpacing: '-0.025em',
            background: 'var(--accent-grad)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{title}</div>
        </div>
      </div>
      )}
    </div>

    {/* Printer pill moved to global GlobalPrinterStatus (persistent across screens) */}
  </header>
);

// Универсальная стеклянная карточка
const GlassCard = ({ children, style = {}, padding = 24, radius = 28, ...rest }) => (
  <div
    {...rest}
    style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: radius,
      padding,
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 16px 32px rgba(0,0,0,0.28)',
      ...style,
    }}
  >
    {children}
  </div>
);

export { ModelBlob, ModelGlyph, PrinterPill, KandinskyMark, HeroGrid, ScreenShell, ScreenHeader, GlassCard };
