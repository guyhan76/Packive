"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import en from '@/locales/en.json';
import ko from '@/locales/ko.json';
import ja from '@/locales/ja.json';

export type Locale = 'en' | 'ko' | 'ja';

const dictionaries: Record<Locale, Record<string, string>> = { en, ko, ja };

const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  localeNames: Record<Locale, string>;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
  localeNames,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with 'en' on both server and client to avoid hydration mismatch
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  // After mount, load saved locale from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('packive_locale') as Locale;
    if (saved && dictionaries[saved]) {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('packive_locale', l);
  }, []);

  const t = useCallback((key: string) => {
    return dictionaries[locale]?.[key] || dictionaries['en']?.[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, localeNames }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale, localeNames } = useI18n();
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className={className || "px-2 py-1 text-sm border rounded-lg bg-white text-black cursor-pointer"}
      title="Language"
    >
      {(Object.keys(localeNames) as Locale[]).map((l) => (
        <option key={l} value={l} style={{color:"#000",background:"#fff"}}>{localeNames[l]}</option>
      ))}
    </select>
  );
}
