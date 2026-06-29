'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function PaymentSuccessBanner() {
  const params = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (params.get('payment') === 'success') {
      setVisible(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [params]);

  if (!visible) return null;

  return (
    <div className="bg-emerald-600 border-b border-emerald-700 px-5 py-3 flex items-center justify-between gap-4">
      <span className="text-sm text-white font-medium">
        🎉 ¡Pago exitoso! Tu suscripción está activa — tu carta ya está disponible para tus clientes.
      </span>
      <button
        onClick={() => setVisible(false)}
        className="text-white/70 hover:text-white transition text-xl leading-none shrink-0"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}
