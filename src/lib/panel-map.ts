// src/lib/panel-map.ts
// Phase 4: Panel Map System - 박스 타입별 패널 자동 감지

export interface Panel {
  id: string;
  name: string;
  nameKo: string;
  x: number;      // mm (칼선 내 좌표)
  y: number;      // mm
  width: number;   // mm
  height: number;  // mm
  role: "front" | "back" | "left" | "right" | "top" | "bottom" | "flap" | "glue";
}

export interface PanelMap {
  boxType: string;
  panels: Panel[];
  totalWidth: number;   // mm
  totalHeight: number;  // mm
  L: number;
  W: number;
  D: number;
}

/**
 * FEFCO-0201: 일반 슬롯형 박스 (Regular Slotted Container)
 * 전개도 구조: [Glue] [W-left] [L-front] [W-right] [L-back]
 *              상단/하단 플랩 포함
 * 
 * SVG 분석 결과:
 * - 패널 순서: L → W → L → W (왼→오)
 * - 상단 Y ≈ 105mm (마진), 높이 ≈ D
 * - 마진: 약 38mm (좌), 약 5mm (상하 차이)
 */
export function generateFEFCO0201(L: number, W: number, D: number, svgMmW?: number, svgMmH?: number): PanelMap {
  // Margins: derive from actual SVG dimensions if available, otherwise use sensible defaults
  const contentW = 20 + W + L + W + L;  // glue + 4 panels
  const flapH0 = Math.min(W / 2, D);
  const contentH = flapH0 + D + flapH0;
  const MARGIN_LEFT = svgMmW ? Math.max(0, (svgMmW - contentW) / 2) : 14;
  const MARGIN_TOP = svgMmH ? Math.max(0, (svgMmH - contentH) / 2) : 11;
  
  // 접착날개 폭 (일반적으로 15~25mm)
  const GLUE_WIDTH = 20;
  
  // 패널 X 시작점 계산
  const glueX = MARGIN_LEFT;
  const panel1X = glueX + GLUE_WIDTH;        // W (left side)
  const panel2X = panel1X + W;                // L (front)
  const panel3X = panel2X + L;                // W (right side)
  const panel4X = panel3X + W;                // L (back)
  
  // 상단/하단 플랩 높이 (보통 W/2 또는 지정값)
  const flapHeight = flapH0;
  
  // 메인 패널 Y
  const mainY = MARGIN_TOP + flapHeight;
  
  const panels: Panel[] = [
    // 접착날개
    {
      id: "glue",
      name: "Glue Flap",
      nameKo: "접착날개",
      x: glueX,
      y: mainY,
      width: GLUE_WIDTH,
      height: D,
      role: "glue"
    },
    {
      id: "front",
      name: "Front (L)",
      nameKo: "정면",
      x: panel2X,
      y: mainY,
      width: L,
      height: D,
      role: "front"
    },
    {
      id: "left",
      name: "Left Side (W)",
      nameKo: "좌측면",
      x: panel1X,
      y: mainY,
      width: W,
      height: D,
      role: "left"
    },
    {
      id: "back",
      name: "Back (L)",
      nameKo: "배면",
      x: panel4X,
      y: mainY,
      width: L,
      height: D,
      role: "back"
    },
    {
      id: "right",
      name: "Right Side (W)",
      nameKo: "우측면",
      x: panel3X,
      y: mainY,
      width: W,
      height: D,
      role: "right"
    },
    {
      id: "top-flap-front",
      name: "Top Flap Front",
      nameKo: "상단플랩 정면",
      x: panel2X,
      y: MARGIN_TOP,
      width: L,
      height: flapHeight,
      role: "flap"
    },
    {
      id: "top-flap-left",
      name: "Top Flap Left",
      nameKo: "상단플랩 좌",
      x: panel1X,
      y: MARGIN_TOP,
      width: W,
      height: flapHeight,
      role: "flap"
    },
    {
      id: "top-flap-back",
      name: "Top Flap Back",
      nameKo: "상단플랩 배면",
      x: panel4X,
      y: MARGIN_TOP,
      width: L,
      height: flapHeight,
      role: "flap"
    },
    {
      id: "top-flap-right",
      name: "Top Flap Right",
      nameKo: "상단플랩 우",
      x: panel3X,
      y: MARGIN_TOP,
      width: W,
      height: flapHeight,
      role: "flap"
    },
    {
      id: "bottom-flap-front",
      name: "Bottom Flap Front",
      nameKo: "하단플랩 정면",
      x: panel2X,
      y: mainY + D,
      width: L,
      height: flapHeight,
      role: "flap"
    },
    {
      id: "bottom-flap-left",
      name: "Bottom Flap Left",
      nameKo: "하단플랩 좌",
      x: panel1X,
      y: mainY + D,
      width: W,
      height: flapHeight,
      role: "flap"
    },
    {
      id: "bottom-flap-back",
      name: "Bottom Flap Back",
      nameKo: "하단플랩 배면",
      x: panel4X,
      y: mainY + D,
      width: L,
      height: flapHeight,
      role: "flap"
    },
    {
      id: "bottom-flap-right",
      name: "Bottom Flap Right",
      nameKo: "하단플랩 우",
      x: panel3X,
      y: mainY + D,
      width: W,
      height: flapHeight,
      role: "flap"
    },
  ];

  const totalWidth = GLUE_WIDTH + W + L + W + L + MARGIN_LEFT * 2;
  const totalHeight = flapHeight + D + flapHeight + MARGIN_TOP * 2;

  return { boxType: "FEFCO-0201", panels, totalWidth, totalHeight, L, W, D };
}

/**
 * 박스 타입에 따라 패널 맵 생성
 */
export function generatePanelMap(boxType: string, L: number, W: number, D: number, svgMmW?: number, svgMmH?: number): PanelMap | null {
  switch (boxType) {
    case "FEFCO-0201":
      return generateFEFCO0201(L, W, D, svgMmW, svgMmH);
    // 추후 추가:
    // case "FEFCO-0215": return generateFEFCO0215(L, W, D);
    // case "ECMA-A20": return generateECMA_A20(L, W, D);
    default:
      console.warn(`[PanelMap] Unknown box type: ${boxType}`);
      return null;
  }
}

/**
 * mm 좌표를 캔버스 px 좌표로 변환
 */
export function panelToCanvas(panel: Panel, pxPerMm: number, offsetX: number = 0, offsetY: number = 0) {
  return {
    left: panel.x * pxPerMm + offsetX,
    top: panel.y * pxPerMm + offsetY,
    width: panel.width * pxPerMm,
    height: panel.height * pxPerMm,
  };
}


/**
 * SVG 칼선에서 수직/수평 경계선을 추출하여 패널 영역 감지
 * EasyPackMaker API가 생성하는 SVG 구조 기반:
 * - transform: matrix(1.333, 0, 0, -1.333, 0, height)
 * - stroke: #000000 (칼선), #444444 (접선)
 * - 명령어: M, V, H, L, C (대문자=절대, 소문자=상대)
 */
export function detectPanelsFromSVG(
  svgString: string,
  boxType: string,
  L: number,
  W: number,
  D: number
): PanelMap | null {
  // 1. viewBox에서 전체 크기 추출
  const vbMatch = svgString.match(/viewBox="([^"]*)"/);
  const widthMatch = svgString.match(/width="([\d.]+)"/);
  const heightMatch = svgString.match(/height="([\d.]+)"/);
  if (!vbMatch) return generatePanelMap(boxType, L, W, D); // fallback

  const vbParts = vbMatch[1].split(/\s+/).map(Number);
  const svgWidth = widthMatch ? parseFloat(widthMatch[1]) : vbParts[2];
  const svgHeight = heightMatch ? parseFloat(heightMatch[1]) : vbParts[3];

  // 2. transform 추출
  const txMatch = svgString.match(/transform="matrix\(([^)]+)\)"/);
  let sx = 1, sy = 1, tx = 0, tyd = 0;
  if (txMatch) {
    const parts = txMatch[1].split(",").map(s => parseFloat(s.trim()));
    if (parts.length >= 6) {
      sx = parts[0]; sy = parts[3]; tx = parts[4]; tyd = parts[5];
    }
  }

  // SVG 단위 → mm 변환 (viewBox 단위 기준)
  // Inkscape PDF→SVG: 1pt = 1/72 inch, 1mm = 72/25.4 pt ≈ 2.8346 pt
  const ptPerMm = 72 / 25.4; // ≈ 2.8346

  // 3. 모든 path의 d 속성과 stroke 색상 추출
  const pathRegex = /d="([^"]*)"/g;
  const styleRegex = /style="([^"]*)"/g;

  // path 블록 단위로 추출 (간단 방식: d와 가장 가까운 style 매칭)
  const dValues: string[] = [];
  const strokeColors: string[] = [];
  
  const lines = svgString.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const dMatch = lines[i].match(/d="([^"]*)"/);
    if (dMatch) {
      dValues.push(dMatch[1]);
      // 근처 줄에서 style 찾기
      let color = "#000000";
      for (let j = Math.max(0, i - 4); j <= Math.min(lines.length - 1, i + 4); j++) {
        const sMatch = lines[j].match(/stroke:#([0-9a-fA-F]+)/);
        if (sMatch) { color = "#" + sMatch[1]; break; }
      }
      strokeColors.push(color);
    }
  }

  // 4. 수직선 X좌표, 수평선 Y좌표 추출 (칼선만 = #000000)
  const verticalXs: number[] = [];
  const horizontalYs: number[] = [];

  for (let i = 0; i < dValues.length; i++) {
    if (strokeColors[i] !== "#000000") continue; // 접선 제외
    
    const d = dValues[i].trim();
    
    // M x,y V y2 패턴 (수직선)
    const mvMatch = d.match(/^M\s*([\d.-]+),([\d.-]+)\s+V\s*([\d.-]+)$/);
    if (mvMatch) {
      const rawX = parseFloat(mvMatch[1]);
      const rawY1 = parseFloat(mvMatch[2]);
      const rawY2 = parseFloat(mvMatch[3]);
      const len = Math.abs(rawY2 - rawY1) / ptPerMm;
      if (len > 50) { // 50mm 이상만 패널 경계
        const mmX = (rawX * sx + tx) / (svgWidth / (svgWidth / sx / ptPerMm));
        verticalXs.push(rawX / ptPerMm);
      }
    }

    // M x,y H x2 패턴 (수평선 - 절대)
    const mhMatch = d.match(/^M\s*([\d.-]+),([\d.-]+)\s+H\s*([\d.-]+)$/);
    if (mhMatch) {
      const rawY = parseFloat(mhMatch[2]);
      const rawX1 = parseFloat(mhMatch[1]);
      const rawX2 = parseFloat(mhMatch[3]);
      const len = Math.abs(rawX2 - rawX1) / ptPerMm;
      if (len > 50) {
        horizontalYs.push(rawY / ptPerMm);
      }
    }
  }

  // 5. 고유값 추출 및 정렬
  const uniqueX = [...new Set(verticalXs.map(x => Math.round(x)))].sort((a, b) => a - b);
  const uniqueY = [...new Set(horizontalYs.map(y => Math.round(y)))].sort((a, b) => a - b);

  console.log("[PanelMap] Detected vertical boundaries (mm):", uniqueX);
  console.log("[PanelMap] Detected horizontal boundaries (mm):", uniqueY);
  console.log("[PanelMap] Expected: L=", L, "W=", W, "D=", D);

  // 6. 감지 실패 시 수학적 계산 fallback
  if (uniqueX.length < 4) {
    console.warn("[PanelMap] Not enough vertical lines detected, using calculated positions");
    return generatePanelMap(boxType, L, W, D);
  }

  // 7. 감지된 경계로 패널 생성
  // FEFCO-0201: 5개 수직선 = 4개 메인 패널 (L, W, L, W)
  // transform 적용된 mm 좌표 사용
  const panels: Panel[] = [];
  const topY = uniqueY.length > 0 ? Math.min(...uniqueY) : 105;
  const panelRoles: Array<{role: Panel["role"], name: string, nameKo: string}> = [
    { role: "front", name: "Front (L)", nameKo: "정면" },
    { role: "left", name: "Left (W)", nameKo: "좌측면" },
    { role: "back", name: "Back (L)", nameKo: "배면" },
    { role: "right", name: "Right (W)", nameKo: "우측면" },
  ];

  for (let i = 0; i < Math.min(uniqueX.length - 1, 4); i++) {
    const pw = uniqueX[i + 1] - uniqueX[i];
    const info = panelRoles[i] || { role: "front" as const, name: `Panel ${i}`, nameKo: `패널${i}` };
    panels.push({
      id: info.role,
      name: info.name,
      nameKo: info.nameKo,
      x: uniqueX[i],
      y: topY,
      width: pw,
      height: D,
      role: info.role,
    });
  }

  return {
    boxType,
    panels,
    totalWidth: uniqueX[uniqueX.length - 1] - uniqueX[0],
    totalHeight: D,
    L, W, D
  };
}
