// src/lib/pdf-cmyk-export.ts
// CMYK Vector PDF Export - SVG-based approach
// Uses Fabric.js toSVG() + svg2pdf.js for accurate vector rendering
// Then post-processes colors to CMYK

// text-to-outlines: dynamic import only (Turbopack compatibility)

interface ExportOptions {
  width: number;
  height: number;
  filename: string;
  includeDieline?: boolean;
  dielineOnly?: boolean;
}

interface CMYKColor {
  c: number; m: number; y: number; k: number;
}

interface SpotColorInfo {
  name: string;
  cmyk: CMYKColor;
  hex: string;
  tint: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

let _cmykEngine: any = null;
async function loadCmykEngine() {
  if (!_cmykEngine) {
    _cmykEngine = await import("./cmyk-engine");
    if (!_cmykEngine.isReverseLUTReady()) {
      await _cmykEngine.loadFOGRA39LUT();
    }
  }
  return _cmykEngine;
}

function rgbToCmyk(r: number, g: number, b: number): CMYKColor {
  // Simple fallback (used synchronously in buildColorMap)
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const k = 1 - Math.max(r1, g1, b1);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - r1 - k) / (1 - k);
  const m = (1 - g1 - k) / (1 - k);
  const y = (1 - b1 - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}

function iccRgbToCmyk(engine: any, r: number, g: number, b: number): CMYKColor {
  if (engine && engine.isReverseLUTReady()) {
    const [c, m, y, k] = engine.srgbToCmyk(r, g, b);
    return {
      c: Math.max(0, Math.min(100, Math.round(c))),
      m: Math.max(0, Math.min(100, Math.round(m))),
      y: Math.max(0, Math.min(100, Math.round(y))),
      k: Math.max(0, Math.min(100, Math.round(k)))
    };
  }
  return rgbToCmyk(r, g, b);
}

function normalizeColor(color: string): string | null {
  if (!color || color === "transparent" || color === "none") return null;
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(color)) {
    const r = color[1], g = color[2], b = color[3];
    return ("#" + r + r + g + g + b + b).toLowerCase();
  }
  const m = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(color);
  if (m) {
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return "#" + toHex(+m[1]) + toHex(+m[2]) + toHex(+m[3]);
  }
  return null;
}

function buildColorMap(canvas: any): { colorMap: Map<string, CMYKColor>; spotMap: Map<string, SpotColorInfo> } {
  const map = new Map<string, CMYKColor>();

  function processObj(obj: any) {
    if (obj._cmykFill && obj.fill) {
      const hex = normalizeColor(obj.fill);
      if (hex) map.set(hex, obj._cmykFill);
    }
    if (obj._cmykStroke && obj.stroke) {
      const hex = normalizeColor(obj.stroke);
      if (hex) map.set(hex, obj._cmykStroke);
    }
    if (obj.fill && !obj._cmykFill) {
      const hex = normalizeColor(obj.fill);
      if (hex && !map.has(hex)) {
        const rgb = hexToRgb(hex);
        if (rgb) map.set(hex, rgbToCmyk(rgb.r, rgb.g, rgb.b));
      }
    }
    if (obj.stroke && !obj._cmykStroke) {
      const hex = normalizeColor(obj.stroke);
      if (hex && !map.has(hex)) {
        const rgb = hexToRgb(hex);
        if (rgb) map.set(hex, rgbToCmyk(rgb.r, rgb.g, rgb.b));
      }
    }
    if (obj._objects) obj._objects.forEach(processObj);
  }
  canvas.getObjects().forEach(processObj);

  function deepScan(obj: any) {
    const fill = normalizeColor(obj.fill || "");
    if (fill && !map.has(fill)) {
      const rgb = hexToRgb(fill);
      if (rgb) map.set(fill, rgbToCmyk(rgb.r, rgb.g, rgb.b));
    }
    const stroke = normalizeColor(obj.stroke || "");
    if (stroke && !map.has(stroke)) {
      const rgb = hexToRgb(stroke);
      if (rgb) map.set(stroke, rgbToCmyk(rgb.r, rgb.g, rgb.b));
    }
    if (obj._objects) obj._objects.forEach(deepScan);
  }
  canvas.getObjects().forEach(deepScan);

  const spotMap = new Map<string, SpotColorInfo>();
  function collectSpots(obj: any) {
    if (obj._spotFill && obj.fill) {
      const hex = normalizeColor(obj.fill);
      if (hex && obj._cmykFill) {
        const name = obj._pantoneRef || obj._spotFillName || obj._spotFill || "";
        spotMap.set(hex, { name, cmyk: obj._cmykFill, hex, tint: 100 });
      }
    }
    if (obj._spotStroke && obj.stroke) {
      const hex = normalizeColor(obj.stroke);
      if (hex && obj._cmykStroke) {
        const name = obj._pantoneRefStroke || obj._spotStrokeName || obj._spotStroke || "";
        spotMap.set(hex, { name, cmyk: obj._cmykStroke, hex, tint: 100 });
      }
    }
    if (obj._objects) obj._objects.forEach(collectSpots);
  }
  canvas.getObjects().forEach(collectSpots);

  return { colorMap: map, spotMap };
}

function replacePdfColorsInString(pdf: string, colorMap: Map<string, CMYKColor>): string {
  let replaced = 0;
  let total = 0;

  function f2i(v: string): number {
    return Math.round(parseFloat(v) * 255);
  }
  function toHex(n: number): string {
    return Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  }

  const NUM = "(\\d+\\.\\d*|\\d*\\.\\d+|\\d+)";

  const rgbRe = new RegExp(NUM + "\\s+" + NUM + "\\s+" + NUM + "\\s+(rg|RG)", "g");
  pdf = pdf.replace(rgbRe, (match: string, r: string, g: string, b: string, op: string) => {
    total++;
    const ri = f2i(r), gi = f2i(g), bi = f2i(b);
    const hex = "#" + toHex(ri) + toHex(gi) + toHex(bi);
    const cmyk = colorMap.get(hex);
    if (cmyk) {
      const c = (cmyk.c / 100).toFixed(4);
      const m = (cmyk.m / 100).toFixed(4);
      const y = (cmyk.y / 100).toFixed(4);
      const k = (cmyk.k / 100).toFixed(4);
      const cmykOp = op === "rg" ? "k" : "K";
      replaced++;
      return c + " " + m + " " + y + " " + k + " " + cmykOp;
    }
    // colorMap에 없는 색상도 CMYK로 변환 (RGB 잔류 방지)
    // 먼저 ±6 범위 내 가장 가까운 colorMap 항목 검색 (반올림 오차 보정)
    let bestCmyk: CMYKColor | null = null;
    let bestDist = Infinity;
    colorMap.forEach((cmykVal, mapHex) => {
      const mapRgb = hexToRgb(mapHex);
      if (!mapRgb) return;
      const dist = Math.abs(mapRgb.r - ri) + Math.abs(mapRgb.g - gi) + Math.abs(mapRgb.b - bi);
      if (dist < bestDist && dist <= 6) { bestDist = dist; bestCmyk = cmykVal; }
    });
    const useCmyk = bestCmyk || rgbToCmyk(ri, gi, bi);
    const fc = (useCmyk.c / 100).toFixed(4);
    const fm = (useCmyk.m / 100).toFixed(4);
    const fy = (useCmyk.y / 100).toFixed(4);
    const fk = (useCmyk.k / 100).toFixed(4);
    const fOp = op === "rg" ? "k" : "K";
    replaced++;
    return fc + " " + fm + " " + fy + " " + fk + " " + fOp;
  });

  const grayFillRe = new RegExp("(?<=\\n|^)" + NUM + "\\s+(g|G)(?=\\n|$)", "gm");
  pdf = pdf.replace(grayFillRe, (match: string, val: string, op: string) => {
    total++;
    const v = parseFloat(val);
    if (v < 0.01) {
      replaced++;
      return "0.0000 0.0000 0.0000 1.0000 " + (op === "g" ? "k" : "K");
    } else if (v > 0.99) {
      replaced++;
      return "0.0000 0.0000 0.0000 0.0000 " + (op === "g" ? "k" : "K");
    }
    // 중간 회색도 CMYK로 변환
    const gk = (1 - v);
    replaced++;
    return "0.0000 0.0000 0.0000 " + gk.toFixed(4) + " " + (op === "g" ? "k" : "K");
  });

  console.log("[PDF] CMYK replaced:", replaced, "/", total, "color operators (string mode)");
  return pdf;
}


/**
 * Convert RGB image XObjects in PDF raw string to CMYK
 * Finds image streams with /DeviceRGB, converts pixel data RGB->CMYK via FOGRA39 LUT
 */


// ─── FOGRA39 ICC OutputIntent 임베드 (PDF Incremental Update) ───
// 원본 PDF의 xref/trailer는 보존, 끝에 새 ICC stream + OutputIntent dict + Catalog override
// + 새 xref + 새 trailer(/Prev로 원본 xref 연결) + startxref + %%EOF를 append.
//
// 안전장치 A: xref 형식 런타임 감지 — traditional xref만 처리, cross-reference stream이면 abort.
// 안전장치 B: 결과 PDF 자체 검증 — %%EOF 종료, startxref offset 일치, ICC /Length 일치.
// 둘 중 어느 단계든 실패 시 원본 rawPdf 그대로 반환.
// "OutputIntent는 부가 기능. 깨진 PDF 만들 바엔 정상 PDF 반환." (graceful degradation)

let _iccBytesCache: Uint8Array | null = null;
async function loadFogra39IccBytes(): Promise<Uint8Array | null> {
  if (_iccBytesCache) return _iccBytesCache;
  try {
    const res = await fetch("/icc/CoatedFOGRA39.icc");
    if (!res.ok) { console.warn("[PDF/ICC] fetch failed:", res.status, res.statusText); return null; }
    const buf = await res.arrayBuffer();
    _iccBytesCache = new Uint8Array(buf);
    return _iccBytesCache;
  } catch (e) {
    console.warn("[PDF/ICC] fetch error:", e);
    return null;
  }
}

// Uint8Array → Latin-1 string (1 byte = 1 char). 기존 PDF 후처리 코드(line 591~597)와 같은 매핑.
function _bytesToLatin1(bytes: Uint8Array): string {
  let s = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    s += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return s;
}

async function embedIccOutputIntent(rawPdf: string): Promise<string> {
  try {
    // ─── ① ICC bytes 확보 ───
    const iccBytes = await loadFogra39IccBytes();
    if (!iccBytes || iccBytes.length === 0) {
      console.warn("[PDF/ICC] ICC bytes unavailable, skip OutputIntent embed");
      return rawPdf;
    }

    // ─── ② 안전장치 A: xref 형식 감지 ───
    // 마지막 startxref → 원본 xref offset 추출 → 그 위치에 "xref\n" 키워드 있어야 traditional.
    // 없으면 cross-reference stream(/Type /XRef) 형식이므로 abort.
    const lastStartxrefIdx = rawPdf.lastIndexOf("startxref");
    if (lastStartxrefIdx < 0) {
      console.warn("[PDF/ICC] no startxref found, abort");
      return rawPdf;
    }
    const startxrefMatch = rawPdf.substring(lastStartxrefIdx).match(/startxref\s+(\d+)\s+%%EOF/);
    if (!startxrefMatch) {
      console.warn("[PDF/ICC] startxref offset parse failed, abort");
      return rawPdf;
    }
    const prevXrefOffset = parseInt(startxrefMatch[1], 10);
    const xrefProbe = rawPdf.substring(prevXrefOffset, prevXrefOffset + 5);
    if (xrefProbe !== "xref\n" && xrefProbe !== "xref\r") {
      console.warn("[PDF/ICC] xref format not traditional at offset " + prevXrefOffset
        + " (got '" + xrefProbe.replace(/[\r\n]/g, "\\n") + "'), abort. PDF likely uses cross-reference stream.");
      return rawPdf;
    }

    // ─── ③ trailer 파싱 — /Root, /Size 추출 ───
    const trailerIdx = rawPdf.lastIndexOf("trailer", lastStartxrefIdx);
    if (trailerIdx < 0 || trailerIdx < prevXrefOffset) {
      console.warn("[PDF/ICC] trailer not found between xref and startxref, abort");
      return rawPdf;
    }
    const trailerSection = rawPdf.substring(trailerIdx, lastStartxrefIdx);
    const rootMatch = trailerSection.match(/\/Root\s+(\d+)\s+(\d+)\s+R/);
    if (!rootMatch) {
      console.warn("[PDF/ICC] /Root not found in trailer, abort");
      return rawPdf;
    }
    const catNum = parseInt(rootMatch[1], 10);
    const catGen = parseInt(rootMatch[2], 10);
    const sizeMatch = trailerSection.match(/\/Size\s+(\d+)/);
    if (!sizeMatch) {
      console.warn("[PDF/ICC] /Size not found in trailer, abort");
      return rawPdf;
    }
    const prevSize = parseInt(sizeMatch[1], 10);

    // ─── ④ Catalog 객체 본문 추출 ───
    // `<catNum> <catGen> obj` 헤더 찾기 → `<<`부터 짝맞춰 `>>`까지가 dict 본문.
    const catHeader = catNum + " " + catGen + " obj";
    const catHeaderIdx = rawPdf.indexOf(catHeader);
    if (catHeaderIdx < 0) {
      console.warn("[PDF/ICC] catalog object header '" + catHeader + "' not found, abort");
      return rawPdf;
    }
    const catDictStart = rawPdf.indexOf("<<", catHeaderIdx);
    if (catDictStart < 0 || catDictStart - catHeaderIdx > 200) {
      console.warn("[PDF/ICC] catalog dict '<<' not found near header, abort");
      return rawPdf;
    }
    // dict 깊이 추적해 outer dict 닫는 `>>` 찾기 (중첩 dict 안전).
    let depth = 0, catDictEnd = -1;
    for (let i = catDictStart; i < rawPdf.length - 1; i++) {
      if (rawPdf[i] === "<" && rawPdf[i + 1] === "<") { depth++; i++; }
      else if (rawPdf[i] === ">" && rawPdf[i + 1] === ">") {
        depth--; i++;
        if (depth === 0) { catDictEnd = i + 1; break; }   // catDictEnd = `>>` 닫힘 직후
      }
    }
    if (catDictEnd < 0) {
      console.warn("[PDF/ICC] catalog dict close '>>' not found, abort");
      return rawPdf;
    }
    let catBody = rawPdf.substring(catDictStart, catDictEnd);    // "<< ... >>"
    // 기존 /OutputIntents 키 제거(있다면 — 예: 이전 stub OutputIntent).
    catBody = catBody.replace(/\/OutputIntents\s*\[[^\]]*\]/g, "");

    // ─── ⑤ 새 객체 번호 할당 ───
    // PDF /Size = 사용된 객체 번호 최대 + 1. 즉 가용 다음 번호 = prevSize.
    const iccObjNum = prevSize;
    const oiObjNum  = prevSize + 1;
    const newSize   = prevSize + 2;
    if (catNum >= iccObjNum) {
      console.warn("[PDF/ICC] unexpected: catNum(" + catNum + ") >= iccObjNum(" + iccObjNum + "), abort");
      return rawPdf;
    }

    // ─── ⑥ Catalog override 본문 — outer `>>` 직전에 /OutputIntents 키 삽입 ───
    const newCatBody = catBody.replace(/>>\s*$/, " /OutputIntents [" + oiObjNum + " 0 R] >>");
    if (newCatBody === catBody) {
      console.warn("[PDF/ICC] catalog body update failed (regex mismatch), abort");
      return rawPdf;
    }

    // ─── ⑦ ICC stream 객체 ───
    const iccLen = iccBytes.length;
    const iccBin = _bytesToLatin1(iccBytes);
    const iccObjText =
      iccObjNum + " 0 obj\n" +
      "<< /N 4 /Length " + iccLen + " >>\n" +
      "stream\n" +
      iccBin + "\n" +
      "endstream\n" +
      "endobj\n";

    // ─── ⑧ OutputIntent dict 객체 (PDF/X-4: /S /GTS_PDFX + /DestOutputProfile) ───
    const oiObjText =
      oiObjNum + " 0 obj\n" +
      "<< /Type /OutputIntent /S /GTS_PDFX " +
      "/OutputConditionIdentifier (FOGRA39) " +
      "/OutputCondition (Coated FOGRA39 \\(ISO 12647-2:2004\\)) " +
      "/Info (Coated FOGRA39) " +
      "/RegistryName (http://www.color.org) " +
      "/DestOutputProfile " + iccObjNum + " 0 R >>\n" +
      "endobj\n";

    // ─── ⑨ Catalog override 객체 (같은 번호로 재선언 — incremental update의 핵심) ───
    const catOverrideText =
      catNum + " " + catGen + " obj\n" +
      newCatBody + "\n" +
      "endobj\n";

    // ─── ⑩ Byte offset 계산 — Latin-1 매핑이라 .length가 byte 수와 일치 ───
    let prefix = rawPdf;
    if (!prefix.endsWith("\n")) prefix += "\n";
    const iccOffset    = prefix.length;
    const oiOffset     = iccOffset + iccObjText.length;
    const catOffset    = oiOffset  + oiObjText.length;
    const newXrefOffset = catOffset + catOverrideText.length;

    // ─── ⑪ 새 xref subsection들 — 객체 번호 오름차순 정렬 ───
    // entry 형식: "%010d %05d <n|f> \n" (정확히 20 byte, PDF spec §7.5.4)
    const xrefEntry = (off: number, gen: number, type: "n" | "f"): string =>
      off.toString().padStart(10, "0") + " " + gen.toString().padStart(5, "0") + " " + type + " \n";
    // Catalog는 보통 작은 번호(1·2), ICC/OI는 prevSize~ → 두 subsection으로 분리.
    const xrefText =
      "xref\n" +
      catNum + " 1\n" + xrefEntry(catOffset, catGen, "n") +
      iccObjNum + " 2\n" + xrefEntry(iccOffset, 0, "n") + xrefEntry(oiOffset, 0, "n");

    // ─── ⑫ 새 trailer — /Prev로 원본 xref 체인 ───
    const trailerText =
      "trailer\n" +
      "<< /Size " + newSize +
      " /Root " + catNum + " " + catGen + " R" +
      " /Prev " + prevXrefOffset +
      " >>\n";

    // ─── ⑬ 결과 조립 ───
    const result =
      prefix +
      iccObjText +
      oiObjText +
      catOverrideText +
      xrefText +
      trailerText +
      "startxref\n" + newXrefOffset + "\n" +
      "%%EOF\n";

    // ─── ⑭ 안전장치 B: 결과 자체 검증 ───
    // B1. %%EOF 종료
    if (!result.trimEnd().endsWith("%%EOF")) {
      console.warn("[PDF/ICC] B1 fail: result not ending with %%EOF, abort");
      return rawPdf;
    }
    // B2. 마지막 startxref 뒤 숫자 = newXrefOffset
    const tailStartIdx = result.lastIndexOf("startxref");
    const tailMatch = result.substring(tailStartIdx).match(/startxref\s+(\d+)\s+%%EOF/);
    if (!tailMatch || parseInt(tailMatch[1], 10) !== newXrefOffset) {
      console.warn("[PDF/ICC] B2 fail: startxref offset mismatch (expected " + newXrefOffset
        + ", got " + (tailMatch ? tailMatch[1] : "null") + "), abort");
      return rawPdf;
    }
    // B2b. newXrefOffset 위치에 정확히 "xref\n" 키워드 존재
    if (result.substring(newXrefOffset, newXrefOffset + 5) !== "xref\n") {
      console.warn("[PDF/ICC] B2b fail: 'xref\\n' not at offset " + newXrefOffset + ", abort");
      return rawPdf;
    }
    // B3. ICC stream의 /Length가 실제 byte 수와 일치
    const iccObjAt = result.indexOf(iccObjNum + " 0 obj");
    if (iccObjAt < 0) {
      console.warn("[PDF/ICC] B3 fail: ICC obj header not found in result, abort");
      return rawPdf;
    }
    const iccLenMatch = result.substring(iccObjAt, iccObjAt + 200).match(/\/Length\s+(\d+)/);
    if (!iccLenMatch || parseInt(iccLenMatch[1], 10) !== iccLen) {
      console.warn("[PDF/ICC] B3 fail: ICC /Length mismatch (expected " + iccLen
        + ", got " + (iccLenMatch ? iccLenMatch[1] : "null") + "), abort");
      return rawPdf;
    }

    console.log("[PDF/ICC] OutputIntent embedded:",
      "icc=" + iccLen + "B,",
      "objs=#" + iccObjNum + ",#" + oiObjNum + ",cat=#" + catNum + "(override),",
      "prevXref=" + prevXrefOffset + " newXref=" + newXrefOffset + ",",
      "+" + (result.length - rawPdf.length) + " bytes");
    return result;
  } catch (e) {
    console.warn("[PDF/ICC] embed exception, return original PDF:", e);
    return rawPdf;
  }
}



export async function exportCmykPdf(
  canvas: any,
  options: ExportOptions
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { svg2pdf } = await import("svg2pdf.js");
  const { filename, includeDieline, dielineOnly } = options;

  const canvasW = canvas.getWidth();
  const canvasH = canvas.getHeight();
  console.log("[PDF] Step 1: Canvas size", canvasW, "x", canvasH);

  // Load ICC FOGRA39 engine for accurate color conversion
  const cmykEngine = await loadCmykEngine();
  const iccReady = cmykEngine && cmykEngine.isReverseLUTReady();
  console.log("[PDF] ICC FOGRA39 engine ready:", iccReady);

  const { colorMap, spotMap } = buildColorMap(canvas);
  // Collect which hex values have explicit _cmykFill/_cmykStroke (user-set CMYK)
  const userCmykHexes = new Set<string>();
  canvas.getObjects().forEach((obj: any) => {
    if (obj._cmykFill && obj.fill) { const h = normalizeColor(obj.fill); if (h) userCmykHexes.add(h); }
    if (obj._cmykStroke && obj.stroke) { const h = normalizeColor(obj.stroke); if (h) userCmykHexes.add(h); }
    if (obj._objects) obj._objects.forEach((sub: any) => {
      if (sub._cmykFill && sub.fill) { const h = normalizeColor(sub.fill); if (h) userCmykHexes.add(h); }
      if (sub._cmykStroke && sub.stroke) { const h = normalizeColor(sub.stroke); if (h) userCmykHexes.add(h); }
    });
  });
  // Upgrade only non-user-set colors with ICC FOGRA39
  if (iccReady) {
    let upgraded = 0, skipped = 0;
    colorMap.forEach((cmyk, hex) => {
      // Skip user-set CMYK colors
      if (userCmykHexes.has(hex)) { skipped++; return; }
      // Special: pure black → K100
      if (hex === "#000000") { colorMap.set(hex, { c: 0, m: 0, y: 0, k: 100 }); upgraded++; return; }
      // Special: pure white → no ink
      if (hex === "#ffffff") { colorMap.set(hex, { c: 0, m: 0, y: 0, k: 0 }); upgraded++; return; }
      const rgb = hexToRgb(hex);
      if (rgb) {
        colorMap.set(hex, iccRgbToCmyk(cmykEngine, rgb.r, rgb.g, rgb.b));
        upgraded++;
      }
    });
    console.log("[PDF] ICC FOGRA39 color upgrade:", upgraded, "converted,", skipped, "user-set preserved");
  }
  console.log("[PDF] Step 2: Color map built,", colorMap.size, "colors");
  colorMap.forEach((cmyk, hex) => {
    console.log("  " + hex + " -> C" + cmyk.c + " M" + cmyk.m + " Y" + cmyk.y + " K" + cmyk.k);
  });
  console.log("[PDF] Spot colors found:", spotMap.size);
  spotMap.forEach((info, hex) => {
    console.log("  SPOT", hex, "->", info.name, "C" + info.cmyk.c + "M" + info.cmyk.m + "Y" + info.cmyk.y + "K" + info.cmyk.k);
  });

  // ─── Spot Color CMYK → colorMap 우선 적용 ───
  let spotOverrideCount = 0;
  spotMap.forEach((info, hex) => {
    if (info.cmyk) {
      colorMap.set(hex, { c: info.cmyk.c, m: info.cmyk.m, y: info.cmyk.y, k: info.cmyk.k });
      spotOverrideCount++;
    }
  });
  if (spotOverrideCount > 0) console.log("[PDF] Spot color CMYK override applied:", spotOverrideCount, "colors");

  const objects = canvas.getObjects();
  const savedVisibility: boolean[] = [];
  objects.forEach((obj: any, idx: number) => {
    savedVisibility[idx] = obj.visible !== false;
    const isDieLineObj = obj._isDieLine || obj._isDieLineGroup || obj._isFoldLine;
    const isPanelLabel = obj._isPanelLabel;

    if (dielineOnly) {
      // Dieline-only mode: show only dieline objects
      if (!isDieLineObj) { obj.set({ visible: false }); }
      else { obj.set({ visible: true }); }
    } else if (includeDieline) {
      // Include dieline: hide panel labels and non-guide layers keep as-is
      if (isPanelLabel) { obj.set({ visible: false }); }
      // Dieline objects stay visible, other guide elements hidden.
      // 종이배경(paperBg)은 _isGuideLayer지만 디자인 요소이므로 보존.
      if (obj._isGuideLayer && !isDieLineObj && !obj._isPaperBackground) { obj.set({ visible: false }); }
    } else {
      // No dieline: hide all guide layer objects
      if (obj._isGuideLayer) { obj.set({ visible: false }); }
    }
  });

  const savedBgColor = canvas.backgroundColor;
  canvas.backgroundColor = "";
  canvas.renderAll();
  // Pre-process: composite transparent images onto white background for PDF
    const imgObjects = canvas.getObjects().filter((o: any) => o.type === "image" && o.visible !== false);
    const origSrcs: Map<any, string> = new Map();
    for (const imgObj of imgObjects) {
      try {
        const el = (imgObj as any)._element || (imgObj as any).getElement?.();
        if (!el || !(el instanceof HTMLImageElement || el instanceof HTMLCanvasElement)) continue;
        const tempCanvas = document.createElement("canvas");
        const natW = (el as HTMLImageElement).naturalWidth || el.width || 200;
        const natH = (el as HTMLImageElement).naturalHeight || el.height || 200;
        tempCanvas.width = natW;
        tempCanvas.height = natH;
        const ctx = tempCanvas.getContext("2d");
        if (!ctx) continue;
        // 투명 PNG의 알파를 보존해야 함. 흰 배경 합성 시 투명 영역이
        // 흰 사각형(바운딩박스)으로 박혀버림 → fillRect 제거.
        ctx.drawImage(el as HTMLImageElement, 0, 0);
        // CMYK simulation: convert each pixel RGB->CMYK->RGB via FOGRA39
        if (cmykEngine?.isReverseLUTReady()) {
          const imgData = ctx.getImageData(0, 0, natW, natH);
          const px = imgData.data;
          for (let pi = 0; pi < px.length; pi += 4) {
            // 투명 픽셀은 변환 생략(RGB 0,0,0이 일부 렌더러에서 검정으로 새는 것 방지)
            if (px[pi + 3] === 0) continue;
            const [c, m, y, k] = cmykEngine.srgbToCmyk(px[pi], px[pi+1], px[pi+2]);
            const [nr, ng, nb] = cmykEngine.cmykToSrgb(c, m, y, k);
            px[pi] = nr; px[pi+1] = ng; px[pi+2] = nb;
          }
          ctx.putImageData(imgData, 0, 0);
          console.log("[PDF] Image CMYK-simulated (alpha preserved): " + natW + "x" + natH);
        }
        // src는 HTMLImageElement에만 존재. canvas는 undefined로 처리.
        origSrcs.set(imgObj, (el instanceof HTMLImageElement ? el.src : "") || "");
        const dataUrl = tempCanvas.toDataURL("image/png");
        await new Promise<void>((resolve) => {
          const newImg = new Image();
          newImg.crossOrigin = "anonymous";
          newImg.onload = () => {
            (imgObj as any)._element = newImg;
            (imgObj as any)._originalElement = newImg;
            imgObj.dirty = true;
            resolve();
          };
          newImg.onerror = () => resolve();
          newImg.src = dataUrl;
        });
      } catch (e) { console.warn("[PDF] Image pre-process failed:", e); }
    }
    canvas.renderAll();
    let svgString = canvas.toSVG({ width: canvasW, height: canvasH });
    // Restore original image sources
    for (const [imgObj, origSrc] of origSrcs) {
      if (origSrc) {
        try {
          await new Promise<void>((resolve) => {
            const restoreImg = new Image();
            restoreImg.crossOrigin = "anonymous";
            restoreImg.onload = () => {
              (imgObj as any)._element = restoreImg;
              (imgObj as any)._originalElement = restoreImg;
              imgObj.dirty = true;
              resolve();
            };
            restoreImg.onerror = () => resolve();
            restoreImg.src = origSrc;
          });
        } catch { /* ignore */ }
      }
    }
    canvas.renderAll();
  console.log("[PDF] Step 3: SVG generated, length:", svgString.length);

  // dielineOnly: forcefully remove all <text> and <tspan> elements from SVG
  if (dielineOnly) {
    const tempParser = new DOMParser();
    const tempDoc = tempParser.parseFromString(svgString, "image/svg+xml");
    const tempSvg = tempDoc.documentElement;
    const textEls = tempSvg.querySelectorAll("text");
    console.log("[PDF] dielineOnly: removing", textEls.length, "text elements from SVG");
    textEls.forEach((el: Element) => el.parentNode?.removeChild(el));
    // Also remove any elements with visibility:hidden or display:none that leaked through
    const hiddenEls = tempSvg.querySelectorAll("[visibility=hidden], [display=none]");
    hiddenEls.forEach((el: Element) => el.parentNode?.removeChild(el));
    svgString = new XMLSerializer().serializeToString(tempSvg);
    console.log("[PDF] dielineOnly: cleaned SVG length:", svgString.length);
  }

  // Debug: show font-family usage in SVG
  const fontMatches = svgString.match(/font-family[^;"']*/g) || [];
  const unique = [...new Set(fontMatches)];
  console.log("[PDF] SVG font-families found:", unique);

  const ffAttrs = svgString.match(/font-family="[^"]*"/g) || [];
 
  // Show the actual font-family value

  // Show 500 chars before Text content
  const ti2 = svgString.indexOf("Text</tspan>");

  const textIdx = svgString.indexOf(">Text<");

  // Also check style attributes
  const styleMatches = svgString.match(/style="[^"]*font[^"]*"/g) || [];

  objects.forEach((obj: any, idx: number) => {
    obj.set({ visible: savedVisibility[idx] });
  });
  canvas.renderAll();

  // Restore background color
  canvas.backgroundColor = savedBgColor;
  canvas.renderAll();

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = svgDoc.documentElement;

  // Normalize font-family in SVG to match jsPDF registered font names
  const svgFontEls = svgEl.querySelectorAll("text, tspan");
  const pdfFontMap: Record<string, string> = {
    "arial": "Arial",
    "georgia": "Georgia",
    "times new roman": "Times New Roman",
    "courier new": "Courier New",
    "helvetica": "helvetica",
    "inter": "Inter",
    "noto sans kr": "NotoSansKR",
    "malgun gothic": "Malgun Gothic",
    "맑은 고딕": "Malgun Gothic",
    "google sans": "NotoSansKR",
    "google sans-bold": "NotoSansKR-Bold",
  };
  svgFontEls.forEach((el) => {
    let ff = el.getAttribute("font-family") || "";
    const elSt = el.getAttribute("style") || "";
    const stMatch = elSt.match(/font-family:\s*([^;]+)/);
    if (stMatch) { ff = stMatch[1]; }
    if (ff) {
      const cleaned = ff.replace(/['"]/g, "").split(",")[0].trim();
      const lower = cleaned.toLowerCase();
      const mapped = pdfFontMap[lower] || cleaned;
      el.setAttribute("font-family", mapped);
      if (stMatch) {
        const fixedSt = elSt.replace(/font-family:\s*[^;]+/, "font-family: " + mapped);
        el.setAttribute("style", fixedSt);
      }
      const fw = el.getAttribute("font-weight") || "";
      const fst = el.getAttribute("font-style") || "";
      const isBold = fw === "bold" || parseInt(fw) >= 700;
      const isItalic = fst === "italic";
      if (isBold || isItalic) {
        let baseName = mapped.replace(/-(Regular|Bold|Italic|BoldItalic)$/i, "");
        if (isBold && isItalic) { el.setAttribute("font-family", baseName + "-BoldItalic"); }
        else if (isBold) { el.setAttribute("font-family", baseName + "-Bold"); }
        else if (isItalic) { el.setAttribute("font-family", baseName + "-Italic"); }
      }
    }
  });

  console.log("[PDF] Font-family normalized:", svgFontEls.length, "elements");
  // Fix: extract fill from style to attribute before outline conversion
  svgEl.querySelectorAll("text, tspan").forEach((el: Element) => {
    const st = el.getAttribute("style") || "";
    const fillMatch = st.match(/(?:^|;\s*)fill:\s*([^;]+)/);
    if (fillMatch) el.setAttribute("fill", fillMatch[1].trim());
    const cleanSt = st.replace(/fill:\s*[^;]+;?/g, "").replace(/stroke[^;]*;?/g, "").replace(/;{2,}/g, ";").replace(/^;|;$/g, "").trim();
    if (cleanSt) el.setAttribute("style", cleanSt); else el.removeAttribute("style");
  });
  console.log("[PDF] Style cleanup before outline conversion");
  // Convert text to outlines (vector paths) for perfect font rendering
  const { convertTextToOutlines } = await import("./text-to-outlines");
  const outlineCount = await convertTextToOutlines(svgEl);
  console.log("[PDF] Step 3b: Text converted to outlines:", outlineCount, "elements");
  const finalSvg = new XMLSerializer().serializeToString(svgEl);
  const pathCountAfter = (finalSvg.match(/<path /g) || []).length;
  const textCountAfter = (finalSvg.match(/<text[\s>]/g) || []).length;
  // fill 색상 확인
  const fillMatches = finalSvg.match(/fill="([^"]+)"/g) || [];
  const uniqueFills = [...new Set(fillMatches)].slice(0, 15);

  svgEl.setAttribute("width", String(canvasW));
  svgEl.setAttribute("height", String(canvasH));

  const orientation = canvasW > canvasH ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "pt", format: [canvasW, canvasH] });
  console.log("[PDF] Step 4: jsPDF created", canvasW, "x", canvasH);

  // Register fonts for accurate text rendering
  try {
    const fontConfigs = [
      { file: "arial.ttf", name: "Arial", style: "normal" },
      { file: "arialbd.ttf", name: "Arial-Bold", style: "bold" },
      { file: "ariali.ttf", name: "Arial-Italic", style: "italic" },
      { file: "arialbi.ttf", name: "Arial-BoldItalic", style: "bolditalic" },
      { file: "georgia.ttf", name: "Georgia", style: "normal" },
      { file: "georgiab.ttf", name: "Georgia-Bold", style: "bold" },
      { file: "georgiai.ttf", name: "Georgia-Italic", style: "italic" },
      { file: "georgiaz.ttf", name: "Georgia-BoldItalic", style: "bolditalic" },
      { file: "NotoSansKR-Regular.ttf", name: "NotoSansKR", style: "normal" },
      { file: "NotoSansKR-Bold.ttf", name: "NotoSansKR-Bold", style: "bold" },
      { file: "malgun.ttf", name: "Malgun Gothic", style: "normal" },
      { file: "malgunbd.ttf", name: "Malgun Gothic-Bold", style: "bold" },
    ];
    for (const fc of fontConfigs) {
      const resp = await fetch("/fonts/" + fc.file);
      if (resp.ok) {
        const buf = await resp.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        const chunk = 8192;
        for (let ci = 0; ci < bytes.length; ci += chunk) {
          binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(ci, Math.min(ci + chunk, bytes.length))));
        }
        const base64 = btoa(binary);
        const fileId = fc.name + ".ttf";
        doc.addFileToVFS(fileId, base64);
        doc.addFont(fileId, fc.name, fc.style);
        console.log("[PDF] Font registered:", fc.name, fc.style);
      }
    }
    console.log("[PDF] Step 4b: Fonts registered");
  } catch (fontErr) {
    console.warn("[PDF] Font loading failed:", fontErr);
  }

  // Fix: Fabric.js puts fill inside style attribute - svg2pdf needs it as direct attribute
  const allTextEls = svgEl.querySelectorAll("text, tspan");
  allTextEls.forEach((el: Element) => {
    const st = el.getAttribute("style") || "";
    // Extract fill from style
    const fillMatch = st.match(/(?:^|;\s*)fill:\s*([^;]+)/);
    if (fillMatch && !el.getAttribute("fill")) {
      el.setAttribute("fill", fillMatch[1].trim());
    }
    // Extract opacity from style
    const opMatch = st.match(/(?:^|;\s*)opacity:\s*([^;]+)/);
    if (opMatch && !el.getAttribute("opacity")) {
      el.setAttribute("opacity", opMatch[1].trim());
    }
    // Remove stroke:none that confuses svg2pdf
    const cleanStyle = st
      .replace(/fill:\s*[^;]+;?/g, "")
      .replace(/opacity:\s*[^;]+;?/g, "")
      .replace(/stroke:\s*none;?/g, "")
      .replace(/stroke-width:\s*[^;]+;?/g, "")
      .replace(/stroke-dasharray:\s*none;?/g, "")
      .replace(/stroke-linecap:\s*[^;]+;?/g, "")
      .replace(/stroke-dashoffset:\s*[^;]+;?/g, "")
      .replace(/stroke-linejoin:\s*[^;]+;?/g, "")
      .replace(/stroke-miterlimit:\s*[^;]+;?/g, "")
      .replace(/stroke-opacity:\s*[^;]+;?/g, "")
      .replace(/;{2,}/g, ";").replace(/^;|;$/g, "").trim();
    if (cleanStyle) el.setAttribute("style", cleanStyle);
    else el.removeAttribute("style");
  });
  console.log("[PDF] Fixed", allTextEls.length, "text/tspan style->attribute for svg2pdf");

  await svg2pdf(svgEl, doc, { x: 0, y: 0, width: canvasW, height: canvasH });
  console.log("[PDF] Step 5: SVG rendered to PDF via svg2pdf.js");

  doc.setProperties({
    title: filename?.replace(".pdf", "") || "Package Design",
    subject: "Package Design - CMYK",
    creator: "Packive",
  });
  

  const pdfArrayBuffer = doc.output("arraybuffer");
  console.log("[PDF] Step 6: PDF ArrayBuffer generated, bytes:", pdfArrayBuffer.byteLength);

  const uint8 = new Uint8Array(pdfArrayBuffer);
  let rawPdf = "";
  const chunkSize = 8192;
  for (let ci = 0; ci < uint8.length; ci += chunkSize) {
    const chunk = uint8.subarray(ci, Math.min(ci + chunkSize, uint8.length));
    rawPdf += String.fromCharCode.apply(null, Array.from(chunk));
  }
  console.log("[PDF] Step 7: Converted to string, length:", rawPdf.length);

  rawPdf = replacePdfColorsInString(rawPdf, colorMap);

  // Step 7b: Vector colors converted to CMYK, images remain DeviceRGB (CMYK-simulated pixels)
  // Step 7b-2: FOGRA39 ICC OutputIntent 임베드 (PDF/X-4 — DestOutputProfile이 실제 ICC stream을 가리킴).
  // 이전의 stub OutputIntent는 DestOutputProfile이 없어 Acrobat/Illustrator가 SWOP default로 fallback,
  // 그게 "PDF가 Proof ON 화면보다 어두움"의 직접 원인이었음. 진짜 ICC 임베드로 교체.
  // 실패 시 헬퍼가 원본 rawPdf 그대로 반환(graceful degradation) → PDF 출력 자체는 보장.
  rawPdf = await embedIccOutputIntent(rawPdf);
  console.log("[PDF] Step 8: CMYK conversion complete, length:", rawPdf.length);

  const outLen = rawPdf.length;
  const outBuf = new Uint8Array(outLen);
  for (let bi = 0; bi < outLen; bi++) {
    outBuf[bi] = rawPdf.charCodeAt(bi) & 0xff;
  }
  const blob = new Blob([outBuf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "design.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log("[PDF] Step 9: Saved as", filename);
}