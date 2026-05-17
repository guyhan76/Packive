// ============================================================
// Parametric Dieline Generator v2
// Unit: PostScript points (1mm = 2.8346pt)
// Matches real FEFCO/ECMA SVG structure exactly
// ============================================================

export interface BoxDimensions {
  length: number;  // mm
  width: number;   // mm
  height: number;  // mm
}

interface GeneratorResult {
  svg: string;
  viewBoxW: number;
  viewBoxH: number;
}

const MM = 2.8346;  // 1mm in pt

function r(v: number): string { return v.toFixed(4); }

// ============================================================
// FEFCO 0201 — Regular Slotted Container
// Matches real production dieline structure
// Red (#ed1c24) = cut, Green (#00a650) = fold
// ============================================================
export function generateFEFCO0201(d: BoxDimensions): GeneratorResult {
  const L = d.length * MM;  // front/back width in pt
  const W = d.width * MM;   // side width in pt
  const H = d.height * MM;  // body height in pt

  const flapD = W / 2;              // standard RSC flap depth
  const glueW = Math.min(40 * MM, W * 0.45);  // glue flap width
  const glueTaper = 10 * MM;        // glue flap taper
  const earW = 8 * MM;              // ear (bridge) between flaps
  const sideInset = 4 * MM;         // side flap trapezoid inset

  // Margins
  const mx = 3 * MM;
  const my = 3 * MM;

  // Key X positions
  const x_glue = mx;                          // glue flap left edge
  const x0 = mx + glueW;                      // body left (Front start)
  const x1 = x0 + L;                          // Front | Right
  const x2 = x1 + W;                          // Right | Back
  const x3 = x2 + L;                          // Back | Left
  const x4 = x3 + W;                          // Left end

  // Key Y positions
  const y_topFlap = my;                        // top flap outer edge
  const y0 = my + flapD;                       // body top
  const y1 = y0 + H;                          // body bottom
  const y_botFlap = y1 + flapD;               // bottom flap outer edge

  // Side flap Y (slightly shorter)
  const sideFlapD = flapD * 0.92;
  const y_sideTop = y0 - sideFlapD;
  const y_sideBot = y1 + sideFlapD;

  const vbW = x4 + mx;
  const vbH = y_botFlap + my;

  // Style definitions
  const cutStyle = 'style="fill:none;stroke:#ed1c24;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10"';
  const foldStyle = 'style="fill:none;stroke:#00a650;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10"';

  let p = '';
  let id = 1;

  // --- Vertical fold lines (body panel separators) ---
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x1)},${r(y1)} V ${r(y0)}"/>`;
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x2)},${r(y1)} V ${r(y0)}"/>`;
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x3)},${r(y1)} V ${r(y0)}"/>`;

  // --- Body outer rectangle (left + right vertical cuts) ---
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x4)},${r(y1 + 2*MM)} V ${r(y0 - 2*MM)}"/>`;
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x_glue)},${r(y1 - 1*MM)} V ${r(y0 + 1*MM)}"/>`;

  // --- Glue flap ---
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x0)},${r(y1)} ${r(x_glue + glueTaper)},${r(y1 - glueTaper)} V ${r(y0 + glueTaper)} l ${r(glueTaper * -1 + (x0 - x_glue - glueTaper))},${r(-glueTaper)}"/>`;

  // --- Top horizontal fold lines (body top edge per panel) ---
  // Front top fold
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x0)},${r(y0)} H ${r(x1)}"/>`;
  // Right top fold
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x1 + earW/2)},${r(y0 - 2*MM)} H ${r(x2 - earW/2)}"/>`;
  // Back top fold
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x2)},${r(y0)} H ${r(x3)}"/>`;
  // Left top fold
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x3 + earW/2)},${r(y0 - 2*MM)} H ${r(x4 - earW/2)}"/>`;

  // --- Top flaps ---
  // Front top flap (rectangle)
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x0)},${r(y0)} v ${r(-flapD)} h ${r(L)} v ${r(flapD)}"/>`;
  // Right top flap (trapezoid)
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x1 + earW/2)},${r(y0 - 2*MM)} v ${r(-sideFlapD + 2*MM)} h ${r(W - earW)} v ${r(sideFlapD - 2*MM)}"/>`;
  // Back top flap (rectangle)
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x2)},${r(y0)} v ${r(-flapD)} h ${r(L)} v ${r(flapD)}"/>`;
  // Left top flap (trapezoid)
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x3 + earW/2)},${r(y0 - 2*MM)} v ${r(-sideFlapD + 2*MM)} h ${r(W - earW)} v ${r(sideFlapD - 2*MM)}"/>`;

  // --- Top ears (small horizontal bridges) ---
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x1)},${r(y0)} h ${r(earW/2)}"/>`;
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x2 - earW/2)},${r(y0)} h ${r(earW/2)}"/>`;
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x3)},${r(y0)} h ${r(earW/2)}"/>`;

  // --- Bottom horizontal fold lines ---
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x0)},${r(y1)} H ${r(x1)}"/>`;
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x1 + earW/2)},${r(y1 + 2*MM)} H ${r(x2 - earW/2)}"/>`;
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x2)},${r(y1)} H ${r(x3)}"/>`;
  p += `<path id="path${id++}" ${foldStyle} d="M ${r(x3 + earW/2)},${r(y1 + 2*MM)} H ${r(x4 - earW/2)}"/>`;

  // --- Bottom flaps ---
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x0)},${r(y1)} v ${r(flapD)} h ${r(L)} v ${r(-flapD)}"/>`;
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x1 + earW/2)},${r(y1 + 2*MM)} v ${r(sideFlapD - 2*MM)} h ${r(W - earW)} v ${r(-sideFlapD + 2*MM)}"/>`;
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x2)},${r(y1)} v ${r(flapD)} h ${r(L)} v ${r(-flapD)}"/>`;
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x3 + earW/2)},${r(y1 + 2*MM)} v ${r(sideFlapD - 2*MM)} h ${r(W - earW)} v ${r(-sideFlapD + 2*MM)}"/>`;

  // --- Bottom ears ---
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x1)},${r(y1)} h ${r(earW/2)}"/>`;
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x2 - earW/2)},${r(y1)} h ${r(earW/2)}"/>`;
  p += `<path id="path${id++}" ${cutStyle} d="M ${r(x3)},${r(y1)} h ${r(earW/2)}"/>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${r(vbW)} ${r(vbH)}" width="${r(vbW)}" height="${r(vbH)}">
${p}
</svg>`;

  return { svg, viewBoxW: vbW, viewBoxH: vbH };
}

// ============================================================
// FEFCO 0215 — Full Overlap Slotted Container
// ============================================================
export function generateFEFCO0215(d: BoxDimensions): GeneratorResult {
  const L = d.length * MM;
  const W = d.width * MM;
  const H = d.height * MM;

  const flapD = W;  // full overlap
  const glueW = Math.min(40 * MM, W * 0.45);
  const glueTaper = 10 * MM;
  const earW = 8 * MM;
  const mx = 3 * MM, my = 3 * MM;

  const x_glue = mx;
  const x0 = mx + glueW;
  const x1 = x0 + L;
  const x2 = x1 + W;
  const x3 = x2 + L;
  const x4 = x3 + W;

  const y0 = my + flapD;
  const y1 = y0 + H;
  const sideFlapD = flapD * 0.92;

  const vbW = x4 + mx;
  const vbH = y1 + flapD + my;

  const cs = 'style="fill:none;stroke:#ed1c24;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10"';
  const fs = 'style="fill:none;stroke:#00a650;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10"';

  let p = '', id = 1;

  // Vertical folds
  p += `<path id="path${id++}" ${fs} d="M ${r(x1)},${r(y1)} V ${r(y0)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x2)},${r(y1)} V ${r(y0)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x3)},${r(y1)} V ${r(y0)}"/>`;

  // Body edges
  p += `<path id="path${id++}" ${cs} d="M ${r(x4)},${r(y1 + 2*MM)} V ${r(y0 - 2*MM)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x_glue)},${r(y1 - 1*MM)} V ${r(y0 + 1*MM)}"/>`;

  // Glue flap
  p += `<path id="path${id++}" ${cs} d="M ${r(x0)},${r(y1)} ${r(x_glue + glueTaper)},${r(y1 - glueTaper)} V ${r(y0 + glueTaper)} l ${r(glueTaper * -1 + (x0 - x_glue - glueTaper))},${r(-glueTaper)}"/>`;

  // Top folds
  p += `<path id="path${id++}" ${fs} d="M ${r(x0)},${r(y0)} H ${r(x1)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x1 + earW/2)},${r(y0 - 2*MM)} H ${r(x2 - earW/2)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x2)},${r(y0)} H ${r(x3)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x3 + earW/2)},${r(y0 - 2*MM)} H ${r(x4 - earW/2)}"/>`;

  // Top flaps (full depth for front/back)
  p += `<path id="path${id++}" ${cs} d="M ${r(x0)},${r(y0)} v ${r(-flapD)} h ${r(L)} v ${r(flapD)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x1 + earW/2)},${r(y0 - 2*MM)} v ${r(-sideFlapD + 2*MM)} h ${r(W - earW)} v ${r(sideFlapD - 2*MM)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x2)},${r(y0)} v ${r(-flapD)} h ${r(L)} v ${r(flapD)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x3 + earW/2)},${r(y0 - 2*MM)} v ${r(-sideFlapD + 2*MM)} h ${r(W - earW)} v ${r(sideFlapD - 2*MM)}"/>`;

  // Top ears
  p += `<path id="path${id++}" ${cs} d="M ${r(x1)},${r(y0)} h ${r(earW/2)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x2 - earW/2)},${r(y0)} h ${r(earW/2)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x3)},${r(y0)} h ${r(earW/2)}"/>`;

  // Bottom folds
  p += `<path id="path${id++}" ${fs} d="M ${r(x0)},${r(y1)} H ${r(x1)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x1 + earW/2)},${r(y1 + 2*MM)} H ${r(x2 - earW/2)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x2)},${r(y1)} H ${r(x3)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x3 + earW/2)},${r(y1 + 2*MM)} H ${r(x4 - earW/2)}"/>`;

  // Bottom flaps
  p += `<path id="path${id++}" ${cs} d="M ${r(x0)},${r(y1)} v ${r(flapD)} h ${r(L)} v ${r(-flapD)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x1 + earW/2)},${r(y1 + 2*MM)} v ${r(sideFlapD - 2*MM)} h ${r(W - earW)} v ${r(-sideFlapD + 2*MM)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x2)},${r(y1)} v ${r(flapD)} h ${r(L)} v ${r(-flapD)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x3 + earW/2)},${r(y1 + 2*MM)} v ${r(sideFlapD - 2*MM)} h ${r(W - earW)} v ${r(-sideFlapD + 2*MM)}"/>`;

  // Bottom ears
  p += `<path id="path${id++}" ${cs} d="M ${r(x1)},${r(y1)} h ${r(earW/2)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x2 - earW/2)},${r(y1)} h ${r(earW/2)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x3)},${r(y1)} h ${r(earW/2)}"/>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${r(vbW)} ${r(vbH)}" width="${r(vbW)}" height="${r(vbH)}">
${p}
</svg>`;

  return { svg, viewBoxW: vbW, viewBoxH: vbH };
}

// ============================================================
// ECMA A20 — Straight Tuck End Carton
// ============================================================
export function generateECMA_A20(d: BoxDimensions): GeneratorResult {
  const L = d.length * MM;
  const W = d.width * MM;
  const H = d.height * MM;

  const tuckD = W * 0.78;
  const dustD = W * 0.45;
  const closureD = tuckD * 0.55;
  const glueW = Math.min(20 * MM, W * 0.5);
  const mx = 3 * MM, my = 3 * MM;

  const x_glue = mx;
  const x0 = mx + glueW;
  const x1 = x0 + L;
  const x2 = x1 + W;
  const x3 = x2 + L;
  const x4 = x3 + W;

  const y0 = my + tuckD;
  const y1 = y0 + H;

  const vbW = x4 + mx;
  const vbH = y1 + tuckD + my;

  const cs = 'style="fill:none;stroke:#ed1c24;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10"';
  const fs = 'style="fill:none;stroke:#00a650;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:10"';

  let p = '', id = 1;

  // Vertical folds
  p += `<path id="path${id++}" ${fs} d="M ${r(x1)},${r(y1)} V ${r(y0)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x2)},${r(y1)} V ${r(y0)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x3)},${r(y1)} V ${r(y0)}"/>`;

  // Body edges
  p += `<path id="path${id++}" ${cs} d="M ${r(x4)},${r(y1)} V ${r(y0)}"/>`;
  p += `<path id="path${id++}" ${cs} d="M ${r(x_glue)},${r(y1 - 3*MM)} V ${r(y0 + 3*MM)}"/>`;

  // Glue flap
  p += `<path id="path${id++}" ${cs} d="M ${r(x0)},${r(y1)} L ${r(x_glue)},${r(y1 - 3*MM)} V ${r(y0 + 3*MM)} L ${r(x0)},${r(y0)}"/>`;

  // Top folds
  p += `<path id="path${id++}" ${fs} d="M ${r(x0)},${r(y0)} H ${r(x1)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x1)},${r(y0)} H ${r(x2)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x2)},${r(y0)} H ${r(x3)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x3)},${r(y0)} H ${r(x4)}"/>`;

  // Top tuck flap (front)
  const tR = 5 * MM;
  p += `<path id="path${id++}" ${cs} d="M ${r(x0)},${r(y0)} v ${r(-tuckD + tR)} l ${r(tR)},${r(-tR)} h ${r(L - 2*tR)} l ${r(tR)},${r(tR)} V ${r(y0)}"/>`;
  // Top dust flap (right side)
  p += `<path id="path${id++}" ${cs} d="M ${r(x1)},${r(y0)} l ${r(2*MM)},${r(-dustD)} h ${r(W - 4*MM)} l ${r(2*MM)},${r(dustD)}"/>`;
  // Top closure (back)
  p += `<path id="path${id++}" ${cs} d="M ${r(x2)},${r(y0)} v ${r(-closureD)} h ${r(L)} v ${r(closureD)}"/>`;
  // Top dust flap (left side)
  p += `<path id="path${id++}" ${cs} d="M ${r(x3)},${r(y0)} l ${r(2*MM)},${r(-dustD)} h ${r(W - 4*MM)} l ${r(2*MM)},${r(dustD)}"/>`;

  // Bottom folds
  p += `<path id="path${id++}" ${fs} d="M ${r(x0)},${r(y1)} H ${r(x1)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x1)},${r(y1)} H ${r(x2)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x2)},${r(y1)} H ${r(x3)}"/>`;
  p += `<path id="path${id++}" ${fs} d="M ${r(x3)},${r(y1)} H ${r(x4)}"/>`;

  // Bottom tuck flap
  p += `<path id="path${id++}" ${cs} d="M ${r(x0)},${r(y1)} v ${r(tuckD - tR)} l ${r(tR)},${r(tR)} h ${r(L - 2*tR)} l ${r(tR)},${r(-tR)} V ${r(y1)}"/>`;
  // Bottom dust flap (right)
  p += `<path id="path${id++}" ${cs} d="M ${r(x1)},${r(y1)} l ${r(2*MM)},${r(dustD)} h ${r(W - 4*MM)} l ${r(2*MM)},${r(-dustD)}"/>`;
  // Bottom closure (back)
  p += `<path id="path${id++}" ${cs} d="M ${r(x2)},${r(y1)} v ${r(closureD)} h ${r(L)} v ${r(-closureD)}"/>`;
  // Bottom dust flap (left)
  p += `<path id="path${id++}" ${cs} d="M ${r(x3)},${r(y1)} l ${r(2*MM)},${r(dustD)} h ${r(W - 4*MM)} l ${r(2*MM)},${r(-dustD)}"/>`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${r(vbW)} ${r(vbH)}" width="${r(vbW)}" height="${r(vbH)}">
${p}
</svg>`;

  return { svg, viewBoxW: vbW, viewBoxH: vbH };
}

// Router
export function generateDieline(code: string, dims: BoxDimensions): GeneratorResult | null {
  switch (code) {
    case 'FEFCO 0201': return generateFEFCO0201(dims);
    case 'FEFCO 0215': return generateFEFCO0215(dims);
    case 'ECMA A20.20.03.03': return generateECMA_A20(dims);
    default: return null;
  }
}