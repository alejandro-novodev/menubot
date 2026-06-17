'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wordmark } from '@/components/brand/Wordmark';

const MESSAGES: Record<string, string> = {
  Configuration: 'Hay un problema de configuración del servidor. Si el problema persiste, contáctanos.',
  AccessDenied: 'No tienes permiso para acceder.',
  Verification: 'El enlace de acceso expiró o ya fue usado.',
  CredentialsSignin: 'Email o contraseña incorrectos.',
  OAuthAccountNotLinked: 'Este email ya está registrado con otro método de acceso. Inicia sesión con el método original.',
  OAuthSignin: 'No se pudo iniciar sesión con el proveedor. Inténtalo de nuevo.',
  OAuthCallback: 'No se pudo completar el inicio de sesión con el proveedor. Inténtalo de nuevo.',
  Default: 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo.',
};

function ErrorContent() {
  const params = useSearchParams();
  const code = params.get('error') ?? 'Default';
  const message = MESSAGES[code] ?? MESSAGES.Default;

  return (
    <div className="min-h-screen bg-[#1A1613] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-block mb-1">
          <Wordmark size="lg" className="text-white" />
        </Link>
        <p className="text-gray-400 text-sm mb-8">Acceso al panel</p>

        <div className="bg-[#241F1B] border border-white/10 rounded-2xl p-6">
          <div className="text-3xl mb-3">⚠️</div>
          <h1 className="text-white font-semibold text-base mb-2">No se pudo iniciar sesión</h1>
          <p className="text-gray-400 text-sm mb-6">{message}</p>
          <Link
            href="/auth/login"
            className="inline-block w-full bg-accent hover:bg-accent-lite text-white font-semibold rounded-xl py-2.5 text-sm transition"
          >
            Volver a iniciar sesión
          </Link>
          {code !== 'Default' && (
            <p className="text-gray-700 text-xs mt-4 font-mono">código: {code}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1A1613]" />}>
      <ErrorContent />
    </Suspense>
  );
}
