"use client";

import { useI18n } from "@/lib/i18n/i18n-provider";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
];

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const currentLang = languages.find((lang) => lang.code === locale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full border border-white/20 hover:bg-white/10"
          aria-label="Select language"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code as any)}
            className={`flex items-center gap-2 ${locale === lang.code ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

