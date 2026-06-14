'use client';

import { useRef, useState } from 'react';

interface ImportResult {
  totalDishes: number;
  completeness: number;
  extractedCount: number;
}

interface MenuImportProps {
  businessId: number;
  /** Called after a successful import batch finishes. */
  onImported?: (result: ImportResult) => void;
  /** Whether "replace existing dishes" starts checked. Default true (onboarding). */
  defaultReplace?: boolean;
  className?: string;
}

type Status = 'pending' | 'processing' | 'done' | 'error';
interface FileStatus { file: File; status: Status; count?: number; error?: string }

const ACCEPT = 'image/*,application/pdf,.pdf,.docx,.xlsx,.xls,.csv,.txt';
const ACCEPT_HINT = 'Foto, PDF, Word, Excel, CSV o TXT';

function isAccepted(file: File): boolean {
  const t = file.type;
  const n = file.name.toLowerCase();
  if (t.startsWith('image/') || t === 'application/pdf') return true;
  return /\.(pdf|docx|xlsx|xls|csv|txt)$/.test(n);
}

function StatusDot({ status }: { status: Status }) {
  const color =
    status === 'done' ? '#5BBF7B' : status === 'error' ? '#E05B5B' : status === 'processing' ? 'var(--accent)' : 'rgba(255,255,255,0.3)';
  return (
    <span
      className={status === 'processing' ? 'inline-block animate-pulse' : 'inline-block'}
      style={{ width: 8, height: 8, borderRadius: 99, background: color, flexShrink: 0 }}
    />
  );
}

export function MenuImport({ businessId, onImported, defaultReplace = true, className = '' }: MenuImportProps) {
  const [mode, setMode] = useState<'file' | 'paste'>('file');
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');
  const [replace, setReplace] = useState(defaultReplace);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const accepted = Array.from(list).filter(isAccepted).map((file) => ({ file, status: 'pending' as Status }));
    const rejected = Array.from(list).length - accepted.length;
    setFiles((prev) => [...prev, ...accepted]);
    setSummary(rejected > 0 ? `${rejected} archivo(s) con formato no soportado fueron ignorados.` : null);
  }

  async function callExtract(body: FormData): Promise<ImportResult> {
    const res = await fetch('/api/menu/extract', { method: 'POST', body });
    const data = (await res.json()) as Partial<ImportResult> & { error?: string };
    if (!res.ok || data.error) throw new Error(data.error ?? 'Error al procesar');
    return { totalDishes: data.totalDishes ?? 0, completeness: data.completeness ?? 0, extractedCount: data.extractedCount ?? 0 };
  }

  async function processFiles() {
    setBusy(true);
    setSummary(null);
    let last: ImportResult | null = null;
    let firstSent = false;
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'done') continue;
      setFiles((prev) => prev.map((f, j) => (j === i ? { ...f, status: 'processing', error: undefined } : f)));
      try {
        const form = new FormData();
        form.append('file', files[i].file);
        form.append('businessId', String(businessId));
        form.append('clearExisting', String(replace && !firstSent));
        const result = await callExtract(form);
        firstSent = true;
        last = result;
        setFiles((prev) => prev.map((f, j) => (j === i ? { ...f, status: 'done', count: result.extractedCount } : f)));
      } catch (e) {
        setFiles((prev) => prev.map((f, j) => (j === i ? { ...f, status: 'error', error: e instanceof Error ? e.message : 'Error' } : f)));
      }
    }
    setBusy(false);
    if (last) {
      setSummary(`Listo · ${last.totalDishes} platos en la carta (${last.completeness}% completa).`);
      onImported?.(last);
    }
  }

  async function processPaste() {
    const hasText = pasteText.trim().length > 0;
    const hasUrl = pasteUrl.trim().length > 0;
    if (!hasText && !hasUrl) return;
    setBusy(true);
    setSummary(null);
    try {
      const form = new FormData();
      form.append('businessId', String(businessId));
      form.append('clearExisting', String(replace));
      if (hasText) form.append('text', pasteText.trim());
      else form.append('url', pasteUrl.trim());
      const result = await callExtract(form);
      setSummary(`Listo · ${result.totalDishes} platos en la carta (${result.completeness}% completa).`);
      setPasteText('');
      setPasteUrl('');
      onImported?.(result);
    } catch (e) {
      setSummary(e instanceof Error ? e.message : 'Error al procesar');
    }
    setBusy(false);
  }

  const canProcess = mode === 'file' ? files.some((f) => f.status !== 'done') : pasteText.trim() || pasteUrl.trim();

  return (
    <div className={className}>
      {/* Mode tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl bg-[#1A1613] border border-white/5 w-fit">
        {(['file', 'paste'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === m ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {m === 'file' ? 'Subir archivo' : 'Pegar texto o enlace'}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        <>
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-9 text-center transition ${
              dragOver ? 'border-accent bg-accent/5' : 'border-white/15 hover:border-accent/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            />
            <div className="text-2xl mb-2">📄</div>
            <p className="text-white text-sm font-medium">Arrastra tu carta aquí o haz clic para subir</p>
            <p className="text-gray-500 text-xs mt-1">{ACCEPT_HINT} · puedes subir varios</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 bg-[#2E2823]/60 border border-white/5 rounded-lg px-3 py-2 text-sm">
                  <StatusDot status={f.status} />
                  <span className="flex-1 min-w-0 truncate text-gray-200">{f.file.name}</span>
                  {f.status === 'done' && <span className="text-xs text-gray-400 shrink-0">{f.count} platos</span>}
                  {f.status === 'error' && <span className="text-xs text-[#E05B5B] shrink-0 truncate max-w-[40%]" title={f.error}>{f.error}</span>}
                  {f.status === 'pending' && !busy && (
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-gray-500 hover:text-white shrink-0" aria-label="Quitar">✕</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <textarea
            value={pasteText}
            onChange={(e) => { setPasteText(e.target.value); if (e.target.value) setPasteUrl(''); }}
            placeholder="Pega aquí el texto de tu carta…"
            rows={6}
            className="w-full bg-[#2E2823] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-accent/60 resize-y"
          />
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex-1 h-px bg-white/10" /> o pega un enlace <span className="flex-1 h-px bg-white/10" />
          </div>
          <input
            type="url"
            value={pasteUrl}
            onChange={(e) => { setPasteUrl(e.target.value); if (e.target.value) setPasteText(''); }}
            placeholder="https://… (página de tu carta)"
            className="w-full bg-[#2E2823] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-accent/60"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
          <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} className="accent-[#C76B43]" />
          Reemplazar la carta actual
        </label>
        <button
          type="button"
          onClick={mode === 'file' ? processFiles : processPaste}
          disabled={busy || !canProcess}
          className="bg-accent hover:bg-accent-lite disabled:bg-[#2E2823] disabled:text-gray-500 text-white font-semibold rounded-xl px-5 py-2 text-sm transition"
        >
          {busy ? 'Procesando…' : 'Extraer carta'}
        </button>
      </div>

      {summary && <p className="mt-3 text-xs text-gray-400">{summary}</p>}
    </div>
  );
}
