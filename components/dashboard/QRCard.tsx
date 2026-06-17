'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCardProps {
  slug: string;
  businessName: string;
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
    QRCode.toDataURL(chatUrl, {
      width: 512,
      margin: 2,
      color: { dark: '#ffffff', light: '#09090b' },
    }).then(setDataUrl);
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
