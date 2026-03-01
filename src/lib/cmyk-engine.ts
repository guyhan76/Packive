// Packive CMYK Color Engine - FOGRA39 ICC Profile based
// Forward: CMYK -> sRGB (using fogra39-lut.bin, 21^4 grid)
// Reverse: sRGB -> CMYK (using fogra39-reverse-lut.bin, 64^3 grid)

const GRID_SIZE = 21;
const STEP = 5; // 100/(21-1) = 5%

let lutData: Uint8Array | null = null;
let lutReady = false;

let revLutData: Uint8Array | null = null;
let revLutReady = false;
const REV_GRID = 64;
const REV_STEP = 4; // 256/64

/**
 * Load both FOGRA39 LUTs (forward + reverse)
 */
export async function loadFOGRA39LUT(): Promise<void> {
  try {
    // Forward LUT: CMYK -> sRGB
    const res = await fetch('/fogra39-lut.bin');
    if (!res.ok) throw new Error('Failed to fetch fogra39-lut.bin');
    const buf = await res.arrayBuffer();
    const arr = new Uint8Array(buf);
    const gridSize = arr[0];
    if (gridSize !== GRID_SIZE) {
      console.warn("LUT grid size mismatch: expected " + GRID_SIZE + ", got " + gridSize);
    }
    lutData = arr.slice(1);
    lutReady = true;
    console.log("FOGRA39 LUT loaded: " + lutData.length + " bytes, grid " + gridSize + "^4");

    // Reverse LUT: sRGB -> CMYK
    try {
      const revRes = await fetch('/fogra39-reverse-lut.bin');
      if (revRes.ok) {
        const revBuf = await revRes.arrayBuffer();
        revLutData = new Uint8Array(revBuf);
        revLutReady = true;
        console.log("FOGRA39 Reverse LUT loaded: " + revLutData.length + " bytes, grid " + REV_GRID + "^3");
      }
    } catch (e) {
      console.warn("Failed to load reverse LUT:", e);
    }
  } catch (e) {
    console.error("Failed to load FOGRA39 LUT:", e);
  }
}

/**
 * Get RGB value at a specific grid point
 */
function getGridRGB(ci: number, mi: number, yi: number, ki: number): [number, number, number] {
  if (!lutData) return [0, 0, 0];
  const idx = ((ci * GRID_SIZE * GRID_SIZE * GRID_SIZE) + (mi * GRID_SIZE * GRID_SIZE) + (yi * GRID_SIZE) + ki) * 3;
  return [lutData[idx] || 0, lutData[idx + 1] || 0, lutData[idx + 2] || 0];
}

/**
 * Convert CMYK (0-100) to sRGB (0-255) using FOGRA39 LUT with quadrilinear interpolation
 */
export function cmykToSrgb(c: number, m: number, y: number, k: number): [number, number, number] {
  if (!lutReady || !lutData) {
    return [
      Math.round(255 * (1 - c / 100) * (1 - k / 100)),
      Math.round(255 * (1 - m / 100) * (1 - k / 100)),
      Math.round(255 * (1 - y / 100) * (1 - k / 100)),
    ];
  }

  c = Math.max(0, Math.min(100, c));
  m = Math.max(0, Math.min(100, m));
  y = Math.max(0, Math.min(100, y));
  k = Math.max(0, Math.min(100, k));

  const cf = c / STEP, mf = m / STEP, yf = y / STEP, kf = k / STEP;
  const ci = Math.min(Math.floor(cf), GRID_SIZE - 2);
  const mi2 = Math.min(Math.floor(mf), GRID_SIZE - 2);
  const yi2 = Math.min(Math.floor(yf), GRID_SIZE - 2);
  const ki = Math.min(Math.floor(kf), GRID_SIZE - 2);

  const cd = cf - ci, md = mf - mi2, yd = yf - yi2, kd = kf - ki;

  const result: [number, number, number] = [0, 0, 0];
  for (let ch = 0; ch < 3; ch++) {
    let sum = 0;
    for (let dc = 0; dc <= 1; dc++) {
      for (let dm = 0; dm <= 1; dm++) {
        for (let dy = 0; dy <= 1; dy++) {
          for (let dk = 0; dk <= 1; dk++) {
            const weight =
              (dc ? cd : 1 - cd) *
              (dm ? md : 1 - md) *
              (dy ? yd : 1 - yd) *
              (dk ? kd : 1 - kd);
            const rgb = getGridRGB(ci + dc, mi2 + dm, yi2 + dy, ki + dk);
            sum += weight * rgb[ch];
          }
        }
      }
    }
    result[ch] = Math.round(Math.max(0, Math.min(255, sum)));
  }
  return result;
}

/**
 * Convert CMYK to hex string using ICC LUT
 */
export function cmykToHex(c: number, m: number, y: number, k: number): string {
  const [r, g, b] = cmykToSrgb(c, m, y, k);
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

/**
 * Convert sRGB (0-255) to CMYK (0-100) using FOGRA39 reverse LUT with trilinear interpolation
 */
export function srgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  if (!revLutReady || !revLutData) {
    // Fallback: simple math (inaccurate)
    const rf = r / 255, gf = g / 255, bf = b / 255;
    const kk = 1 - Math.max(rf, gf, bf);
    if (kk === 1) return [0, 0, 0, 100];
    return [
      Math.round((1 - rf - kk) / (1 - kk) * 100),
      Math.round((1 - gf - kk) / (1 - kk) * 100),
      Math.round((1 - bf - kk) / (1 - kk) * 100),
      Math.round(kk * 100)
    ];
  }

  // ICC-based reverse lookup with trilinear interpolation
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  const rf = r / REV_STEP, gf = g / REV_STEP, bf = b / REV_STEP;
  const ri = Math.min(Math.floor(rf), REV_GRID - 2);
  const gi = Math.min(Math.floor(gf), REV_GRID - 2);
  const bi = Math.min(Math.floor(bf), REV_GRID - 2);
  const rd = rf - ri, gd = gf - gi, bd = bf - bi;

  const getIdx = (r2: number, g2: number, b2: number) => (r2 * REV_GRID * REV_GRID + g2 * REV_GRID + b2) * 4;

  const result: [number, number, number, number] = [0, 0, 0, 0];
  for (let ch = 0; ch < 4; ch++) {
    const c000 = revLutData[getIdx(ri, gi, bi) + ch];
    const c100 = revLutData[getIdx(ri + 1, gi, bi) + ch];
    const c010 = revLutData[getIdx(ri, gi + 1, bi) + ch];
    const c110 = revLutData[getIdx(ri + 1, gi + 1, bi) + ch];
    const c001 = revLutData[getIdx(ri, gi, bi + 1) + ch];
    const c101 = revLutData[getIdx(ri + 1, gi, bi + 1) + ch];
    const c011 = revLutData[getIdx(ri, gi + 1, bi + 1) + ch];
    const c111 = revLutData[getIdx(ri + 1, gi + 1, bi + 1) + ch];

    const c00 = c000 * (1 - rd) + c100 * rd;
    const c01 = c001 * (1 - rd) + c101 * rd;
    const c10 = c010 * (1 - rd) + c110 * rd;
    const c11 = c011 * (1 - rd) + c111 * rd;
    const cx0 = c00 * (1 - gd) + c10 * gd;
    const cx1 = c01 * (1 - gd) + c11 * gd;
    result[ch] = Math.round(cx0 * (1 - bd) + cx1 * bd);
  }
  return result;
}

/**
 * Check if forward LUT is loaded and ready
 */
export function isLUTReady(): boolean {
  return lutReady;
}

/**
 * Check if reverse LUT is loaded and ready
 */
export function isReverseLUTReady(): boolean {
  return revLutReady;
}