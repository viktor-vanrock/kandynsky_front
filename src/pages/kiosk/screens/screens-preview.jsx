import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';
import { IconArrowRight, IconPrinter } from '../components/icons.jsx';
import { ModelBlob } from '../components/shell.jsx';

const SIZE_OPTIONS = [
  { id: 'S', label: 'S', sub: '60 мм', mult: 0.65, mins: 55 },
  { id: 'M', label: 'M', sub: '90 мм', mult: 1.0, mins: 90 },
  { id: 'L', label: 'L', sub: '140 мм', mult: 1.6, mins: 145 },
];

const _fmtMins = (mins) => {
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} ч` : `${h} ч ${String(m).padStart(2, '0')} мин`;
};

const GlbModel = ({ url }) => {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
};

const ModelCanvas = ({ glbUrl }) => (
  <Canvas
    camera={{ position: [0, 0, 2.5], fov: 45 }}
    style={{ width: '100%', height: '100%' }}
    gl={{ antialias: true, alpha: true }}
  >
    <ambientLight intensity={0.6} />
    <directionalLight position={[5, 5, 5]} intensity={1.2} />
    <Suspense fallback={null}>
      <GlbModel url={glbUrl} />
      <Environment preset="city" />
    </Suspense>
    <OrbitControls
      enablePan={false}
      minDistance={1.2}
      maxDistance={6}
      autoRotate
      autoRotateSpeed={1.4}
    />
  </Canvas>
);

const PreviewScreen = ({ prompt, glbUrl, onBack, onPrint, slicing, slicingError, onRetryPrint, accent = '#3DDC84' }) => {
  const [size, setSize] = React.useState('M');
  const sizeOpt = SIZE_OPTIONS.find((s) => s.id === size);

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
            <div className="text" style={{ fontSize: 24, color: '#fff', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {prompt}
            </div>
            <div className="text" style={{ fontSize: 13, color: 'var(--fg-dim)', lineHeight: 1, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Сгенерировано Kandinsky 3D
            </div>
          </div>
        </div>
        <div style={{ width: 220 }} />
      </header>

      {/* Hero: 3D viewer left + size picker right */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'grid', gridTemplateColumns: '1.05fr 1fr',
        alignItems: 'center', gap: 24,
      }}>
        {/* LEFT — 3D viewer or fallback blob */}
        <div style={{
          position: 'relative',
          width: '100%', aspectRatio: '1 / 1', maxHeight: 520,
          display: 'grid', placeItems: 'center', margin: '0 auto',
        }}>
          <div style={{
            position: 'absolute', inset: '8%',
            background: 'radial-gradient(circle at 50% 55%, rgba(61,220,132,0.28) 0%, rgba(168,240,198,0.16) 35%, transparent 70%)',
            filter: 'blur(30px)', zIndex: 0,
          }} />
          <div style={{
            position: 'relative', zIndex: 1,
            width: '88%', height: '88%',
            display: 'grid', placeItems: 'center',
            transform: `scale(${0.6 + sizeOpt.mult * 0.3})`,
            transition: 'transform 600ms cubic-bezier(.2,.9,.3,1)',
          }}>
            {glbUrl ? (
              <ModelCanvas glbUrl={glbUrl} />
            ) : (
              <ModelBlob size={360} variant="mint" seed={42} />
            )}
          </div>
        </div>

        {/* RIGHT — size picker + time card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingRight: 8 }}>
          <div>
            <div className="text" style={{
              fontSize: 18, color: 'var(--fg-muted)',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: 16, fontWeight: 500,
            }}>
              Выбери размер
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {SIZE_OPTIONS.map((s) => {
                const active = size === s.id;
                return (
                  <button key={s.id} onClick={() => setSize(s.id)} style={{
                    flex: 1, aspectRatio: '1 / 1', maxWidth: 120,
                    borderRadius: 28,
                    background: active ? 'var(--accent-grad)' : 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
                    border: active ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.14)',
                    color: active ? '#0A2A1A' : '#fff',
                    display: 'grid', placeItems: 'center',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                    boxShadow: active
                      ? '0 14px 30px rgba(61,220,132,0.45), inset 0 1px 0 rgba(255,255,255,0.5)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 24px rgba(0,0,0,0.3)',
                    transition: 'all 240ms cubic-bezier(.2,.9,.3,1)',
                    cursor: 'pointer',
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

          {/* Print time card */}
          <div key={`time-${size}`} style={{
            position: 'relative', overflow: 'hidden',
            padding: '22px 26px', borderRadius: 28,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 90% 50%, rgba(61,220,132,0.22), transparent 60%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)',
                display: 'grid', placeItems: 'center', color: '#A8F0C6', flexShrink: 0,
              }}>
                <IconPrinter size={24} />
              </span>
              <div style={{ flex: 1 }}>
                <div className="text" style={{ fontSize: 12, color: 'var(--fg-dim)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  Время печати
                </div>
                <div className="display" style={{
                  fontSize: 38, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 4,
                  background: 'var(--accent-grad)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', color: 'transparent',
                  whiteSpace: 'nowrap',
                }}>
                  ~{_fmtMins(sizeOpt.mins)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action tiles */}
      <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <button onClick={onBack} style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 32, padding: '32px 36px 28px',
          color: '#fff', textAlign: 'left',
          display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: 160, gap: 12,
          backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
          cursor: 'pointer',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 10% 50%, rgba(255,255,255,0.10), transparent 60%)', pointerEvents: 'none' }} />
          <div className="display" style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative' }}>Назад</div>
          <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', position: 'relative', lineHeight: 1.35 }}>Изменить описание</div>
        </button>

        <button onClick={() => onPrint(size)} style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 32, padding: '32px 36px 28px',
          color: '#fff', textAlign: 'left',
          display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: 160, gap: 12,
          backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
          cursor: 'pointer',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(61,220,132,0.32), transparent 60%)', pointerEvents: 'none' }} />
          <div className="display" style={{ fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative' }}>Отправить на&nbsp;печать</div>
          <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', position: 'relative', lineHeight: 1.35 }}>Размер {sizeOpt.label} · ~{_fmtMins(sizeOpt.mins)}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', marginTop: 4 }}>
            <span style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--accent-grad)', color: '#fff',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 8px 22px rgba(61,220,132,0.4)',
            }}><IconArrowRight size={24} /></span>
          </div>
        </button>
      </div>

      {/* Slicing overlay */}
      {(slicing || slicingError) && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          display: 'grid', placeItems: 'center',
          animation: 'a-fade-in 200ms ease-out both',
        }}>
          <div style={{
            width: 560, maxWidth: '90%',
            background: 'linear-gradient(180deg, rgba(14,22,20,0.96) 0%, rgba(8,12,10,0.97) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 36, padding: '48px 44px 40px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
            textAlign: 'center',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            animation: 'pop 320ms cubic-bezier(.2,.9,.3,1) both',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: slicingError
                ? 'radial-gradient(circle at 50% 0%, rgba(255,90,90,0.18), transparent 55%)'
                : 'radial-gradient(circle at 50% 0%, rgba(61,220,132,0.20), transparent 55%)',
              pointerEvents: 'none',
            }} />

            {slicing && !slicingError && (
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                border: '3px solid rgba(61,220,132,0.20)',
                borderTopColor: '#3DDC84',
                animation: 'k-spin 0.9s linear infinite',
                flexShrink: 0,
              }} />
            )}

            {slicingError && (
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(255,90,90,0.16)',
                border: '1px solid rgba(255,90,90,0.35)',
                display: 'grid', placeItems: 'center',
                fontSize: 28, flexShrink: 0,
              }}>✕</div>
            )}

            <div style={{ position: 'relative' }}>
              <div className="display" style={{ fontSize: 30, fontWeight: 300, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1, marginBottom: 10 }}>
                {slicingError ? 'Ошибка подготовки' : 'Подготовка GCode…'}
              </div>
              <div className="text" style={{ fontSize: 16, color: 'var(--fg-muted)', lineHeight: 1.4 }}>
                {slicingError ? slicingError : 'Нарезаем модель для вашего принтера'}
              </div>
            </div>

            {slicingError && (
              <button onClick={onRetryPrint} style={{
                position: 'relative', padding: '16px 40px', borderRadius: 20,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)',
                color: '#fff', cursor: 'pointer', fontFamily: 'var(--text)', fontSize: 16,
              }}>
                Закрыть
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewScreen;
