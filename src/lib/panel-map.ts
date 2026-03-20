// --- Panel Map Engine v4 ---
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

function getPathX(o: any): number {
  if (o.path && o.path[0] && o.path[0].length >= 2) return o.path[0][1];
  return 0;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function detectPanels(dielineObjects: any[], pxPerMm: number = 1): PanelMapResult {
  const GREEN = 'rgba(0,166,80,1)';
  const RED = 'rgba(237,28,36,1)';

  const foldLines = dielineObjects.filter((o: any) => o.stroke === GREEN);
  const cutLines = dielineObjects.filter((o: any) => o.stroke === RED);

  // Step 1: 수직 접는선 & 수직 칼선
  const verticalFolds = foldLines.filter((o: any) => (o.width || 0) < 5 && (o.height || 0) > 100);
  const verticalCuts = cutLines.filter((o: any) => (o.path?.length || 0) === 2 && (o.width || 0) < 5 && (o.height || 0) > 500);

  // Step 2: 수평 접는선
  const horizontalFolds = foldLines
    .filter((o: any) => (o.height || 0) < 5 && (o.width || 0) > 100)
    .sort((a: any, b: any) => (a.top || 0) - (b.top || 0));

  // Step 3: 모든 수직 경계선 합치기
  const allVerticals = [...verticalFolds, ...verticalCuts]
    .sort((a: any, b: any) => getPathX(a) - getPathX(b));
  const vSvgX = allVerticals.map((o: any) => getPathX(o));
  const vCanvasLeft = allVerticals.map((o: any) => o.left as number);

  // Step 4: 수평 접는선 top 그룹화
  const hTops = horizontalFolds.map((o: any) => o.top as number);
  const uniqueHTops = [...new Set(hTops.map((t: number) => Math.round(t)))].sort((a, b) => a - b);
  const topBoundary = uniqueHTops.length > 0 ? uniqueHTops[0] : 0;
  const bottomBoundary = uniqueHTops.length > 1 ? uniqueHTops[uniqueHTops.length - 1] : 9999;
  const midY = (topBoundary + bottomBoundary) / 2;

  // 수평 접는선을 상단/하단 그룹으로 분리
  const topHFolds = horizontalFolds.filter((h: any) => (h.top || 0) < midY);
  const botHFolds = horizontalFolds.filter((h: any) => (h.top || 0) > midY);

  // Step 5: 본체 면 생성
  const bodyPanels: Panel[] = [];
  const bodyLabels = ['Front', 'Right', 'Back', 'Left'];

  for (let i = 0; i < vSvgX.length - 1; i++) {
    const svgWidth = vSvgX[i + 1] - vSvgX[i];
    if (svgWidth < 20) continue;
    const canvasLeft = vCanvasLeft[i];
    const canvasRight = vCanvasLeft[i + 1];
    const canvasWidth = canvasRight - canvasLeft;
    const mmW = round2(canvasWidth / pxPerMm);

    // 이 면의 너비와 가장 비슷한 수평 접는선 찾기
    const findBestMatch = (folds: any[]): any => {
      let best = folds[0];
      let bestDiff = Infinity;
      for (const f of folds) {
        const fw = (f.width || 0) * (f.scaleX || 1);
        const diff = Math.abs(fw - canvasWidth);
        if (diff < bestDiff) { bestDiff = diff; best = f; }
      }
      return best;
    };

    const myTopFold = topHFolds.length > 0 ? findBestMatch(topHFolds) : null;
    const myBotFold = botHFolds.length > 0 ? findBestMatch(botHFolds) : null;

    let canvasTop: number;
    let canvasHeight: number;
    if (myTopFold && myBotFold) {
      canvasTop = myTopFold.top || 0;
      canvasHeight = (myBotFold.top || 0) - canvasTop;
    } else {
      const refFold = verticalFolds[0];
      canvasTop = refFold ? (refFold.top || 0) : 0;
      canvasHeight = refFold ? (refFold.height || 0) * (refFold.scaleY || 1) : 0;
    }
    const mmH = round2(canvasHeight / pxPerMm);


    bodyPanels.push({
      label: bodyLabels[bodyPanels.length % 4] || 'Body-' + bodyPanels.length,
      role: 'body',
      left: canvasLeft,
      top: canvasTop,
      width: canvasWidth,
      height: canvasHeight,
      mmWidth: mmW,
      mmHeight: mmH,
    });
  }

  // Step 6: 닫힌 사각형 플랩 (빨간, pathLen >= 4, w > 50, h > 50)
  const closedRects = cutLines
    .filter((o: any) => (o.path?.length || 0) >= 4 && (o.width || 0) > 50 && (o.height || 0) > 50)
    .filter((o: any) => !((o.width || 0) < 200 && (o.height || 0) > 500));

  // Step 7: 플랩 분류
  const topFlaps = closedRects
    .filter((o: any) => (o.top || 0) < topBoundary)
    .sort((a: any, b: any) => (a.left || 0) - (b.left || 0));

  const bottomFlaps = closedRects
    .filter((o: any) => (o.top || 0) > bottomBoundary)
    .sort((a: any, b: any) => (a.left || 0) - (b.left || 0));

  // Step 8: 풀칠 탭
  const glueFlap = cutLines.find((o: any) =>
    (o.path?.length || 0) >= 4 && (o.width || 0) < 200 && (o.height || 0) > 500
  );

  // Step 9: 패널 리스트 조합
  const flapPanels: Panel[] = [];

  if (glueFlap) {
    flapPanels.push({
      label: 'Glue Flap',
      role: 'glue',
      left: glueFlap.left || 0,
      top: glueFlap.top || 0,
      width: (glueFlap.width || 0) * (glueFlap.scaleX || 1),
      height: (glueFlap.height || 0) * (glueFlap.scaleY || 1),
      mmWidth: round2((glueFlap.width || 0) * (glueFlap.scaleX || 1) / pxPerMm),
      mmHeight: round2((glueFlap.height || 0) * (glueFlap.scaleY || 1) / pxPerMm),
    });
  }

  topFlaps.forEach((o: any, i: number) => {
    flapPanels.push({
      label: 'Top-' + (i + 1),
      role: 'flap-top',
      left: o.left || 0,
      top: o.top || 0,
      width: (o.width || 0) * (o.scaleX || 1),
      height: (o.height || 0) * (o.scaleY || 1),
      mmWidth: round2((o.width || 0) * (o.scaleX || 1) / pxPerMm),
      mmHeight: round2((o.height || 0) * (o.scaleY || 1) / pxPerMm),
    });
  });

  bottomFlaps.forEach((o: any, i: number) => {
    flapPanels.push({
      label: 'Bottom-' + (i + 1),
      role: 'flap-bottom',
      left: o.left || 0,
      top: o.top || 0,
      width: (o.width || 0) * (o.scaleX || 1),
      height: (o.height || 0) * (o.scaleY || 1),
      mmWidth: round2((o.width || 0) * (o.scaleX || 1) / pxPerMm),
      mmHeight: round2((o.height || 0) * (o.scaleY || 1) / pxPerMm),
    });
  });

  const allPanels = [...flapPanels.slice(0, 1), ...bodyPanels, ...flapPanels.slice(1)];

  // Step 10: 박스 치수 계산
  const L = bodyPanels.length > 0 ? bodyPanels[0].mmWidth : 0;
  const W = bodyPanels.length > 1 ? bodyPanels[1].mmWidth : 0;
  const H = bodyPanels.length > 0 ? bodyPanels[0].mmHeight : 0;
  const flapDepth = topFlaps.length > 0 ? round2((topFlaps[0].height || 0) * (topFlaps[0].scaleY || 1) / pxPerMm) : 0;

  return {
    panels: allPanels,
    boxType: 'FEFCO-0201',
    dimensions: { L, W, H, flapDepth },
  };
}
