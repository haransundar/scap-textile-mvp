"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Locale = "en" | "ta" | "hi";

type Messages = Record<string, string>;

const SUPPORTED_LOCALES = ["en", "ta", "hi"] as const;

type I18nContextType = {
  locale: Locale;
  locales: readonly string[];
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const DEFAULT_LOCALE: Locale = "en";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    const stored = (localStorage.getItem("locale") as Locale | null) || DEFAULT_LOCALE;
    setLocale(stored);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await import(`./messages/${locale}.json`);
        setMessages(data.default as Messages);
      } catch {
        const fallback = await import("./messages/en.json");
        setMessages(fallback.default as Messages);
      }
    }
    load();
    localStorage.setItem("locale", locale);
  }, [locale]);

  const t = useMemo(() => {
    return (key: string) => messages[key] ?? key;
  }, [messages]);

  const value = useMemo(() => ({
    locale,
    locales: SUPPORTED_LOCALES,
    setLocale,
    t
  }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}


