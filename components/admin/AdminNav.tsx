'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoIcon, Wordmark } from '@/components/brand/Wordmark';

const TABS = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/usage', label: 'Uso y costos' },
  { href: '/admin/keys', label: 'API Keys' },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-white/5 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="font-bold text-lg">
          <span className="flex items-center gap-2"><LogoIcon size={26} /><Wordmark size="md" /></span>
          <span className="ml-2 text-xs text-gray-500 font-normal">Admin</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300 transition">← Dashboard</Link>
      </div>
      <nav className="flex gap-1 mt-3 -mb-4">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-xs px-3 py-2 border-b-2 transition ${active ? 'border-accent text-accent font-semibold' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
