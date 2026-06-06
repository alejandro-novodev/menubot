import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          🍜 Menu<span className="text-purple-400">Bot</span>
        </Link>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{session.user.email}</span>
          <Link href="/api/auth/signout" className="text-gray-600 hover:text-gray-400 transition">
            Salir
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Panel de control</h1>
        <p className="text-gray-400 mb-8">Bienvenido, {session.user.name ?? session.user.email}</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/onboarding"
            className="bg-purple-600/10 border border-purple-500/30 rounded-2xl p-5 hover:border-purple-500/60 transition"
          >
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-semibold text-white mb-1">Configurar tu carta</h3>
            <p className="text-sm text-gray-400">Completa el proceso de onboarding para activar tu asistente.</p>
          </Link>

          <Link
            href="/dashboard/menu"
            className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition"
          >
            <div className="text-2xl mb-2">🗂️</div>
            <h3 className="font-semibold text-white mb-1">Gestionar menú</h3>
            <p className="text-sm text-gray-400">Edita platos, completa información y mejora el score.</p>
          </Link>
        </div>

        <div className="mt-6 bg-amber-900/20 border border-amber-700/30 rounded-xl px-4 py-3 text-sm text-amber-300">
          ⚠️ Tu cuenta está <strong>pendiente de activación</strong>. Completa el onboarding para activar tu restaurante.
        </div>
      </main>
    </div>
  );
}
