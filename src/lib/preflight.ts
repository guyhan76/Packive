/**
 * Packive Pre-flight Check System
 * - 인쇄 전 오류/경고를 자동 검출
 * - 규칙 기반 (AI 불필요)
 */

export type Severity = "error" | "warning" | "info";

export interface PreflightIssue {
  severity: Severity;
  code: string;
  message: string;
  objectName?: string;
  details?: string;
}

export interface PreflightResult {
  passed: boolean;
  issues: PreflightIssue[];
  summary: { errors: number; warnings: number; info: number };
}

/**
 * 캔버스의 모든 요소를 검사하여 인쇄 이슈를 반환합니다.
 */
export function runPreflight(
  canvas: any,
  options: {
    minDpi?: number;        // 최소 해상도 (기본 300)
    minFontSize?: number;   // 최소 텍스트 크기 pt (기본 6)
    bleedMm?: number;       // 블리드 mm (기본 3)
    scale?: number;         // mm→px 스케일
  } = {}
): PreflightResult {
  const {
    minDpi = 300,
    minFontSize = 6,
    bleedMm = 3,
    scale = 1,
  } = options;

  const issues: PreflightIssue[] = [];
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();

  const objects = canvas.getObjects().filter((o: any) =>
    o.selectable !== false &&
    !o._isGuideLayer &&
    !o._isBleedGuide &&
    !o._isGuide &&
    o.visible !== false
  );

  if (objects.length === 0) {
    issues.push({
      severity: "warning",
      code: "EMPTY_CANVAS",
      message: "Canvas is empty — no printable objects found",
    });
  }

  for (const obj of objects) {
    const name = obj.name || obj.type || "Unknown";

    // 1. 이미지 해상도 체크
    if (obj.type === "image" && obj._element) {
      const el = obj._element;
      const naturalW = el.naturalWidth || el.width || 0;
      const naturalH = el.naturalHeight || el.height || 0;
      const displayW = (obj.width || 0) * (obj.scaleX || 1);
      const displayH = (obj.height || 0) * (obj.scaleY || 1);

      if (naturalW > 0 && displayW > 0) {
        // DPI 계산: (원본 픽셀 / 출력 mm) * 25.4
        const displayMm = displayW / scale;
        const dpi = displayMm > 0 ? (naturalW / displayMm) * 25.4 : 0;

        if (dpi > 0 && dpi < minDpi) {
          issues.push({
            severity: dpi < 150 ? "error" : "warning",
            code: "LOW_DPI",
            message: `Image "${name}" resolution is ${Math.round(dpi)} DPI (minimum: ${minDpi} DPI)`,
            objectName: name,
            details: `Original: ${naturalW}x${naturalH}px, Display: ${displayW.toFixed(0)}x${displayH.toFixed(0)}px`,
          });
        }
      }
    }

    // 2. 텍스트 크기 체크
    if ((obj.type === "i-text" || obj.type === "text" || obj.type === "textbox") && obj.fontSize) {
      const displayFontSize = obj.fontSize * (obj.scaleY || 1);
      // px → pt 변환 (scale 기준)
      const fontSizeMm = displayFontSize / scale;
      const fontSizePt = fontSizeMm * 2.83465;

      if (fontSizePt < minFontSize) {
        issues.push({
          severity: fontSizePt < 4 ? "error" : "warning",
          code: "SMALL_TEXT",
          message: `Text "${(obj.text || "").substring(0, 20)}..." is ${fontSizePt.toFixed(1)}pt (minimum: ${minFontSize}pt)`,
          objectName: name,
          details: `Actual size: ${fontSizeMm.toFixed(2)}mm / ${fontSizePt.toFixed(1)}pt`,
        });
      }
    }

    // 3. 블리드 영역 밖 요소 체크
    const br = obj.getBoundingRect ? obj.getBoundingRect(true) : null;
    if (br) {
      const bleedPx = bleedMm * scale;
      const outsideLeft = br.left < -bleedPx;
      const outsideTop = br.top < -bleedPx;
      const outsideRight = (br.left + br.width) > (cw + bleedPx);
      const outsideBottom = (br.top + br.height) > (ch + bleedPx);

      if (outsideLeft || outsideTop || outsideRight || outsideBottom) {
        issues.push({
          severity: "warning",
          code: "OUTSIDE_BLEED",
          message: `"${name}" extends beyond the bleed area`,
          objectName: name,
        });
      }
    }

    // 4. 안전영역 침범 체크 (텍스트/중요 요소)
    if (br && (obj.type === "i-text" || obj.type === "text" || obj.type === "textbox")) {
      const safePx = 5 * scale;  // 5mm 안전영역
      const insideLeft = br.left < safePx;
      const insideTop = br.top < safePx;
      const insideRight = (br.left + br.width) > (cw - safePx);
      const insideBottom = (br.top + br.height) > (ch - safePx);

      if (insideLeft || insideTop || insideRight || insideBottom) {
        issues.push({
          severity: "warning",
          code: "TEXT_NEAR_EDGE",
          message: `Text "${(obj.text || "").substring(0, 20)}..." is within the safe zone (5mm from trim)`,
          objectName: name,
        });
      }
    }

    // 5. RGB 이미지 경고
    if (obj.type === "image" && !obj._cmykConverted) {
      issues.push({
        severity: "info",
        code: "RGB_IMAGE",
        message: `Image "${name}" is RGB — will be auto-converted to CMYK on export`,
        objectName: name,
      });
    }
  }

  const errors = issues.filter(i => i.severity === "error").length;
  const warnings = issues.filter(i => i.severity === "warning").length;
  const info = issues.filter(i => i.severity === "info").length;

  return {
    passed: errors === 0,
    issues,
    summary: { errors, warnings, info },
  };
}