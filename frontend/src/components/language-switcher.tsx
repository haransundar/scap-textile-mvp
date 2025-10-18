"use client";

import { useI18n } from '@/lib/i18n/i18n-provider';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Globe } from 'lucide-react';

type Locale = 'en' | 'ta' | 'hi';

export function LanguageSwitcher() {
  const { locale, setLocale, locales } = useI18n();
  
  // Map of language codes to their display names
  const languageNames: Record<string, string> = {
    en: 'English',
    ta: 'தமிழ்',
    hi: 'हिन्दी',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((lang) => (
          <DropdownMenuItem 
            key={lang} 
            onClick={() => setLocale(lang as Locale)}
            className={locale === lang ? 'bg-gray-100 dark:bg-gray-800' : ''}
          >
            {languageNames[lang] || lang}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
