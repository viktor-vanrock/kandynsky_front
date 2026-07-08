import React from 'react';
import { IconClose, IconPrinter } from './icons.jsx';

// Persistent top-right printer status pill.
// Survives all screen transitions without re-mounting.

const GlobalPrinterStatus = ({
  screen = 'home',
  printing = false,
  requestConnect = false,
  onRequestConnectHandled,
}) => {
  const isPrinting = !!printing;
  const isDone = screen === 'done' || screen === 'cancelled';

  const [time, setTime] = React.useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  });
  React.useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  // 10-tap easter egg → admin connection modal
  const tapState = React.useRef({ count: 0, last: 0, timer: null });
  const [tapHint, setTapHint] = React.useState(0);
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [ip, setIp] = React.useState(() => localStorage.getItem('k3d_printer_ip') || '192.168.1.42');
  const [port, setPort] = React.useState(() => localStorage.getItem('k3d_printer_port') || '7125');
  const [connecting, setConnecting] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [hasPrinter, setHasPrinter] = React.useState(() => !!localStorage.getItem('k3d_printer_ip'));

  // External trigger from handleSendToPrint when no printer IP configured
  React.useEffect(() => {
    if (requestConnect) {
      setAdminOpen(true);
      onRequestConnectHandled?.();
    }
  }, [requestConnect, onRequestConnectHandled]);

  const onPillClick = () => {
    if (isPrinting) return;
    if (!hasPrinter) { setAdminOpen(true); return; }
    const now = Date.now();
    const s = tapState.current;
    if (now - s.last > 800) s.count = 0;
    s.count += 1;
    s.last = now;
    setTapHint(s.count);
    clearTimeout(s.timer);
    s.timer = setTimeout(() => { s.count = 0; setTapHint(0); }, 1200);
    if (s.count >= 10) {
      s.count = 0;
      setTapHint(0);
      setAdminOpen(true);
    }
  };

  const handleConnect = () => {
    setConnecting(true);
    setConnected(false);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      localStorage.setItem('k3d_printer_ip', ip);
      localStorage.setItem('k3d_printer_port', port);
      setHasPrinter(true);
      setTimeout(() => { setAdminOpen(false); setConnected(false); }, 1100);
    }, 1400);
  };

  // Hide while the on-screen keyboard is open
  const [kbOpen, setKbOpen] = React.useState(false);
  React.useEffect(() => {
    const onKb = (e) => setKbOpen(!!(e.detail && e.detail.open));
    window.addEventListener('k3d:keyboard', onKb);
    return () => window.removeEventListener('k3d:keyboard', onKb);
  }, []);

  const hidden = kbOpen || isDone;
  const hintFrac = Math.min(1, tapHint / 10);

  return (
    <React.Fragment>
      <div style={{
        position: 'absolute',
        top: 32, right: 56,
        zIndex: 5,
        display: 'flex', alignItems: 'center', gap: 18,
        pointerEvents: hidden ? 'none' : 'auto',
        opacity: hidden ? 0 : 1,
        transform: hidden ? 'translateY(-12px)' : 'translateY(0)',
        transition: 'opacity 260ms cubic-bezier(.2,.9,.3,1), transform 260ms cubic-bezier(.2,.9,.3,1)',
      }}>
        <span style={{
          fontSize: 28, color: 'var(--fg)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontWeight: 400, letterSpacing: '0.02em',
        }}>
          {time}
        </span>

        <div
          onClick={onPillClick}
          style={{
            position: 'relative',
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '10px 18px',
            background: isPrinting
              ? 'rgba(61,220,132,0.14)'
              : !hasPrinter ? 'rgba(228,128,57,0.16)'
              : 'rgba(255,255,255,0.05)',
            border: isPrinting
              ? '1px solid rgba(61,220,132,0.35)'
              : !hasPrinter ? '1px solid rgba(228,128,57,0.45)'
              : '1px solid var(--hairline)',
            borderRadius: 999,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transition: 'background 260ms ease, border-color 260ms ease, transform 200ms ease',
            cursor: 'pointer',
            boxShadow: isPrinting
              ? '0 8px 22px rgba(61,220,132,0.25)'
              : !hasPrinter ? '0 8px 22px rgba(228,128,57,0.20)'
              : 'none',
            transform: tapHint > 0 ? `scale(${1 + hintFrac * 0.04})` : 'none',
            overflow: 'hidden',
          }}>
          {!isPrinting && tapHint > 0 && (
            <span style={{
              position: 'absolute', left: 0, bottom: 0,
              height: 2, width: `${hintFrac * 100}%`,
              background: 'linear-gradient(90deg, rgba(168,240,198,0.6), #3DDC84)',
              transition: 'width 180ms ease',
            }} />
          )}
          <span className="status-dot" style={isPrinting ? {
            background: '#3DDC84',
            boxShadow: '0 0 10px #3DDC84',
            animation: 'a-print-pulse 1.6s ease-in-out infinite',
          } : !hasPrinter ? {
            background: '#E48039',
            boxShadow: '0 0 8px #E48039',
          } : undefined} />
          <span className="text" style={{ fontSize: 14, color: !hasPrinter ? '#F5C49A' : 'var(--fg)' }}>
            {isPrinting ? 'Идёт печать' : !hasPrinter ? 'Подключить принтер' : 'Принтер готов'}
          </span>
        </div>
      </div>

      {/* === ADMIN: подключение к принтеру === */}
      {adminOpen && (
        <div
          onClick={() => !connecting && setAdminOpen(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.62)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'grid', placeItems: 'center',
            padding: 56,
            animation: 'a-fade-in 220ms ease-out both',
          }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 640, maxWidth: '100%',
              position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(20,28,26,0.92) 0%, rgba(10,14,16,0.94) 100%)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 32, padding: '36px 36px 30px',
              color: '#fff',
              boxShadow: '0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10)',
              animation: 'pop 360ms cubic-bezier(.2,.9,.3,1) both',
            }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 90% 0%, rgba(61,220,132,0.18), transparent 55%)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                <span style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(61,220,132,0.16)',
                  border: '1px solid rgba(61,220,132,0.32)',
                  color: '#A8F0C6',
                  display: 'grid', placeItems: 'center',
                }}>
                  <IconPrinter size={24} />
                </span>
                <div>
                  <div className="text" style={{ fontSize: 11, color: 'var(--fg-dim)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Service · admin</div>
                  <div className="display" style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.01em', color: '#fff', marginTop: 2 }}>Подключение к принтеру</div>
                </div>
              </div>
              <button
                onClick={() => !connecting && setAdminOpen(false)}
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: '#fff',
                  display: 'grid', placeItems: 'center',
                  cursor: 'pointer',
                }}>
                <IconClose size={18} />
              </button>
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="text" style={{ fontSize: 12, color: 'var(--fg-dim)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>IP-адрес принтера (Moonraker)</span>
                <input
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="192.168.1.42"
                  spellCheck={false}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '18px 20px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#fff',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 22, letterSpacing: '0.02em',
                    outline: 'none',
                  }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="text" style={{ fontSize: 12, color: 'var(--fg-dim)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Порт Moonraker</span>
                <input
                  value={port}
                  onChange={(e) => setPort(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="7125"
                  spellCheck={false}
                  style={{
                    width: 200, boxSizing: 'border-box',
                    padding: '18px 20px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#fff',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 22, letterSpacing: '0.02em',
                    outline: 'none',
                  }}
                />
              </label>
            </div>

            <div style={{
              position: 'relative', marginTop: 18,
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 13, color: connected ? '#A8F0C6' : 'var(--fg-muted)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              letterSpacing: '0.06em', minHeight: 18,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: connected ? '#3DDC84' : (connecting ? '#FFD27A' : 'rgba(255,255,255,0.4)'),
                boxShadow: connected ? '0 0 10px #3DDC84' : 'none',
                animation: connecting ? 'k-pulse 1s infinite' : 'none',
              }} />
              {connecting && `Подключение к ${ip}:${port}…`}
              {connected  && `Подключено · ${ip}:${port}`}
              {!connecting && !connected && `tcp://${ip}:${port}`}
            </div>

            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22 }}>
              <button
                onClick={() => !connecting && setAdminOpen(false)}
                style={{
                  padding: '18px 24px', borderRadius: 18,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontFamily: 'var(--text)', fontSize: 16, fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Отмена
              </button>
              <button
                onClick={handleConnect}
                disabled={connecting || !ip}
                style={{
                  padding: '18px 24px', borderRadius: 18,
                  background: 'var(--accent-grad)',
                  color: '#0A2A1A',
                  border: 'none',
                  fontFamily: 'var(--text)', fontSize: 16, fontWeight: 600,
                  opacity: (connecting || !ip) ? 0.6 : 1,
                  cursor: (connecting || !ip) ? 'default' : 'pointer',
                  boxShadow: '0 10px 24px rgba(61,220,132,0.35)',
                }}>
                {connecting ? 'Подключаемся…' : connected ? 'Готово ✓' : 'Подключиться'}
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export { GlobalPrinterStatus };
