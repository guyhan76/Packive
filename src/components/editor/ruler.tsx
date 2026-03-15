// src/components/editor/ruler.tsx
"use client";
import React, { useRef, useEffect, useCallback, useState } from "react";

const RULER_THICK = 22;
const INCH_MM = 25.4;

// ─── Color Palette (Illustrator-inspired) ───
const C = {
  bg: "#2b2b2b",
  bgLight: "#3c3c3c",
  border: "#1a1a1a",
  tick: "#888888",
  tickMajor: "#cccccc",
  label: "#aaaaaa",
  origin: "#ff6b6b",
  cursor: "#4fc3f7",
  guidePreview: "#00e5ff",
  corner: "#2b2b2b",
  cornerText: "#8c8c8c",
  cornerHover: "#3c3c3c",
};

interface RulerProps {
  direction: "horizontal" | "vertical";
  canvasWidth: number;
  canvasHeight: number;
  scale: number;        // px per mm
  zoom: number;         // percentage 100=100%
  scrollLeft: number;
  scrollTop: number;
  pad: number;          // mm (PAD=15)
  unit: "mm" | "inch";
  mouseX?: number;      // client mouse X relative to wrapper
  mouseY?: number;      // client mouse Y relative to wrapper
  onGuideCreate?: (pos: number, dir: "h" | "v") => void;
}

// Adaptive tick spacing: returns [majorStep, minorDivisions]
function getTickSpacing(unit: "mm" | "inch", pxPerMM: number, zoom01: number): [number, number] {
  if (unit === "mm") {
    const pxPer1mm = pxPerMM * zoom01;
    if (pxPer1mm >= 20)  return [5, 5];       // every 5mm, 1mm minor
    if (pxPer1mm >= 8)   return [10, 10];      // every 10mm, 1mm minor
    if (pxPer1mm >= 4)   return [20, 4];       // every 20mm, 5mm minor
    if (pxPer1mm >= 2)   return [50, 5];       // every 50mm, 10mm minor
    if (pxPer1mm >= 0.8) return [100, 10];     // every 100mm, 10mm minor
    return [200, 4];
  } else {
    const pxPerInch = pxPerMM * INCH_MM * zoom01;
    if (pxPerInch >= 400) return [0.25, 4];    // every 1/4", 1/16" minor
    if (pxPerInch >= 200) return [0.5, 4];     // every 1/2", 1/8" minor
    if (pxPerInch >= 100) return [1, 8];       // every 1", 1/8" minor
    if (pxPerInch >= 50)  return [2, 4];       // every 2", 1/2" minor
    if (pxPerInch >= 20)  return [5, 5];       // every 5", 1" minor
    return [10, 5];
  }
}

export default function Ruler({
  direction, canvasWidth, canvasHeight,
  scale, zoom, scrollLeft, scrollTop, pad,
  unit, mouseX, mouseY, onGuideCreate
}: RulerProps) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [dragPos, setDragPos] = useState<number | null>(null); // px position during drag

  const isH = direction === "horizontal";
  const z = zoom / 100;

  // ─── Drawing ───
  const draw = useCallback(() => {
    const el = cvRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = el.width / dpr;
    const H = el.height / dpr;
    const len = isH ? W : H;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const grad = isH
      ? ctx.createLinearGradient(0, 0, 0, RULER_THICK)
      : ctx.createLinearGradient(0, 0, RULER_THICK, 0);
    grad.addColorStop(0, C.bg);
    grad.addColorStop(1, C.bgLight);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Bottom/right border
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (isH) { ctx.moveTo(0, RULER_THICK - 0.5); ctx.lineTo(W, RULER_THICK - 0.5); }
    else     { ctx.moveTo(RULER_THICK - 0.5, 0); ctx.lineTo(RULER_THICK - 0.5, H); }
    ctx.stroke();

    // ─── Tick calculation ───
    const scroll = isH ? scrollLeft : scrollTop;
    const [majorStep, minorDiv] = getTickSpacing(unit, scale, z);
    const minorStep = majorStep / minorDiv;
    const unitScale = unit === "mm" ? scale * z : scale * INCH_MM * z;

    // visible range in unit coords
    const startU = (0 + scroll) / unitScale - (pad / (unit === "mm" ? 1 : INCH_MM));
    const endU = (len + scroll) / unitScale - (pad / (unit === "mm" ? 1 : INCH_MM));
    const firstTick = Math.floor(startU / minorStep) * minorStep;
    const lastTick = Math.ceil(endU / minorStep) * minorStep;

    ctx.font = "500 9px Inter, -apple-system, system-ui, sans-serif";

    for (let u = firstTick; u <= lastTick; u = +(u + minorStep).toFixed(8)) {
      const padU = pad / (unit === "mm" ? 1 : INCH_MM);
      const px = (u + padU) * unitScale - scroll;

      if (px < -20 || px > len + 20) continue;

      // Determine tick type
      const remMajor = Math.abs(u % majorStep);
      const isMajor = remMajor < minorStep * 0.01 || Math.abs(remMajor - majorStep) < minorStep * 0.01;
      const halfStep = majorStep / 2;
      const remHalf = Math.abs(u % halfStep);
      const isMid = !isMajor && (remHalf < minorStep * 0.01 || Math.abs(remHalf - halfStep) < minorStep * 0.01);

      // Tick lengths (Illustrator style: from bottom/right edge)
      let tickLen: number;
      if (isMajor) tickLen = RULER_THICK * 0.7;
      else if (isMid) tickLen = RULER_THICK * 0.42;
      else tickLen = RULER_THICK * 0.2;

      ctx.strokeStyle = isMajor ? C.tickMajor : C.tick;
      ctx.lineWidth = isMajor ? 1 : 0.5;

      // Snap to half pixel for crisp lines
      const snappedPx = Math.round(px * 2) / 2;

      ctx.beginPath();
      if (isH) {
        ctx.moveTo(snappedPx, RULER_THICK);
        ctx.lineTo(snappedPx, RULER_THICK - tickLen);
      } else {
        ctx.moveTo(RULER_THICK, snappedPx);
        ctx.lineTo(RULER_THICK - tickLen, snappedPx);
      }
      ctx.stroke();

      // Labels (major ticks only)
      if (isMajor) {
        let label: string;
        if (unit === "mm") {
          label = String(Math.round(u));
        } else {
          label = u % 1 === 0 ? String(Math.round(u)) : u.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
        }

        ctx.fillStyle = C.label;
        if (isH) {
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(label, snappedPx, RULER_THICK - tickLen - 1);
        } else {
          ctx.save();
          ctx.translate(RULER_THICK - tickLen - 1, snappedPx);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }
      }
    }

    // ─── Origin marker (red triangle) ───
    const originPx = pad * scale * z - scroll;
    if (originPx > -10 && originPx < len + 10) {
      ctx.fillStyle = C.origin;
      ctx.beginPath();
      if (isH) {
        ctx.moveTo(originPx, RULER_THICK);
        ctx.lineTo(originPx - 3, RULER_THICK - 5);
        ctx.lineTo(originPx + 3, RULER_THICK - 5);
      } else {
        ctx.moveTo(RULER_THICK, originPx);
        ctx.lineTo(RULER_THICK - 5, originPx - 3);
        ctx.lineTo(RULER_THICK - 5, originPx + 3);
      }
      ctx.fill();
    }

    // ─── Mouse cursor indicator ───
    const mousePx = isH ? (mouseX ?? -100) : (mouseY ?? -100);
    if (mousePx >= 0 && mousePx <= len) {
      ctx.strokeStyle = C.cursor;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      if (isH) {
        ctx.moveTo(mousePx, 0);
        ctx.lineTo(mousePx, RULER_THICK);
      } else {
        ctx.moveTo(0, mousePx);
        ctx.lineTo(RULER_THICK, mousePx);
      }
      ctx.stroke();
    }

    // ─── Drag preview line ───
    if (dragPos !== null) {
      ctx.strokeStyle = C.guidePreview;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      if (isH) {
        ctx.moveTo(dragPos, 0);
        ctx.lineTo(dragPos, RULER_THICK);
      } else {
        ctx.moveTo(0, dragPos);
        ctx.lineTo(RULER_THICK, dragPos);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Position tooltip
      const padU = pad / (unit === "mm" ? 1 : INCH_MM);
      const unitVal = (dragPos + scroll) / unitScale - padU;
      const tooltipText = unit === "mm"
        ? `${unitVal.toFixed(1)} mm`
        : `${unitVal.toFixed(3)} in`;

      ctx.fillStyle = C.guidePreview;
      ctx.font = "bold 9px Inter, system-ui";
      if (isH) {
        ctx.textAlign = dragPos > len - 60 ? "right" : "left";
        ctx.textBaseline = "bottom";
        ctx.fillText(tooltipText, dragPos + (dragPos > len - 60 ? -4 : 4), RULER_THICK - 2);
      } else {
        ctx.save();
        ctx.translate(2, dragPos + (dragPos > len - 40 ? -4 : 14));
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(tooltipText, 0, 0);
        ctx.restore();
      }
    }
  }, [direction, scale, zoom, scrollLeft, scrollTop, pad, unit, canvasWidth, canvasHeight, mouseX, mouseY, isH, dragPos]);

  // ─── Resize observer ───
  useEffect(() => {
    const wrap = wrapRef.current;
    const el = cvRef.current;
    if (!wrap || !el) return;

    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const rect = wrap.getBoundingClientRect();
      const w = isH ? rect.width : RULER_THICK;
      const h = isH ? RULER_THICK : rect.height;
      el.width = w * dpr;
      el.height = h * dpr;
      el.style.width = w + "px";
      el.style.height = h + "px";
      draw();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw, isH]);

  useEffect(() => { draw(); }, [draw]);

  // ─── Drag to create guide ───
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = true;
    document.body.style.cursor = isH ? "s-resize" : "e-resize";
    const rect = cvRef.current?.getBoundingClientRect();
    if (rect) {
      setDragPos(isH ? e.clientX - rect.left : e.clientY - rect.top);
    }
  }, [isH]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const rect = cvRef.current?.getBoundingClientRect();
      if (rect) {
        setDragPos(isH ? e.clientX - rect.left : e.clientY - rect.top);
      }
    };
    const onUp = (e: MouseEvent) => {
      if (!dragRef.current) return;
      dragRef.current = false;
      document.body.style.cursor = "";
      setDragPos(null);

      const el = cvRef.current;
      if (!el || !onGuideCreate) return;
      const rect = el.getBoundingClientRect();
      const px = isH ? e.clientX - rect.left : e.clientY - rect.top;
      const scroll = isH ? scrollLeft : scrollTop;
      const padMM = pad;
      const mm = (px + scroll) / (scale * z) - padMM;
      // Only create if dragged beyond ruler area
      const outOfRuler = isH ? (e.clientY > rect.bottom) : (e.clientX > rect.right);
      if (outOfRuler) {
        onGuideCreate(Math.round(mm * 100) / 100, isH ? "h" : "v");
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, [isH, scale, z, scrollLeft, scrollTop, pad, onGuideCreate]);

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        ...(isH
          ? { top: 0, left: RULER_THICK, right: 0, height: RULER_THICK }
          : { top: RULER_THICK, left: 0, bottom: 0, width: RULER_THICK }),
        zIndex: 30,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={cvRef}
        onMouseDown={onMouseDown}
        style={{
          display: "block",
          cursor: isH ? "s-resize" : "e-resize",
        }}
      />
    </div>
  );
}

// ─── Corner unit toggle ───
export function RulerCorner({ unit, onToggle }: { unit: "mm" | "inch"; onToggle: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute", top: 0, left: 0,
        width: RULER_THICK, height: RULER_THICK,
        zIndex: 31,
        background: hover ? C.cornerHover : C.corner,
        borderRight: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", userSelect: "none",
        transition: "background 0.15s",
      }}
      title={`Click to switch to ${unit === "mm" ? "inch" : "mm"}`}
    >
      <span style={{
        fontSize: "8px",
        fontWeight: 700,
        color: hover ? "#ffffff" : C.cornerText,
        letterSpacing: "0.3px",
        textTransform: "uppercase",
        transition: "color 0.15s",
      }}>
        {unit}
      </span>
    </div>
  );
}

export { RULER_THICK };