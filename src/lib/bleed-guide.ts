/**
 * Packive Bleed Guide System v11
 * - Uses group position/scale directly (zoom-independent)
 * - No getBoundingRect (affected by viewport transform)
 */

const DEFAULT_BLEED_MM = 3;

interface BleedConfig {
  scale?: number;
  bleedMm?: number;
}

export async function addBleedGuides(canvas: any, config: BleedConfig) {
  const { Rect } = await import("fabric");
  const bleedMm = config.bleedMm ?? DEFAULT_BLEED_MM;
  removeBleedGuides(canvas);

  const g = canvas.getObjects().find((o: any) =>
    o._isDieLine || o._isDieline || o._isGuideLayer ||
    (o.name && (o.name.includes("dieline") || o.name.includes("__dieline")))
  );
  if (!g) { console.warn("[BLEED] No dieline found"); return null; }

  // Calculate dieline bounds in object coordinates (zoom-independent)
  // Group center is at (g.left, g.top)
  // Rendered size = g.width * g.scaleX, g.height * g.scaleY
  const gScaleX = g.scaleX || 1;
  const gScaleY = g.scaleY || 1;
  const renderedW = g.width * gScaleX;
  const renderedH = g.height * gScaleY;

  // Group origin is center by default in Fabric.js
  const dieLeft = g.left - renderedW / 2;
  const dieTop = g.top - renderedH / 2;

  // Calculate bleed in object pixels
  // pxPerMm = renderedW / actualMmWidth
  // We know viewBox to mm conversion: svgMm = viewBox * 0.264583
  // renderedW = g.width * gScaleX where g.width is in SVG units
  // So pxPerMm = renderedW / (g.width * 0.264583)
  const svgMm = config.svgMmW || g.width * 0.264583;
  const pxPerMm = renderedW / svgMm;
  const bleedPx = bleedMm * pxPerMm;

  const bleedRect = new Rect({
    left: dieLeft - bleedPx,
    top: dieTop - bleedPx,
    width: renderedW + bleedPx * 2,
    height: renderedH + bleedPx * 2,
    fill: "transparent",
    stroke: "#ff3333",
    strokeWidth: 1,
    strokeDashArray: [],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    name: "__bleed_guide__",
    _isBleedGuide: true,
  });

  canvas.add(bleedRect);
  canvas.requestRenderAll();
  console.log("[BLEED] Guide added: " + bleedMm + "mm = " + bleedPx.toFixed(1) + "px (pxPerMm=" + pxPerMm.toFixed(4) + ")");
  console.log("[BLEED] Dieline: left=" + dieLeft.toFixed(1) + " top=" + dieTop.toFixed(1) + " w=" + renderedW.toFixed(1) + " h=" + renderedH.toFixed(1));
  return bleedRect;
}

export function removeBleedGuides(canvas: any) {
  const guides = canvas.getObjects().filter(
    (o: any) => o._isBleedGuide || o.name === "__bleed_guide__"
  );
  guides.forEach((g: any) => canvas.remove(g));
  if (guides.length > 0) canvas.requestRenderAll();
}

export function toggleBleedGuides(canvas: any, visible: boolean) {
  canvas.getObjects().forEach((o: any) => {
    if (o._isBleedGuide || o.name === "__bleed_guide__") {
      o.visible = visible;
    }
  });
  canvas.requestRenderAll();
}

export function calcPdfBoxes(
  canvasWidth: number,
  canvasHeight: number,
  bleedMm: number = DEFAULT_BLEED_MM
) {
  const bleedPt = bleedMm * 2.83465;
  return {
    trimBox: [0, 0, canvasWidth, canvasHeight],
    bleedBox: [-bleedPt, -bleedPt, canvasWidth + bleedPt, canvasHeight + bleedPt],
    artBox: [bleedPt, bleedPt, canvasWidth - bleedPt, canvasHeight - bleedPt],
  };
}