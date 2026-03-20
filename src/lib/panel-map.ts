// --- Panel Map Engine v3 ---
// 칼선 오브젝트에서 패널(면)을 자동 인식하고 라벨링한다.

export interface Panel {
  label: string;
  role: 'body' | 'flap-top' | 'flap-bottom' | 'glue';
  left: number;
  top: number;
  width: number;
  height: number;
  mmWidth: number;
  mmHeight: number;
}

export interface PanelMapResult {
  panels: Panel[];
  boxType: string;
  dimensions: { L: number; W: number; H: number; flapDepth: number };
}

// pxPerMm is passed from the editor (scaleRef.current)

function getPathX(o: any): number {
  if (o.path && o.path[0] && o.path[0].length >= 2) return o.path[0][1];
  return 0;
}

export function detectPanels(dielineObjects: any[], pxPerMm: number = 1): PanelMapResult {
  const GREEN = 'rgba(0,166,80,1)';
  const RED = 'rgba(237,28,36,1)';

  const foldLines = dielineObjects.filter(o => o.stroke === GREEN);
  const cutLines = dielineObjects.filter(o => o.stroke === RED);

  // Step 1: 수직 접는선 (초록, w < 5, h > 100)
  const verticalFolds = foldLines
    .filter(o => (o.width || 0) < 5 && (o.height || 0) > 100)
    .sort((a: any, b: any) => getPathX(a) - getPathX(b));

  // Step 2: 수직 칼선 = 외곽 경계 (빨간, w < 5, h > 500)
  const verticalCuts = cutLines
    .filter(o => (o.width || 0) < 5 && (o.height || 0) > 500)
    .sort((a: any, b: any) => getPathX(a) - getPathX(b));

  // Step 3: 모든 수직 경계선 합치기 (접는선 + 외곽 칼선)
  const allVerticals = [...verticalFolds, ...verticalCuts]
    .sort((a: any, b: any) => getPathX(a) - getPathX(b));

  const vSvgX = allVerticals.map((o: any) => getPathX(o));
  const vCanvasLeft = allVerticals.map((o: any) => o.left as number);

  // Step 4: 본체 높이 (수직 접는선의 SVG Y 범위)
  let bodyTopSvg = Infinity, bodyBottomSvg = 0;
  verticalFolds.forEach((o: any) => {
    if (o.path) {
      o.path.forEach((cmd: any[]) => {
        if (cmd.length >= 3) {
          bodyTopSvg = Math.min(bodyTopSvg, cmd[2]);
          bodyBottomSvg = Math.max(bodyBottomSvg, cmd[2]);
        }
      });
    }
  });
  const bodyHeightSvg = bodyBottomSvg - bodyTopSvg;
  const bodyCanvasH = verticalFolds.length > 0 ? (verticalFolds[0].height || 0) * (verticalFolds[0].scaleY || 1) : 0;
  const bodyHeightMm = Math.round(bodyCanvasH / pxPerMm);

  // Step 5: 본체 면 생성
  const bodyPanels: Panel[] = [];
  const bodyLabels = ['Front', 'Right', 'Back', 'Left'];

  for (let i = 0; i < vSvgX.length - 1; i++) {
    const svgWidth = vSvgX[i + 1] - vSvgX[i];
    if (svgWidth < 20) continue;
    const canvasLeft = vCanvasLeft[i];
    const canvasWidth = vCanvasLeft[i + 1] - vCanvasLeft[i];
    const mmW = Math.round(canvasWidth / pxPerMm);
    const refFold = verticalFolds[0];
    const canvasTop = refFold ? (refFold.top || 0) : 0;
    const canvasHeight = refFold ? (refFold.height || 0) : 0;

    bodyPanels.push({
      label: bodyLabels[bodyPanels.length % 4] || 'Body-' + bodyPanels.length,
      role: 'body',
      left: canvasLeft,
      top: canvasTop,
      width: canvasWidth,
      height: canvasHeight,
      mmWidth: mmW,
      mmHeight: bodyHeightMm,
    });
  }

  // Step 6: 닫힌 사각형 플랩 (빨간, pathLen >= 4, w > 50, h > 50)
  // 풀칠 탭 제외 (w < 200 && h > 500)
  const closedRects = cutLines
    .filter(o => (o.path?.length || 0) >= 4 && (o.width || 0) > 50 && (o.height || 0) > 50)
    .filter(o => !((o.width || 0) < 200 && (o.height || 0) > 500));

  // Step 7: 수평 접는선으로 상단/하단 경계 찾기
  const horizontalFolds = foldLines
    .filter(o => (o.height || 0) < 5 && (o.width || 0) > 100)
    .sort((a: any, b: any) => (a.top || 0) - (b.top || 0));

  // 수평 접는선 top 값들의 중간값으로 상단/하단 경계 구분
  const hTops = horizontalFolds.map((o: any) => o.top as number);
  const uniqueHTops = [...new Set(hTops.map((t: number) => Math.round(t)))].sort((a, b) => a - b);
  // 보통 2개 그룹: 상단 경계(~118~124)와 하단 경계(~388~393)
  const topBoundary = uniqueHTops.length > 0 ? uniqueHTops[0] : 0;
  const bottomBoundary = uniqueHTops.length > 1 ? uniqueHTops[uniqueHTops.length - 1] : 9999;


  // Step 8: 플랩 분류 - 플랩의 top이 상단 경계 위면 top, 하단 경계 아래면 bottom
  const topFlaps = closedRects
    .filter((o: any) => (o.top || 0) < topBoundary)
    .sort((a: any, b: any) => (a.left || 0) - (b.left || 0));

  const bottomFlaps = closedRects
    .filter((o: any) => (o.top || 0) > bottomBoundary)
    .sort((a: any, b: any) => (a.left || 0) - (b.left || 0));

  const flapPanels: Panel[] = [];

  topFlaps.forEach((o: any, i: number) => {
    flapPanels.push({
      label: 'Top-' + (i + 1),
      role: 'flap-top',
      left: o.left || 0,
      top: o.top || 0,
      width: o.width || 0,
      height: o.height || 0,
      mmWidth: Math.round((o.width || 0) * (o.scaleX || 1) / pxPerMm),
      mmHeight: Math.round((o.height || 0) * (o.scaleY || 1) / pxPerMm),
    });
  });

  bottomFlaps.forEach((o: any, i: number) => {
    flapPanels.push({
      label: 'Bottom-' + (i + 1),
      role: 'flap-bottom',
      left: o.left || 0,
      top: o.top || 0,
      width: o.width || 0,
      height: o.height || 0,
      mmWidth: Math.round((o.width || 0) * (o.scaleX || 1) / pxPerMm),
      mmHeight: Math.round((o.height || 0) * (o.scaleY || 1) / pxPerMm),
    });
  });

  // Step 9: 풀칠 탭
  const glueFlap = cutLines.find(o =>
    (o.path?.length || 0) >= 4 && (o.width || 0) > 20 && (o.width || 0) < 200 && (o.height || 0) > 500
  );

  const gluePanels: Panel[] = [];
  if (glueFlap) {
    gluePanels.push({
      label: 'Glue Flap',
      role: 'glue',
      left: glueFlap.left || 0,
      top: glueFlap.top || 0,
      width: glueFlap.width || 0,
      height: glueFlap.height || 0,
      mmWidth: Math.round((glueFlap.width || 0) * (glueFlap.scaleX || 1) / pxPerMm),
      mmHeight: Math.round((glueFlap.height || 0) * (glueFlap.scaleY || 1) / pxPerMm),
    });
  }

  // Step 10: 박스 치수
  const bodyWidths = bodyPanels.map(p => p.mmWidth).sort((a, b) => b - a);
  const L = bodyWidths[0] || 0;
  const W = bodyWidths.length > 1 ? bodyWidths[1] : 0;
  const H = bodyHeightMm;
  const flapDepth = topFlaps.length > 0
    ? Math.round((topFlaps[0].height || 0) * (topFlaps[0].scaleY || 1) / pxPerMm)
    : 0;

  const allPanels = [...gluePanels, ...bodyPanels, ...flapPanels];

  closedRects.forEach((o: any, i: number) => {
    const fc = (o.top || 0) + (o.height || 0) / 2;
  });

  return {
    panels: allPanels,
    boxType: 'FEFCO-0201',
    dimensions: { L, W, H, flapDepth },
  };
}
