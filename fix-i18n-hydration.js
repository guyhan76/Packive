const fs = require('fs');
const f = 'src/components/i18n-context.tsx';
let s = fs.readFileSync(f, 'utf8');

// Replace the entire I18nProvider function
const oldProvider = `export function I18nProvider({ children }: { children: ReactNode }) {
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
}`;

const newProvider = `export function I18nProvider({ children }: { children: ReactNode }) {
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
}`;

if (s.includes('localStorage.getItem(\'packive_locale\') as Locale;\n      if (saved && dictionaries[saved]) return saved;')) {
  s = s.replace(oldProvider, newProvider);
  fs.writeFileSync(f, s, 'utf8');
  console.log('[Fix] Replaced I18nProvider - initial state always "en", useEffect loads saved locale');
  console.log('Total changes: 1');
} else {
  // Try with CRLF
  const oldCRLF = oldProvider.replace(/\n/g, '\r\n');
  const newCRLF = newProvider.replace(/\n/g, '\r\n');
  if (s.includes(oldCRLF)) {
    s = s.replace(oldCRLF, newCRLF);
    fs.writeFileSync(f, s, 'utf8');
    console.log('[Fix] Replaced I18nProvider (CRLF) - initial state always "en", useEffect loads saved locale');
    console.log('Total changes: 1');
  } else {
    console.log('[SKIP] Pattern not found - doing line-based fix');
    // Fallback: replace just the useState line
    const lines = s.split(/\r?\n/);
    const sep = s.includes('\r\n') ? '\r\n' : '\n';
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("const [locale, setLocaleState] = useState<Locale>(() => {")) {
        // Find the closing of this useState
        let j = i;
        while (j < lines.length && !lines[j].includes('return \'en\'')) j++;
        while (j < lines.length && !lines[j].trim().startsWith('});')) j++;
        // Replace lines i..j with simple useState + useEffect
        const indent = '  ';
        const replacement = [
          indent + "// Always start with 'en' to avoid hydration mismatch",
          indent + "const [locale, setLocaleState] = useState<Locale>('en');",
          indent + "const [mounted, setMounted] = useState(false);",
          "",
          indent + "React.useEffect(() => {",
          indent + "  const saved = localStorage.getItem('packive_locale') as Locale;",
          indent + "  if (saved && dictionaries[saved]) {",
          indent + "    setLocaleState(saved);",
          indent + "  }",
          indent + "  setMounted(true);",
          indent + "}, []);",
        ];
        lines.splice(i, j - i + 1, ...replacement);
        changed = true;
        console.log('[Fix] Line-based replacement at lines ' + (i+1) + '-' + (j+1));
        break;
      }
    }
    if (changed) {
      // Also simplify setLocale - remove typeof window check
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("if (typeof window !== 'undefined')") && lines[i+1] && lines[i+1].includes("localStorage.setItem('packive_locale'")) {
          const storeLine = lines[i+1].trim();
          lines.splice(i, 3, '    ' + storeLine);
          console.log('[Fix] Simplified setLocale');
          break;
        }
      }
      s = lines.join(sep);
      fs.writeFileSync(f, s, 'utf8');
      console.log('Total changes: 1');
    } else {
      console.log('[ERROR] Could not find useState pattern');
    }
  }
}
