'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCardProps {
  slug: string;
  businessName: string;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function QRCard({ slug, businessName }: QRCardProps) {
  const [dataUrl, setDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const [open, setOpen] = useState(false);

  // window is only available on the client — read the origin after mount so the
  // server and client render the same empty state first (avoids a hydration
  // mismatch on the URL). The setState-in-effect here is intentional.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const shortUrl = origin ? `${origin}/r/${slug}` : '';
  const chatUrl = origin ? `${origin}/chat/${slug}` : '';

  useEffect(() => {
    if (!chatUrl) return;
    let cancelled = false;
    (async () => {
      const canvas = document.createElement('canvas');
      // High error correction (~30%) so the center logo doesn't break scanning.
      await QRCode.toCanvas(canvas, chatUrl, {
        width: 512, margin: 2, errorCorrectionLevel: 'H',
        color: { dark: '#1A1613', light: '#ffffff' },
      });
      try { await document.fonts.ready; } catch { /* fall back to system font */ }
      if (cancelled) return;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const size = canvas.width;
        const box = Math.round(size * 0.24);
        const x = (size - box) / 2;
        const y = (size - box) / 2;
        const pad = Math.round(box * 0.16);
        ctx.fillStyle = '#ffffff';
        roundRectPath(ctx, x - pad, y - pad, box + pad * 2, box + pad * 2, (box + pad * 2) * 0.26);
        ctx.fill();
        ctx.fillStyle = '#C76B43';
        roundRectPath(ctx, x, y, box, box, box * 0.22);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${Math.round(box * 0.5)}px "Space Grotesk", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('m.', x + box / 2, y + box / 2 + box * 0.04);
      }
      setDataUrl(canvas.toDataURL('image/png'));
    })();
    return () => { cancelled = true; };
  }, [chatUrl]);

  function copyLink() {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadQR() {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qr-${slug}.png`;
    a.click();
  }

  /** Print-friendly popup sized for a table tent. */
  function printQR() {
    if (!dataUrl) return;
    const w = window.open('', '_blank', 'width=460,height=640');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>QR · ${businessName}</title></head>
      <body style="margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;font-family:system-ui,sans-serif;text-align:center">
        <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em">${businessName}</div>
        <img src="${dataUrl}" alt="QR" style="width:320px;height:320px"/>
        <div style="font-size:15px;color:#555">Escanea para ver la carta 📱</div>
        <div style="font-size:12px;color:#999">con menubot.</div>
      </body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 350);
  }

  return (
    <>
      <div className="app-surface border app-line rounded-2xl p-4">
        <div className="flex items-center gap-3">
          {/* Tappable QR thumbnail → opens the full preview */}
          <button onClick={() => setOpen(true)} disabled={!dataUrl}
            className="shrink-0 relative group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            aria-label="Ampliar código QR" title="Ampliar QR">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- base64 data URL
              <img src={dataUrl} alt="QR" className="w-20 h-20 rounded-xl border app-line" />
            ) : (
              <div className="w-20 h-20 app-surface2 rounded-xl border app-line animate-pulse" />
            )}
            <span className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/0 group-hover:bg-black/15 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="opacity-0 group-hover:opacity-100 transition drop-shadow">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </span>
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold app-ink text-sm">Comparte tu carta</h3>
            <p className="text-xs app-mut mb-2 leading-snug">Toca el QR para ampliarlo, descargarlo o imprimirlo.</p>
            <div className="flex items-center gap-2 app-surface2 border app-line rounded-lg px-2.5 py-1.5">
              <span className="text-xs app-mut truncate flex-1">{shortUrl}</span>
              <button onClick={copyLink} className="text-xs text-accent hover:text-accent-lite shrink-0 transition font-medium">
                {copied ? '✓' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm app-surface border app-line rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="font-semibold app-ink text-sm">Compartir carta</h3>
                <p className="text-xs app-mut truncate">{businessName}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="app-mut app-ink-hover transition shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {dataUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- base64 data URL
              <img src={dataUrl} alt="QR" className="w-full max-w-[260px] mx-auto rounded-2xl border app-line bg-white" />
            )}

            <div className="flex items-center gap-2 app-surface2 border app-line rounded-xl px-3 py-2 mt-4">
              <span className="text-xs app-mut truncate flex-1">{shortUrl}</span>
              <button onClick={copyLink} className="text-xs text-accent hover:text-accent-lite shrink-0 transition font-medium">
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button onClick={downloadQR} disabled={!dataUrl}
                className="text-sm bg-accent hover:bg-accent-lite text-white font-semibold px-3 py-2.5 rounded-xl transition disabled:opacity-50">
                ↓ Descargar PNG
              </button>
              <button onClick={printQR} disabled={!dataUrl}
                className="text-sm app-soft app-soft-hover border app-line app-mut app-ink-hover px-3 py-2.5 rounded-xl transition disabled:opacity-50">
                🖨 Imprimir
              </button>
            </div>
            <a href={chatUrl} target="_blank"
              className="block text-center text-sm text-accent hover:text-accent-lite mt-3 transition">
              Ver carta →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
