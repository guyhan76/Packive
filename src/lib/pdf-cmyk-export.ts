// src/lib/pdf-cmyk-export.ts
// CMYK Vector PDF Export - SVG-based approach
// Uses Fabric.js toSVG() + svg2pdf.js for accurate vector rendering
// Then post-processes colors to CMYK

import { convertTextToOutlines } from "./text-to-outlines";

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

function rgbToCmyk(r: number, g: number, b: number): CMYKColor {
  const r1 = r / 255, g1 = g / 255, b1 = b / 255;
  const k = 1 - Math.max(r1, g1, b1);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

  const c = (1 - r1 - k) / (1 - k);
  const m = (1 - g1 - k) / (1 - k);
  const y = (1 - b1 - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
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
    const maxV = Math.max(ri, gi, bi) / 255;
    const kVal = 1 - maxV;
    const cVal = maxV === 0 ? 0 : (1 - ri / 255 - kVal) / (1 - kVal);
    const mVal = maxV === 0 ? 0 : (1 - gi / 255 - kVal) / (1 - kVal);
    const yVal = maxV === 0 ? 0 : (1 - bi / 255 - kVal) / (1 - kVal);
    const cmykOp2 = op === "rg" ? "k" : "K";
    replaced++;
    return cVal.toFixed(4) + " " + mVal.toFixed(4) + " " + yVal.toFixed(4) + " " + kVal.toFixed(4) + " " + cmykOp2;
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
    return match;
  });

  console.log("[PDF] CMYK replaced:", replaced, "/", total, "color operators (string mode)");
  return pdf;
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

  const { colorMap, spotMap } = buildColorMap(canvas);
  console.log("[PDF] Step 2: Color map built,", colorMap.size, "colors");
  colorMap.forEach((cmyk, hex) => {
    console.log("  " + hex + " -> C" + cmyk.c + " M" + cmyk.m + " Y" + cmyk.y + " K" + cmyk.k);
  });
  console.log("[PDF] Spot colors found:", spotMap.size);
  spotMap.forEach((info, hex) => {
    console.log("  SPOT", hex, "->", info.name, "C" + info.cmyk.c + "M" + info.cmyk.m + "Y" + info.cmyk.y + "K" + info.cmyk.k);
  });

  const objects = canvas.getObjects();
  const savedVisibility: boolean[] = [];
  objects.forEach((obj: any, idx: number) => {
    savedVisibility[idx] = obj.visible !== false;
    if (obj._isGuideLayer) {
      obj.set({ visible: false });
    }
    if (dielineOnly) {
      const isDieline = obj._isDieline || obj._isDielineGroup || (obj.type === "group" && !obj._cmykFill);
      if (!isDieline) obj.set({ visible: false });
    }
    if (!includeDieline && !dielineOnly) {
      if (obj._isDieline || obj._isDielineGroup) {
        obj.set({ visible: false });
      }
    }
  });
  canvas.renderAll();

  // Handle background color: remove before toSVG, add full-size rect to PDF later
  const savedBgColor = canvas.backgroundColor;
  canvas.backgroundColor = "";
  canvas.renderAll();

  const svgString = canvas.toSVG({ width: canvasW, height: canvasH });
  console.log("[PDF] Step 3: SVG generated, length:", svgString.length);

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
    "inter": "NotoSansKR-Regular",
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
  // Convert text to outlines (vector paths) for perfect font rendering
  const outlineCount = await convertTextToOutlines(svgEl);
  console.log("[PDF] Step 3b: Text converted to outlines:", outlineCount, "elements");

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

  await svg2pdf(svgEl, doc, { x: 0, y: 0, width: canvasW, height: canvasH });
  console.log("[PDF] Step 5: SVG rendered to PDF via svg2pdf.js");

  // Draw background color as full-canvas rect in PDF
  if (savedBgColor && savedBgColor !== "transparent" && savedBgColor !== "none" && savedBgColor !== "") {
    const bgHex = normalizeColor(savedBgColor);
    if (bgHex) {
      const bgRgb = hexToRgb(bgHex);
      if (bgRgb) {
        // Add background rect behind all content
        // jsPDF pages[1] array: insert at beginning
        const pages = (doc as any).internal.pages;
        if (pages[1] && Array.isArray(pages[1])) {
          const bgCmyk = colorMap.get(bgHex) || rgbToCmyk(bgRgb.r, bgRgb.g, bgRgb.b);
          const bc = (bgCmyk.c / 100).toFixed(4);
          const bm = (bgCmyk.m / 100).toFixed(4);
          const by = (bgCmyk.y / 100).toFixed(4);
          const bk = (bgCmyk.k / 100).toFixed(4);
          // Insert background rect operators at the beginning of content
          const bgOps = [
            "q",
            bc + " " + bm + " " + by + " " + bk + " k",
            "0 0 " + canvasW + " " + canvasH + " re",
            "f",
            "Q"
          ];
          // Find first content entry and insert before it
          pages[1].splice(1, 0, ...bgOps);
          console.log("[PDF] Background rect added:", bgHex, "->", "C" + bgCmyk.c + " M" + bgCmyk.m + " Y" + bgCmyk.y + " K" + bgCmyk.k);
        }
      }
    }
  }

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

  const finalPdf = rawPdf;
  console.log("[PDF] Step 8: CMYK conversion complete, length:", finalPdf.length);

  const outLen = finalPdf.length;
  const outBuf = new Uint8Array(outLen);
  for (let bi = 0; bi < outLen; bi++) {
    outBuf[bi] = finalPdf.charCodeAt(bi) & 0xff;
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
