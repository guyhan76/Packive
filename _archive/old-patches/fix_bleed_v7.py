import json

bleed_code = r'''/**
 * Packive Bleed Guide System v7
 * - Uses actual cut-line bounding path from dieline group
 * - Applies Clipper.js polygon offset for accurate bleed outline
 * - Follows concave/convex shapes (glue tabs, flaps, etc.)
 * - Falls back to simple bbox offset if Clipper unavailable
 */

const DEFAULT_BLEED_MM = 3;

interface BleedConfig {
  scale: number;
  bleedMm?: number;
}

/**
 * Extract green cut-line segments and transform to canvas coordinates
 */
function extractCutSegments(canvas: any): { segments: [number, number][][]; bbox: {left:number;top:number;width:number;height:number} } | null {
  const g = canvas.getObjects().find((o: any) =>
    o._isDieLine || o._isDieline || o._isGuideLayer ||
    (o.name && (o.name.includes('dieline') || o.name.includes('__dieline')))
  );
  if (!g) { console.warn('[BLEED] No dieline group found'); return null; }

  const children = g._objects || [];
  const greenPaths = children.filter((ch: any) =>
    ch.type === 'path' && ch.stroke && ch.stroke.includes('0,166,80')
  );
  if (greenPaths.length === 0) { console.warn('[BLEED] No green cut-lines'); return null; }

  // Group bounding rect for coordinate reference
  const gBound = g.getBoundingRect();

  // Use getBoundingRect approach: transform each child path's endpoints
  // through the group's transformation matrix
  const segments: [number, number][][] = [];

  greenPaths.forEach((p: any) => {
    if (!p.path || p.path.length < 2) return;
    const pts: [number, number][] = [];
    p.path.forEach((cmd: any[]) => {
      if (cmd[0] === 'M' || cmd[0] === 'L' || cmd[0] === 'C') {
        // For M and L: cmd[1], cmd[2]
        // For C (cubic bezier): endpoint is cmd[5], cmd[6]
        if (cmd[0] === 'C') {
          pts.push([cmd[5], cmd[6]]);
        } else {
          pts.push([cmd[1], cmd[2]]);
        }
      }
    });
    if (pts.length >= 2) segments.push(pts);
  });

  // Now transform: path local coords -> group local coords -> canvas coords
  // Each path child has its own left/top/scaleX/scaleY relative to group center
  // But simpler: use the group's calcTransformMatrix and each object's calcTransformMatrix
  const transformedSegments: [number, number][][] = [];

  greenPaths.forEach((p: any, idx: number) => {
    if (!p.path || p.path.length < 2) return;

    // Get the absolute transform matrix of this child
    let matrix: number[];
    try {
      matrix = p.calcTransformMatrix();
    } catch(e) {
      // Fallback: use group transform + child offset
      const gm = g.calcTransformMatrix ? g.calcTransformMatrix() : [1,0,0,1,g.left||0,g.top||0];
      matrix = gm;
    }

    const pts: [number, number][] = [];
    p.path.forEach((cmd: any[]) => {
      let x: number, y: number;
      if (cmd[0] === 'M' || cmd[0] === 'L') {
        x = cmd[1]; y = cmd[2];
      } else if (cmd[0] === 'C') {
        x = cmd[5]; y = cmd[6];
      } else {
        return;
      }

      // Apply transform matrix: [a, b, c, d, e, f]
      // newX = a*x + c*y + e
      // newY = b*x + d*y + f
      const cx = matrix[0] * x + matrix[2] * y + matrix[4];
      const cy = matrix[1] * x + matrix[3] * y + matrix[5];
      pts.push([cx, cy]);
    });

    if (pts.length >= 2) transformedSegments.push(pts);
  });

  console.log(`[BLEED] Extracted ${transformedSegments.length} cut-line segments`);
  return { segments: transformedSegments, bbox: gBound };
}

/**
 * Build connected outline from line segments
 * Connects endpoints that are close together to form a closed polygon
 */
function buildOutlinePolygon(segments: [number, number][][]): [number, number][] {
  if (segments.length === 0) return [];

  // Flatten all unique endpoints
  const allPts: [number, number][] = [];
  segments.forEach(seg => {
    seg.forEach(pt => allPts.push(pt));
  });

  // Find bounding box from all points
  const xs = allPts.map(p => p[0]);
  const ys = allPts.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Build outline by tracing the outermost points
  // Strategy: collect all segment endpoints, then trace the outer boundary
  // using a simplified approach - sort endpoints and connect outer ones

  // For packaging dielines, the cut lines form the outer boundary
  // We need to chain the segments into a closed path

  // Try to chain segments end-to-end
  const TOLERANCE = 2.0; // pixels tolerance for matching endpoints
  const used = new Array(segments.length).fill(false);
  const chain: [number, number][] = [];

  // Start with the leftmost segment
  let startIdx = 0;
  let leftmost = Infinity;
  segments.forEach((seg, i) => {
    const sx = Math.min(seg[0][0], seg[seg.length-1][0]);
    if (sx < leftmost) { leftmost = sx; startIdx = i; }
  });

  // Add first segment
  used[startIdx] = true;
  chain.push(...segments[startIdx]);
  let current = chain[chain.length - 1];

  // Chain remaining segments
  let iterations = 0;
  const maxIter = segments.length * 2;
  while (iterations < maxIter) {
    iterations++;
    let bestIdx = -1;
    let bestDist = Infinity;
    let bestReverse = false;

    for (let i = 0; i < segments.length; i++) {
      if (used[i]) continue;
      const seg = segments[i];
      const startPt = seg[0];
      const endPt = seg[seg.length - 1];

      const distToStart = Math.hypot(current[0] - startPt[0], current[1] - startPt[1]);
      const distToEnd = Math.hypot(current[0] - endPt[0], current[1] - endPt[1]);

      if (distToStart < bestDist) {
        bestDist = distToStart; bestIdx = i; bestReverse = false;
      }
      if (distToEnd < bestDist) {
        bestDist = distToEnd; bestIdx = i; bestReverse = true;
      }
    }

    if (bestIdx === -1 || bestDist > TOLERANCE * 50) break;

    used[bestIdx] = true;
    const seg = bestReverse ? [...segments[bestIdx]].reverse() : segments[bestIdx];
    // Skip first point if it's close to current (avoid duplicates)
    const skipFirst = Math.hypot(current[0] - seg[0][0], current[1] - seg[0][1]) < TOLERANCE;
    chain.push(...(skipFirst ? seg.slice(1) : seg));
    current = chain[chain.length - 1];
  }

  console.log(`[BLEED] Built outline: ${chain.length} points from ${segments.filter((_,i) => used[i]).length}/${segments.length} segments`);
  return chain;
}

/**
 * Offset a polygon using Clipper.js
 */
async function clipperOffset(polygon: [number, number][], offsetPx: number): Promise<[number, number][]> {
  try {
    const ClipperLib = (await import('js-clipper')).default || await import('js-clipper');

    const SCALE = 1000; // Clipper uses integers, scale up for precision
    const path = polygon.map(([x, y]) => ({ X: Math.round(x * SCALE), Y: Math.round(y * SCALE) }));

    const co = new ClipperLib.ClipperOffset();
    co.AddPath(path, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);

    const solution: any[] = [];
    co.Execute(solution, offsetPx * SCALE);

    if (solution.length > 0 && solution[0].length > 0) {
      const result = solution[0].map((pt: any) => [pt.X / SCALE, pt.Y / SCALE] as [number, number]);
      console.log(`[BLEED] Clipper offset: ${polygon.length} → ${result.length} points`);
      return result;
    }
  } catch (e) {
    console.warn('[BLEED] Clipper.js failed, using simple offset:', e);
  }

  // Fallback: simple bbox offset
  return simpleOffset(polygon, offsetPx);
}

/**
 * Simple offset fallback: move each vertex outward from centroid
 */
function simpleOffset(polygon: [number, number][], offsetPx: number): [number, number][] {
  if (polygon.length < 3) return polygon;

  const cx = polygon.reduce((s, p) => s + p[0], 0) / polygon.length;
  const cy = polygon.reduce((s, p) => s + p[1], 0) / polygon.length;

  return polygon.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return [x + (dx / dist) * offsetPx, y + (dy / dist) * offsetPx] as [number, number];
  });
}

/**
 * Convert polygon to SVG path data string
 */
function polygonToPathData(pts: [number, number][]): string {
  if (pts.length < 3) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ') + ' Z';
}

/**
 * Main: Add bleed guides following the actual cut-line shape
 */
export async function addBleedGuides(canvas: any, config: BleedConfig) {
  const { Path, Rect } = await import('fabric');
  const bleedMm = config.bleedMm ?? DEFAULT_BLEED_MM;

  removeBleedGuides(canvas);

  const cutData = extractCutSegments(canvas);

  if (cutData && cutData.segments.length >= 3) {
    // Build outline polygon from chained segments
    const outline = buildOutlinePolygon(cutData.segments);

    if (outline.length >= 3) {
      const bleedPx = bleedMm * config.scale;

      // Offset using Clipper.js
      const offsetPoly = await clipperOffset(outline, bleedPx);

      if (offsetPoly.length >= 3) {
        const pathData = polygonToPathData(offsetPoly);
        const bleedPath = new Path(pathData, {
          fill: 'transparent',
          stroke: '#22c55e',
          strokeWidth: 1.2,
          strokeDashArray: [8, 4],
          selectable: false,
          evented: false,
          excludeFromExport: true,
          name: '__bleed_guide__',
          _isBleedGuide: true,
        });

        canvas.add(bleedPath);
        canvas.requestRenderAll();
        console.log(`[BLEED] Offset bleed guide added: ${bleedMm}mm, ${offsetPoly.length} vertices`);
        return bleedPath;
      }
    }
  }

  // Fallback: bounding box
  console.log('[BLEED] Falling back to bbox rect');
  const bbox = getDielineBBox(canvas);
  if (!bbox) { console.warn('[BLEED] No dieline for bleed'); return null; }

  const bleedPx = bleedMm * config.scale;
  const bleedRect = new Rect({
    left: bbox.left - bleedPx,
    top: bbox.top - bleedPx,
    width: bbox.width + bleedPx * 2,
    height: bbox.height + bleedPx * 2,
    fill: 'transparent',
    stroke: '#22c55e',
    strokeWidth: 1.2,
    strokeDashArray: [8, 4],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    name: '__bleed_guide__',
    _isBleedGuide: true,
  });
  canvas.add(bleedRect);
  canvas.requestRenderAll();
  console.log(`[BLEED] Bbox fallback: ${bleedMm}mm (${bleedPx.toFixed(1)}px)`);
  return bleedRect;
}

function getDielineBBox(canvas: any) {
  const objs = canvas.getObjects().filter((o: any) =>
    o._isDieLine || o._isDieline ||
    (o.name && (o.name.includes('dieline') || o.name.includes('__dieline')))
  );
  if (objs.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  objs.forEach((o: any) => {
    const b = o.getBoundingRect();
    minX = Math.min(minX, b.left); minY = Math.min(minY, b.top);
    maxX = Math.max(maxX, b.left + b.width); maxY = Math.max(maxY, b.top + b.height);
  });
  return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
}

export function removeBleedGuides(canvas: any) {
  const guides = canvas.getObjects().filter(
    (o: any) => o._isBleedGuide || o.name === '__bleed_guide__'
  );
  guides.forEach((g: any) => canvas.remove(g));
  if (guides.length > 0) canvas.requestRenderAll();
}

export function toggleBleedGuides(canvas: any, visible: boolean) {
  canvas.getObjects().forEach((o: any) => {
    if (o._isBleedGuide || o.name === '__bleed_guide__') {
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
'''

with open('src/lib/bleed-guide.ts', 'w', encoding='utf-8') as f:
    f.write(bleed_code)
print(f"bleed-guide.ts v7 written: {len(bleed_code)} bytes")
