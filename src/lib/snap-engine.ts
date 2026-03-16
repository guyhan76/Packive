/**
 * Packive Snap Engine
 * - 요소 이동 시 가이드, 다른 요소 모서리/중앙에 스냅
 * - 스냅 라인 시각화 데이터 반환
 */

export interface SnapLine {
  type: "h" | "v";
  pos: number;       // canvas px
  label?: string;
}

export interface SnapResult {
  x: number;
  y: number;
  lines: SnapLine[];
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

function getBounds(obj: any): Bounds {
  const br = obj.getBoundingRect(true);
  return {
    left: br.left,
    top: br.top,
    right: br.left + br.width,
    bottom: br.top + br.height,
    centerX: br.left + br.width / 2,
    centerY: br.top + br.height / 2,
  };
}

/**
 * 캔버스 위의 모든 스냅 대상(다른 요소 + 가이드 + 캔버스 경계)을 수집하여
 * 이동 중인 요소의 최적 위치를 반환합니다.
 *
 * @param moving   이동 중인 Fabric 객체
 * @param canvas   Fabric canvas 인스턴스
 * @param threshold 스냅 감지 거리 (px)
 * @returns SnapResult { x, y, lines }
 */
export function calcSnap(
  moving: any,
  canvas: any,
  threshold: number = 8
): SnapResult {
  const lines: SnapLine[] = [];
  const mb = getBounds(moving);
  let dx = 0;
  let dy = 0;

  // 스냅 대상 좌표 수집
  const hTargets: number[] = [];  // 수평 (y 좌표)
  const vTargets: number[] = [];  // 수직 (x 좌표)

  // 1. 캔버스 경계
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();
  vTargets.push(0, cw / 2, cw);
  hTargets.push(0, ch / 2, ch);

  // 2. 다른 요소들의 모서리/중앙
  const objects = canvas.getObjects().filter((o: any) =>
    o !== moving &&
    o.selectable !== false &&
    !o._isGuideLayer &&
    !o._isGuide &&
    o.visible !== false
  );

  for (const obj of objects) {
    const b = getBounds(obj);
    vTargets.push(b.left, b.centerX, b.right);
    hTargets.push(b.top, b.centerY, b.bottom);
  }

  // 3. 사용자 가이드 라인
  const guides = canvas.getObjects().filter((o: any) => o._isGuide);
  for (const g of guides) {
    if (g._guideDir === "h") {
      hTargets.push(g.top || g.y1 || 0);
    } else {
      vTargets.push(g.left || g.x1 || 0);
    }
  }

  // 수직 스냅 (x축)
  const movingVPoints = [mb.left, mb.centerX, mb.right];
  let bestVDist = threshold + 1;
  let bestVDx = 0;
  let bestVLine = 0;

  for (const mp of movingVPoints) {
    for (const tp of vTargets) {
      const dist = Math.abs(mp - tp);
      if (dist < bestVDist) {
        bestVDist = dist;
        bestVDx = tp - mp;
        bestVLine = tp;
      }
    }
  }

  if (bestVDist <= threshold) {
    dx = bestVDx;
    lines.push({ type: "v", pos: bestVLine });
  }

  // 수평 스냅 (y축)
  const movingHPoints = [mb.top, mb.centerY, mb.bottom];
  let bestHDist = threshold + 1;
  let bestHDy = 0;
  let bestHLine = 0;

  for (const mp of movingHPoints) {
    for (const tp of hTargets) {
      const dist = Math.abs(mp - tp);
      if (dist < bestHDist) {
        bestHDist = dist;
        bestHDy = tp - mp;
        bestHLine = tp;
      }
    }
  }

  if (bestHDist <= threshold) {
    dy = bestHDy;
    lines.push({ type: "h", pos: bestHLine });
  }

  return {
    x: (moving.left || 0) + dx,
    y: (moving.top || 0) + dy,
    lines,
  };
}