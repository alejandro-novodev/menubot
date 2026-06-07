'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { formatPrice, getDishEmoji, capitalize } from '@/lib/menu';
import { scoreLabel } from '@/lib/completeness';

interface Dish {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  ingredients: string | null;
  allergens: string | null;
}

const ALLERGEN_OPTIONS = ['gluten', 'lácteos', 'mariscos', 'huevo', 'frutos secos', 'soya', 'ninguno'];
const CATEGORIES = ['entradas', 'principales', 'postres', 'bebidas', 'cócteles', 'piscos', 'cervezas', 'sin alcohol', 'chef', 'kids', 'otros'];

function DishModal({
  dish,
  businessId,
  onClose,
  onSaved,
}: {
  dish: Partial<Dish> | null;
  businessId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !dish?.id;
  const [form, setForm] = useState<Partial<Dish>>(dish ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key: keyof Dish, val: unknown) {
    setForm(f => ({ ...f, [key]: val }));
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
      <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-semibold text-white mb-4">{isNew ? 'Agregar plato' : 'Editar plato'}</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
            <input value={form.name ?? ''} onChange={e => set('name', e.target.value)}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60 transition"
              placeholder="Nombre del plato" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Categoría</label>
            <select value={form.category ?? ''} onChange={e => set('category', e.target.value || null)}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60 transition">
              <option value="">Sin categoría</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{capitalize(c)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Precio (CLP)</label>
            <input type="number" min="0" value={form.price ?? ''} onChange={e => set('price', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60 transition"
              placeholder="8990" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Descripción</label>
            <textarea rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value || null)}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60 transition resize-none"
              placeholder="Descripción breve..." />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Ingredientes</label>
            <input value={form.ingredients ?? ''} onChange={e => set('ingredients', e.target.value || null)}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500/60 transition"
              placeholder="pollo, limón, cebolla..." />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Alérgenos</label>
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
                    className={`px-2.5 py-1 rounded-full text-xs transition ${selected ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-none px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition">Cancelar</button>
          <button onClick={save} disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-semibold rounded-xl py-2 text-sm transition">
            {saving ? 'Guardando...' : isNew ? 'Agregar plato' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
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

  useEffect(() => { load(); }, [load]);

  async function deleteDish(id: number) {
    if (!confirm('¿Eliminar este plato?')) return;
    setDeleting(id);
    await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
    await load();
    setDeleting(null);
  }

  const filtered = dishes.filter(d =>
    !filter || d.name.toLowerCase().includes(filter.toLowerCase()) || (d.category ?? '').toLowerCase().includes(filter.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Dish[]>>((acc, d) => {
    const cat = d.category ?? 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(d);
    return acc;
  }, {});

  const { label: scoreTag, color: scoreColor } = scoreLabel(completeness);

  if (!bizId) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">Selecciona un negocio desde el dashboard.</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-white/5 px-5 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-white text-sm truncate">{bizName || 'Menú'}</h1>
          {bizSlug && <p className="text-xs text-gray-500">/chat/{bizSlug}</p>}
        </div>
        <button onClick={() => setModalDish(null)}
          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shrink-0">
          + Agregar plato
        </button>
      </header>

      {/* Completeness bar */}
      <div className="border-b border-white/5 px-5 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-400">{dishes.length} platos · Completeness <span className={`font-semibold ${scoreColor}`}>{completeness}% — {scoreTag}</span></span>
          <Link href={`/chat/${bizSlug}`} target="_blank" className="text-xs text-purple-400 hover:text-purple-300 transition">Ver carta →</Link>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all ${completeness >= 80 ? 'bg-emerald-500' : completeness >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${completeness}%` }} />
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-white/5">
        <input value={filter} onChange={e => setFilter(e.target.value)}
          className="w-full bg-gray-800/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/40 transition"
          placeholder="Buscar plato o categoría..." />
      </div>

      {/* Dishes */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="text-center text-gray-600 py-12">Cargando...</div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm mb-4">No hay platos aún.</p>
            <button onClick={() => setModalDish(null)} className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
              + Agregar el primer plato
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([cat, catDishes]) => (
            <div key={cat} className="mb-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">{capitalize(cat)} ({catDishes.length})</h3>
              <div className="space-y-1.5">
                {catDishes.map(dish => {
                  const missing = [!dish.description, !dish.price, !dish.category, !dish.ingredients, !dish.allergens].filter(Boolean).length;
                  return (
                    <div key={dish.id} className="flex items-center gap-3 bg-gray-900 border border-white/5 rounded-xl px-3 py-2.5 group hover:border-white/10 transition">
                      <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-xl shrink-0">
                        {getDishEmoji(dish.name, dish.category ?? '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{dish.name}</p>
                          {missing > 0 && (
                            <span className="text-xs text-orange-400 shrink-0">⚠ {missing} campo{missing !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {dish.price ? formatPrice(dish.price) : <span className="text-orange-400">Sin precio</span>}
                          {dish.description && ` · ${dish.description.slice(0, 40)}${dish.description.length > 40 ? '...' : ''}`}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => setModalDish(dish)}
                          className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition">
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
