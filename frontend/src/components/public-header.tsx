'use client';

import Link from 'next/link';
import { ModeToggle } from './mode-toggle';
import { LanguageSelector } from './language-selector';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">SCAP</span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
