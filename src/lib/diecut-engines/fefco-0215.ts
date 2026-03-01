// FEFCO 0215: Tuck Top + Snap Lock Bottom
// High-precision engine — reference-accurate shapes
// Bezier curves + true arcs for Illustrator-grade output

import { MaterialSpec, getGlueFlapWidth, getDustFlapLength, BLEED } from './materials'

export interface BoxDimensions {
  length: number  // L (mm)
  width: number   // W (mm)
  depth: number   // D (mm)
}

export interface ArcData {
  rx: number; ry: number;
  largeArc: boolean; sweep: boolean;
}

export interface BezierData {
  cx1: number; cy1: number;
  cx2: number; cy2: number;
}

export interface Point {
  x: number
  y: number
  arc?: ArcData
  bezier?: BezierData
}

export interface DiecutPath {
  points: Point[]
  type: 'cut' | 'fold'
}

export interface PanelInfo {
  name: string
  x: number
  y: number
  width: number
  height: number
}

export interface DiecutResult {
  paths: DiecutPath[]
  totalWidth: number
  totalHeight: number
  panels: PanelInfo[]
}

export function generateFefco0215(
  dimensions: BoxDimensions,
  material: MaterialSpec
): DiecutResult {
  const { length: L, width: W, depth: D } = dimensions
  const t = material.thickness
  const glueFlap = getGlueFlapWidth(material, L, W)
  const tuck = material.tuckLength
  const dustFlap = getDustFlapLength(W)

  const paths: DiecutPath[] = []
  const panels: PanelInfo[] = []
  const margin = 15

  // ═══════════════════════════════════════
  // X COORDINATES
  // Glue Flap | Panel 1 (L) | Panel 2 (W) | Panel 3 (L) | Panel 4 (W)
  // ═══════════════════════════════════════
  const x0 = margin
  const x1 = x0 + glueFlap
  const x2 = x1 + L + t
  const x3 = x2 + W + t
  const x4 = x3 + L + t
  const x5 = x4 + W

  // ═══════════════════════════════════════
  // Y COORDINATES
  // ═══════════════════════════════════════
  const tuckHeight = tuck
  const tuckInsertHeight = tuck * 0.6
  const dustFlapHeight = dustFlap
  const topMax = Math.max(tuckHeight, dustFlapHeight, tuckInsertHeight)

  const bodyTop = margin + topMax
  const bodyBottom = bodyTop + D

  // Bottom snap lock heights (reference-accurate proportions)
  const snapMainHeight = W * 0.78
  const snapSideHeight = W * 0.65
  const snapClosureHeight = W * 0.72
  const bottomMax = Math.max(snapMainHeight, snapSideHeight, snapClosureHeight)

  // ═══════════════════════════════════════
  // REGISTER PANELS
  // ═══════════════════════════════════════
  panels.push({ name: 'Glue Flap', x: x0, y: bodyTop, width: glueFlap, height: D })
  panels.push({ name: 'Panel 1 (Front)', x: x1, y: bodyTop, width: L, height: D })
  panels.push({ name: 'Panel 2 (Left)', x: x2, y: bodyTop, width: W, height: D })
  panels.push({ name: 'Panel 3 (Back)', x: x3, y: bodyTop, width: L, height: D })
  panels.push({ name: 'Panel 4 (Right)', x: x4, y: bodyTop, width: W, height: D })

  // ═══════════════════════════════════════
  // FOLD LINES (Crease — green dashed)
  // ═══════════════════════════════════════
  // Vertical folds between panels
  ;[x1, x2, x3, x4].forEach(fx => {
    paths.push({
      points: [{ x: fx, y: margin }, { x: fx, y: bodyBottom + bottomMax + 5 }],
      type: 'fold',
    })
  })
  // Horizontal fold: body top
  paths.push({ points: [{ x: x0, y: bodyTop }, { x: x5, y: bodyTop }], type: 'fold' })
  // Horizontal fold: body bottom
  paths.push({ points: [{ x: x0, y: bodyBottom }, { x: x5, y: bodyBottom }], type: 'fold' })

  // ═══════════════════════════════════════
  // CUT LINES — GLUE FLAP (tapered with smooth curves)
  // ═══════════════════════════════════════
  const gTaper = Math.min(12, D * 0.07)
  const gR = Math.min(4, glueFlap * 0.2)

  paths.push({
    points: [
      { x: x1, y: bodyTop },
      { x: x0 + gR, y: bodyTop + gTaper,
        bezier: { cx1: x0 + glueFlap * 0.4, cy1: bodyTop, cx2: x0 + gR, cy2: bodyTop + gTaper * 0.3 } },
      { x: x0, y: bodyTop + gTaper + gR,
        arc: { rx: gR, ry: gR, largeArc: false, sweep: false } },
      { x: x0, y: bodyBottom - gTaper - gR },
      { x: x0 + gR, y: bodyBottom - gTaper,
        arc: { rx: gR, ry: gR, largeArc: false, sweep: false } },
      { x: x1, y: bodyBottom,
        bezier: { cx1: x0 + gR, cy1: bodyBottom - gTaper * 0.3, cx2: x0 + glueFlap * 0.4, cy2: bodyBottom } },
    ],
    type: 'cut',
  })

  // Right edge of Panel 4
  paths.push({
    points: [{ x: x5, y: bodyTop }, { x: x5, y: bodyBottom }],
    type: 'cut',
  })

  // ═══════════════════════════════════════
  // TOP — Panel 1: TUCK FLAP (semicircle thumb cut)
  // ═══════════════════════════════════════
  const tuckY = bodyTop - tuckHeight
  const thumbR = Math.min(L * 0.09, 14)
  const thumbCx = x1 + L / 2
  const tCornerR = Math.min(4, tuckHeight * 0.12)

  paths.push({
    points: [
      { x: x1, y: bodyTop },
      { x: x1, y: tuckY + tCornerR },
      { x: x1 + tCornerR, y: tuckY,
        arc: { rx: tCornerR, ry: tCornerR, largeArc: false, sweep: true } },
      { x: thumbCx - thumbR, y: tuckY },
      // True semicircle thumb cut
      { x: thumbCx + thumbR, y: tuckY,
        arc: { rx: thumbR, ry: thumbR, largeArc: true, sweep: false } },
      { x: x2 - t - tCornerR, y: tuckY },
      { x: x2 - t, y: tuckY + tCornerR,
        arc: { rx: tCornerR, ry: tCornerR, largeArc: false, sweep: true } },
      { x: x2 - t, y: bodyTop },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Tuck Flap', x: x1, y: tuckY, width: L, height: tuckHeight })

  // ═══════════════════════════════════════
  // TOP — Panel 2: DUST FLAP (smooth trapezoid)
  // ═══════════════════════════════════════
  const dfTop = bodyTop - dustFlapHeight
  const dfTaper = Math.min(10, W * 0.12)
  const dfR = Math.min(3, dustFlapHeight * 0.1)

  paths.push({
    points: [
      { x: x2, y: bodyTop },
      { x: x2 + dfTaper, y: dfTop + dfR,
        bezier: { cx1: x2, cy1: bodyTop - dustFlapHeight * 0.5, cx2: x2 + dfTaper * 0.5, cy2: dfTop + dfR * 3 } },
      { x: x2 + dfTaper + dfR, y: dfTop,
        arc: { rx: dfR, ry: dfR, largeArc: false, sweep: true } },
      { x: x3 - t - dfTaper - dfR, y: dfTop },
      { x: x3 - t - dfTaper, y: dfTop + dfR,
        arc: { rx: dfR, ry: dfR, largeArc: false, sweep: true } },
      { x: x3 - t, y: bodyTop,
        bezier: { cx1: x3 - t - dfTaper * 0.5, cy1: dfTop + dfR * 3, cx2: x3 - t, cy2: bodyTop - dustFlapHeight * 0.5 } },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Dust Flap L', x: x2, y: dfTop, width: W, height: dustFlapHeight })

  // ═══════════════════════════════════════
  // TOP — Panel 3: TUCK INSERT (shorter flap)
  // ═══════════════════════════════════════
  const insY = bodyTop - tuckInsertHeight
  const insR = Math.min(3, tuckInsertHeight * 0.1)

  paths.push({
    points: [
      { x: x3, y: bodyTop },
      { x: x3, y: insY + insR },
      { x: x3 + insR, y: insY,
        arc: { rx: insR, ry: insR, largeArc: false, sweep: true } },
      { x: x4 - t - insR, y: insY },
      { x: x4 - t, y: insY + insR,
        arc: { rx: insR, ry: insR, largeArc: false, sweep: true } },
      { x: x4 - t, y: bodyTop },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Tuck Insert', x: x3, y: insY, width: L, height: tuckInsertHeight })

  // ═══════════════════════════════════════
  // TOP — Panel 4: DUST FLAP (mirror of Panel 2)
  // ═══════════════════════════════════════
  paths.push({
    points: [
      { x: x4, y: bodyTop },
      { x: x4 + dfTaper, y: dfTop + dfR,
        bezier: { cx1: x4, cy1: bodyTop - dustFlapHeight * 0.5, cx2: x4 + dfTaper * 0.5, cy2: dfTop + dfR * 3 } },
      { x: x4 + dfTaper + dfR, y: dfTop,
        arc: { rx: dfR, ry: dfR, largeArc: false, sweep: true } },
      { x: x5 - dfTaper - dfR, y: dfTop },
      { x: x5 - dfTaper, y: dfTop + dfR,
        arc: { rx: dfR, ry: dfR, largeArc: false, sweep: true } },
      { x: x5, y: bodyTop,
        bezier: { cx1: x5 - dfTaper * 0.5, cy1: dfTop + dfR * 3, cx2: x5, cy2: bodyTop - dustFlapHeight * 0.5 } },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Dust Flap R', x: x4, y: dfTop, width: W, height: dustFlapHeight })

  // ═══════════════════════════════════════
  // BOTTOM — Panel 1: SNAP MAIN FLAP
  // Reference shape: rectangle with small side locking tabs
  // ═══════════════════════════════════════
  const s1B = bodyBottom + snapMainHeight
  const tabW = Math.min(10, L * 0.07)
  const tabH = Math.min(6, snapMainHeight * 0.08)

  paths.push({
    points: [
      { x: x1, y: bodyBottom },
      // Left edge down
      { x: x1, y: s1B - tabH },
      // Left locking tab (extends left)
      { x: x1 - tabW, y: s1B - tabH },
      { x: x1 - tabW, y: s1B },
      // Bottom edge
      { x: x2 - t + tabW, y: s1B },
      // Right locking tab (extends right)
      { x: x2 - t + tabW, y: s1B - tabH },
      { x: x2 - t, y: s1B - tabH },
      // Right edge up
      { x: x2 - t, y: bodyBottom },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Snap Main', x: x1, y: bodyBottom, width: L, height: snapMainHeight })

  // ═══════════════════════════════════════
  // BOTTOM — Panel 2: SNAP SIDE FLAP (pointed/curved bottom)
  // Reference shape: narrows to a curved point at bottom center
  // ═══════════════════════════════════════
  const s2B = bodyBottom + snapSideHeight
  const s2Curve = W * 0.35

  paths.push({
    points: [
      { x: x2, y: bodyBottom },
      // Left edge down
      { x: x2, y: s2B - s2Curve },
      // Curved bottom converging to center point
      { x: (x2 + x3 - t) / 2, y: s2B,
        bezier: { cx1: x2, cy1: s2B - s2Curve * 0.2, cx2: x2 + W * 0.15, cy2: s2B } },
      // Right side curve back up
      { x: x3 - t, y: s2B - s2Curve,
        bezier: { cx1: x3 - t - W * 0.15, cy1: s2B, cx2: x3 - t, cy2: s2B - s2Curve * 0.2 } },
      // Right edge up
      { x: x3 - t, y: bodyBottom },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Snap Side L', x: x2, y: bodyBottom, width: W, height: snapSideHeight })

  // ═══════════════════════════════════════
  // BOTTOM — Panel 3: SNAP CLOSURE (with locking notches)
  // Reference: has rectangular notch cutouts near bottom corners
  // ═══════════════════════════════════════
  const s3B = bodyBottom + snapClosureHeight
  const nW = Math.min(L * 0.1, 12)  // notch width
  const nH = Math.min(8, snapClosureHeight * 0.12)  // notch height
  const nGap = 4  // gap between notch parts

  paths.push({
    points: [
      { x: x3, y: bodyBottom },
      // Left edge down
      { x: x3, y: s3B },
      // Left notch
      { x: x3 + nW, y: s3B },
      { x: x3 + nW, y: s3B - nH },
      { x: x3 + nW + nGap, y: s3B - nH },
      { x: x3 + nW + nGap, y: s3B },
      // Bottom edge
      { x: x4 - t - nW - nGap, y: s3B },
      // Right notch
      { x: x4 - t - nW - nGap, y: s3B - nH },
      { x: x4 - t - nW, y: s3B - nH },
      { x: x4 - t - nW, y: s3B },
      { x: x4 - t, y: s3B },
      // Right edge up
      { x: x4 - t, y: bodyBottom },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Snap Closure', x: x3, y: bodyBottom, width: L, height: snapClosureHeight })

  // ═══════════════════════════════════════
  // BOTTOM — Panel 4: SNAP SIDE FLAP (mirror of Panel 2)
  // ═══════════════════════════════════════
  const s4B = bodyBottom + snapSideHeight

  paths.push({
    points: [
      { x: x4, y: bodyBottom },
      { x: x4, y: s4B - s2Curve },
      { x: (x4 + x5) / 2, y: s4B,
        bezier: { cx1: x4, cy1: s4B - s2Curve * 0.2, cx2: x4 + W * 0.15, cy2: s4B } },
      { x: x5, y: s4B - s2Curve,
        bezier: { cx1: x5 - W * 0.15, cy1: s4B, cx2: x5, cy2: s4B - s2Curve * 0.2 } },
      { x: x5, y: bodyBottom },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Snap Side R', x: x4, y: bodyBottom, width: W, height: snapSideHeight })

  // ═══════════════════════════════════════
  // TOTAL DIMENSIONS
  // ═══════════════════════════════════════
  const totalWidth = x5 + margin
  const totalHeight = bodyBottom + bottomMax + margin

  return { paths, totalWidth, totalHeight, panels }
}