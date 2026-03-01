/**
 * Packive CMYK Color Engine
 * ICC-based CMYK to sRGB conversion using FOGRA39 LUT
 * 
 * Architecture:
 * - Precomputed 4D LUT from FOGRA39 ICC profile (21^4 = 194,481 entries)
 * - Runtime tetrahedral interpolation for arbitrary CMYK values
 * - All color data stored as CMYK (original), RGB is derived for display
 * 
 * License: Packive proprietary (math algorithms, no third-party code)
 */

// LUT data: loaded from /fogra39-lut.bin (0.6MB)
let lutData: Uint8Array | null = null;
let lutReady = false;
const GRID_SIZE = 21; // 0,5,10,...,100 = 21 steps
const STEP = 5;       // 5% per grid step

/**
 * Load the FOGRA39 LUT binary file
 * Call once at app startup
 */
export async function loadFOGRA39LUT(): Promise<void> {
  if (lutReady) return;
  try {
    const res = await fetch("/fogra39-lut.bin");
    const buf = await res.arrayBuffer();
    const arr = new Uint8Array(buf);
    // First byte is grid size, rest is RGB data
    const gridSize = arr[0];
    if (gridSize !== GRID_SIZE) {
      console.warn(`LUT grid size mismatch: expected ${GRID_SIZE}, got ${gridSize}`);
    }
    lutData = arr.slice(1);
    lutReady = true;
    console.log(`FOGRA39 LUT loaded: ${lutData.length} bytes, grid ${gridSize}^4`);
  } catch (e) {
    console.error("Failed to load FOGRA39 LUT:", e);
  }
}

/**
 * Get RGB value at a specific grid point
 * c,m,y,k are grid indices (0-20)
 */
function lutLookup(ci: number, mi: number, yi: number, ki: number): [number, number, number] {
  if (!lutData) return [0, 0, 0];
  const idx = ((ci * GRID_SIZE + mi) * GRID_SIZE + yi) * GRID_SIZE + ki;
  const offset = idx * 3;
  return [lutData[offset], lutData[offset + 1], lutData[offset + 2]];
}

/**
 * Trilinear interpolation helper for 3 values
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Convert CMYK (0-100) to sRGB (0-255) using FOGRA39 ICC LUT
 * Uses quadrilinear (4D linear) interpolation
 */
export function cmykToSrgb(c: number, m: number, y: number, k: number): [number, number, number] {
  if (!lutReady || !lutData) {
    // Fallback: simple math conversion (inaccurate but functional)
    return [
      Math.round(255 * (1 - c / 100) * (1 - k / 100)),
      Math.round(255 * (1 - m / 100) * (1 - k / 100)),
      Math.round(255 * (1 - y / 100) * (1 - k / 100)),
    ];
  }

  // Clamp to 0-100
  c = Math.max(0, Math.min(100, c));
  m = Math.max(0, Math.min(100, m));
  y = Math.max(0, Math.min(100, y));
  k = Math.max(0, Math.min(100, k));

  // Find grid cell and fractional position
  const cf = c / STEP, mf = m / STEP, yf = y / STEP, kf = k / STEP;
  const ci = Math.min(Math.floor(cf), GRID_SIZE - 2);
  const mi = Math.min(Math.floor(mf), GRID_SIZE - 2);
  const yi = Math.min(Math.floor(yf), GRID_SIZE - 2);
  const ki = Math.min(Math.floor(kf), GRID_SIZE - 2);
  const ct = cf - ci, mt = mf - mi, yt = yf - yi, kt = kf - ki;

  // 4D linear interpolation (16 lookups, 15 lerps)
  const result: [number, number, number] = [0, 0, 0];
  for (let ch = 0; ch < 3; ch++) {
    // Interpolate along K axis (8 pairs -> 8 values)
    const v0000 = lerp(lutLookup(ci, mi, yi, ki)[ch], lutLookup(ci, mi, yi, ki + 1)[ch], kt);
    const v0001 = lerp(lutLookup(ci, mi, yi + 1, ki)[ch], lutLookup(ci, mi, yi + 1, ki + 1)[ch], kt);
    const v0010 = lerp(lutLookup(ci, mi + 1, yi, ki)[ch], lutLookup(ci, mi + 1, yi, ki + 1)[ch], kt);
    const v0011 = lerp(lutLookup(ci, mi + 1, yi + 1, ki)[ch], lutLookup(ci, mi + 1, yi + 1, ki + 1)[ch], kt);
    const v0100 = lerp(lutLookup(ci + 1, mi, yi, ki)[ch], lutLookup(ci + 1, mi, yi, ki + 1)[ch], kt);
    const v0101 = lerp(lutLookup(ci + 1, mi, yi + 1, ki)[ch], lutLookup(ci + 1, mi, yi + 1, ki + 1)[ch], kt);
    const v0110 = lerp(lutLookup(ci + 1, mi + 1, yi, ki)[ch], lutLookup(ci + 1, mi + 1, yi, ki + 1)[ch], kt);
    const v0111 = lerp(lutLookup(ci + 1, mi + 1, yi + 1, ki)[ch], lutLookup(ci + 1, mi + 1, yi + 1, ki + 1)[ch], kt);

    // Interpolate along Y axis (4 pairs -> 4 values)
    const v000 = lerp(v0000, v0001, yt);
    const v001 = lerp(v0010, v0011, yt);
    const v010 = lerp(v0100, v0101, yt);
    const v011 = lerp(v0110, v0111, yt);

    // Interpolate along M axis (2 pairs -> 2 values)
    const v00 = lerp(v000, v001, mt);
    const v01 = lerp(v010, v011, mt);

    // Interpolate along C axis (1 pair -> 1 value)
    result[ch] = Math.round(lerp(v00, v01, ct));
  }

  return [
    Math.max(0, Math.min(255, result[0])),
    Math.max(0, Math.min(255, result[1])),
    Math.max(0, Math.min(255, result[2])),
  ];
}

/**
 * Convert CMYK to HEX string for CSS/Canvas display
 */
export function cmykToHex(c: number, m: number, y: number, k: number): string {
  const [r, g, b] = cmykToSrgb(c, m, y, k);
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

/**
 * Convert sRGB to approximate CMYK using reverse lookup
 * Note: This is approximate since sRGB->CMYK is not unique
 * For user color picker: pick in sRGB, get approximate CMYK
 */
export function srgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  // Simple reverse calculation (not ICC-based, but good enough for picker)
  r = r / 255; g = g / 255; b = b / 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  const c = Math.round((1 - r - k) / (1 - k) * 100);
  const m = Math.round((1 - g - k) / (1 - k) * 100);
  const y = Math.round((1 - b - k) / (1 - k) * 100);
  return [c, m, Math.round(y), Math.round(k * 100)];
}

/**
 * Check if LUT is loaded and ready
 */
export function isLUTReady(): boolean {
  return lutReady;
}