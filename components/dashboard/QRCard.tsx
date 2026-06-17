'use client';

import { useEffect, useRef, useState } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // window is only available on the client — read the origin after mount
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
        // white backing so the QR modules under the logo are cleared
        ctx.fillStyle = '#ffffff';
        roundRectPath(ctx, x - pad, y - pad, box + pad * 2, box + pad * 2, (box + pad * 2) * 0.26);
        ctx.fill();
        // terracotta logo tile
        ctx.fillStyle = '#C76B43';
        roundRectPath(ctx, x, y, box, box, box * 0.22);
        ctx.fill();
        // "m." mark
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

  return (
    <div className="app-surface border app-line rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold app-ink text-sm mb-1">Comparte tu carta</h3>
          <p className="text-xs app-mut">Tus clientes escanean el QR para chatear con el asistente.</p>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* QR preview */}
        {dataUrl ? (
          <div className="shrink-0">
            <img src={dataUrl} alt="QR Code" className="w-24 h-24 rounded-xl border app-line" />
          </div>
        ) : (
          <div className="w-24 h-24 app-surface2 rounded-xl border app-line animate-pulse shrink-0" />
        )}

        {/* Actions */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 app-surface2 border app-line rounded-xl px-3 py-2">
            <span className="text-xs app-mut truncate flex-1">{shortUrl}</span>
            <button onClick={copyLink} className="text-xs text-accent hover:text-accent-lite shrink-0 transition font-medium">
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={downloadQR}
              disabled={!dataUrl}
              className="flex-1 text-xs app-soft app-soft-hover border app-line app-mut app-ink-hover px-3 py-2 rounded-xl transition disabled:opacity-50"
            >
              ↓ QR PNG
            </button>
            <a
              href={chatUrl}
              target="_blank"
              className="flex-1 text-xs bg-accent/20 hover:bg-accent/30 border border-accent/30 text-accent px-3 py-2 rounded-xl transition text-center"
            >
              Ver carta →
            </a>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
