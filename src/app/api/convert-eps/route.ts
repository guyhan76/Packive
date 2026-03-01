import { NextRequest, NextResponse } from "next/server";

/* ── CorelDRAW 8 EPS Parser ──
   Pattern: "v1 v2 /" is a segment separator
   - "0 0 /" → cut line
   - "0 1 /" → crease/fold line  
   - other → annotation
   Drawing: m (moveto), l (lineto), C (curveto), @c (close), S (stroke)
   
   Each segment becomes its own SVG path (no merging - keeps shapes accurate)
*/

function parseCorelEPS(epsText: string): {
  svg: string;
  bbox: number[];
  pathCounts: { cut: number; crease: number; other: number; total: number };
  creaseLinesX: number[];
  creaseLinesY: number[];
} {
  const bbMatch = epsText.match(
    /%%BoundingBox:\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)/
  );
  const bb = bbMatch
    ? [parseFloat(bbMatch[1]), parseFloat(bbMatch[2]), parseFloat(bbMatch[3]), parseFloat(bbMatch[4])]
    : [0, 0, 595, 842];

  const [bx, by, bx2, by2] = bb;
  const W = bx2 - bx;
  const H = by2 - by;

  let bodyStart = epsText.indexOf("%%Page:");
  if (bodyStart < 0) bodyStart = epsText.indexOf("%%EndSetup");
  if (bodyStart < 0) bodyStart = 0;
  const body = epsText.substring(bodyStart);

  const tokens: string[] = [];
  const re = /[^\s]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) tokens.push(m[0]);

  interface SvgPath { d: string; type: "cut" | "crease" | "other"; }
  const svgPaths: SvgPath[] = [];
  const creaseLinesX: number[] = [];
  const creaseLinesY: number[] = [];

  function tx(x: number) { return x - bx; }
  function ty(y: number) { return H - (y - by); }

  let segD = "";
  let segRawStartX = 0, segRawStartY = 0;
  let curRawX = 0, curRawY = 0;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    // moveto: x y m
    if (t === "m" && i >= 2) {
      const rawX = parseFloat(tokens[i - 2]);
      const rawY = parseFloat(tokens[i - 1]);
      if (!isNaN(rawX) && !isNaN(rawY)) {
        segRawStartX = rawX; segRawStartY = rawY;
        curRawX = rawX; curRawY = rawY;
        segD = `M ${tx(rawX).toFixed(2)} ${ty(rawY).toFixed(2)}`;
      }
    }

    // lineto: x y l
    if (t === "l" && i >= 2) {
      const rawX = parseFloat(tokens[i - 2]);
      const rawY = parseFloat(tokens[i - 1]);
      if (!isNaN(rawX) && !isNaN(rawY)) {
        curRawX = rawX; curRawY = rawY;
        segD += ` L ${tx(rawX).toFixed(2)} ${ty(rawY).toFixed(2)}`;
      }
    }

    // curveto: x1 y1 x2 y2 x3 y3 C
    if (t === "C" && i >= 6) {
      const v = [];
      for (let j = 6; j >= 1; j--) v.push(parseFloat(tokens[i - j]));
      if (v.every((n) => !isNaN(n))) {
        curRawX = v[4]; curRawY = v[5];
        segD += ` C ${tx(v[0]).toFixed(2)} ${ty(v[1]).toFixed(2)} ${tx(v[2]).toFixed(2)} ${ty(v[3]).toFixed(2)} ${tx(v[4]).toFixed(2)} ${ty(v[5]).toFixed(2)}`;
      }
    }

    // close
    if (t === "@c" && segD) segD += " Z";

    // Segment separator: v1 v2 /
    if (t === "/" && i >= 2) {
      const v1 = parseFloat(tokens[i - 2]);
      const v2 = parseFloat(tokens[i - 1]);
      if (!isNaN(v1) && !isNaN(v2) && segD) {
        let type: "cut" | "crease" | "other" = "cut";
        if (Math.abs(v1) < 0.01 && Math.abs(v2) < 0.01) type = "cut";
        else if (Math.abs(v1) < 0.01 && Math.abs(v2 - 1.0) < 0.01) type = "crease";
        else type = "other";

        svgPaths.push({ d: segD, type });

        if (type === "crease") {
          if (Math.abs(segRawStartX - curRawX) < 3) {
            creaseLinesX.push(Math.round((segRawStartX + curRawX) / 2 * 10) / 10);
          }
          if (Math.abs(segRawStartY - curRawY) < 3) {
            creaseLinesY.push(Math.round((segRawStartY + curRawY) / 2 * 10) / 10);
          }
        }
        segD = "";
      }
    }

    // Stroke
    if (t === "S") {
      if (segD) { svgPaths.push({ d: segD, type: "cut" }); segD = ""; }
    }
  }
  if (segD) svgPaths.push({ d: segD, type: "cut" });

  // Build SVG - each segment is its own path
  const colors = { cut: "#FF0000", crease: "#00AA00", other: "#888888" };
  const pathStrs = svgPaths.map((p) => {
    const dash = p.type === "crease" ? ' stroke-dasharray="8,4"' : "";
    const op = p.type === "other" ? ' opacity="0.4"' : "";
    const sw = p.type === "cut" ? 1.0 : p.type === "crease" ? 0.8 : 0.6;
    return `  <path d="${p.d}" stroke="${colors[p.type]}" stroke-width="${sw}" fill="none"${dash}${op}/>`;
  }).join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" width="${W.toFixed(2)}" height="${H.toFixed(2)}">
${pathStrs}
</svg>`;

  const cut = svgPaths.filter((p) => p.type === "cut").length;
  const crease = svgPaths.filter((p) => p.type === "crease").length;
  const other = svgPaths.filter((p) => p.type === "other").length;

  return {
    svg,
    bbox: bb,
    pathCounts: { cut, crease, other, total: svgPaths.length },
    creaseLinesX: [...new Set(creaseLinesX)].sort((a, b) => a - b),
    creaseLinesY: [...new Set(creaseLinesY)].sort((a, b) => a - b),
  };
}

// ── Estimate L×W×H ──
function estimateDimensions(
  creaseLinesX: number[],
  creaseLinesY: number[],
  bboxW: number,
  bboxH: number
): { L: number; W: number; H: number; confidence: string } {
  const ptToMM = 0.3528;

  function dedup(arr: number[], tol = 5): number[] {
    const sorted = [...arr].sort((a, b) => a - b);
    const r: number[] = [];
    for (const v of sorted) {
      if (r.length === 0 || Math.abs(v - r[r.length - 1]) > tol) r.push(v);
    }
    return r;
  }

  const ux = dedup(creaseLinesX);
  const uy = dedup(creaseLinesY);

  const xGaps = [];
  for (let i = 1; i < ux.length; i++) {
    const g = Math.round(Math.abs(ux[i] - ux[i - 1]) * ptToMM);
    if (g > 15) xGaps.push(g);
  }

  const yGaps = [];
  for (let i = 1; i < uy.length; i++) {
    const g = Math.round(Math.abs(uy[i] - uy[i - 1]) * ptToMM);
    if (g > 15) yGaps.push(g);
  }

  let L = 0, W = 0, H = 0, confidence = "low";

  if (xGaps.length >= 2) {
    const clusters = new Map<number, number>();
    for (const g of xGaps) {
      const k = Math.round(g / 5) * 5;
      clusters.set(k, (clusters.get(k) || 0) + 1);
    }
    const sorted = [...clusters.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted.length >= 2) {
      const vals = sorted.map((s) => s[0]).sort((a, b) => b - a);
      L = vals[0]; W = vals[1];
      confidence = sorted[0][1] >= 2 ? "high" : "medium";
    } else if (sorted.length === 1) {
      L = sorted[0][0]; W = sorted[0][0]; confidence = "medium";
    }
  }

  if (yGaps.length >= 1) {
    H = Math.max(...yGaps);
    if (yGaps.length >= 3) confidence = confidence === "low" ? "medium" : confidence;
  }

  if (L === 0 && W === 0 && H === 0) {
    confidence = "estimated";
    L = Math.round(bboxW * ptToMM / 4);
    W = Math.round(bboxW * ptToMM / 6);
    H = Math.round(bboxH * ptToMM / 2);
  }

  return { L, W, H, confidence };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const text = await file.text();
    if (!text.includes("%!PS-Adobe") && !text.includes("EPSF")) {
      return NextResponse.json({ error: "Invalid EPS" }, { status: 400 });
    }

    const { svg, bbox, pathCounts, creaseLinesX, creaseLinesY } = parseCorelEPS(text);
    const bboxW = bbox[2] - bbox[0];
    const bboxH = bbox[3] - bbox[1];
    const dims = estimateDimensions(creaseLinesX, creaseLinesY, bboxW, bboxH);

    return NextResponse.json({
      svg, bbox,
      totalWidthPt: bboxW, totalHeightPt: bboxH,
      pathCounts, creaseLinesX, creaseLinesY,
      estimatedDimensions: dims,
      source: file.name,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}