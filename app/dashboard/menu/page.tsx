'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { formatPrice, getDishEmoji, capitalize } from '@/lib/menu';
import { scoreLabel } from '@/lib/completeness';
import { MenuImport } from '@/components/dashboard/MenuImport';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Dish {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  ingredients: string | null;
  allergens: string | null;
  image: string | null;
  icon: string | null;
  is_recommended: boolean;
  available: boolean;
}

const ALLERGEN_OPTIONS = ['gluten', 'lácteos', 'mariscos', 'huevo', 'frutos secos', 'soya', 'ninguno'];
const CATEGORIES = ['entradas', 'principales', 'postres', 'bebidas', 'cócteles', 'piscos', 'cervezas', 'sin alcohol', 'chef', 'kids', 'otros'];
const DISH_ICONS = ['🍽️', '🍗', '🥩', '🐟', '🐠', '🦐', '🐙', '🥟', '🍜', '🥦', '🥗', '🌮', '🍕', '🥪', '🍔', '🍮', '🍰', '🍫', '☕', '🍹', '🍺', '🥤', '🍷'];

/** Resize + compress an image file to a small JPEG data URL (stored in the DB). */
function resizeImage(file: File, maxSize = 700, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
        else if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas no soportado'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DishModal({
  dish,
  businessId,
  existingCategories,
  onClose,
  onSaved,
}: {
  dish: Partial<Dish> | null;
  businessId: number;
  existingCategories: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !dish?.id;
  const [form, setForm] = useState<Partial<Dish>>(dish ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imgBusy, setImgBusy] = useState(false);
  const [generating, setGenerating] = useState(false);

  const categoryOptions = Array.from(new Set([...existingCategories, ...CATEGORIES].map(c => c.trim()).filter(Boolean)));

  async function onPickImage(file: File | undefined) {
    if (!file) return;
    setImgBusy(true);
    setError('');
    try {
      set('image', await resizeImage(file));
    } catch {
      setError('No se pudo procesar la imagen.');
    } finally {
      setImgBusy(false);
    }
  }

  function set(key: keyof Dish, val: unknown) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function generateWithAI() {
    if (!form.name?.trim()) { setError('Escribe el nombre del plato antes de generar.'); return; }
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/dishes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, dishName: form.name }),
      });
      const data = await res.json() as { description?: string; ingredients?: string; allergens?: string; error?: string; upgradeRequired?: boolean };
      if (!res.ok) {
        setError(data.error ?? 'Error al generar.');
        return;
      }
      if (data.description) set('description', data.description);
      if (data.ingredients) set('ingredients', data.ingredients);
      if (data.allergens) set('allergens', data.allergens);
    } catch {
      setError('Error de conexión al generar.');
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!form.name?.trim()) { setError('El nombre es requerido.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = isNew
        ? await fetch('/api/dishes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, businessId }),
          })
        : await fetch(`/api/dishes/${form.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? 'Error al guardar.'); return; }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md app-surface border app-line rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-semibold app-ink mb-4">{isNew ? 'Agregar plato' : 'Editar plato'}</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs app-mut mb-1">Nombre *</label>
            <input value={form.name ?? ''} onChange={e => set('name', e.target.value)}
              className="w-full app-surface2 border app-line rounded-xl px-3 py-2 text-sm app-ink outline-none focus:border-accent/60 transition"
              placeholder="Nombre del plato" />
          </div>
          <div>
            <label className="block text-xs app-mut mb-1">Categoría</label>
            <input
              list="dish-categories"
              value={form.category ?? ''}
              onChange={e => set('category', e.target.value || null)}
              className="w-full app-surface2 border app-line rounded-xl px-3 py-2 text-sm app-ink outline-none focus:border-accent/60 transition"
              placeholder="Elige o escribe una categoría nueva"
            />
            <datalist id="dish-categories">
              {categoryOptions.map(c => <option key={c} value={capitalize(c)} />)}
            </datalist>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none app-surface2 border app-line rounded-xl px-3 py-2.5">
            <input type="checkbox" checked={!!form.is_recommended} onChange={e => set('is_recommended', e.target.checked)} className="accent-[#C76B43] w-4 h-4 shrink-0" />
            <span className="text-sm app-ink">⭐ Recomendación del chef</span>
            <span className="text-xs app-mut2 ml-auto hidden sm:inline">se destaca y se prioriza en el chat</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none app-surface2 border app-line rounded-xl px-3 py-2.5">
            <input type="checkbox" checked={form.available !== false} onChange={e => set('available', e.target.checked)} className="accent-[#C76B43] w-4 h-4 shrink-0" />
            <span className="text-sm app-ink">Disponible hoy</span>
            <span className="text-xs app-mut2 ml-auto hidden sm:inline">si lo desmarcas, aparece “Agotado”</span>
          </label>

          {/* Visual: foto o ícono */}
          <div>
            <label className="block text-xs app-mut mb-2">Imagen del plato</label>
            <div className="flex items-start gap-3">
              {/* Preview */}
              <div className="w-16 h-16 rounded-xl app-surface2 border app-line flex items-center justify-center overflow-hidden shrink-0 text-2xl">
                {form.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={form.image} alt="" className="w-full h-full object-cover" />
                  : (form.icon || getDishEmoji(form.name ?? '', form.category ?? ''))}
              </div>
              <div className="flex-1 min-w-0">
                <label className="inline-block cursor-pointer text-xs font-semibold text-accent hover:text-accent-lite transition">
                  {imgBusy ? 'Procesando…' : form.image ? 'Cambiar foto' : 'Subir foto'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => { onPickImage(e.target.files?.[0]); e.target.value = ''; }} />
                </label>
                {form.image && (
                  <button type="button" onClick={() => set('image', null)} className="ml-3 text-xs app-mut app-ink-hover transition">Quitar</button>
                )}
                {/* Icon picker (fallback when no photo) */}
                {!form.image && (
                  <>
                    <p className="text-xs app-mut2 mt-2 mb-1">o elige un ícono</p>
                    <div className="flex flex-wrap gap-1">
                      {DISH_ICONS.map(ic => (
                        <button key={ic} type="button" onClick={() => set('icon', form.icon === ic ? null : ic)}
                          className={`w-7 h-7 rounded-lg text-base leading-none flex items-center justify-center transition ${form.icon === ic ? 'bg-accent/20 ring-1 ring-accent' : 'app-soft-hover'}`}>
                          {ic}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs app-mut mb-1">Precio (CLP)</label>
            <input type="number" min="0" value={form.price ?? ''} onChange={e => set('price', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full app-surface2 border app-line rounded-xl px-3 py-2 text-sm app-ink outline-none focus:border-accent/60 transition"
              placeholder="8990" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs app-mut">Descripción</label>
              <button
                type="button"
                onClick={generateWithAI}
                disabled={generating || !form.name?.trim()}
                className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-lite disabled:opacity-40 transition"
              >
                {generating ? '✨ Generando…' : '✨ Generar con IA'}
              </button>
            </div>
            <textarea rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value || null)}
              className="w-full app-surface2 border app-line rounded-xl px-3 py-2 text-sm app-ink outline-none focus:border-accent/60 transition resize-none"
              placeholder="Descripción breve... o usa ✨ Generar con IA" />
          </div>
          <div>
            <label className="block text-xs app-mut mb-1">Ingredientes</label>
            <input value={form.ingredients ?? ''} onChange={e => set('ingredients', e.target.value || null)}
              className="w-full app-surface2 border app-line rounded-xl px-3 py-2 text-sm app-ink outline-none focus:border-accent/60 transition"
              placeholder="pollo, limón, cebolla..." />
          </div>
          <div>
            <label className="block text-xs app-mut mb-2">Alérgenos</label>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGEN_OPTIONS.map(a => {
                const selected = (form.allergens ?? '').includes(a);
                return (
                  <button key={a} type="button" onClick={() => {
                    if (a === 'ninguno') { set('allergens', 'ninguno'); return; }
                    const curr = (form.allergens ?? '').replace('ninguno', '').split(',').map(s => s.trim()).filter(Boolean);
                    const next = selected ? curr.filter(x => x !== a) : [...curr, a];
                    set('allergens', next.join(', ') || null);
                  }}
                    className={`px-2.5 py-1 rounded-full text-xs transition ${selected ? 'bg-accent text-white' : 'app-surface2 app-mut app-soft-hover'}`}>
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-none px-4 py-2 rounded-xl app-soft border app-line text-sm app-mut app-ink-hover transition">Cancelar</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-accent hover:bg-accent-lite disabled:opacity-50 text-white font-semibold rounded-xl py-2 text-sm transition">
            {saving ? 'Guardando...' : isNew ? 'Agregar plato' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Click-to-edit field for the dish rows: the view is a button; clicking swaps
// in an autofocused input. Enter/blur saves, Escape cancels. Uncontrolled so
// the value is read once on commit.
function InlineField({ value, display, type = 'text', viewClass = '', inputClass = '', onSave }: {
  value: string;
  display: React.ReactNode;
  type?: 'text' | 'number';
  viewClass?: string;
  inputClass?: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const cancelled = useRef(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        title="Clic para editar"
        className={`cursor-text rounded px-1 -mx-1 text-left transition hover:bg-black/[0.045] ${viewClass}`}
      >
        {display}
      </button>
    );
  }
  return (
    <input
      autoFocus
      type={type}
      defaultValue={value}
      onFocus={e => e.target.select()}
      onBlur={e => {
        setEditing(false);
        if (cancelled.current) { cancelled.current = false; return; }
        const v = e.target.value.trim();
        if (v !== value) onSave(v);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') e.currentTarget.blur();
        else if (e.key === 'Escape') { cancelled.current = true; e.currentTarget.blur(); }
      }}
      className={`bg-transparent border-b border-accent outline-none ${inputClass}`}
    />
  );
}

function MenuEditor() {
  const params = useSearchParams();
  const bizId = parseInt(params.get('biz') ?? '0');

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [completeness, setCompleteness] = useState(0);
  const [bizName, setBizName] = useState('');
  const [bizSlug, setBizSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalDish, setModalDish] = useState<Partial<Dish> | null | false>(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filter, setFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    if (!bizId) return;
    const [dishRes, bizRes] = await Promise.all([
      fetch(`/api/businesses/${bizId}/dishes`),
      fetch(`/api/businesses/${bizId}/info`),
    ]);
    if (dishRes.ok) {
      const data = await dishRes.json() as { dishes: Dish[] };
      setDishes(data.dishes);
      const scored = data.dishes.filter(d => d.description && d.price && d.category && d.ingredients && d.allergens).length;
      setCompleteness(data.dishes.length > 0 ? Math.round((scored / data.dishes.length) * 100) : 0);
    }
    if (bizRes.ok) {
      const d = await bizRes.json() as { name: string; slug: string; menu_completeness: number };
      setBizName(d.name);
      setBizSlug(d.slug);
      setCompleteness(d.menu_completeness);
    }
    setLoading(false);
  }, [bizId]);

  // Inlined so setState runs only after the await (keeps
  // react-hooks/set-state-in-effect happy); `load` is reused by the mutations.
  useEffect(() => {
    if (!bizId) return;
    let cancelled = false;
    (async () => {
      const [dishRes, bizRes] = await Promise.all([
        fetch(`/api/businesses/${bizId}/dishes`),
        fetch(`/api/businesses/${bizId}/info`),
      ]);
      if (cancelled) return;
      if (dishRes.ok) {
        const data = await dishRes.json() as { dishes: Dish[] };
        setDishes(data.dishes);
        const scored = data.dishes.filter(d => d.description && d.price && d.category && d.ingredients && d.allergens).length;
        setCompleteness(data.dishes.length > 0 ? Math.round((scored / data.dishes.length) * 100) : 0);
      }
      if (bizRes.ok) {
        const d = await bizRes.json() as { name: string; slug: string; menu_completeness: number };
        setBizName(d.name);
        setBizSlug(d.slug);
        setCompleteness(d.menu_completeness);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [bizId]);

  async function exportAllergenPdf() {
    setExporting(true);
    try {
      const res = await fetch(`/api/export/allergens?businessId=${bizId}`);
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        alert(d.error ?? 'Error al exportar el PDF.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alergenos-${bizSlug}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error de conexión al exportar.');
    } finally {
      setExporting(false);
    }
  }

  async function deleteDish(id: number) {
    if (!confirm('¿Eliminar este plato?')) return;
    setDeleting(id);
    await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
    await load();
    setDeleting(null);
  }

  // Inline row edits (name/price/description) — optimistic, then reload so the
  // completeness score and category sorting stay honest.
  async function patchDish(dish: Dish, patch: Partial<Dish>) {
    setDishes(ds => ds.map(d => d.id === dish.id ? { ...d, ...patch } : d));
    await fetch(`/api/dishes/${dish.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await load();
  }

  // Quick "mark as sold out / available" toggle — optimistic so it feels instant
  // when a dish runs out mid-service.
  async function toggleAvailable(dish: Dish) {
    const next = !dish.available;
    setDishes(ds => ds.map(d => d.id === dish.id ? { ...d, available: next } : d));
    await fetch(`/api/dishes/${dish.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: next }),
    });
  }

  // Rename a category for every dish in it — after an import the category
  // names often need cleanup, and per-dish edits would be painful.
  async function renameCategory(from: string, to: string) {
    const ids = dishes.filter(d => (d.category ?? 'Sin categoría') === from).map(d => d.id);
    setDishes(ds => ds.map(d => (d.category ?? 'Sin categoría') === from ? { ...d, category: to } : d));
    if (catFilter === from) setCatFilter(to);
    await Promise.all(ids.map(id => fetch(`/api/dishes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: to }),
    })));
    await load();
  }

  // Per-category totals + incomplete counts for the filter chips.
  const catStats = dishes.reduce<Record<string, { total: number; incomplete: number }>>((acc, d) => {
    const cat = d.category ?? 'Sin categoría';
    acc[cat] ??= { total: 0, incomplete: 0 };
    acc[cat].total++;
    if (!d.description || !d.price || !d.category || !d.ingredients || !d.allergens) acc[cat].incomplete++;
    return acc;
  }, {});

  const filtered = dishes.filter(d =>
    (!filter || d.name.toLowerCase().includes(filter.toLowerCase()) || (d.category ?? '').toLowerCase().includes(filter.toLowerCase()))
    && (!catFilter || (d.category ?? 'Sin categoría') === catFilter)
  );

  const grouped = filtered.reduce<Record<string, Dish[]>>((acc, d) => {
    const cat = d.category ?? 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(d);
    return acc;
  }, {});

  const { label: scoreTag, color: scoreColor } = scoreLabel(completeness);

  if (!bizId) return <div className="min-h-screen app-bg flex items-center justify-center app-mut">Selecciona un negocio desde el dashboard.</div>;

  return (
    <div className="min-h-screen app-bg app-ink flex flex-col">
      <header className="border-b app-line px-5 py-3 flex items-center gap-3 flex-wrap">
        <Link href="/dashboard" className="app-mut app-ink-hover transition shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold app-ink text-sm truncate">{bizName || 'Menú'}</h1>
          {bizSlug && <p className="text-xs app-mut truncate">/chat/{bizSlug}</p>}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto sm:shrink-0">
          <button
            onClick={exportAllergenPdf}
            disabled={exporting || dishes.length === 0}
            title="Exportar PDF de alérgenos (Res. 20 Minsal)"
            className="flex-none border app-line app-mut hover:app-ink disabled:opacity-40 text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1"
          >
            {exporting ? '⏳' : '📄'} PDF
          </button>
          <button onClick={() => setShowImport(v => !v)}
            className="flex-1 sm:flex-none border border-accent/40 text-accent hover:bg-accent/10 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
            Importar carta
          </button>
          <button onClick={() => setModalDish(null)}
            className="flex-1 sm:flex-none bg-accent hover:bg-accent-lite text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
            + Agregar plato
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Completeness bar */}
      <div className="border-b app-line px-5 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs app-mut">{dishes.length} platos · Completeness <span className={`font-semibold ${scoreColor}`}>{completeness}% — {scoreTag}</span></span>
          <Link href={`/chat/${bizSlug}`} target="_blank"
            className="shrink-0 border border-accent/40 text-accent hover:bg-accent/10 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
            Ver carta →
          </Link>
        </div>
        <div className="w-full app-surface2 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all ${completeness >= 80 ? 'bg-emerald-500' : completeness >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${completeness}%` }} />
        </div>
      </div>

      {/* Import panel */}
      {showImport && (
        <div className="px-5 py-3 border-b app-line">
          <div className="app-surface border app-line rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold app-ink">Importar carta</h2>
              <button onClick={() => setShowImport(false)} className="app-mut app-ink-hover text-sm transition" aria-label="Cerrar">✕</button>
            </div>
            <MenuImport
              businessId={bizId}
              defaultReplace={false}
              onImported={() => { load(); setShowImport(false); }}
            />
          </div>
        </div>
      )}

      {/* Search + category filter chips */}
      <div className="px-5 py-3 border-b app-line">
        <input value={filter} onChange={e => setFilter(e.target.value)}
          className="w-full app-surface2 border app-line rounded-xl px-3 py-2 text-sm app-ink placeholder-gray-600 outline-none focus:border-accent/40 transition"
          placeholder="Buscar plato o categoría..." />
        {dishes.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <button
              onClick={() => setCatFilter('')}
              className={`rounded-full text-xs font-semibold px-3 py-1.5 border transition ${
                !catFilter ? 'bg-accent border-accent text-white' : 'app-surface2 app-mut app-line hover:border-accent/40'
              }`}
            >
              Todo · {dishes.length}
            </button>
            {Object.entries(catStats).map(([cat, s]) => {
              const on = catFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCatFilter(on ? '' : cat)}
                  title={s.incomplete > 0 ? `${s.incomplete} plato${s.incomplete !== 1 ? 's' : ''} con campos pendientes` : 'Categoría completa'}
                  className={`rounded-full text-xs font-semibold px-3 py-1.5 border transition ${
                    on ? 'bg-accent border-accent text-white' : 'app-surface2 app-mut app-line hover:border-accent/40'
                  }`}
                >
                  {capitalize(cat)} · {s.total}
                  {s.incomplete > 0 && <span className={on ? 'text-white/85' : 'text-orange-400'}> ⚠{s.incomplete}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dishes */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="text-center app-mut2 py-12">Cargando...</div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="app-mut text-sm mb-4">No hay platos aún.</p>
            <button onClick={() => setModalDish(null)} className="bg-accent hover:bg-accent-lite text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
              + Agregar el primer plato
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catDishes]) => (
            <div key={cat} className="mb-5">
              <h3 className="mb-2">
                <InlineField
                  value={cat}
                  display={<span className="text-xs font-semibold app-mut uppercase tracking-widest">{capitalize(cat)} ({catDishes.length})</span>}
                  inputClass="w-full max-w-[280px] text-xs font-semibold app-ink uppercase tracking-widest"
                  onSave={v => { if (v && v !== cat) renameCategory(cat, v); }}
                />
              </h3>
              <div className="space-y-1.5">
                {catDishes.map(dish => {
                  const missing = [!dish.description, !dish.price, !dish.category, !dish.ingredients, !dish.allergens].filter(Boolean).length;
                  return (
                    <div key={dish.id} className="flex items-center gap-3 app-surface border app-line rounded-xl px-3 py-2.5 group transition">
                      <div className={`w-9 h-9 rounded-lg app-surface2 flex items-center justify-center text-xl shrink-0 overflow-hidden ${dish.available ? '' : 'opacity-50 grayscale'}`}>
                        {dish.image
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={dish.image} alt="" className="w-full h-full object-cover" />
                          : (dish.icon || getDishEmoji(dish.name, dish.category ?? ''))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <InlineField
                            value={dish.name}
                            display={<span className="text-sm font-medium app-ink break-words">{dish.is_recommended && <span title="Recomendación del chef">⭐ </span>}{dish.name}</span>}
                            viewClass="min-w-0"
                            inputClass="w-full max-w-[260px] text-sm font-medium app-ink"
                            onSave={v => { if (v) patchDish(dish, { name: v }); }}
                          />
                          {missing > 0 && (
                            <span className="text-xs text-orange-400 shrink-0">⚠ {missing} campo{missing !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        <div className="mt-0.5">
                          <InlineField
                            value={dish.price?.toString() ?? ''}
                            type="number"
                            display={dish.price
                              ? <span className="text-sm font-bold app-ink">{formatPrice(dish.price)}</span>
                              : <span className="text-xs text-orange-400">Sin precio — agregar</span>}
                            inputClass="w-28 text-sm font-bold app-ink"
                            onSave={v => {
                              const n = parseInt(v);
                              patchDish(dish, { price: Number.isFinite(n) && n > 0 ? n : null });
                            }}
                          />
                        </div>
                        <div>
                          <InlineField
                            value={dish.description ?? ''}
                            display={dish.description
                              ? <span className="block text-xs app-mut leading-snug line-clamp-2">{dish.description}</span>
                              : <span className="text-xs italic text-[#9A9087]">Agregar descripción…</span>}
                            viewClass="block w-full"
                            inputClass="w-full text-xs app-mut"
                            onSave={v => patchDish(dish, { description: v || null })}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAvailable(dish)}
                        title={dish.available ? 'Marcar como agotado' : 'Marcar como disponible'}
                        className={`shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${dish.available ? 'app-soft app-soft-hover app-line app-mut app-ink-hover' : 'bg-red-500/15 border-red-500/30 text-red-500 hover:bg-red-500/25'}`}
                      >
                        {dish.available ? 'Disponible' : 'Agotado'}
                      </button>
                      <div className="flex gap-1.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                        <button onClick={() => setModalDish(dish)}
                          className="text-xs app-mut app-ink-hover app-soft app-soft-hover px-2.5 py-1.5 rounded-lg transition">
                          Editar
                        </button>
                        <button onClick={() => deleteDish(dish.id)} disabled={deleting === dish.id}
                          className="text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 px-2.5 py-1.5 rounded-lg transition disabled:opacity-50">
                          {deleting === dish.id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {modalDish !== false && (
        <DishModal
          dish={modalDish}
          businessId={bizId}
          existingCategories={Array.from(new Set(dishes.map(d => d.category).filter((c): c is string => !!c)))}
          onClose={() => setModalDish(false)}
          onSaved={() => { setModalDish(false); load(); }}
        />
      )}
    </div>
  );
}

export default function MenuPage() {
  return <Suspense><MenuEditor /></Suspense>;
}
