"use client";

import { useI18n } from "@/lib/i18n/i18n-provider";

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  return (
    <select
      aria-label="Language selector"
      className="rounded-md border border-border bg-background px-2 py-1 text-sm"
      value={locale}
      onChange={(e) => setLocale(e.target.value as any)}
    >
      <option value="en">English</option>
      <option value="ta">தமிழ்</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
}


