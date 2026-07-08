import React from 'react';
import { IconCheck, IconClose, IconHome, IconPrinter } from '../components/icons.jsx';
import { ModelBlob } from '../components/shell.jsx';
import { getPrintStatus } from '../components/klipper.js';

const _fmtMins = (mins) => {
  if (mins < 1) return '< 1 мин';
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} ч` : `${h} ч ${String(m).padStart(2, '0')} мин`;
};

// ═══════════════════════════════════════════════════════════
// PrintingScreen — live print progress via Moonraker polling
// ═══════════════════════════════════════════════════════════
const PrintingScreen = ({ prompt, startTime, printMins = 90, onDone, onHome, onCancel, accent = '#3DDC84' }) => {
  const [progress, setProgress] = React.useState(0);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  React.useEffect(() => {
    const printerIp   = localStorage.getItem('k3d_printer_ip');
    const printerPort = localStorage.getItem('k3d_printer_port') || '7125';

    if (printerIp) {
      const poll = async () => {
        try {
          const status = await getPrintStatus(printerIp, printerPort);
          const p = Math.round(status.progress * 100);
          setProgress(p);
          if (status.state === 'complete') {
            setTimeout(onDone, 800);
          }
        } catch {
          // transient — keep last known progress
        }
      };
      poll();
      const t = setInterval(poll, 3000);
      return () => clearInterval(t);
    }

    // Fallback: estimate by elapsed time
    const totalMs = Math.max(1, printMins * 60 * 1000);
    const tick = () => {
      const base = startTime || Date.now();
      const p = Math.min(99, Math.round(((Date.now() - base) / totalMs) * 100));
      setProgress(p);
    };
    tick();
    const t = setInterval(tick, 5000);
    return () => clearInterval(t);
  }, [startTime, printMins, onDone]);

  const pct = Math.round(progress);
  const eta = Math.max(0, Math.round(printMins * (1 - pct / 100)));
  const layer = Math.floor(pct * 1.2);
  const totalLayers = 120;

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
              Печатается · слой {layer}/{totalLayers}
            </div>
          </div>
        </div>
        <div style={{ width: 220 }} />
      </header>

      {/* Hero: model with fill animation left + progress tile right */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'grid', gridTemplateColumns: '1.05fr 1fr',
        alignItems: 'center', gap: 24,
      }}>
        {/* LEFT — animated blob with fill effect */}
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
          <div style={{ position: 'relative', zIndex: 1, width: '88%', height: '88%', display: 'grid', placeItems: 'center' }}>
            {/* ghost */}
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 0.18 }}>
              <ModelBlob size={420} variant="mint" seed={42} />
            </div>
            {/* rising fill */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: `inset(${100 - pct}% 0 0 0)`,
              transition: 'clip-path 400ms linear',
              display: 'grid', placeItems: 'center',
              filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.6))',
            }}>
              <ModelBlob size={420} variant="mint" seed={42} />
            </div>
            {/* laser line */}
            <div style={{
              position: 'absolute', left: '4%', right: '4%',
              top: `${100 - pct}%`, height: 2,
              background: 'linear-gradient(90deg, transparent, #3DDC84, #A8F0C6, #3DDC84, transparent)',
              boxShadow: '0 0 14px #3DDC84, 0 0 30px rgba(61,220,132,0.6)',
              transition: 'top 400ms linear',
              opacity: pct > 0 && pct < 100 ? 1 : 0,
            }} />
          </div>
        </div>

        {/* RIGHT — % tile + remaining time */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingRight: 8 }}>
          <div>
            <div className="text" style={{
              fontSize: 18, color: 'var(--fg-muted)',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: 16, fontWeight: 500,
            }}>
              Прогресс печати
            </div>
            <div style={{
              width: '100%', borderRadius: 28,
              background: 'var(--accent-grad)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#0A2A1A',
              padding: '36px 28px 28px',
              backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              boxShadow: '0 14px 30px rgba(61,220,132,0.45), inset 0 1px 0 rgba(255,255,255,0.5)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35), transparent 55%)',
                pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <div className="display" style={{
                    fontSize: 140, fontWeight: 300, lineHeight: 0.9,
                    letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums',
                  }}>{pct}</div>
                  <div className="display" style={{ fontSize: 56, fontWeight: 300, lineHeight: 1, opacity: 0.7 }}>%</div>
                </div>
                <div className="text" style={{
                  fontSize: 12, opacity: 0.75,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  слой {layer}/{totalLayers}
                </div>
                <div style={{ marginTop: 14, width: '100%', height: 6, borderRadius: 999, background: 'rgba(10,42,26,0.18)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'rgba(10,42,26,0.55)', transition: 'width 400ms linear' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Remaining time card */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            padding: '22px 26px', borderRadius: 28,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)',
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
                <div className="text" style={{ fontSize: 12, color: 'var(--fg-dim)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Осталось</div>
                <div className="display" style={{
                  fontSize: 38, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 4,
                  background: 'var(--accent-grad)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', color: 'transparent',
                  whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums',
                }}>
                  ~{_fmtMins(eta)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action tiles */}
      <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <button onClick={onHome} style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 26, padding: '22px 26px 20px',
          color: '#fff', textAlign: 'left',
          display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center',
          minHeight: 120, gap: 14,
          backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
          cursor: 'pointer',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 10% 50%, rgba(255,255,255,0.10), transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div className="display" style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05 }}>На главную</div>
            <div className="text" style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 6, lineHeight: 1.3 }}>Вернуться в&nbsp;главное меню</div>
          </div>
          <span style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}><IconHome size={22} /></span>
        </button>

        <button onClick={() => setCancelOpen(true)} style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,170,150,0.22)',
          borderRadius: 26, padding: '22px 26px 20px',
          color: '#fff', textAlign: 'left',
          display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center',
          minHeight: 120, gap: 14,
          backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 20px 40px rgba(0,0,0,0.35)',
          cursor: 'pointer',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(255,140,120,0.22), transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div className="display" style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Отменить печать</div>
            <div className="text" style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 6, lineHeight: 1.3 }}>Остановить принтер и&nbsp;вернуться</div>
          </div>
          <span style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,140,120,0.18)', border: '1px solid rgba(255,170,150,0.28)',
            color: '#FFD3C8', display: 'grid', placeItems: 'center', flexShrink: 0,
            boxShadow: '0 8px 22px rgba(255,140,120,0.25)',
          }}><IconClose size={22} /></span>
        </button>
      </div>

      {/* Cancel confirm modal */}
      {cancelOpen && (
        <div onClick={() => setCancelOpen(false)} style={{
          position: 'absolute', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.62)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          display: 'grid', placeItems: 'center', padding: 56,
          animation: 'a-fade-in 220ms ease-out both',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: 620, maxWidth: '100%',
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(28,18,18,0.94) 0%, rgba(14,10,10,0.96) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 32, padding: '36px 36px 30px',
            color: '#fff',
            boxShadow: '0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10)',
            animation: 'pop 360ms cubic-bezier(.2,.9,.3,1) both',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 0%, rgba(255,90,90,0.22), transparent 55%)', pointerEvents: 'none' }} />
            <div className="text" style={{ position: 'relative', fontSize: 12, color: '#FFB0B0', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>
              Печать будет остановлена
            </div>
            <h2 className="display" style={{ position: 'relative', fontSize: 38, fontWeight: 300, letterSpacing: '-0.02em', color: '#fff', margin: '8px 0 14px', lineHeight: 1.1 }}>
              Отменить печать?
            </h2>
            <p className="text" style={{ position: 'relative', fontSize: 18, color: 'var(--fg-muted)', lineHeight: 1.4, margin: '0 0 24px', maxWidth: 520 }}>
              Принтер остановит печать на <span style={{ color: '#fff', fontWeight: 500 }}>{pct}%</span>. Незавершённую модель придётся снять со стола.
            </p>
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setCancelOpen(false)} style={{
                padding: '18px 24px', borderRadius: 18,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.14)', color: '#fff',
                fontFamily: 'var(--text)', fontSize: 16, fontWeight: 500, cursor: 'pointer',
              }}>Нет, продолжить</button>
              <button onClick={() => { setCancelOpen(false); onCancel && onCancel(); }} style={{
                padding: '18px 24px', borderRadius: 18,
                background: 'linear-gradient(180deg, rgba(255,90,90,0.22) 0%, rgba(220,60,60,0.10) 100%)',
                border: '1px solid rgba(255,90,90,0.45)', color: '#FFD8D8',
                fontFamily: 'var(--text)', fontSize: 16, fontWeight: 500, cursor: 'pointer',
              }}>Отменить печать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// DoneScreen — print complete
// ═══════════════════════════════════════════════════════════
const DoneScreen = ({ prompt, onHome, accent = '#3DDC84' }) => (
  <div style={{
    position: 'absolute', inset: 0,
    padding: '32px 56px',
    display: 'grid', placeItems: 'center',
    overflow: 'hidden',
  }}>
    {/* Glows */}
    <div style={{
      position: 'absolute', right: '-8%', top: '8%',
      width: '70%', height: '78%',
      background: `radial-gradient(circle at 55% 50%, ${accent}33 0%, ${accent}11 30%, transparent 60%)`,
      filter: 'blur(20px)', pointerEvents: 'none',
    }} />

    <div style={{ maxWidth: 880, textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{
        width: 160, height: 160, margin: '0 auto 36px',
        borderRadius: '50%', background: 'var(--accent-grad)', color: '#0A2A1A',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 30px 60px rgba(61,220,132,0.45), inset 0 1px 0 rgba(255,255,255,0.4)',
        animation: 'pop 620ms cubic-bezier(.2,.9,.3,1) both',
      }}>
        <IconCheck size={80} />
      </div>

      <div className="text" style={{
        fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase',
        background: 'var(--accent-grad)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        WebkitTextFillColor: 'transparent', color: 'transparent',
      }}>
        Печать завершена
      </div>

      <h1 className="display" style={{ fontSize: 76, fontWeight: 300, letterSpacing: '-0.035em', color: '#fff', margin: '14px 0 22px', lineHeight: 1.05 }}>
        Модель напечатана!<br />
        <span style={{
          background: 'var(--accent-grad)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          WebkitTextFillColor: 'transparent', color: 'transparent',
        }}>Забери её из принтера</span>
      </h1>

      <p className="text" style={{ fontSize: 20, color: 'var(--fg-muted)', maxWidth: 620, margin: '0 auto 44px' }}>
        Осторожно — стол может быть тёплым. Если модель прилипла, попроси администратора.
      </p>

      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <button onClick={onHome} style={{
          width: '100%', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 32, padding: '28px 32px 24px',
          color: '#fff', textAlign: 'left',
          display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: 168, gap: 10,
          backdropFilter: 'blur(32px) saturate(160%)', WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.35)',
          cursor: 'pointer',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 50%, rgba(61,220,132,0.22), transparent 60%)', pointerEvents: 'none' }} />
          <div className="display" style={{ fontSize: 30, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, position: 'relative' }}>На главную</div>
          <div className="text" style={{ fontSize: 16, color: 'var(--fg-muted)', position: 'relative', lineHeight: 1.35 }}>Новая печать</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative', marginTop: 4 }}>
            <span style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--accent-grad)', color: '#0A2A1A',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 8px 22px rgba(61,220,132,0.4)',
            }}><IconHome size={22} /></span>
          </div>
        </button>
      </div>

      {/* Receipt */}
      <div style={{
        marginTop: 48, display: 'inline-flex', gap: 40,
        padding: '18px 32px', borderRadius: 24,
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)',
      }}>
        <div>
          <div className="text" style={{ fontSize: 12, color: 'var(--fg-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Модель</div>
          <div className="text" style={{ fontSize: 16, color: '#fff', marginTop: 4, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prompt}</div>
        </div>
        <div>
          <div className="text" style={{ fontSize: 12, color: 'var(--fg-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Принтер</div>
          <div className="text" style={{ fontSize: 16, color: '#fff', marginTop: 4 }}>SBER-01</div>
        </div>
      </div>
    </div>
  </div>
);

export { PrintingScreen, DoneScreen };
