/**
 * Packive Bleed Guide System v5
 * 
 * 실무 인쇄 Bleed 규칙:
 * - 일반 면: 칼선 바깥 3mm 확장
 * - Glue 탭: bleed 제외, 시작점에서 5mm offset
 * - 색상: 초록 실선 (Pacdora 표준)
 * 
 * 현재 Phase 0: 전체 bounding box 기준 bleed
 * Phase 4 이후: Panel Map으로 면별 bleed (glue 탭 5mm 제외)
 */

const DEFAULT_BLEED_MM = 3;

/**
 * 칼선 객체의 bounding box (canvas 좌표계)
 */
function getDielineBBox(canvas: any): { left: number; top: number; width: number; height: number } | null {
  const allObjs = canvas.getObjects();
  const dielineObjs = allObjs.filter((o: any) =>
    o._isDieLine || o._isDieline ||
    (o.name && typeof o.name === 'string' && (o.name.includes('dieline') || o.name.includes('__dieline')))
  );

  if (dielineObjs.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const obj of dielineObjs) {
    if (obj.setCoords) obj.setCoords();

    if (obj.aCoords) {
      const pts = [obj.aCoords.tl, obj.aCoords.tr, obj.aCoords.bl, obj.aCoords.br];
      for (const p of pts) {
        if (!p) continue;
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
    } else {
      const w = (obj.width || 0) * (obj.scaleX || 1);
      const h = (obj.height || 0) * (obj.scaleY || 1);
      const L = obj.left || 0;
      const T = obj.top || 0;
      const ox = obj.originX || 'left';
      const oy = obj.originY || 'top';
      let aL = L, aT = T;
      if (ox === 'center') aL = L - w / 2;
      else if (ox === 'right') aL = L - w;
      if (oy === 'center') aT = T - h / 2;
      else if (oy === 'bottom') aT = T - h;
      minX = Math.min(minX, aL);
      minY = Math.min(minY, aT);
      maxX = Math.max(maxX, aL + w);
      maxY = Math.max(maxY, aT + h);
    }
  }

  if (minX === Infinity) return null;
  return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Bleed 가이드를 추가합니다.
 * 초록색 실선, 칼선 바깥 3mm
 */
export async function addBleedGuides(
  canvas: any,
  config: { scale: number; canvasWidth: number; canvasHeight: number; bleedMm?: number }
): Promise<{ bleedRect: any; safeRect: any; trimRect: any } | null> {
  const { Rect } = await import("fabric");
  const bleedMm = config.bleedMm ?? DEFAULT_BLEED_MM;
  const s = config.scale;

  removeBleedGuides(canvas);

  const bbox = getDielineBBox(canvas);
  if (!bbox) {
    console.warn('[BLEED] No dieline found');
    return null;
  }

  const bleedPx = bleedMm * s;

  // 초록색 실선 bleed (Pacdora 스타일)
  const bleedRect = new Rect({
    left: bbox.left - bleedPx,
    top: bbox.top - bleedPx,
    width: bbox.width + bleedPx * 2,
    height: bbox.height + bleedPx * 2,
    fill: "transparent",
    stroke: "#22c55e",
    strokeWidth: 1,
    strokeDashArray: undefined,
    selectable: false,
    evented: false,
    originX: 'left',
    originY: 'top',
    _isBleedGuide: true,
    _isGuideLayer: true,
    name: `Bleed ${bleedMm}mm`,
  });

  canvas.add(bleedRect);
  canvas.bringObjectToFront(bleedRect);
  canvas.requestRenderAll();

  console.log(`[BLEED] Green solid line added: ${bleedMm}mm (${bleedPx.toFixed(1)}px) outside dieline`);
  return { bleedRect, safeRect: null as any, trimRect: null as any };
}

/**
 * 블리드 가이드 제거
 */
export function removeBleedGuides(canvas: any): void {
  const guides = canvas.getObjects().filter((o: any) => o._isBleedGuide);
  guides.forEach((g: any) => canvas.remove(g));
  if (guides.length > 0) canvas.requestRenderAll();
}

/**
 * 블리드 가이드 토글
 */
export function toggleBleedGuides(canvas: any, visible: boolean): void {
  const guides = canvas.getObjects().filter((o: any) => o._isBleedGuide);
  guides.forEach((g: any) => g.set({ visible }));
  canvas.requestRenderAll();
}

/**
 * PDF BleedBox/TrimBox (pt 단위)
 */
export function calcPdfBoxes(
  canvasWidth: number,
  canvasHeight: number,
  bleedMm: number = DEFAULT_BLEED_MM
): { trimBox: number[]; bleedBox: number[]; artBox: number[] } {
  const bleedPt = bleedMm * 2.83465;
  return {
    trimBox: [0, 0, canvasWidth, canvasHeight],
    bleedBox: [-bleedPt, -bleedPt, canvasWidth + bleedPt, canvasHeight + bleedPt],
    artBox: [0, 0, canvasWidth, canvasHeight],
  };
}