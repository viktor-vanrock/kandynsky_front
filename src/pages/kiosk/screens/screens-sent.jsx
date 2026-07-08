import React from 'react';
import { IconArrowRight, IconPrinter } from '../components/icons.jsx';

const SentScreen = ({ prompt, size = 'M', printMins = 90, onHome, accent = '#3DDC84' }) => {
  const fmtMins = (m) => {
    if (m < 60) return `${m} мин`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem === 0 ? `${h} ч` : `${h} ч ${rem} м`;
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      padding: '32px 56px 32px',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      gap: 24,
      overflow: 'hidden',
    }}>
      {/* Glows */}
      <div style={{
        position: 'absolute', right: '-8%', top: '8%',
        width: '70%', height: '78%',
        background: `radial-gradient(circle at 55% 50%, ${accent}33 0%, ${accent}11 30%, transparent 60%)`,
        filter: 'blur(20px)', pointerEvents: 'none', zIndex: 1,
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
            boxShadow: '0 0 36px rgba(36,224,200,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}>
            <IconPrinter size={34} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="text" style={{ fontSize: 24, color: '#fff', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.01em', maxWidth: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {prompt}
            </div>
            <div className="text" style={{
              fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                background: '#3DDC84', width: 8, height: 8, borderRadius: '50%',
                display: 'inline-block', boxShadow: '0 0 10px #3DDC84',
                animation: 'a-print-pulse 1.6s ease-in-out infinite',
              }} />
              В очереди печати · SBER-01
            </div>
          </div>
        </div>
        <div style={{ width: 220 }} />
      </header>

      {/* Hero */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'grid', placeItems: 'center',
        textAlign: 'center', padding: '0 24px',
      }}>
        <div style={{ maxWidth: 880 }}>
          <div style={{
            width: 160, height: 160, margin: '0 auto 28px',
            borderRadius: '50%',
            background: 'var(--accent-grad)', color: '#0A2A1A',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 30px 60px rgba(61,220,132,0.45), inset 0 1px 0 rgba(255,255,255,0.4)',
            animation: 'pop 620ms cubic-bezier(.2,.9,.3,1) both',
          }}>
            <IconPrinter size={80} />
          </div>

          <div className="text" style={{
            fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase',
            background: 'var(--accent-grad)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
          }}>
            Готово
          </div>

          <h1 className="display" style={{
            fontSize: 84, fontWeight: 300, letterSpacing: '-0.035em',
            color: '#fff', margin: '12px 0 18px', lineHeight: 1.02,
          }}>
            Модель отправлена<br />
            <span style={{
              background: 'var(--accent-grad)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent', color: 'transparent',
            }}>на&nbsp;печать</span>
          </h1>

          <p className="text" style={{
            fontSize: 22, color: 'var(--fg-muted)',
            maxWidth: 720, margin: '0 auto 28px', lineHeight: 1.4,
          }}>
            Вернитесь через <span style={{ color: '#fff', fontWeight: 500 }}>~{fmtMins(printMins)}</span> — именно столько времени займёт печать.
          </p>

          <div className="text" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '12px 22px', borderRadius: 999,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
            fontSize: 14, color: 'var(--fg-muted)', letterSpacing: '0.04em',
          }}>
            <span style={{
              background: '#3DDC84', width: 8, height: 8, borderRadius: '50%',
              display: 'inline-block', boxShadow: '0 0 10px #3DDC84',
              animation: 'a-print-pulse 1.6s ease-in-out infinite',
            }} />
            Принтер начал работу — размер {size}
          </div>
        </div>
      </div>

      {/* Bottom tile */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <button onClick={onHome} style={{
          width: '100%',
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 32, padding: '32px 36px 28px',
          color: '#fff', textAlign: 'left',
          display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center',
          minHeight: 130, gap: 24,
          backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
          animation: 'slideup 520ms 60ms cubic-bezier(.2,.9,.3,1) both',
          cursor: 'pointer',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 90% 50%, rgba(61,220,132,0.22), transparent 60%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div className="display" style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05 }}>На&nbsp;главную</div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', marginTop: 6, lineHeight: 1.35 }}>Можно отправить ещё одну модель</div>
          </div>
          <span style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--accent-grad)', color: '#fff',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 8px 22px rgba(61,220,132,0.4)', position: 'relative',
          }}><IconArrowRight size={28} /></span>
        </button>
      </div>
    </div>
  );
};

export default SentScreen;
