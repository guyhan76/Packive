// src/lib/google-fonts.ts
// Google Fonts dynamic loader with full API integration

export interface FontInfo {
  family: string;
  category: "korean" | "japanese" | "chinese" | "sans-serif" | "serif" | "display" | "handwriting" | "monospace";
  weights: number[];
  label?: string;
  subsets?: string[];
}

// ─── Curated defaults (used before API loads) ───
export const FONT_CATALOG: FontInfo[] = [
  // Sans-serif
  { family: "Inter", category: "sans-serif", weights: [100,200,300,400,500,600,700,800,900] },
  { family: "Roboto", category: "sans-serif", weights: [100,300,400,500,700,900] },
  { family: "Open Sans", category: "sans-serif", weights: [300,400,500,600,700,800] },
  { family: "Montserrat", category: "sans-serif", weights: [100,200,300,400,500,600,700,800,900] },
  { family: "Poppins", category: "sans-serif", weights: [100,200,300,400,500,600,700,800,900] },
  { family: "Lato", category: "sans-serif", weights: [100,300,400,700,900] },
  { family: "Oswald", category: "sans-serif", weights: [200,300,400,500,600,700] },
  // Serif
  { family: "Playfair Display", category: "serif", weights: [400,500,600,700,800,900] },
  { family: "Lora", category: "serif", weights: [400,500,600,700] },
  { family: "Merriweather", category: "serif", weights: [300,400,700,900] },
  // Display
  { family: "Bebas Neue", category: "display", weights: [400] },
  { family: "Anton", category: "display", weights: [400] },
  // Handwriting
  { family: "Pacifico", category: "handwriting", weights: [400] },
  { family: "Dancing Script", category: "handwriting", weights: [400,500,600,700] },
  // Korean
  { family: "Noto Sans KR", category: "korean", weights: [100,300,400,500,700,900], label: "노토 산스" },
  { family: "Noto Serif KR", category: "korean", weights: [200,300,400,500,600,700,900], label: "노토 세리프" },
  { family: "Black Han Sans", category: "korean", weights: [400], label: "검은고딕" },
  { family: "Jua", category: "korean", weights: [400], label: "주아" },
  // Japanese
  { family: "Noto Sans JP", category: "japanese", weights: [100,300,400,500,700,900] },
  { family: "Noto Serif JP", category: "japanese", weights: [200,300,400,500,600,700,900] },
];

// ─── Full catalog (populated by API) ───
let fullCatalog: FontInfo[] = [];
let apiLoaded = false;
let apiLoading = false;
const apiListeners: (() => void)[] = [];

function classifyFont(family: string, apiCategory: string, subsets: string[]): FontInfo["category"] {
  if (subsets.includes("korean")) return "korean";
  if (subsets.includes("japanese")) return "japanese";
  if (subsets.includes("chinese-simplified") || subsets.includes("chinese-traditional")) return "chinese";
  if (apiCategory === "sans-serif") return "sans-serif";
  if (apiCategory === "serif") return "serif";
  if (apiCategory === "display") return "display";
  if (apiCategory === "handwriting") return "handwriting";
  if (apiCategory === "monospace") return "monospace";
  return "sans-serif";
}

function parseWeights(variants: string[]): number[] {
  const weights = new Set<number>();
  for (const v of variants) {
    const num = parseInt(v);
    if (!isNaN(num)) weights.add(num);
    else if (v === "regular" || v === "italic") weights.add(400);
    else if (v.includes("700")) weights.add(700);
  }
  if (weights.size === 0) weights.add(400);
  return Array.from(weights).sort((a, b) => a - b);
}

export async function loadFullCatalogFromAPI(): Promise<FontInfo[]> {
  if (apiLoaded) return fullCatalog;
  if (apiLoading) {
    return new Promise(resolve => {
      apiListeners.push(() => resolve(fullCatalog));
    });
  }
  apiLoading = true;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
  if (!apiKey) {
    console.warn("[FONT] No Google Fonts API key found, using curated list");
    fullCatalog = [...FONT_CATALOG];
    apiLoaded = true;
    apiLoading = false;
    return fullCatalog;
  }

  try {
    const resp = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity&subset=latin`
    );
    if (!resp.ok) throw new Error(`API error: ${resp.status}`);
    const data = await resp.json();
    const items: any[] = data.items || [];

    fullCatalog = items.map((item: any) => ({
      family: item.family,
      category: classifyFont(item.family, item.category, item.subsets || []),
      weights: parseWeights(item.variants || []),
      subsets: item.subsets || [],
    }));

    console.log("[FONT] API loaded:", fullCatalog.length, "fonts");
    console.log("[FONT] Korean:", fullCatalog.filter(f => f.category === "korean").length);
    console.log("[FONT] Japanese:", fullCatalog.filter(f => f.category === "japanese").length);
    apiLoaded = true;
    apiLoading = false;
    apiListeners.forEach(cb => cb());
    apiListeners.length = 0;
    return fullCatalog;
  } catch (err) {
    console.error("[FONT] API fetch failed:", err);
    fullCatalog = [...FONT_CATALOG];
    apiLoaded = true;
    apiLoading = false;
    apiListeners.forEach(cb => cb());
    apiListeners.length = 0;
    return fullCatalog;
  }
}

export function getFullCatalog(): FontInfo[] {
  return apiLoaded ? fullCatalog : FONT_CATALOG;
}

export function isAPILoaded(): boolean {
  return apiLoaded;
}

// Track loaded fonts
const loadedFonts = new Set<string>();

export function loadGoogleFont(family: string, weights?: number[]): void {
  if (loadedFonts.has(family)) return;
  loadedFonts.add(family);

  const w = weights && weights.length > 0 ? weights.join(";") : "400;700";
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${w}&display=swap`;
  document.head.appendChild(link);
}

export async function loadGoogleFontAsync(family: string, weights?: number[]): Promise<void> {
  loadGoogleFont(family, weights);
  try {
    await document.fonts.load(`400 16px "${family}"`);
  } catch {
    await new Promise(r => setTimeout(r, 500));
  }
}

export function getFontsByCategory(category: FontInfo["category"]): FontInfo[] {
  const catalog = getFullCatalog();
  return catalog.filter(f => f.category === category);
}

export function searchFonts(query: string): FontInfo[] {
  const q = query.toLowerCase();
  const catalog = getFullCatalog();
  return catalog.filter(f =>
    f.family.toLowerCase().includes(q) ||
    (f.label && f.label.includes(q))
  );
}

export function getCategoryLabel(category: FontInfo["category"]): string {
  const labels: Record<string, string> = {
    "sans-serif": "Sans-serif",
    "serif": "Serif",
    "display": "Display / Title",
    "handwriting": "Handwriting / Script",
    "monospace": "Monospace",
    "korean": "한글 Korean",
    "japanese": "日本語 Japanese",
    "chinese": "中文 Chinese",
  };
  return labels[category] || category;
}
