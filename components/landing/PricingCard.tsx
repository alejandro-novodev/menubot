'use client';

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: { text: string; included: boolean }[];
  featured?: boolean;
  onContact: (plan: string) => void;
}

export function PricingCard({ name, price, description, features, featured = false, onContact }: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 transition-all ${
        featured
          ? 'bg-accent/10 border border-accent/40 shadow-lg shadow-black/30'
          : 'bg-[#241F1B] border border-white/5'
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
            Más popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className={`text-lg font-semibold mb-1 ${featured ? 'text-accent' : 'text-white'}`}>
          {name}
        </h3>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-bold text-white">{price}</span>
        <span className="text-gray-500 text-sm ml-1">/mes</span>
      </div>

      <ul className="flex-1 space-y-2.5 mb-6">
        {features.map((f) => (
          <li key={f.text} className="flex items-start gap-2 text-sm">
            <span className={`mt-0.5 shrink-0 ${f.included ? 'text-accent' : 'text-gray-700'}`}>
              {f.included ? '✓' : '—'}
            </span>
            <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>{f.text}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onContact(name)}
        className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
          featured
            ? 'bg-accent hover:bg-accent-lite text-white'
            : 'bg-[#2E2823] hover:bg-[#3A332D] text-gray-200 border border-white/10'
        }`}
      >
        Empezar →
      </button>
    </div>
  );
}
