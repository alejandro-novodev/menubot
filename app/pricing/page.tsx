import Link from 'next/link';
import { LogoIcon, Wordmark } from '@/components/brand/Wordmark';
import { PlanGrid } from '@/components/landing/PlanGrid';

export const metadata = {
  title: 'Planes · menubot',
  description: 'Planes de menubot para restaurantes en Chile. Precios en CLP, 14 días gratis.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#1A1613] text-white">
      <nav className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon size={26} />
          <Wordmark size="md" className="text-white" />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/auth/login" className="text-gray-400 hover:text-white transition">Iniciar sesión</Link>
          <Link href="/auth/register" className="font-semibold bg-accent hover:bg-accent-lite text-white px-4 py-1.5 rounded-xl transition">
            Empezar gratis
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 border border-white/10 bg-white/5 text-xs text-gray-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 14 días gratis · Sin tarjeta
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Planes simples, sin sorpresas</h1>
          <p className="text-gray-400 text-lg">Elige el plan según el tamaño de tu operación. Cámbialo o cancélalo cuando quieras.</p>
        </div>

        <PlanGrid />

        <div className="max-w-2xl mx-auto mt-16 text-center">
          <h2 className="text-lg font-semibold mb-2">¿Tienes una cadena o necesidades especiales?</h2>
          <p className="text-gray-400 text-sm mb-4">El plan Enterprise se adapta a tu operación: API, integraciones, SSO y SLA garantizado.</p>
          <a href="mailto:hola@menubot.cl?subject=Plan%20Enterprise" className="text-accent hover:text-accent-lite transition text-sm font-medium">
            Hablemos →
          </a>
        </div>
      </main>
    </div>
  );
}
