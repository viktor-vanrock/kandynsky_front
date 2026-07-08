// klipper.js — Moonraker HTTP API client
// Moonraker runs on the printer itself, default port 7125.
// All functions throw on non-OK responses so callers can catch uniformly.

const base = (ip, port) => `http://${ip}:${port}`;

export async function checkPrinter(ip, port) {
  const res = await fetch(`${base(ip, port)}/printer/info`);
  if (!res.ok) throw new Error(`Printer unreachable: ${res.status}`);
  return res.json();
}

export async function uploadGcode(ip, port, blob, filename = 'print.gcode.3mf') {
  const form = new FormData();
  form.append('file', blob, filename);
  form.append('root', 'gcodes');
  const res = await fetch(`${base(ip, port)}/server/files/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Upload failed: ${text}`);
  }
  return res.json();
}

export async function startPrint(ip, port, filename) {
  const res = await fetch(`${base(ip, port)}/printer/print/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Start print failed: ${text}`);
  }
  return res.json();
}

// Returns { state: 'printing'|'complete'|'paused'|'error'|'standby', progress: 0..1 }
export async function getPrintStatus(ip, port) {
  const res = await fetch(
    `${base(ip, port)}/printer/objects/query?print_stats&display_status`
  );
  if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`);
  const data = await res.json();
  const status = data?.result?.status ?? {};
  return {
    state: status.print_stats?.state ?? 'standby',
    progress: status.display_status?.progress ?? 0,
    filename: status.print_stats?.filename ?? '',
  };
}
