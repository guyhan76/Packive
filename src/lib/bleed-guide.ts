/**
 * Packive Bleed Guide System v14
 * - Universal outer contour extraction from cut-line paths
 * - Works with any FEFCO dieline type
 * - Merges all cut-line points into a graph, then traces the outer boundary
 */

const DEFAULT_BLEED_MM = 3;

interface BleedConfig {
  scale?: number;
  bleedMm?: number;
  svgMmW?: number;
}

interface Pt {
  x: number;
  y: number;
}

/* ─── extract canvas coordinates from a Fabric path object ─── */

function extractCanvasPts(
  p: any,
  gx: number,
  gy: number,
  gs: number
): Pt[] {
  const allCmds: any[] = p.path || [];
  const cmds = allCmds.filter((cmd: any) => "MLCQ".includes(cmd[0]));
  const rawXs: number[] = [];
  const rawYs: number[] = [];
  cmds.forEach((cmd: any) => {
    if (cmd[0] === "M" || cmd[0] === "L") {
      rawXs.push(cmd[1]);
      rawYs.push(cmd[2]);
    } else if (cmd[0] === "C") {
      rawXs.push(cmd[1], cmd[3], cmd[5]);
      rawYs.push(cmd[2], cmd[4], cmd[6]);
    } else if (cmd[0] === "Q") {
      rawXs.push(cmd[1], cmd[3]);
      rawYs.push(cmd[2], cmd[4]);
    }
  });
  if (rawXs.length === 0) return [];

  const rawCX = (Math.min(...rawXs) + Math.max(...rawXs)) / 2;
  const rawCY = (Math.min(...rawYs) + Math.max(...rawYs)) / 2;

  return cmds
    .map((cmd: any) => {
      let rx: number | undefined;
      let ry: number | undefined;
      if (cmd[0] === "M" || cmd[0] === "L") {
        rx = cmd[1];
        ry = cmd[2];
      } else if (cmd[0] === "C") {
        rx = cmd[5];
        ry = cmd[6];
      } else if (cmd[0] === "Q") {
        rx = cmd[3];
        ry = cmd[4];
      }
      if (rx === undefined || ry === undefined) return null;
      return {
        x: gx + (rx - rawCX) * p.scaleX * gs + p.left * gs,
        y: gy + (ry - rawCY) * p.scaleY * gs + p.top * gs,
      };
    })
    .filter(Boolean) as Pt[];
}

/* ─── merge nearby points ─── */

function mergePoints(allPts: Pt[], tol: number): Pt[] {
  const merged: Pt[] = [];
  for (const p of allPts) {
    const existing = merged.find(
      (m) => Math.abs(m.x - p.x) < tol && Math.abs(m.y - p.y) < tol
    );
    if (!existing) {
      merged.push({ x: p.x, y: p.y });
    }
  }
  return merged;
}

function findMerged(merged: Pt[], p: Pt, tol: number): number {
  for (let i = 0; i < merged.length; i++) {
    if (Math.abs(merged[i].x - p.x) < tol && Math.abs(merged[i].y - p.y) < tol)
      return i;
  }
  return -1;
}

/* ─── build adjacency graph from segments ─── */

interface Edge {
  from: number;
  to: number;
}

function buildGraph(
  segments: Pt[][],
  merged: Pt[],
  tol: number
): Edge[] {
  const edges: Edge[] = [];
  const edgeSet = new Set<string>();

  for (const seg of segments) {
    for (let i = 0; i < seg.length - 1; i++) {
      const fi = findMerged(merged, seg[i], tol);
      const ti = findMerged(merged, seg[i + 1], tol);
      if (fi === -1 || ti === -1 || fi === ti) continue;
      const key1 = `${fi}-${ti}`;
      const key2 = `${ti}-${fi}`;
      if (!edgeSet.has(key1)) {
        edgeSet.add(key1);
        edgeSet.add(key2);
        edges.push({ from: fi, to: ti });
      }
    }
  }
  return edges;
}

/* ─── trace outer boundary using leftmost-turn algorithm ─── */

function traceOuterBoundary(merged: Pt[], edges: Edge[]): Pt[] {
  // build adjacency list
  const adj: Map<number, number[]> = new Map();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    if (!adj.has(e.to)) adj.set(e.to, []);
    adj.get(e.from)!.push(e.to);
    adj.get(e.to)!.push(e.from);
  }

  // start from the topmost-leftmost point
  let startIdx = 0;
  for (let i = 1; i < merged.length; i++) {
    if (
      merged[i].y < merged[startIdx].y ||
      (merged[i].y === merged[startIdx].y && merged[i].x < merged[startIdx].x)
    ) {
      startIdx = i;
    }
  }

  // trace using "always turn right" (clockwise outer boundary)
  const result: number[] = [startIdx];
  // initial direction: coming from above (angle = -PI/2, i.e. pointing down)
  let prevAngle = -Math.PI / 2;
  let current = startIdx;

  for (let iter = 0; iter < 500; iter++) {
    const neighbors = adj.get(current);
    if (!neighbors || neighbors.length === 0) break;

    let bestNext = -1;
    let bestAngleDiff = -Infinity;

    for (const n of neighbors) {
      const dx = merged[n].x - merged[current].x;
      const dy = merged[n].y - merged[current].y;
      const angle = Math.atan2(dy, dx);

      // angle difference: how much we turn right from incoming direction
      // incoming direction is prevAngle + PI (reversed)
      let diff = angle - (prevAngle + Math.PI);
      // normalize to (-PI, PI]
      while (diff <= -Math.PI) diff += 2 * Math.PI;
      while (diff > Math.PI) diff -= 2 * Math.PI;

      if (diff > bestAngleDiff) {
        bestAngleDiff = diff;
        bestNext = n;
      }
    }

    if (bestNext === -1) break;
    if (bestNext === startIdx && result.length > 2) {
      // closed loop
      break;
    }

    // prevent infinite loops
    if (result.length > 3 && result.includes(bestNext) && bestNext !== startIdx) {
      break;
    }

    result.push(bestNext);
    const dx = merged[bestNext].x - merged[current].x;
    const dy = merged[bestNext].y - merged[current].y;
    prevAngle = Math.atan2(dy, dx);
    current = bestNext;
  }

  return result.map((i) => merged[i]);
}

/* ─── simplify polygon: remove collinear points ─── */

function simplifyPolygon(pts: Pt[]): Pt[] {
  if (pts.length < 3) return pts;
  const result: Pt[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    // check if collinear
    const cross =
      (cur.x - prev.x) * (next.y - prev.y) -
      (cur.y - prev.y) * (next.x - prev.x);
    if (Math.abs(cross) > 0.5) {
      result.push(cur);
    }
  }
  return result.length >= 3 ? result : pts;
}

/* ─── polygon offset ─── */

function offsetPolygon(pts: Pt[], dist: number): Pt[] {
  const n = pts.length;
  const edges: { a: Pt; b: Pt }[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dy / len;
    const ny = -dx / len;
    edges.push({
      a: { x: a.x + nx * dist, y: a.y + ny * dist },
      b: { x: b.x + nx * dist, y: b.y + ny * dist },
    });
  }

  function intersect(e1: { a: Pt; b: Pt }, e2: { a: Pt; b: Pt }): Pt {
    const x1 = e1.a.x, y1 = e1.a.y, x2 = e1.b.x, y2 = e1.b.y;
    const x3 = e2.a.x, y3 = e2.a.y, x4 = e2.b.x, y4 = e2.b.y;
    const dn = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(dn) < 0.001)
      return { x: (e1.b.x + e2.a.x) / 2, y: (e1.b.y + e2.a.y) / 2 };
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / dn;
    return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
  }

  const result: Pt[] = [];
  for (let i = 0; i < n; i++) {
    result.push(intersect(edges[(i - 1 + n) % n], edges[i]));
  }
  return result;
}

/* ─── main export ─── */

export async function addBleedGuides(canvas: any, config: BleedConfig) {
  const { Path } = await import("fabric");
  const bleedMm = config.bleedMm ?? DEFAULT_BLEED_MM;
  removeBleedGuides(canvas);

  const g = canvas.getObjects().find(
    (o: any) =>
      o._isDieLine ||
      o._isDieline ||
      o._isGuideLayer ||
      (o.name &&
        (o.name.includes("dieline") || o.name.includes("__dieline")))
  );
  if (!g || !g._objects) {
    console.warn("[BLEED] No dieline group found");
    return null;
  }

  // find cut-line paths (red: 237,28,36)
  const cuts = g._objects.filter(
    (p: any) => p.type === "path" && (p.stroke || "").includes("237,28,36")
  );
  if (cuts.length === 0) {
    console.warn("[BLEED] No cut-line paths found");
    return null;
  }

  const gx = g.left as number;
  const gy = g.top as number;
  const gs = g.scaleX as number;

  // extract all segments as canvas-coordinate point arrays
  const segments: Pt[][] = cuts.map((p: any) => extractCanvasPts(p, gx, gy, gs));

  // collect all points and merge nearby ones
  const allPts = segments.flat();
  const MERGE_TOL = 3.0;
  const merged = mergePoints(allPts, MERGE_TOL);

  // build graph
  const edges = buildGraph(segments, merged, MERGE_TOL);

  // trace outer boundary
  const boundary = traceOuterBoundary(merged, edges);
  if (boundary.length < 3) {
    console.warn("[BLEED] Could not trace outer boundary");
    return null;
  }

  // simplify
  const simplified = simplifyPolygon(boundary);

  // calculate bleed in canvas pixels
  const svgMmW = config.svgMmW || g.width * 0.264583;
  const svgUnitsPerMm = g.width / svgMmW;
  const bleedSvgUnits = bleedMm * svgUnitsPerMm;
  const bleedPx = bleedSvgUnits * gs;

  // offset polygon outward (try both directions, pick the one that expands)
  const tryA = offsetPolygon(simplified, bleedPx);
  const tryB = offsetPolygon(simplified, -bleedPx);
  const topOrigY = Math.min(...simplified.map((p) => p.y));
  const topA = Math.min(...tryA.map((p) => p.y));
  const topB = Math.min(...tryB.map((p) => p.y));
  const bleedPoly = topA < topOrigY ? tryA : topB < topOrigY ? tryB : tryA;

  // build SVG path
  const d = bleedPoly
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    )
    .join(" ") + " Z";

  const bleedPath = new Path(d, {
    fill: "transparent",
    stroke: "#0066ff",
    strokeWidth: 1.5,
    strokeDashArray: [],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    name: "__bleed_guide__",
    // @ts-ignore
    _isBleedGuide: true,
  });

  canvas.add(bleedPath);
  canvas.requestRenderAll();

  console.log(
    `[BLEED] Guide added: ${bleedMm}mm = ${bleedPx.toFixed(1)}px, ` +
    `${simplified.length} contour pts (from ${merged.length} merged, ${allPts.length} raw)`
  );
  return bleedPath;
}

export function removeBleedGuides(canvas: any) {
  const guides = canvas
    .getObjects()
    .filter((o: any) => o._isBleedGuide || o.name === "__bleed_guide__");
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
    bleedBox: [
      -bleedPt, -bleedPt,
      canvasWidth + bleedPt, canvasHeight + bleedPt,
    ],
    artBox: [
      bleedPt, bleedPt,
      canvasWidth - bleedPt, canvasHeight - bleedPt,
    ],
  };
}
