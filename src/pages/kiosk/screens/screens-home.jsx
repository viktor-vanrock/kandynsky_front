import React from 'react';
import { IconKids, IconCatalog, IconSparkles, IconArrowLeft, IconPrinter } from '../components/icons.jsx';
import { ModelGlyph } from '../components/shell.jsx';

// Catalog is empty for now — quick-print button does nothing until catalog is populated
const CATALOG_MODELS = [];

const A_HEADLINES = [
  { l1: 'Преврати',  l2: 'идею',       l3: 'в изделие' },
  { l1: 'Сделай',    l2: 'уникальный', l3: 'подарок' },
  { l1: 'Напечатай', l2: 'любую',      l3: 'фигурку' },
];

const A_MODELS = [
  { id: 'fox',      glyph: 'dino',   color: '#3DDC84', name: 'Лисёнок',             time: '4 ч 20 мин' },
  { id: 'pinecone', glyph: 'flower', color: '#A8F0C6', name: 'Светильник «Шишка»',  time: '6 ч 10 мин' },
  { id: 'moon',     glyph: 'sphere', color: '#3F81FD', name: 'Ночник «Луна»',       time: '5 ч 40 мин' },
];

const SIZE_OPTIONS_H = [
  { id: 'S', label: 'S', sub: '60 мм',  mult: 0.65 },
  { id: 'M', label: 'M', sub: '90 мм',  mult: 1.0  },
  { id: 'L', label: 'L', sub: '140 мм', mult: 1.6  },
];

const _parseMinutesH = (t) => {
  if (!t) return 30;
  const s = String(t).toLowerCase();
  const h = s.match(/(\d+)\s*ч/);
  const m = s.match(/(\d+)\s*м/);
  let total = 0;
  if (h) total += parseInt(h[1], 10) * 60;
  if (m) total += parseInt(m[1], 10);
  if (!h && !m) { const n = parseInt(s, 10); if (!isNaN(n)) total = n; }
  return total || 30;
};
const _formatMinutesH = (mins) => {
  mins = Math.max(1, Math.round(mins));
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} ч` : `${h} ч ${String(m).padStart(2, '0')} мин`;
};

const HomeScreen = ({ onGenerate, onPick, accent = '#3DDC84' }) => {
  const [phraseIdx, setPhraseIdx] = React.useState(0);
  const [modelIdx, setModelIdx] = React.useState(0);
  const [phase, setPhase] = React.useState('home');
  const [previewModel, setPreviewModel] = React.useState(null);
  const [size, setSize] = React.useState('M');

  React.useEffect(() => {
    if (phase !== 'home') return;
    const t = setInterval(() => setPhraseIdx((i) => (i + 1) % A_HEADLINES.length), 5000);
    return () => clearInterval(t);
  }, [phase]);

  React.useEffect(() => {
    if (phase !== 'home') return;
    const t = setInterval(() => setModelIdx((i) => (i + 1) % A_MODELS.length), 4500);
    return () => clearInterval(t);
  }, [phase]);

  const headline = A_HEADLINES[phraseIdx];
  const currentModel = A_MODELS[modelIdx];

  const handleQuickPrint = () => {
    const pool = CATALOG_MODELS;
    const m = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    if (!m) return;
    setPreviewModel({ ...m });
    setSize('M');
    setPhase('preview');
  };

  const handleBack = () => {
    setPhase('home');
    setTimeout(() => setPreviewModel(null), 600);
  };

  const handlePrint = () => {
    if (previewModel && onPick) onPick('quickprint', previewModel);
  };

  const handlePickType = (type) => {
    if (type === 'ai') { onGenerate(); return; }
    if (onPick) onPick(type);
  };

  const sizeOpt = SIZE_OPTIONS_H.find((s) => s.id === size);
  const baseMin = _parseMinutesH(previewModel?.time);
  const est = baseMin * (sizeOpt?.mult || 1);

  const isPrev = phase === 'preview';
  const isPick = phase === 'pickModel';
  const isHome = phase === 'home';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      padding: '32px 56px 32px',
      display: 'grid',
      gridTemplateRows: 'auto minmax(0, 1fr) auto',
      gap: 24,
      overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{
        position: 'absolute', right: '-8%', top: '8%',
        width: '70%', height: '78%',
        background: `radial-gradient(circle at 55% 50%, ${accent}33 0%, ${accent}11 30%, transparent 60%)`,
        filter: 'blur(20px)', pointerEvents: 'none', zIndex: 1,
        transition: 'opacity 700ms cubic-bezier(.2,.9,.3,1)',
        opacity: isPrev ? 0.7 : 1,
      }} />
      <div style={{
        position: 'absolute', left: '-10%', bottom: '-10%',
        width: '50%', height: '40%',
        background: 'radial-gradient(circle at 50% 50%, #A8F0C622 0%, transparent 60%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 3,
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}>
          <span style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'radial-gradient(circle at 38% 38%, #6FF0D8 0%, #24E0C8 22%, #1E9CE0 55%, #0E5E7A 80%, #0A3F2E 100%)',
            color: '#fff', display: 'grid', placeItems: 'center',
            boxShadow: '0 0 36px rgba(36,224,200,0.55), 0 0 12px rgba(30,156,224,0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}>
            <IconPrinter size={34} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', minWidth: 280 }}>
            {/* Home title */}
            <div style={{
              opacity: isPrev ? 0 : 1,
              transform: isPrev ? 'translateY(-8px)' : 'translateY(0)',
              filter: isPrev ? 'blur(6px)' : 'blur(0)',
              transition: 'opacity 360ms cubic-bezier(.2,.9,.3,1), transform 360ms cubic-bezier(.2,.9,.3,1), filter 360ms',
              pointerEvents: isPrev ? 'none' : 'auto',
            }}>
              <div className="text" style={{ fontSize: 24, color: '#fff', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.01em' }}>
                Киоск 3D-печати
              </div>
              <div className="text" style={{ fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>
                Игрушки · сувениры · декор
              </div>
            </div>
            {/* Preview title (overlay) */}
            <div style={{
              position: 'absolute', inset: 0,
              opacity: isPrev ? 1 : 0,
              transform: isPrev ? 'translateY(0)' : 'translateY(8px)',
              filter: isPrev ? 'blur(0)' : 'blur(6px)',
              transition: 'opacity 420ms 80ms cubic-bezier(.2,.9,.3,1), transform 420ms 80ms cubic-bezier(.2,.9,.3,1), filter 420ms 80ms',
              pointerEvents: isPrev ? 'auto' : 'none',
            }}>
              <div className="text" style={{ fontSize: 24, color: '#fff', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {previewModel?.title || ' '}
              </div>
              <div className="text" style={{ fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>
                Случайная модель · Готово к печати
              </div>
            </div>
          </div>
        </div>
        {/* spacer so header layout balances with GlobalPrinterStatus on the right */}
        <div style={{ width: 220 }} />
      </header>

      {/* Hero row */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'grid', gridTemplateColumns: '1.05fr 1fr',
        gap: 24,
      }}>
        {/* LEFT */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* HOME: rotating headline */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', paddingRight: 12, paddingTop: 4,
            opacity: isPrev ? 0 : 1,
            transform: isPrev ? 'translateX(-32px)' : 'translateX(0)',
            filter: isPrev ? 'blur(10px)' : 'blur(0)',
            transition: 'opacity 480ms cubic-bezier(.2,.9,.3,1), transform 600ms cubic-bezier(.2,.9,.3,1), filter 480ms',
            pointerEvents: isPrev ? 'none' : 'auto',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{ position: 'relative', minHeight: 288, paddingTop: 12, overflow: 'visible' }}>
                <h1
                  key={`hl-${phraseIdx}`}
                  className="display"
                  style={{
                    margin: 0, color: '#fff',
                    fontSize: 96, lineHeight: 1.0,
                    fontWeight: 300, letterSpacing: '-0.04em',
                    display: 'flex', flexDirection: 'column',
                    animation: 'k-phrase-in 700ms cubic-bezier(.2,.9,.3,1) both',
                  }}>
                  <span style={{
                    background: 'var(--accent-grad)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', color: 'transparent',
                    display: 'block', whiteSpace: 'nowrap',
                  }}>{headline.l1}</span>
                  <span style={{ color: '#fff', display: 'block', whiteSpace: 'nowrap' }}>{headline.l2}</span>
                  <span style={{ color: '#fff', display: 'block', whiteSpace: 'nowrap' }}>{headline.l3}</span>
                </h1>
              </div>
              <span className="text" style={{
                fontSize: 16, color: 'var(--fg-muted)', lineHeight: 1.3,
                opacity: isPick ? 0 : 0.7, letterSpacing: '0.02em',
                transition: 'all 360ms cubic-bezier(.2,.9,.3,1)',
              }}>
                {isPick ? '' : '↓ Выбери способ ниже'}
              </span>
            </div>
          </div>

          {/* PREVIEW: centered 3D model */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'grid', placeItems: 'center',
            opacity: isPrev ? 1 : 0,
            transform: isPrev ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(20px)',
            filter: isPrev ? 'blur(0)' : 'blur(8px)',
            transition: 'opacity 520ms 120ms cubic-bezier(.2,.9,.3,1), transform 700ms 120ms cubic-bezier(.2,.9,.3,1), filter 520ms 120ms',
            pointerEvents: isPrev ? 'auto' : 'none',
          }}>
            <div style={{
              position: 'relative',
              height: '100%', maxHeight: 480, width: 'auto', aspectRatio: '1 / 1',
              display: 'grid', placeItems: 'center',
            }}>
              <div style={{
                position: 'absolute', inset: '8%',
                background: 'radial-gradient(circle at 50% 55%, rgba(61,220,132,0.32) 0%, rgba(168,240,198,0.18) 35%, transparent 70%)',
                filter: 'blur(30px)', zIndex: 0,
              }} />
              <div style={{
                position: 'relative', zIndex: 1,
                width: '88%', height: '88%',
                display: 'grid', placeItems: 'center',
                transform: `scale(${0.7 + (sizeOpt?.mult || 1) * 0.28})`,
                transition: 'transform 600ms cubic-bezier(.2,.9,.3,1)',
              }}>
                {previewModel && (
                  <ModelGlyph shape={previewModel.glyph} color={previewModel.color || '#3DDC84'} size={340} />
                )}
              </div>
              <div style={{
                position: 'absolute', bottom: '4%', left: '50%', transform: 'translateX(-50%)',
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', borderRadius: 999,
                background: 'rgba(20,20,22,0.7)',
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(10px)', zIndex: 2,
              }}>
                <span className="text" style={{
                  fontSize: 13, color: '#fff', fontWeight: 500,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.04em',
                }}>
                  {sizeOpt?.sub} · {Math.round(24 * (sizeOpt?.mult || 1))} г PLA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* HOME: rotating gallery */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'grid', placeItems: 'center',
            opacity: isPrev ? 0 : 1,
            transform: isPrev ? 'translateX(40px) scale(0.92)' : 'translateX(0) scale(1)',
            filter: isPrev ? 'blur(10px)' : 'blur(0)',
            transition: 'opacity 480ms cubic-bezier(.2,.9,.3,1), transform 600ms cubic-bezier(.2,.9,.3,1), filter 480ms',
            pointerEvents: isPrev ? 'none' : 'auto',
          }}>
            <div style={{
              position: 'relative',
              height: '100%', maxHeight: 520, width: 'auto', aspectRatio: '1 / 1',
              display: 'grid', placeItems: 'center', margin: '0 auto',
            }}>
              <div style={{
                position: 'absolute', inset: '8%',
                background: 'radial-gradient(circle at 50% 55%, rgba(61,220,132,0.28) 0%, rgba(168,240,198,0.16) 35%, transparent 70%)',
                filter: 'blur(30px)', zIndex: 0,
              }} />
              <div style={{ position: 'relative', zIndex: 1, width: '88%', height: '88%', display: 'grid', placeItems: 'center' }}>
                {A_MODELS.map((m, i) => (
                  <div
                    key={m.id}
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'grid', placeItems: 'center',
                      opacity: i === modelIdx ? 1 : 0,
                      transform: i === modelIdx ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(8px)',
                      transition: 'opacity 800ms cubic-bezier(.2,.9,.3,1), transform 1200ms cubic-bezier(.2,.9,.3,1)',
                    }}>
                    <ModelGlyph shape={m.glyph} color={m.color} size={320} />
                  </div>
                ))}
              </div>
              <div style={{
                position: 'absolute', bottom: '6%', left: '12%', right: '12%',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2,
              }}>
                <div
                  key={`n-${modelIdx}`}
                  className="text"
                  style={{
                    fontSize: 15, color: '#fff', fontWeight: 500,
                    padding: '8px 14px',
                    background: 'rgba(20,20,22,0.7)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: 999, backdropFilter: 'blur(10px)',
                    animation: 'k-phrase-in 600ms cubic-bezier(.2,.9,.3,1) both',
                  }}>
                  {currentModel.name}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {A_MODELS.map((_, i) => (
                    <span key={i} style={{
                      width: i === modelIdx ? 20 : 6,
                      height: 5, borderRadius: 3,
                      background: i === modelIdx ? accent : 'rgba(255,255,255,0.28)',
                      transition: 'all 400ms cubic-bezier(.2,.9,.3,1)',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW: S/M/L picker + time card */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, paddingRight: 8,
            opacity: isPrev ? 1 : 0,
            transform: isPrev ? 'translateX(0)' : 'translateX(40px)',
            filter: isPrev ? 'blur(0)' : 'blur(8px)',
            transition: 'opacity 520ms 160ms cubic-bezier(.2,.9,.3,1), transform 700ms 160ms cubic-bezier(.2,.9,.3,1), filter 520ms 160ms',
            pointerEvents: isPrev ? 'auto' : 'none',
          }}>
            <div>
              <div className="text" style={{
                fontSize: 13, color: 'var(--fg-dim)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14,
              }}>
                Выбери размер
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {SIZE_OPTIONS_H.map((s, i) => {
                  const active = size === s.id;
                  return (
                    <button key={s.id} onClick={() => setSize(s.id)} style={{
                      flex: 1, aspectRatio: '1 / 1', maxWidth: 120, borderRadius: 28,
                      background: active ? 'var(--accent-grad)' : 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
                      border: active ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.14)',
                      color: active ? '#0A2A1A' : '#fff',
                      display: 'grid', placeItems: 'center',
                      backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                      boxShadow: active
                        ? '0 14px 30px rgba(61,220,132,0.45), inset 0 1px 0 rgba(255,255,255,0.5)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 24px rgba(0,0,0,0.3)',
                      transition: 'all 240ms cubic-bezier(.2,.9,.3,1)',
                      cursor: 'pointer',
                      animation: isPrev ? `slideup 460ms ${200 + i * 70}ms cubic-bezier(.2,.9,.3,1) both` : 'none',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div className="display" style={{ fontSize: 56, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.04em' }}>{s.label}</div>
                        <div className="text" style={{ fontSize: 12, opacity: 0.75, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.02em' }}>{s.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{
              position: 'relative', overflow: 'hidden',
              padding: '22px 26px', borderRadius: 28,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 24px rgba(0,0,0,0.3)',
              animation: isPrev ? 'slideup 460ms 420ms cubic-bezier(.2,.9,.3,1) both' : 'none',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(61,220,132,0.22), transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)',
                  display: 'grid', placeItems: 'center', color: '#A8F0C6', flexShrink: 0,
                }}>
                  <IconPrinter size={24} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className="text" style={{ fontSize: 12, color: 'var(--fg-dim)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Время печати</div>
                  <div key={`time-${size}`} className="display" style={{
                    fontSize: 38, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 4,
                    background: 'var(--accent-grad)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', color: 'transparent',
                    whiteSpace: 'nowrap', animation: 'k-phrase-in 420ms cubic-bezier(.2,.9,.3,1) both',
                  }}>
                    ~{_formatMinutesH(est)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ position: 'relative', zIndex: 2, height: 232 }}>
        {/* Back-to-home button (visible only in pickModel phase) */}
        <button
          onClick={() => setPhase('home')}
          aria-label="Назад к главному"
          style={{
            position: 'absolute', left: 0, bottom: 'calc(100% + 18px)',
            width: 56, height: 56,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '50%', cursor: 'pointer',
            backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            opacity: isPick ? 1 : 0, pointerEvents: isPick ? 'auto' : 'none',
            animation: isPick ? 'slideup 520ms 200ms cubic-bezier(.2,.9,.3,1) both' : 'none',
            transition: 'opacity 360ms cubic-bezier(.2,.9,.3,1)', zIndex: 3,
          }}>
          <IconArrowLeft size={22} />
        </button>

        {/* HOME tiles */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18,
          opacity: isHome ? 1 : 0,
          transform: isHome ? 'translateY(0)' : (isPick ? 'translateY(40px) scale(0.96)' : 'translateY(40px)'),
          filter: isHome ? 'blur(0)' : 'blur(8px)',
          transition: 'opacity 460ms cubic-bezier(.2,.9,.3,1), transform 560ms cubic-bezier(.2,.9,.3,1), filter 460ms',
          pointerEvents: isHome ? 'auto' : 'none',
        }}>
          {/* 1 — Печать за 1 клик */}
          <button onClick={handleQuickPrint} style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 32, padding: '36px 36px 32px',
            color: '#fff', textAlign: 'left',
            display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: 232, gap: 12,
            backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
            animation: !isPrev ? 'slideup 520ms 60ms cubic-bezier(.2,.9,.3,1) both' : 'none',
            cursor: 'pointer', opacity: CATALOG_MODELS.length === 0 ? 0.45 : 1,
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(61,220,132,0.32), transparent 60%)', pointerEvents: 'none' }} />
            <div className="display" style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative', whiteSpace: 'nowrap' }}>Печать за 1&nbsp;клик</div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', marginTop: 6, position: 'relative', maxWidth: 320, lineHeight: 1.35, minHeight: '2.7em' }}>
              {CATALOG_MODELS.length === 0 ? 'Каталог пока пуст' : '3D-модель выберется случайно'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', position: 'relative', marginTop: 8 }}>
              <span style={{ color: 'var(--fg-dim)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconSparkles size={26} /></span>
            </div>
          </button>

          {/* 2 — Выбрать 3D-модель */}
          <button onClick={() => setPhase('pickModel')} style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 32, padding: '36px 36px 32px',
            color: '#fff', textAlign: 'left',
            display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: 232, gap: 12,
            backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
            animation: !isPrev ? 'slideup 520ms 140ms cubic-bezier(.2,.9,.3,1) both' : 'none',
            cursor: 'pointer',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(111,231,168,0.26), transparent 60%)', pointerEvents: 'none' }} />
            <div className="display" style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative', whiteSpace: 'nowrap' }}>Выбрать 3D-модель</div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', marginTop: 6, position: 'relative', maxWidth: 340, lineHeight: 1.35, minHeight: '2.7em' }}>
              Готовую из каталога, или создать с&nbsp;помощью&nbsp;AI
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', position: 'relative', marginTop: 8 }}>
              <span style={{ color: 'var(--fg-dim)', display: 'inline-flex', alignItems: 'center', gap: 12 }}><IconCatalog size={26} /><IconSparkles size={22} /></span>
            </div>
          </button>

          {/* 3 — Печать по фото */}
          <button onClick={() => handlePickType('selfie')} style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 32, padding: '36px 36px 32px',
            color: '#fff', textAlign: 'left',
            display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: 232, gap: 12,
            backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
            animation: !isPrev ? 'slideup 520ms 220ms cubic-bezier(.2,.9,.3,1) both' : 'none',
            cursor: 'pointer',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(36,242,191,0.22), transparent 60%)', pointerEvents: 'none' }} />
            <div className="display" style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative', whiteSpace: 'nowrap' }}>Печать по&nbsp;фото</div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', marginTop: 6, position: 'relative', maxWidth: 340, lineHeight: 1.35, minHeight: '2.7em' }}>
              Сфотографируйся и напечатай 3D-бюст
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', position: 'relative', marginTop: 8 }}>
              <span style={{ color: 'var(--fg-dim)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconKids size={26} /></span>
            </div>
          </button>
        </div>

        {/* PICK-MODEL tiles */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18,
          opacity: isPick ? 1 : 0,
          transform: isPick ? 'translateY(0)' : 'translateY(40px)',
          filter: isPick ? 'blur(0)' : 'blur(8px)',
          transition: 'opacity 520ms 240ms cubic-bezier(.2,.9,.3,1), transform 640ms 240ms cubic-bezier(.2,.9,.3,1), filter 520ms 240ms',
          pointerEvents: isPick ? 'auto' : 'none',
        }}>
          {/* P1 — AI-генерация */}
          <button onClick={() => handlePickType('ai')} style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 32, padding: '36px 36px 32px',
            color: '#fff', textAlign: 'left',
            display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: 232, gap: 12,
            backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
            animation: isPick ? 'slideup 520ms 280ms cubic-bezier(.2,.9,.3,1) both' : 'none',
            cursor: 'pointer',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(63,129,253,0.30), transparent 60%)', pointerEvents: 'none' }} />
            <div className="display" style={{ fontSize: 30, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative', whiteSpace: 'nowrap' }}>AI-генерация</div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', marginTop: 6, position: 'relative', maxWidth: 340, lineHeight: 1.35 }}>
              Создай уникальную модель с&nbsp;AI-сервисом Kandinsky 3D
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', position: 'relative', marginTop: 8 }}>
              <span style={{ color: 'var(--fg-dim)', display: 'inline-flex' }}><IconSparkles size={26} /></span>
            </div>
          </button>

          {/* P2 — Игрушки для детей */}
          <button onClick={() => handlePickType('kids')} style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 32, padding: '36px 36px 32px',
            color: '#fff', textAlign: 'left',
            display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: 232, gap: 12,
            backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
            animation: isPick ? 'slideup 520ms 360ms cubic-bezier(.2,.9,.3,1) both' : 'none',
            cursor: 'pointer',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(249,178,253,0.26), transparent 60%)', pointerEvents: 'none' }} />
            <div className="display" style={{ fontSize: 30, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative', whiteSpace: 'nowrap' }}>Игрушки для&nbsp;детей</div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', marginTop: 6, position: 'relative', maxWidth: 340, lineHeight: 1.35 }}>
              Динозавры, роботы, животные
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', position: 'relative', marginTop: 8 }}>
              <span style={{ color: 'var(--fg-dim)', display: 'inline-flex' }}><IconKids size={26} /></span>
            </div>
          </button>

          {/* P3 — Весь каталог */}
          <button onClick={() => handlePickType('catalog')} style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 32, padding: '36px 36px 32px',
            color: '#fff', textAlign: 'left',
            display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: 232, gap: 12,
            backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
            animation: isPick ? 'slideup 520ms 440ms cubic-bezier(.2,.9,.3,1) both' : 'none',
            cursor: 'pointer',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(36,242,191,0.28), transparent 60%)', pointerEvents: 'none' }} />
            <div className="display" style={{ fontSize: 30, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative', whiteSpace: 'nowrap' }}>Весь каталог моделей</div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', marginTop: 6, position: 'relative', maxWidth: 340, lineHeight: 1.35 }}>
              Готовые 3D-модели с&nbsp;популярных сайтов
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', position: 'relative', marginTop: 8 }}>
              <span style={{ color: 'var(--fg-dim)', display: 'inline-flex' }}><IconCatalog size={26} /></span>
            </div>
          </button>
        </div>

        {/* PREVIEW tiles */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18,
          opacity: isPrev ? 1 : 0,
          transform: isPrev ? 'translateY(0)' : 'translateY(40px)',
          filter: isPrev ? 'blur(0)' : 'blur(8px)',
          transition: 'opacity 520ms 240ms cubic-bezier(.2,.9,.3,1), transform 640ms 240ms cubic-bezier(.2,.9,.3,1), filter 520ms 240ms',
          pointerEvents: isPrev ? 'auto' : 'none',
        }}>
          <button onClick={handleBack} style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 32, padding: '32px 36px 28px',
            color: '#fff', textAlign: 'left',
            display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: 200, gap: 12,
            backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
            cursor: 'pointer',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 10% 50%, rgba(255,255,255,0.10), transparent 60%)', pointerEvents: 'none' }} />
            <div className="display" style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative' }}>Назад</div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', position: 'relative', lineHeight: 1.35 }}>Выбрать другую модель</div>
          </button>
          <button onClick={handlePrint} style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 32, padding: '32px 36px 28px',
            color: '#fff', textAlign: 'left',
            display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: 200, gap: 12,
            backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
            cursor: 'pointer',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(61,220,132,0.36), transparent 60%)', pointerEvents: 'none' }} />
            <div className="display" style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative', whiteSpace: 'nowrap' }}>Отправить на&nbsp;печать</div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', position: 'relative', lineHeight: 1.35 }}>
              Размер {sizeOpt?.label} · ~{_formatMinutesH(est)}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
