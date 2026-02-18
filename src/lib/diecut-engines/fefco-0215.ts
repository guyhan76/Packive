// FEFCO 0215: Tuck Top + Snap Lock Bottom
// Reference: https://www.cefbox.com/dielines/foldingBox/snapLockBottom
//
// PANEL ORDER (left to right):
//   Glue Flap | Panel 1 (L) | Panel 2 (W) | Panel 3 (L) | Panel 4 (W)
//
// TOP STRUCTURE:
//   Panel 1 (L): Top Tuck Flap with thumb cut (semicircle)
//   Panel 2 (W): Top Dust Flap (trapezoid)
//   Panel 3 (L): Top Tuck Insert (shorter, folds inside to hold tuck)
//   Panel 4 (W): Top Dust Flap (trapezoid)
//
// BOTTOM STRUCTURE (Snap Lock / 1-2-3 Bottom):
//   Panel 1 (L): Snap Lock Main Flap (largest, folds first)
//   Panel 2 (W): Snap Lock Side Flap (folds second)
//   Panel 3 (L): Snap Lock Closure Flap (with locking tabs, folds last and snaps)
//   Panel 4 (W): Snap Lock Side Flap (folds second)

import { MaterialSpec, getGlueFlapWidth, getDustFlapLength, BLEED } from './materials'

export interface BoxDimensions {
  length: number  // L (mm)
  width: number   // W (mm)
  depth: number   // D (mm)
}

export interface Point {
  x: number
  y: number
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

  // ========================================
  // X COORDINATES (left to right)
  // Glue Flap | Panel 1 (L) | Panel 2 (W) | Panel 3 (L) | Panel 4 (W)
  // ========================================
  const x0 = margin                            // Glue Flap left edge
  const x1 = x0 + glueFlap                     // Panel 1 (L) left = Glue Flap right
  const x2 = x1 + L + t                        // Panel 2 (W) left
  const x3 = x2 + W + t                        // Panel 3 (L) left
  const x4 = x3 + L + t                        // Panel 4 (W) left
  const x5 = x4 + W                            // Panel 4 (W) right

  // ========================================
  // Y COORDINATES (top to bottom)
  // ========================================
  const tuckHeight = tuck                       // Tuck flap height
  const tuckInsertHeight = tuck * 0.6           // Tuck insert (shorter)
  const dustFlapHeight = dustFlap               // Dust flap = W/2

  // The top section height is the max of tuck, dustFlap, tuckInsert
  const topMax = Math.max(tuckHeight, dustFlapHeight, tuckInsertHeight)

  const bodyTop = margin + topMax               // Body top edge
  const bodyBottom = bodyTop + D                // Body bottom edge

  // Bottom snap lock heights
  const snapMainHeight = W * 0.75              // Panel 1 (L) bottom: main flap
  const snapSideHeight = D * 0.5               // Panel 2,4 (W) bottom: side flaps
  const snapClosureHeight = W * 0.70           // Panel 3 (L) bottom: closure with tabs

  const bottomMax = Math.max(snapMainHeight, snapSideHeight, snapClosureHeight)

  // ========================================
  // REGISTER PANELS
  // ========================================
  panels.push({ name: 'Glue Flap', x: x0, y: bodyTop, width: glueFlap, height: D })
  panels.push({ name: 'Panel 1 (L)', x: x1, y: bodyTop, width: L, height: D })
  panels.push({ name: 'Panel 2 (W)', x: x2, y: bodyTop, width: W, height: D })
  panels.push({ name: 'Panel 3 (L)', x: x3, y: bodyTop, width: L, height: D })
  panels.push({ name: 'Panel 4 (W)', x: x4, y: bodyTop, width: W, height: D })

  // ========================================
  // FOLD LINES (blue #0055FF)
  // ========================================

  // Vertical fold lines between panels
  ;[x1, x2, x3, x4].forEach((fx) => {
    paths.push({
      points: [
        { x: fx, y: bodyTop - topMax },
        { x: fx, y: bodyBottom + bottomMax }
      ],
      type: 'fold',
    })
  })

  // Horizontal fold: body top
  paths.push({
    points: [{ x: x0, y: bodyTop }, { x: x5, y: bodyTop }],
    type: 'fold',
  })

  // Horizontal fold: body bottom
  paths.push({
    points: [{ x: x0, y: bodyBottom }, { x: x5, y: bodyBottom }],
    type: 'fold',
  })

  // ========================================
  // CUT LINES (red #FF0000)
  // ========================================

  // --- GLUE FLAP (tapered trapezoid on left) ---
  const glueTaper = Math.min(5, D * 0.03)
  paths.push({
    points: [
      { x: x1, y: bodyTop },
      { x: x0 + 1, y: bodyTop + glueTaper },
      { x: x0, y: bodyTop + glueTaper + 2 },
      { x: x0, y: bodyBottom - glueTaper - 2 },
      { x: x0 + 1, y: bodyBottom - glueTaper },
      { x: x1, y: bodyBottom },
    ],
    type: 'cut',
  })

  // --- RIGHT EDGE of Panel 4 (body) ---
  paths.push({
    points: [{ x: x5, y: bodyTop }, { x: x5, y: bodyBottom }],
    type: 'cut',
  })

  // ========================================
  // TOP - Panel 1 (L): TUCK FLAP with thumb cut
  // ========================================
  const tuckY = bodyTop - tuckHeight
  const thumbR = Math.min(L * 0.08, 12)
  const thumbCx = (x1 + x2) / 2  // center of Panel 1

  paths.push({
    points: [
      { x: x1, y: bodyTop },
      { x: x1, y: tuckY + 3 },
      { x: x1 + 3, y: tuckY },
      // top edge to thumb cut
      { x: thumbCx - thumbR, y: tuckY },
      // semicircle thumb cut (approximated with arc points)
      { x: thumbCx - thumbR * 0.71, y: tuckY - thumbR * 0.71 },
      { x: thumbCx, y: tuckY - thumbR },
      { x: thumbCx + thumbR * 0.71, y: tuckY - thumbR * 0.71 },
      { x: thumbCx + thumbR, y: tuckY },
      // continue top edge
      { x: x2 - t - 3, y: tuckY },
      { x: x2 - t, y: tuckY + 3 },
      { x: x2 - t, y: bodyTop },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Tuck Flap', x: x1, y: tuckY, width: L, height: tuckHeight })

  // ========================================
  // TOP - Panel 2 (W): DUST FLAP (trapezoid)
  // ========================================
  const df2Top = bodyTop - dustFlapHeight
  const dfTaper = Math.min(8, W * 0.08)

  paths.push({
    points: [
      { x: x2, y: bodyTop },
      { x: x2 + dfTaper, y: df2Top },
      { x: x3 - t - dfTaper, y: df2Top },
      { x: x3 - t, y: bodyTop },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Top Dust Flap', x: x2, y: df2Top, width: W, height: dustFlapHeight })

  // ========================================
  // TOP - Panel 3 (L): TUCK INSERT (shorter flap, folds inside)
  // ========================================
  const insertY = bodyTop - tuckInsertHeight

  paths.push({
    points: [
      { x: x3, y: bodyTop },
      { x: x3, y: insertY + 2 },
      { x: x3 + 2, y: insertY },
      { x: x4 - t - 2, y: insertY },
      { x: x4 - t, y: insertY + 2 },
      { x: x4 - t, y: bodyTop },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Tuck Insert', x: x3, y: insertY, width: L, height: tuckInsertHeight })

  // ========================================
  // TOP - Panel 4 (W): DUST FLAP (trapezoid)
  // ========================================
  const df4Top = bodyTop - dustFlapHeight

  paths.push({
    points: [
      { x: x4, y: bodyTop },
      { x: x4 + dfTaper, y: df4Top },
      { x: x5 - dfTaper, y: df4Top },
      { x: x5, y: bodyTop },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Top Dust Flap 2', x: x4, y: df4Top, width: W, height: dustFlapHeight })

  // ========================================
  // BOTTOM - Panel 1 (L): SNAP LOCK MAIN FLAP (folds first, largest)
  // ========================================
  const snap1Bottom = bodyBottom + snapMainHeight
  const snap1TabW = 8
  const snap1TabH = 5

  paths.push({
    points: [
      { x: x1, y: bodyBottom },
      { x: x1, y: snap1Bottom - snap1TabH },
      // left tab notch
      { x: x1 - snap1TabW, y: snap1Bottom - snap1TabH },
      { x: x1 - snap1TabW, y: snap1Bottom },
      { x: x1, y: snap1Bottom },
      // bottom edge
      { x: x2 - t, y: snap1Bottom },
      // right tab notch
      { x: x2 - t, y: snap1Bottom },
      { x: x2 - t + snap1TabW, y: snap1Bottom },
      { x: x2 - t + snap1TabW, y: snap1Bottom - snap1TabH },
      { x: x2 - t, y: snap1Bottom - snap1TabH },
      { x: x2 - t, y: bodyBottom },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Snap Main', x: x1, y: bodyBottom, width: L, height: snapMainHeight })

  // ========================================
  // BOTTOM - Panel 2 (W): SNAP LOCK SIDE FLAP
  // ========================================
  const snap2Bottom = bodyBottom + snapSideHeight
  const snap2Taper = Math.min(10, W * 0.15)

  paths.push({
    points: [
      { x: x2, y: bodyBottom },
      { x: x2, y: snap2Bottom },
      // angled bottom corners
      { x: x2 + snap2Taper, y: snap2Bottom + snap2Taper * 0.5 },
      { x: (x2 + x3 - t) / 2, y: snap2Bottom + snap2Taper * 0.7 },
      { x: x3 - t - snap2Taper, y: snap2Bottom + snap2Taper * 0.5 },
      { x: x3 - t, y: snap2Bottom },
      { x: x3 - t, y: bodyBottom },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Snap Side', x: x2, y: bodyBottom, width: W, height: snapSideHeight })

  // ========================================
  // BOTTOM - Panel 3 (L): SNAP LOCK CLOSURE (with locking notches)
  // ========================================
  const snap3Bottom = bodyBottom + snapClosureHeight
  const notchW = L * 0.12
  const notchH = 6

  paths.push({
    points: [
      { x: x3, y: bodyBottom },
      { x: x3, y: snap3Bottom },
      // left locking notch
      { x: x3 + notchW, y: snap3Bottom },
      { x: x3 + notchW, y: snap3Bottom - notchH },
      { x: x3 + notchW + 4, y: snap3Bottom - notchH },
      { x: x3 + notchW + 4, y: snap3Bottom },
      // bottom edge
      { x: x4 - t - notchW - 4, y: snap3Bottom },
      // right locking notch
      { x: x4 - t - notchW - 4, y: snap3Bottom - notchH },
      { x: x4 - t - notchW, y: snap3Bottom - notchH },
      { x: x4 - t - notchW, y: snap3Bottom },
      { x: x4 - t, y: snap3Bottom },
      { x: x4 - t, y: bodyBottom },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Snap Closure', x: x3, y: bodyBottom, width: L, height: snapClosureHeight })

  // ========================================
  // BOTTOM - Panel 4 (W): SNAP LOCK SIDE FLAP
  // ========================================
  const snap4Bottom = bodyBottom + snapSideHeight
  const snap4Taper = snap2Taper

  paths.push({
    points: [
      { x: x4, y: bodyBottom },
      { x: x4, y: snap4Bottom },
      { x: x4 + snap4Taper, y: snap4Bottom + snap4Taper * 0.5 },
      { x: (x4 + x5) / 2, y: snap4Bottom + snap4Taper * 0.7 },
      { x: x5 - snap4Taper, y: snap4Bottom + snap4Taper * 0.5 },
      { x: x5, y: snap4Bottom },
      { x: x5, y: bodyBottom },
    ],
    type: 'cut',
  })
  panels.push({ name: 'Snap Side 2', x: x4, y: bodyBottom, width: W, height: snapSideHeight })

  // ========================================
  // TOTAL DIMENSIONS
  // ========================================
  const totalWidth = x5 + margin
  const totalHeight = bodyBottom + bottomMax + margin

  return { paths, totalWidth, totalHeight, panels }
}
