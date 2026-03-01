// src/lib/text-to-outlines.ts
// Convert SVG <text> elements to <path> outlines using opentype.js
// This ensures fonts render identically in any environment

import opentype from "opentype.js";

// Cache loaded fonts to avoid re-fetching
const fontCache = new Map<string, opentype.Font>();

// Google Fonts API base URL for TTF files
const GOOGLE_FONTS_CSS_URL = "https://fonts.googleapis.com/css2?family=";

async function fetchGoogleFontUrl(family: string, weight: string): Promise<string | null> {
  try {
    const w = weight === "bold" ? "700" : "400";
    const url = `${GOOGLE_FONTS_CSS_URL}${encodeURIComponent(family)}:wght@${w}&display=swap`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (!resp.ok) return null;
    const css = await resp.text();
    const match = css.match(/src:\s*url\(([^)]+\.ttf[^)]*)\)/);
    if (match) return match[1];
    const woff2Match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]woff2['"]\)/);
    if (woff2Match) return woff2Match[1];
    return null;
  } catch {
    return null;
  }
}

async function loadFont(family: string, weight: string): Promise<opentype.Font | null> {
    // Normalize font family name - strip style suffixes for lookup
  const styleSuffix = family.match(/-(Regular|Bold|Italic|BoldItalic)$/i);
  const baseFamilyName = family.replace(/-(Regular|Bold|Italic|BoldItalic)$/i, "");
  if (styleSuffix) {
    const suffix = styleSuffix[1].toLowerCase();
    if (suffix.includes("bold")) weight = "bold";
  }
  family = baseFamilyName;

  const cacheKey = `${family}__${weight}`;
  if (fontCache.has(cacheKey)) return fontCache.get(cacheKey)!;

  // Normalize family name
  const familyNorm = family
    .replace(/^['"]|['"]$/g, "")
    .split(",")[0].trim();

  const normKey = `${familyNorm}__${weight}`;
  if (fontCache.has(normKey)) return fontCache.get(normKey)!;

  // Try local fonts first
  const localMap: Record<string, string> = {
    "NotoSansKR__normal": "/fonts/NotoSansKR-Regular.ttf",
    "NotoSansKR__bold": "/fonts/NotoSansKR-Bold.ttf",
    "Noto Sans KR__normal": "/fonts/NotoSansKR-Regular.ttf",
    "Noto Sans KR__bold": "/fonts/NotoSansKR-Bold.ttf",
    "Arial__normal": "/fonts/arial.ttf",
    "Arial__bold": "/fonts/arialbd.ttf",
    "Georgia__normal": "/fonts/georgia.ttf",
    "Georgia__bold": "/fonts/georgiab.ttf",
    "Malgun Gothic__normal": "/fonts/malgun.ttf",
    "Malgun Gothic__bold": "/fonts/malgunbd.ttf",
    "Inter__normal": "/fonts/Inter-Regular.ttf",
    "Inter__bold": "/fonts/Inter-Bold.ttf",
  };

  for (const tryKey of [cacheKey, normKey]) {
    const localPath = localMap[tryKey];
    if (localPath) {
      try {
        const resp = await fetch(localPath);
        if (resp.ok) {
          const buf = await resp.arrayBuffer();
          const font = opentype.parse(buf);
          fontCache.set(cacheKey, font);
          fontCache.set(normKey, font);
          console.log("[OUTLINE] Loaded local font:", tryKey);
          return font;
        }
      } catch { /* fall through */ }
    }
  }

  // Try Google Fonts CSS API to get TTF URL
  const tryFamilies = [familyNorm, family];
  for (const tryFamily of tryFamilies) {
    try {
      const w = weight === "bold" ? "700" : "400";
      const apiUrl = `/api/google-font-css?family=${encodeURIComponent(family)}&weight=${w}`;
const resp = await fetch(apiUrl);
if (!resp.ok) {
  console.warn("[OUTLINE] API route failed for:", family);
  return null;
}
const data = await resp.json();
const fontUrl = data.fontUrl;
if (fontUrl) {
  try {
    const fontResp = await fetch(fontUrl);
    if (fontResp.ok) {
      const buf = await fontResp.arrayBuffer();
      const font = opentype.parse(buf);
      fontCache.set(cacheKey, font);
      console.log("[OUTLINE] Loaded Google font via API route:", cacheKey);
      return font;
    }
  } catch (e) {
    console.warn("[OUTLINE] Failed to parse Google font:", family, e);
  }
}

      if (!cssResp.ok) continue;
      const css = await cssResp.text();

      // Extract TTF or WOFF2 URL
      const ttfMatch = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"](?:truetype|woff2)['"]\)/);
      const urlMatch = ttfMatch || css.match(/url\(([^)]+)\)/);
      if (!urlMatch) continue;

      const gFontUrl = urlMatch[1];
      const fontResp = await fetch(gFontUrl);
      if (!fontResp.ok) continue;

      const buf = await fontResp.arrayBuffer();
      const font = opentype.parse(buf);
      fontCache.set(cacheKey, font);
      fontCache.set(normKey, font);
      console.log("[OUTLINE] Loaded Google font:", tryFamily, weight);
      return font;
    } catch { continue; }
  }

  // Fallback: try Noto Sans KR for Korean characters
  const fallbackKey = `NotoSansKR__${weight}`;
  const fallbackPath = weight === "bold" ? "/fonts/NotoSansKR-Bold.ttf" : "/fonts/NotoSansKR-Regular.ttf";
  try {
    const resp = await fetch(fallbackPath);
    if (resp.ok) {
      const buf = await resp.arrayBuffer();
      const font = opentype.parse(buf);
      fontCache.set(cacheKey, font);
      fontCache.set(normKey, font);
      console.log("[OUTLINE] Loaded fallback NotoSansKR for:", familyNorm);
      return font;
    }
  } catch { /* ignore */ }

  console.warn("[OUTLINE] Failed to load font:", cacheKey);
  return null;
}


function getTextAttributes(el: Element): {
  x: number; y: number; fontSize: number;
  fontFamily: string; fontWeight: string; fontStyle: string;
  fill: string; stroke: string; strokeWidth: number;
  opacity: number; transform: string;
} {
  const style = el.getAttribute("style") || "";
  const getStyle = (prop: string): string => {
    const m = style.match(new RegExp(prop + ":\\s*([^;]+)"));
    return m ? m[1].trim() : "";
  };

  const fontFamily = (el.getAttribute("font-family") || getStyle("font-family") || "Inter")
    .replace(/['"]/g, "").split(",")[0].trim();
  const fontWeight = el.getAttribute("font-weight") || getStyle("font-weight") || "normal";
  const fontStyle = el.getAttribute("font-style") || getStyle("font-style") || "normal";
  const fontSize = parseFloat(el.getAttribute("font-size") || getStyle("font-size") || "16");
  const fill = el.getAttribute("fill") || getStyle("fill") || "#000000";
  const stroke = el.getAttribute("stroke") || getStyle("stroke") || "none";
  const strokeWidth = parseFloat(el.getAttribute("stroke-width") || getStyle("stroke-width") || "0");
  const opacity = parseFloat(el.getAttribute("opacity") || getStyle("opacity") || "1");
  const transform = el.getAttribute("transform") || "";

  return {
    x: parseFloat(el.getAttribute("x") || "0"),
    y: parseFloat(el.getAttribute("y") || "0"),
    fontSize, fontFamily, fontWeight, fontStyle,
    fill, stroke, strokeWidth, opacity, transform,
  };
}

export async function convertTextToOutlines(svgEl: Element): Promise<number> {
  const textElements = svgEl.querySelectorAll("text");
  let converted = 0;

  for (const textEl of Array.from(textElements)) {
    const attrs = getTextAttributes(textEl);
    const weight = (attrs.fontWeight === "bold" || parseInt(attrs.fontWeight) >= 700) ? "bold" : "normal";
    const font = await loadFont(attrs.fontFamily, weight);
    if (!font) continue;

    const tspans = textEl.querySelectorAll("tspan");
    const doc = textEl.ownerDocument;
    const g = doc.createElementNS("http://www.w3.org/2000/svg", "g");

    if (attrs.transform) g.setAttribute("transform", attrs.transform);
    if (attrs.opacity !== 1) g.setAttribute("opacity", String(attrs.opacity));

    if (tspans.length > 0) {
      for (const tspan of Array.from(tspans)) {
        const text = tspan.textContent || "";
        if (!text.trim()) continue;

        const tx = parseFloat(tspan.getAttribute("x") || String(attrs.x));
        const ty = parseFloat(tspan.getAttribute("y") || String(attrs.y));
        const tFill = tspan.getAttribute("fill") || attrs.fill;
        const tFontSize = parseFloat(tspan.getAttribute("font-size") || String(attrs.fontSize));

        const path = font.getPath(text, tx, ty, tFontSize);
        const pathData = path.toPathData(2);

        const pathEl = doc.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.setAttribute("d", pathData);
        pathEl.setAttribute("fill", tFill);
        if (attrs.stroke !== "none") {
          pathEl.setAttribute("stroke", attrs.stroke);
          pathEl.setAttribute("stroke-width", String(attrs.strokeWidth));
        }
        g.appendChild(pathEl);
      }
    } else {
      const text = textEl.textContent || "";
      if (!text.trim()) continue;

      const path = font.getPath(text, attrs.x, attrs.y, attrs.fontSize);
      const pathData = path.toPathData(2);

      const pathEl = doc.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", pathData);
      pathEl.setAttribute("fill", attrs.fill);
      if (attrs.stroke !== "none") {
        pathEl.setAttribute("stroke", attrs.stroke);
        pathEl.setAttribute("stroke-width", String(attrs.strokeWidth));
      }
      g.appendChild(pathEl);
    }

    textEl.parentNode?.replaceChild(g, textEl);
    converted++;
  }

  console.log("[OUTLINE] Converted", converted, "text elements to outlines");
  return converted;
}

