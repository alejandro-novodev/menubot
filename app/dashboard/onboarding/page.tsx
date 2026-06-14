'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { LogoIcon, Wordmark } from '@/components/brand/Wordmark';
import { MenuImport } from '@/components/dashboard/MenuImport';

// ── Types ─────────────────────────────────────────────────────────────────
const BUSINESS_TYPES = [
  { value: 'restaurant', label: '🍽️ Restaurante' },
  { value: 'bar', label: '🍺 Bar / Pub' },
  { value: 'hotel', label: '🏨 Hotel / Room Service' },
  { value: 'service', label: '💆 Spa / Salón / Servicios' },
  { value: 'retail', label: '🛍️ Tienda / Retail' },
];

const ALLERGEN_OPTIONS = ['gluten', 'lácteos', 'mariscos', 'huevo', 'frutos secos', 'soya', 'ninguno'];

interface Dish {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  ingredients: string | null;
  allergens: string | null;
}

// ── Step indicator ─────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const steps = ['Tu negocio', 'Sube el menú', 'Completa la carta'];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${i + 1 === step ? 'text-accent' : i + 1 < step ? 'text-gray-500' : 'text-gray-700'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i + 1 === step ? 'bg-accent text-white' : i + 1 < step ? 'bg-gray-700 text-gray-400' : 'bg-[#2E2823] text-gray-600'}`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < steps.length - 1 && <div className="w-8 h-px bg-[#2E2823] mx-2" />}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Business Profile ───────────────────────────────────────────────
function Step1({ onNext }: { onNext: (bizId: number, slug: string) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleNameChange(v: string) {
    setName(v);
    if (!slug || slug === toSlug(name)) setSlug(toSlug(v));
  }

  function toSlug(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-').slice(0, 40);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/businesses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, businessType, slug }),
      });
      const data = await res.json() as { success?: boolean; businessId?: number; slug?: string; error?: string };
      if (!res.ok) { setError(data.error ?? 'Error'); return; }
      onNext(data.businessId!, data.slug!);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Nombre del negocio *</label>
        <input
          required value={name} onChange={e => handleNameChange(e.target.value)}
          className="w-full bg-[#2E2823] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition"
          placeholder="Ej: Restaurante La Mar"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Tipo de negocio</label>
        <select
          value={businessType} onChange={e => setBusinessType(e.target.value)}
          className="w-full bg-[#2E2823] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-accent/60 transition"
        >
          {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Descripción corta</label>
        <textarea
          value={description} onChange={e => setDescription(e.target.value)} rows={2}
          className="w-full bg-[#2E2823] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition resize-none"
          placeholder="Ej: Cocina peruana de autor con mariscos frescos"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">URL de tu carta</label>
        <div className="flex items-center bg-[#2E2823] border border-white/10 rounded-xl overflow-hidden focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-accent/30 transition">
          <span className="text-xs text-gray-600 pl-3 shrink-0">menubot.cl/chat/</span>
          <input
            value={slug} onChange={e => setSlug(toSlug(e.target.value))}
            className="flex-1 bg-transparent px-1 py-2.5 text-sm text-accent outline-none"
            placeholder="mi-restaurante"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        type="submit" disabled={loading || !name.trim()}
        className="w-full bg-accent hover:bg-accent-lite disabled:bg-[#2E2823] disabled:text-gray-500 text-white font-semibold rounded-xl py-2.5 text-sm transition-all"
      >
        {loading ? 'Creando...' : 'Continuar →'}
      </button>
    </form>
  );
}

// ── Step 2: Upload Menu ────────────────────────────────────────────────────
function Step2({ businessId, onNext }: { businessId: number; onNext: (count: number) => void }) {
  const [result, setResult] = useState<{ totalDishes: number; completeness: number } | null>(null);

  if (result) {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-white mb-2">{result.totalDishes} platos en total</h3>
        <p className="text-gray-400 text-sm mb-1">Completeness inicial: <span className="text-accent font-semibold">{result.completeness}%</span></p>
        <p className="text-gray-500 text-xs mb-6">Vamos a completar la información que falta.</p>
        <button onClick={() => onNext(result.totalDishes)} className="w-full bg-accent hover:bg-accent-lite text-white font-semibold rounded-xl py-2.5 text-sm transition">
          Completar carta →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MenuImport
        businessId={businessId}
        defaultReplace
        onImported={(r) => setResult({ totalDishes: r.totalDishes, completeness: r.completeness })}
      />
      <button onClick={() => onNext(0)} className="w-full text-xs text-gray-600 hover:text-gray-400 transition py-1">
        Saltar por ahora (subir después desde el dashboard)
      </button>
    </div>
  );
}

// ── Step 3: Completeness Wizard ────────────────────────────────────────────
function Step3({ businessId, slug, onDone }: { businessId: number; slug: string; onDone: () => void }) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<Partial<Dish>>({});

  const loadDishes = useCallback(async () => {
    const res = await fetch(`/api/businesses/${businessId}/dishes`);
    const data = await res.json() as { dishes: Dish[] };
    // Filter only dishes with missing fields
    const incomplete = (data.dishes ?? []).filter(d =>
      !d.description || !d.price || !d.category || !d.ingredients || !d.allergens
    );
    setDishes(incomplete);
    setLoaded(true);
  }, [businessId]);

  if (!loaded) {
    loadDishes();
    return <div className="text-center py-8 text-gray-400 text-sm">Cargando platos...</div>;
  }

  if (dishes.length === 0 || current >= dishes.length) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-white mb-2">¡Carta completa!</h3>
        <p className="text-gray-400 text-sm mb-6">Tu menú está listo para que tus clientes lo exploren.</p>
        <Link
          href={`/chat/${slug}`}
          target="_blank"
          className="block w-full text-center bg-accent hover:bg-accent-lite text-white font-semibold rounded-xl py-2.5 text-sm mb-3 transition"
        >
          Ver mi carta pública →
        </Link>
        <button onClick={onDone} className="w-full text-sm text-gray-500 hover:text-gray-300 py-1 transition">
          Ir al dashboard
        </button>
      </div>
    );
  }

  const dish = dishes[current];
  const missing = (['description', 'price', 'category', 'ingredients', 'allergens'] as (keyof Dish)[])
    .filter(k => !dish[k] && k !== 'id' && k !== 'name');
  const field = missing[0];

  const total = dishes.length;
  const pct = Math.round((current / total) * 100);

  async function save() {
    if (!field || answers[field] === undefined) { skip(); return; }
    setSaving(true);
    await fetch(`/api/dishes/${dish.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: answers[field] }),
    });
    setSaving(false);
    setAnswers({});
    setCurrent(c => c + 1);
  }

  function skip() {
    setAnswers({});
    setCurrent(c => c + 1);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Plato {current + 1} de {total}</span>
          <span>{pct}% completado</span>
        </div>
        <div className="w-full bg-[#2E2823] rounded-full h-1.5 mb-4">
          <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="bg-[#2E2823]/60 rounded-xl px-4 py-3 text-sm">
        <p className="text-accent text-xs font-semibold mb-0.5">Plato</p>
        <p className="text-white font-medium">{dish.name}</p>
        {dish.category && <p className="text-gray-500 text-xs">{dish.category}</p>}
      </div>

      {field === 'description' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">¿Cómo describirías este plato?</label>
          <textarea
            rows={2} value={(answers.description as string) ?? ''}
            onChange={e => setAnswers({ description: e.target.value })}
            className="w-full bg-[#2E2823] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent/60 transition resize-none"
            placeholder="Descripción breve del plato..."
          />
        </div>
      )}

      {field === 'price' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">¿Cuál es el precio de <strong className="text-white">{dish.name}</strong>?</label>
          <div className="flex items-center bg-[#2E2823] border border-white/10 rounded-xl overflow-hidden focus-within:border-accent/60 transition">
            <span className="text-gray-500 pl-3 text-sm">$</span>
            <input
              type="number" min="0" value={(answers.price as number) ?? ''}
              onChange={e => setAnswers({ price: parseInt(e.target.value) })}
              className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white outline-none"
              placeholder="8990"
            />
            <span className="text-gray-600 pr-3 text-xs">CLP</span>
          </div>
        </div>
      )}

      {field === 'category' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Categoría</label>
          <select
            value={(answers.category as string) ?? ''}
            onChange={e => setAnswers({ category: e.target.value })}
            className="w-full bg-[#2E2823] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-accent/60 transition"
          >
            <option value="">Selecciona...</option>
            {['entradas', 'principales', 'postres', 'bebidas', 'cócteles', 'desayunos', 'otros'].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      )}

      {field === 'ingredients' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Ingredientes principales</label>
          <input
            type="text" value={(answers.ingredients as string) ?? ''}
            onChange={e => setAnswers({ ingredients: e.target.value })}
            className="w-full bg-[#2E2823] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-accent/60 transition"
            placeholder="pollo, limón, cebolla..."
          />
        </div>
      )}

      {field === 'allergens' && (
        <div>
          <label className="block text-xs text-gray-400 mb-2">¿Contiene alérgenos?</label>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map(a => {
              const selected = ((answers.allergens as string) ?? '').includes(a);
              return (
                <button
                  key={a} type="button"
                  onClick={() => {
                    if (a === 'ninguno') { setAnswers({ allergens: 'ninguno' }); return; }
                    const curr = ((answers.allergens as string) ?? '').replace('ninguno', '').split(',').map(s => s.trim()).filter(Boolean);
                    const next = selected ? curr.filter(x => x !== a) : [...curr, a];
                    setAnswers({ allergens: next.join(', ') || undefined });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${selected ? 'bg-accent text-white' : 'bg-[#2E2823] text-gray-400 hover:bg-gray-700'}`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={skip} className="flex-none px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition">
          Saltar
        </button>
        <button
          onClick={save} disabled={saving}
          className="flex-1 bg-accent hover:bg-accent-lite disabled:bg-gray-700 text-white font-semibold rounded-xl py-2.5 text-sm transition"
        >
          {saving ? 'Guardando...' : 'Guardar →'}
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [slug, setSlug] = useState('');

  const TITLES = ['Configura tu negocio', 'Sube tu carta', 'Completa la información'];
  const SUBTITLES = [
    'Cuéntanos sobre tu restaurante para personalizar tu asistente.',
    'Sube el PDF o foto de tu carta y la IA extrae los platos automáticamente.',
    'Completa la información que falta para dar la mejor experiencia a tus clientes.',
  ];

  return (
    <div className="min-h-screen bg-[#1A1613] text-white flex flex-col">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <span className="flex items-center gap-2"><LogoIcon size={26} /><Wordmark size="md" /></span>
        <span className="text-xs text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          14 días de prueba gratis
        </span>
      </header>

      <main className="flex-1 flex items-start justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <StepBar step={step} />

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">{TITLES[step - 1]}</h1>
            <p className="text-gray-400 text-sm">{SUBTITLES[step - 1]}</p>
          </div>

          <div className="bg-[#241F1B] border border-white/10 rounded-2xl p-6">
            {step === 1 && (
              <Step1 onNext={(id, s) => { setBusinessId(id); setSlug(s); setStep(2); }} />
            )}
            {step === 2 && businessId && (
              <Step2 businessId={businessId} onNext={() => setStep(3)} />
            )}
            {step === 3 && businessId && (
              <Step3 businessId={businessId} slug={slug} onDone={() => router.push('/dashboard')} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
