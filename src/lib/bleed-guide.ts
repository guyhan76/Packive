/**
 * Packive Bleed Guide System
 * - 칼선(dieline) 기준으로 블리드(3mm) + 안전영역(5mm) 가이드 생성
 * - Fabric.js 캔버스에 시각적 가이드 오버레이
 */

export interface BleedConfig {
  bleedMm: number;      // 블리드 (기본 3mm)
  safeZoneMm: number;   // 안전영역 (기본 5mm)
  scale: number;         // mm → px 변환 스케일
  canvasWidth: number;
  canvasHeight: number;
}

export interface BleedGuideObjects {
  bleedRect: any;       // 블리드 영역 사각형
  safeRect: any;        // 안전영역 사각형
  trimRect: any;        // 트림(칼선) 영역 사각형
}

const DEFAULT_BLEED_MM = 3;
const DEFAULT_SAFE_ZONE_MM = 5;

/**
 * 블리드/안전영역 가이드를 Fabric 캔버스에 추가합니다.
 * 칼선이 캔버스 전체를 기준으로 한다고 가정합니다.
 */
export async function addBleedGuides(
  canvas: any,
  config: Partial<BleedConfig> & { scale: number; canvasWidth: number; canvasHeight: number }
): Promise<BleedGuideObjects | null> {
  const { Rect } = await import("fabric");

  const bleedMm = config.bleedMm ?? DEFAULT_BLEED_MM;
  const safeMm = config.safeZoneMm ?? DEFAULT_SAFE_ZONE_MM;
  const s = config.scale;
  const cw = config.canvasWidth;
  const ch = config.canvasHeight;

  const bleedPx = bleedMm * s;
  const safePx = safeMm * s;

  // 기존 블리드 가이드 제거
  removeBleedGuides(canvas);

  // 블리드 영역 (빨간 점선 — 칼선 바깥 3mm)
  const bleedRect = new Rect({
    left: -bleedPx,
    top: -bleedPx,
    width: cw + bleedPx * 2,
    height: ch + bleedPx * 2,
    fill: "transparent",
    stroke: "#ef4444",
    strokeWidth: 1,
    strokeDashArray: [6, 4],
    selectable: false,
    evented: false,
    _isBleedGuide: true,
    _isGuideLayer: true,
    name: `Bleed ${bleedMm}mm`,
  });

  // 트림 영역 (검은 실선 — 칼선 = 캔버스 경계)
  const trimRect = new Rect({
    left: 0,
    top: 0,
    width: cw,
    height: ch,
    fill: "transparent",
    stroke: "#000000",
    strokeWidth: 0.5,
    selectable: false,
    evented: false,
    _isBleedGuide: true,
    _isTrimLine: true,
    _isGuideLayer: true,
    name: "Trim Line",
  });

  // 안전영역 (파란 점선 — 칼선 안쪽 5mm)
  const safeRect = new Rect({
    left: safePx,
    top: safePx,
    width: cw - safePx * 2,
    height: ch - safePx * 2,
    fill: "transparent",
    stroke: "#3b82f6",
    strokeWidth: 1,
    strokeDashArray: [4, 4],
    selectable: false,
    evented: false,
    _isBleedGuide: true,
    _isSafeZone: true,
    _isGuideLayer: true,
    name: `Safe Zone ${safeMm}mm`,
  });

  canvas.add(bleedRect, trimRect, safeRect);
  // 가이드를 맨 위로
  canvas.bringObjectToFront(bleedRect);
  canvas.bringObjectToFront(trimRect);
  canvas.bringObjectToFront(safeRect);
  canvas.requestRenderAll();

  console.log(`[BLEED] Guides added: bleed=${bleedMm}mm (${bleedPx.toFixed(1)}px), safe=${safeMm}mm (${safePx.toFixed(1)}px)`);

  return { bleedRect, safeRect, trimRect };
}

/**
 * 블리드 가이드를 캔버스에서 제거합니다.
 */
export function removeBleedGuides(canvas: any): void {
  const guides = canvas.getObjects().filter((o: any) => o._isBleedGuide);
  guides.forEach((g: any) => canvas.remove(g));
  if (guides.length > 0) {
    canvas.requestRenderAll();
    console.log("[BLEED] Guides removed:", guides.length);
  }
}

/**
 * 블리드 가이드 표시/숨김을 토글합니다.
 */
export function toggleBleedGuides(canvas: any, visible: boolean): void {
  const guides = canvas.getObjects().filter((o: any) => o._isBleedGuide);
  guides.forEach((g: any) => g.set({ visible }));
  canvas.requestRenderAll();
}

/**
 * PDF 내보내기용 BleedBox/TrimBox 좌표를 계산합니다 (pt 단위).
 */
export function calcPdfBoxes(
  canvasWidth: number,
  canvasHeight: number,
  bleedMm: number = DEFAULT_BLEED_MM
): { trimBox: number[]; bleedBox: number[]; artBox: number[] } {
  // PDF에서는 pt 단위 (1pt = 0.352778mm, 1mm = 2.83465pt)
  const bleedPt = bleedMm * 2.83465;

  // TrimBox = 실제 재단 크기 (캔버스 크기를 pt로)
  const trimBox = [0, 0, canvasWidth, canvasHeight];

  // BleedBox = TrimBox + 블리드 (바깥쪽으로 확장)
  const bleedBox = [
    -bleedPt,
    -bleedPt,
    canvasWidth + bleedPt,
    canvasHeight + bleedPt,
  ];

  // ArtBox = TrimBox와 동일 (또는 안전영역)
  const artBox = [0, 0, canvasWidth, canvasHeight];

  return { trimBox, bleedBox, artBox };
}