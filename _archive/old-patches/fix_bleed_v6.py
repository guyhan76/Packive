import re

# ========== STEP 1: Fix stale canvas reference ==========
with open('src/components/editor/unified-editor.tsx', 'r', encoding='utf-8') as f:
    editor = f.read()

# Add window.__pc update after every canvas operation that may recreate canvas
# Find the dieline load completion section (where _isDieLine is set)
# Insert window.__pc = c; right after canvas operations

# Pattern: after setting _isDieLine on the group
old_dieline_tag = '_isDieLine: true, _isGuideLayer: true'
if old_dieline_tag in editor:
    # Add canvas reference update after dieline is added to canvas
    editor = editor.replace(
        '_isDieLine: true, _isGuideLayer: true',
        '_isDieLine: true, _isGuideLayer: true'
    )
    print("Found _isDieLine tagging location")
else:
    print("WARNING: _isDieLine tag pattern not found")

# Ensure window.__pc is updated in the dieline load callback
# Look for where canvas.add is called after dieline load
lines = editor.split('\n')
new_lines = []
dieline_add_found = False
for i, line in enumerate(lines):
    new_lines.append(line)
    # After canvas.add that involves dieline, update window.__pc
    if 'c.add(' in line and not dieline_add_found:
        # Check surrounding context for dieline
        context = '\n'.join(lines[max(0,i-10):min(len(lines),i+5)])
        if '_isDieLine' in context or '_isDieline' in context or 'dieline' in context.lower():
            new_lines.append('        (window as any).__pc = c; // keep ref fresh after dieline load')
            dieline_add_found = True
            print(f"Added window.__pc refresh at line {i+1}")

if not dieline_add_found:
    # Fallback: add it after any renderAll that follows dieline operations
    new_lines2 = []
    for i, line in enumerate(new_lines):
        new_lines2.append(line)
        if 'c.requestRenderAll()' in line or 'c.renderAll()' in line:
            context = '\n'.join(new_lines[max(0,i-15):min(len(new_lines),i+3)])
            if ('_isDieLine' in context or 'dieline' in context.lower()) and not dieline_add_found:
                new_lines2.append('        (window as any).__pc = c; // keep ref fresh')
                dieline_add_found = True
                print(f"Added window.__pc refresh (fallback) at line {i+1}")
    new_lines = new_lines2

editor = '\n'.join(new_lines)

with open('src/components/editor/unified-editor.tsx', 'w', encoding='utf-8') as f:
    f.write(editor)
print("Editor updated")

# ========== STEP 2: Rewrite bleed-guide.ts for path-based offset ==========
bleed_code = r'''/**
 * Packive Bleed Guide System v6
 * - Extracts actual cut-line paths from dieline group
 * - Generates offset bleed outline following cut-line shape
 * - Falls back to bounding-box rectangle if path extraction fails
 */

const DEFAULT_BLEED_MM = 3;

interface BleedConfig {
  scale: number;      // px per mm
  bleedMm?: number;
}

/**
 * Extract green cut-line points from dieline group
 * Green stroke = rgba(0,166,80,x) = cut line
 * Red stroke = rgba(237,28,36,x) = fold line
 */
function extractCutLinePoints(canvas: any): { points: [number, number][]; group: any } | null {
  const g = canvas.getObjects().find((o: any) =>
    o._isDieLine || o._isDieline || o._isGuideLayer ||
    (o.name && (o.name.includes('dieline') || o.name.includes('__dieline')))
  );

  if (!g) {
    console.warn('[BLEED] No dieline group found');
    return null;
  }

  const children = g._objects || [];
  const greenPaths = children.filter((ch: any) =>
    ch.type === 'path' && ch.stroke && ch.stroke.includes('0,166,80')
  );

  if (greenPaths.length === 0) {
    console.warn('[BLEED] No green cut-line paths found');
    return null;
  }

  // Collect all endpoints from green paths
  const allPts: [number, number][] = [];
  greenPaths.forEach((p: any) => {
    if (p.path) {
      p.path.forEach((cmd: any[]) => {
        if (cmd[0] === 'M' || cmd[0] === 'L') {
          allPts.push([cmd[1], cmd[2]]);
        }
      });
    }
  });

  console.log(`[BLEED] Extracted ${allPts.length} points from ${greenPaths.length} green cut-lines`);
  return { points: allPts, group: g };
}

/**
 * Build convex hull from cut-line points (Graham scan)
 */
function convexHull(points: [number, number][]): [number, number][] {
  if (points.length < 3) return points;

  // Remove duplicates
  const unique = Array.from(new Set(points.map(p => `${p[0].toFixed(2)},${p[1].toFixed(2)}`)))
    .map(s => s.split(',').map(Number) as [number, number]);

  if (unique.length < 3) return unique;

  // Find lowest-leftmost point
  let start = 0;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i][1] > unique[start][1] ||
        (unique[i][1] === unique[start][1] && unique[i][0] < unique[start][0])) {
      start = i;
    }
  }
  [unique[0], unique[start]] = [unique[start], unique[0]];

  const pivot = unique[0];
  unique.sort((a, b) => {
    const cross = (a[0] - pivot[0]) * (b[1] - pivot[1]) - (b[0] - pivot[0]) * (a[1] - pivot[1]);
    if (cross !== 0) return cross > 0 ? -1 : 1;
    const da = (a[0] - pivot[0]) ** 2 + (a[1] - pivot[1]) ** 2;
    const db = (b[0] - pivot[0]) ** 2 + (b[1] - pivot[1]) ** 2;
    return da - db;
  });

  const hull: [number, number][] = [];
  for (const p of unique) {
    while (hull.length >= 2) {
      const a = hull[hull.length - 2];
      const b = hull[hull.length - 1];
      const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
      if (cross <= 0) hull.pop();
      else break;
    }
    hull.push(p);
  }
  return hull;
}

/**
 * Offset a convex polygon outward by a given distance (mm in SVG coords)
 */
function offsetPolygon(hull: [number, number][], offsetPx: number): [number, number][] {
  const n = hull.length;
  if (n < 3) return hull;

  const result: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const prev = hull[(i - 1 + n) % n];
    const curr = hull[i];
    const next = hull[(i + 1) % n];

    // Edge vectors
    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];

    // Outward normals (for convex hull wound CCW, outward is to the left)
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;

    const nx1 = -dy1 / len1;
    const ny1 = dx1 / len1;
    const nx2 = -dy2 / len2;
    const ny2 = dx2 / len2;

    // Average normal at vertex
    let nx = nx1 + nx2;
    let ny = ny1 + ny2;
    const nlen = Math.sqrt(nx * nx + ny * ny) || 1;
    nx /= nlen;
    ny /= nlen;

    // Scale factor to maintain offset distance at corners
    const dot = nx * nx1 + ny * ny1;
    const scale = dot !== 0 ? 1 / dot : 1;

    result.push([
      curr[0] + nx * offsetPx * scale,
      curr[1] + ny * offsetPx * scale
    ]);
  }
  return result;
}

/**
 * Convert hull points to SVG path string
 */
function hullToPathData(hull: [number, number][]): string {
  if (hull.length < 3) return '';
  const parts = hull.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`);
  parts.push('Z');
  return parts.join(' ');
}

/**
 * Add bleed guides following the actual cut-line shape
 */
export async function addBleedGuides(canvas: any, config: BleedConfig) {
  const { Rect, Path, Group } = await import('fabric');
  const bleedMm = config.bleedMm ?? DEFAULT_BLEED_MM;

  // Remove existing bleed guides
  removeBleedGuides(canvas);

  // Try path-based approach first
  const cutData = extractCutLinePoints(canvas);

  if (cutData && cutData.points.length >= 6) {
    const { points, group } = cutData;

    // Get group transform
    const gLeft = group.left || 0;
    const gTop = group.top || 0;
    const gScaleX = group.scaleX || 1;
    const gScaleY = group.scaleY || 1;
    const gWidth = group.width || 0;
    const gHeight = group.height || 0;

    // Transform points from local SVG coords to canvas coords
    const canvasPts: [number, number][] = points.map(([x, y]) => [
      gLeft + (x - gWidth / 2) * gScaleX + (gWidth * gScaleX) / 2,
      gTop + (y - gHeight / 2) * gScaleY + (gHeight * gScaleY) / 2
    ] as [number, number]);

    // Build convex hull
    const hull = convexHull(canvasPts);

    // Calculate offset in canvas pixels
    // bleedMm is in mm, config.scale is px/mm
    const bleedPx = bleedMm * config.scale;

    // Offset hull outward
    const offsetHull = offsetPolygon(hull, bleedPx);

    // Create path
    const pathData = hullToPathData(offsetHull);
    if (pathData) {
      const bleedPath = new Path(pathData, {
        fill: 'transparent',
        stroke: '#22c55e',
        strokeWidth: 1,
        strokeDashArray: [6, 4],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        name: '__bleed_guide__',
        _isBleedGuide: true,
      });
      canvas.add(bleedPath);
      canvas.requestRenderAll();

      console.log(`[BLEED] Path-based bleed guide added: ${bleedMm}mm offset, ${hull.length} vertices, ${offsetHull.length} offset vertices`);
      return bleedPath;
    }
  }

  // Fallback: bounding box rectangle
  console.log('[BLEED] Falling back to bounding-box rectangle');
  const bbox = getDielineBBox(canvas);
  if (!bbox) {
    console.warn('[BLEED] No dieline found for bleed guide');
    return null;
  }

  const bleedPx = bleedMm * config.scale;
  const bleedRect = new Rect({
    left: bbox.left - bleedPx,
    top: bbox.top - bleedPx,
    width: bbox.width + bleedPx * 2,
    height: bbox.height + bleedPx * 2,
    fill: 'transparent',
    stroke: '#22c55e',
    strokeWidth: 1,
    strokeDashArray: [6, 4],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    name: '__bleed_guide__',
    _isBleedGuide: true,
  });
  canvas.add(bleedRect);
  canvas.requestRenderAll();

  console.log(`[BLEED] Rect fallback bleed guide added: ${bleedMm}mm (${bleedPx.toFixed(1)}px)`);
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
    const bound = o.getBoundingRect();
    minX = Math.min(minX, bound.left);
    minY = Math.min(minY, bound.top);
    maxX = Math.max(maxX, bound.left + bound.width);
    maxY = Math.max(maxY, bound.top + bound.height);
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
print(f"bleed-guide.ts rewritten: {len(bleed_code)} bytes")

print("\nDone! Run: npm run build")
