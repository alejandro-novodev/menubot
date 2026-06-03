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
          ? 'bg-purple-600/10 border border-purple-500/40 shadow-lg shadow-purple-900/20'
          : 'bg-gray-900 border border-white/5'
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Más popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className={`text-lg font-semibold mb-1 ${featured ? 'text-purple-300' : 'text-white'}`}>
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
            <span className={`mt-0.5 shrink-0 ${f.included ? 'text-purple-400' : 'text-gray-700'}`}>
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
            ? 'bg-purple-600 hover:bg-purple-500 text-white'
            : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-white/10'
        }`}
      >
        Empezar →
      </button>
    </div>
  );
}
