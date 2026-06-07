'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  planId: string;
  businessId: number;
  isCurrent: boolean;
  isFeatured?: boolean;
}

export function BillingClient({ planId, businessId, isCurrent, isFeatured }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    setLoading(true);
    try {
      const res = await fetch('/api/flow/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, businessId }),
      });
      const data = await res.json() as { paymentUrl?: string; error?: string };
      if (data.paymentUrl) {
        router.push(data.paymentUrl);
      }
    } finally {
      setLoading(false);
    }
  }

  if (isCurrent) {
    return (
      <div className="w-full text-center text-xs text-gray-500 py-2 border border-white/5 rounded-xl">
        ✓ Plan actual
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={loading}
      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${
        isFeatured
          ? 'bg-purple-600 hover:bg-purple-500 text-white'
          : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-white/10'
      }`}
    >
      {loading ? 'Procesando...' : 'Elegir plan →'}
    </button>
  );
}
