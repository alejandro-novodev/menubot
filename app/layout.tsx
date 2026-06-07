import type { Metadata } from 'next';
import { Space_Grotesk, Archivo } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'menubot. — Novodev SPA',
  description: 'El asistente inteligente para la carta de tu restaurante. Producto de Novodev SPA.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${archivo.variable} h-full antialiased`}
    >
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: 'var(--font-archivo, system-ui, sans-serif)' }}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
