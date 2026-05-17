// snap-engine.ts – canvas-local coordinate snap system
export interface SnapLine {
  type: "v" | "h";   // vertical or horizontal
  pos: number;        // canvas-local coordinate (px)
}

export interface SnapResult {
  x: number;
  y: number;
  lines: SnapLine[];
}

/**
 * Calculate snap for a moving object.
 * All coordinates are in canvas-local space (not screen pixels).
 * @param moving - the Fabric object being dragged
 * @param canvas - the Fabric canvas instance
 * @param threshold - snap distance in canvas-local px (default 8)
 */
export function calcSnap(
  moving: any,
  canvas: any,
  threshold = 8
): SnapResult {
  const zoom = canvas.viewportTransform?.[0] || 1;
  const adjustedThreshold = threshold / zoom;

  // Canvas dimensions in local coordinates
  const cw = canvas.getWidth() / zoom;
  const ch = canvas.getHeight() / zoom;

  // Moving object bounds (local coordinates)
  const ml = moving.left ?? 0;
  const mt = moving.top ?? 0;
  const mw = (moving.width ?? 0) * (moving.scaleX ?? 1);
  const mh = (moving.height ?? 0) * (moving.scaleY ?? 1);
  const mc = ml + mw / 2;  // center x
  const mm = mt + mh / 2;  // center y
  const mr = ml + mw;      // right
  const mb = mt + mh;      // bottom

  // Snap targets: canvas edges + center
  const vTargets: number[] = [0, cw / 2, cw];
  const hTargets: number[] = [0, ch / 2, ch];

  // Add other objects as snap targets
  const objects = canvas.getObjects ? canvas.getObjects() : [];
  for (const obj of objects) {
    if (obj === moving) continue;
    if (obj.excludeFromSnap) continue;
    // Skip special objects
    const name = (obj.name || "").toLowerCase();
    if (name.includes("guide") || name.includes("dieline") || name.includes("bleed") || name.includes("safety")) continue;

    const ol = obj.left ?? 0;
    const ot = obj.top ?? 0;
    const ow = (obj.width ?? 0) * (obj.scaleX ?? 1);
    const oh = (obj.height ?? 0) * (obj.scaleY ?? 1);

    vTargets.push(ol, ol + ow / 2, ol + ow);
    hTargets.push(ot, ot + oh / 2, ot + oh);
  }

  // Find best vertical snap
  let bestV: { dist: number; target: number; edge: string } | null = null;
  const movingVEdges = [
    { pos: ml, edge: "left" },
    { pos: mc, edge: "center" },
    { pos: mr, edge: "right" },
  ];
  for (const ve of movingVEdges) {
    for (const t of vTargets) {
      const d = Math.abs(ve.pos - t);
      if (d < adjustedThreshold && (!bestV || d < bestV.dist)) {
        bestV = { dist: d, target: t, edge: ve.edge };
      }
    }
  }

  // Find best horizontal snap
  let bestH: { dist: number; target: number; edge: string } | null = null;
  const movingHEdges = [
    { pos: mt, edge: "top" },
    { pos: mm, edge: "middle" },
    { pos: mb, edge: "bottom" },
  ];
  for (const he of movingHEdges) {
    for (const t of hTargets) {
      const d = Math.abs(he.pos - t);
      if (d < adjustedThreshold && (!bestH || d < bestH.dist)) {
        bestH = { dist: d, target: t, edge: he.edge };
      }
    }
  }

  // Calculate adjusted position
  let newX = ml;
  let newY = mt;
  const lines: SnapLine[] = [];

  if (bestV) {
    const offset = bestV.edge === "left" ? 0 : bestV.edge === "center" ? mw / 2 : mw;
    newX = bestV.target - offset;
    lines.push({ type: "v", pos: bestV.target });
  }

  if (bestH) {
    const offset = bestH.edge === "top" ? 0 : bestH.edge === "middle" ? mh / 2 : mh;
    newY = bestH.target - offset;
    lines.push({ type: "h", pos: bestH.target });
  }

  return { x: newX, y: newY, lines };
}
