import React from 'react';
import { IconArrowLeft, IconSparkles } from '../components/icons.jsx';

const SUGGESTIONS = [
  'Маленький дракон сидит на камне',
  'Стаканчик для карандашей в форме лисы',
  'Ракетный корабль в стиле ретро',
  'Кольцо с узором из листьев',
  'Гриб с домиком внутри',
  'Сова с большими глазами',
];

const GenerateScreen = ({ onBack, onSubmit, accent = '#3DDC84' }) => {
  const [value, setValue] = React.useState('');

  const handleSubmit = () => {
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = value.trim().length > 0;

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
        background: `radial-gradient(circle at 55% 50%, ${accent}33 0%, ${accent}11 30%, transparent 60%)`,
        filter: 'blur(20px)', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 3,
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}>
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
            <span className="text" style={{ fontSize: 16, color: '#fff', letterSpacing: '0.02em' }}>Назад</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="text" style={{ fontSize: 13, color: 'var(--fg-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1 }}>
              Что напечатать?
            </div>
            <div className="display" style={{
              fontSize: 34, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.025em',
              background: 'var(--accent-grad)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent', color: 'transparent',
            }}>Описание объекта</div>
          </div>
        </div>
        <div style={{ width: 220 }} />
      </header>

      {/* Input area */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center',
      }}>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          border: `1px solid ${canSubmit ? `${accent}55` : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 28,
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          boxShadow: canSubmit
            ? `inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 2px ${accent}22`
            : 'inset 0 1px 0 rgba(255,255,255,0.10)',
          transition: 'border-color 200ms, box-shadow 200ms',
        }}>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Например: маленький дракон сидит на камне..."
            rows={4}
            style={{
              display: 'block', width: '100%', boxSizing: 'border-box',
              padding: '28px 32px',
              background: 'transparent', border: 'none', outline: 'none',
              color: '#fff',
              fontFamily: 'var(--text)', fontSize: 26, fontWeight: 500,
              lineHeight: 1.4, resize: 'none',
              caretColor: accent,
            }}
          />
          {canSubmit && (
            <div style={{ padding: '0 32px 20px', display: 'flex', justifyContent: 'flex-end' }}>
              <span className="text" style={{ fontSize: 13, color: 'var(--fg-dim)' }}>
                {value.length} симв. · Enter для отправки
              </span>
            </div>
          )}
        </div>

        {!canSubmit && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setValue(s)}
                style={{
                  padding: '12px 20px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: 'var(--fg-muted)', fontFamily: 'var(--text)',
                  fontSize: 15, cursor: 'pointer',
                }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%', minHeight: 160,
            position: 'relative', overflow: 'hidden',
            background: canSubmit
              ? 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)'
              : 'rgba(255,255,255,0.03)',
            border: canSubmit ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.06)',
            borderRadius: 32, padding: '32px 48px',
            color: canSubmit ? '#fff' : 'rgba(255,255,255,0.3)',
            textAlign: 'left',
            display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 24,
            backdropFilter: 'blur(32px) saturate(160%)',
            WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            cursor: canSubmit ? 'pointer' : 'default',
            transition: 'all 300ms cubic-bezier(.2,.9,.3,1)',
          }}>
          {canSubmit && (
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle at 90% 50%, ${accent}33, transparent 60%)`,
              pointerEvents: 'none',
            }} />
          )}
          <div style={{ position: 'relative' }}>
            <div className="display" style={{ fontSize: 38, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.0, whiteSpace: 'nowrap' }}>
              Сгенерировать модель
            </div>
            <div className="text" style={{ fontSize: 18, color: 'var(--fg-muted)', marginTop: 8, lineHeight: 1.35 }}>
              AI создаст 3D-модель без текстуры и подготовит STL для печати
            </div>
          </div>
          <span style={{
            width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
            background: canSubmit ? 'var(--accent-grad)' : 'rgba(255,255,255,0.06)',
            color: canSubmit ? '#0A2A1A' : 'rgba(255,255,255,0.3)',
            display: 'grid', placeItems: 'center',
            boxShadow: canSubmit ? '0 10px 26px rgba(61,220,132,0.40)' : 'none',
            position: 'relative',
            transition: 'all 300ms cubic-bezier(.2,.9,.3,1)',
          }}>
            <IconSparkles size={34} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default GenerateScreen;
