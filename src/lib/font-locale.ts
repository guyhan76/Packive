const LOCALE_FONT_MAP: Record<string, string> = {
  en: "Inter",
  ko: "Noto Sans KR",
  ja: "Noto Sans JP",
  "zh-CN": "Noto Sans SC",
  "zh-TW": "Noto Sans TC",
};

function detectScript(text: string): string | null {
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if ((code >= 0xAC00 && code <= 0xD7AF) || (code >= 0x1100 && code <= 0x11FF) || (code >= 0x3130 && code <= 0x318F)) return "ko";
    if ((code >= 0x3040 && code <= 0x309F) || (code >= 0x30A0 && code <= 0x30FF)) return "ja";
    if (code >= 0x4E00 && code <= 0x9FFF) return "zh-CN";
  }
  return null;
}

export function getDefaultFont(locale: string = "en"): string {
  return LOCALE_FONT_MAP[locale] || LOCALE_FONT_MAP["en"];
}

export function detectFontForText(text: string, locale: string = "en"): string {
  const script = detectScript(text);
  if (script) return LOCALE_FONT_MAP[script] || LOCALE_FONT_MAP["en"];
  return getDefaultFont(locale);
}

export function needsCJKFont(text: string): boolean {
  return detectScript(text) !== null;
}

