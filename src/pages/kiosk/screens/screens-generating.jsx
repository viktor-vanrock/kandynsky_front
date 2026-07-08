import React from 'react';
import { ModelBlob } from '../components/shell.jsx';

const GeneratingScreen = ({ prompt, estimationSeconds, error, onBack, accent = '#3DDC84' }) => {
  const [elapsed, setElapsed] = React.useState(0);
  const startRef = React.useRef(Date.now());

  React.useEffect(() => {
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Progress: 0-95% based on time elapsed vs estimation
  const progress = estimationSeconds && estimationSeconds > 0
    ? Math.min(95, Math.round((elapsed / estimationSeconds) * 100))
    : null;

  const fmtElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m} мин ${String(sec).padStart(2,'0')} с` : `${sec} с`;
  };

  const hasError = !!error;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      padding: '32px 56px',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      gap: 24,
      overflow: 'hidden',
    }}>
      {/* Glows */}
      <div style={{
        position: 'absolute', right: '-8%', top: '8%',
        width: '70%', height: '78%',
        background: hasError
          ? 'radial-gradient(circle at 55% 50%, rgba(255,90,90,0.22) 0%, transparent 60%)'
          : `radial-gradient(circle at 55% 50%, ${accent}33 0%, ${accent}11 30%, transparent 60%)`,
        filter: 'blur(20px)', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="text" style={{ fontSize: 13, color: 'var(--fg-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Kandinsky 3D · Text to Geometry
          </div>
          <div className="display" style={{
            fontSize: 34, fontWeight: 300, letterSpacing: '-0.025em',
            background: hasError ? 'none' : 'var(--accent-grad)',
            WebkitBackgroundClip: hasError ? 'none' : 'text',
            backgroundClip: hasError ? 'none' : 'text',
            WebkitTextFillColor: hasError ? '#fff' : 'transparent',
            color: hasError ? '#fff' : 'transparent',
          }}>
            {hasError ? 'Ошибка генерации' : 'Создаём модель…'}
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ position: 'relative', zIndex: 2, display: 'grid', placeItems: 'center' }}>
        {hasError ? (
          <div style={{ textAlign: 'center', maxWidth: 640 }}>
            <div style={{
              width: 80, height: 80, margin: '0 auto 24px',
              borderRadius: '50%',
              background: 'rgba(255,90,90,0.16)',
              border: '1px solid rgba(255,90,90,0.35)',
              display: 'grid', placeItems: 'center',
              fontSize: 32,
            }}>✕</div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', lineHeight: 1.5, maxWidth: 560 }}>
              {error}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: 700 }}>
            <div style={{ display: 'grid', placeItems: 'center', marginBottom: 32 }}>
              <ModelBlob size={240} variant="mint" seed={42} />
            </div>

            <div className="text" style={{
              fontSize: 13, color: 'var(--fg-dim)',
              letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 18,
            }}>
              {progress !== null ? `${progress}%` : 'Инициализация…'}
            </div>

            <div className="display" style={{
              fontSize: 44, fontWeight: 300, color: '#fff',
              letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24,
            }}>
              {prompt}
            </div>

            {progress !== null ? (
              <div style={{
                width: 440, height: 5, margin: '0 auto',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.10)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: 'var(--accent-grad)',
                  borderRadius: 999,
                  transition: 'width 1s linear',
                }} />
              </div>
            ) : (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', borderRadius: 999,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: accent, boxShadow: `0 0 10px ${accent}`,
                  animation: 'a-print-pulse 1.6s ease-in-out infinite',
                }} />
                <span className="text" style={{ fontSize: 14, color: 'var(--fg-muted)' }}>
                  {fmtElapsed(elapsed)} · Ожидаем ответ от сервиса
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Back / Retry */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <button
          onClick={onBack}
          style={{
            width: '100%', minHeight: 120,
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 32, padding: '32px 48px',
            color: 'var(--fg-muted)', textAlign: 'left',
            backdropFilter: 'blur(32px) saturate(160%)',
            WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            cursor: 'pointer',
          }}>
          <div className="display" style={{ fontSize: 30, fontWeight: 300, letterSpacing: '-0.02em' }}>
            {hasError ? 'Попробовать снова' : 'Отменить'}
          </div>
          <div className="text" style={{ fontSize: 16, color: 'var(--fg-dim)', marginTop: 6 }}>
            {hasError ? 'Вернуться к вводу описания' : 'Вернуться к главному экрану'}
          </div>
        </button>
      </div>
    </div>
  );
};

export default GeneratingScreen;
