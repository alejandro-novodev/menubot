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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const shortUrl = `${window.location.origin}/r/${slug}`;
  const chatUrl = `${window.location.origin}/chat/${slug}`;

  useEffect(() => {
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
    <div className="bg-[#241F1B] border border-white/5 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-white text-sm mb-1">Comparte tu carta</h3>
          <p className="text-xs text-gray-500">Tus clientes escanean el QR para chatear con el asistente.</p>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* QR preview */}
        {dataUrl ? (
          <div className="shrink-0">
            <img src={dataUrl} alt="QR Code" className="w-24 h-24 rounded-xl border border-white/10" />
          </div>
        ) : (
          <div className="w-24 h-24 bg-[#2E2823] rounded-xl border border-white/10 animate-pulse shrink-0" />
        )}

        {/* Actions */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 bg-[#2E2823]/60 border border-white/10 rounded-xl px-3 py-2">
            <span className="text-xs text-gray-400 truncate flex-1">{shortUrl}</span>
            <button onClick={copyLink} className="text-xs text-accent hover:text-accent-lite shrink-0 transition font-medium">
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={downloadQR}
              disabled={!dataUrl}
              className="flex-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-3 py-2 rounded-xl transition disabled:opacity-50"
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
