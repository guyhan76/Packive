const fs = require('fs');

// Create i18n context
const contextCode = `"use client";
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
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('packive_locale') as Locale;
      if (saved && dictionaries[saved]) return saved;
    }
    return 'en';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('packive_locale', l);
    }
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
      className={className || "px-2 py-1 text-sm border rounded-lg bg-white text-gray-700 cursor-pointer"}
      title="Language"
    >
      {(Object.keys(localeNames) as Locale[]).map((l) => (
        <option key={l} value={l}>{localeNames[l]}</option>
      ))}
    </select>
  );
}
`;

fs.writeFileSync('src/components/i18n-context.tsx', contextCode, 'utf8');
console.log('Created: src/components/i18n-context.tsx');

// Now wrap the layout or page with I18nProvider
// Check if layout.tsx exists
const layoutFile = 'src/app/layout.tsx';
if (fs.existsSync(layoutFile)) {
  let layout = fs.readFileSync(layoutFile, 'utf8');
  
  if (!layout.includes('I18nProvider')) {
    // Add import
    if (layout.includes("import")) {
      const lastImport = layout.lastIndexOf('import');
      const endOfLastImport = layout.indexOf('\n', lastImport);
      layout = layout.substring(0, endOfLastImport + 1) + 
        'import { I18nProvider } from "@/components/i18n-context";\n' + 
        layout.substring(endOfLastImport + 1);
      console.log('Added I18nProvider import to layout.tsx');
    }
    
    // Wrap children with I18nProvider
    if (layout.includes('{children}')) {
      layout = layout.replace('{children}', '<I18nProvider>{children}</I18nProvider>');
      console.log('Wrapped children with I18nProvider in layout.tsx');
    }
    
    fs.writeFileSync(layoutFile, layout, 'utf8');
    console.log('Updated: ' + layoutFile);
  } else {
    console.log('I18nProvider already in layout.tsx');
  }
} else {
  console.log('layout.tsx not found at ' + layoutFile);
}
