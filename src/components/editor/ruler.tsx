// src/components/editor/ruler.tsx
"use client";
import React, { useRef, useEffect, useCallback } from "react";

interface RulerProps {
  direction: "horizontal" | "vertical";
  canvasWidth: number;   // px
  canvasHeight: number;  // px
  scale: number;         // px per mm
  zoom: number;          // percentage (100 = 100%)
  scrollLeft: number;    // wrapper scroll offset
  scrollTop: number;
  pad: number;           // mm padding (PAD=15)
  unit: "mm" | "inch";
  onGuideCreate?: (position: number, direction: "h" | "v") => void;
}

const RULER_SIZE = 24; // px width/height of ruler bar
const INCH_TO_MM = 25.4;

export default function Ruler({
  direction, canvasWidth, canvasHeight,
  scale, zoom, scrollLeft, scrollTop, pad,
  unit, onGuideCreate
}: RulerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);

  const draw = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const isH = direction === "horizontal";
    const length = isH ? el.width / dpr : el.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, el.width / dpr, el.height / dpr);

    // Background
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, isH ? length : RULER_SIZE, isH ? RULER_SIZE : length);

    // Border
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 0.5;
    if (isH) {
      ctx.beginPath(); ctx.moveTo(0, RULER_SIZE - 0.5); ctx.lineTo(length, RULER_SIZE - 0.5); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(RULER_SIZE - 0.5, 0); ctx.lineTo(RULER_SIZE - 0.5, length); ctx.stroke();
    }

    const z = zoom / 100;
    const scroll = isH ? scrollLeft : scrollTop;
    const pxPerUnit = unit === "mm" ? scale * z : scale * INCH_TO_MM * z;
    const unitLabel = unit === "mm" ? "mm" : "in";

    // Determine tick spacing based on zoom level
    let majorStep: number;  // in unit (mm or inch)
    let minorDiv: number;   // subdivisions per major

    if (unit === "mm") {
      const pxPer10mm = 10 * scale * z;
      if (pxPer10mm > 200) { majorStep = 5; minorDiv = 5; }
      else if (pxPer10mm > 80) { majorStep = 10; minorDiv = 10; }
      else if (pxPer10mm > 40) { majorStep = 20; minorDiv = 4; }
      else if (pxPer10mm > 20) { majorStep = 50; minorDiv = 5; }
      else { majorStep = 100; minorDiv = 10; }
    } else {
      const pxPerInch = INCH_TO_MM * scale * z;
      if (pxPerInch > 300) { majorStep = 0.5; minorDiv = 5; }
      else if (pxPerInch > 120) { majorStep = 1; minorDiv = 8; }
      else if (pxPerInch > 60) { majorStep = 2; minorDiv = 4; }
      else { majorStep = 5; minorDiv = 5; }
    }

    const minorStep = majorStep / minorDiv;

    // Calculate visible range in mm/inch
    // Canvas coordinate = (mm + pad) * scale * zoom - scroll
    // So: mm = (canvasPx + scroll) / (scale * zoom) - pad
    const startUnit = -scroll / (scale * z) - pad;
    const endUnit = (length - scroll) / (scale * z) - pad + (isH ? 0 : 0);

    // Round to nearest minor step
    const firstTick = Math.floor(startUnit / minorStep) * minorStep;
    const lastTick = Math.ceil(endUnit / minorStep) * minorStep;

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "9px Inter, system-ui, sans-serif";

    for (let u = firstTick; u <= lastTick; u += minorStep) {
      // Convert unit to canvas pixel position
      const px = (u + pad) * scale * z - scroll;

      if (px < -10 || px > length + 10) continue;

      const isMajor = Math.abs(u % majorStep) < minorStep * 0.01 ||
                      Math.abs(u % majorStep - majorStep) < minorStep * 0.01;
      const isMid = !isMajor && (Math.abs(u % (majorStep / 2)) < minorStep * 0.01);

      let tickLen: number;
      if (isMajor) tickLen = RULER_SIZE * 0.65;
      else if (isMid) tickLen = RULER_SIZE * 0.4;
      else tickLen = RULER_SIZE * 0.22;

      ctx.strokeStyle = isMajor ? "#374151" : "#9ca3af";
      ctx.lineWidth = isMajor ? 0.8 : 0.5;
      ctx.beginPath();

      if (isH) {
        ctx.moveTo(px, RULER_SIZE - tickLen);
        ctx.lineTo(px, RULER_SIZE);
      } else {
        ctx.moveTo(RULER_SIZE - tickLen, px);
        ctx.lineTo(RULER_SIZE, px);
      }
      ctx.stroke();

      // Label on major ticks
      if (isMajor && tickLen > RULER_SIZE * 0.5) {
        const label = unit === "mm"
          ? String(Math.round(u))
          : u.toFixed(u % 1 === 0 ? 0 : 1);

        ctx.fillStyle = "#374151";
        if (isH) {
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(label, px, 2);
        } else {
          ctx.save();
          ctx.translate(2, px);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }
      }
    }

    // Zero origin marker
    const zeroPx = pad * scale * z - scroll;
    if (zeroPx > 0 && zeroPx < length) {
      ctx.fillStyle = "#ef4444";
      if (isH) {
        ctx.fillRect(zeroPx - 0.5, RULER_SIZE - 4, 1, 4);
      } else {
        ctx.fillRect(RULER_SIZE - 4, zeroPx - 0.5, 4, 1);
      }
    }
  }, [direction, scale, zoom, scrollLeft, scrollTop, pad, unit, canvasWidth, canvasHeight]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const isH = direction === "horizontal";
    const parentW = el.parentElement?.clientWidth || 800;
    const parentH = el.parentElement?.clientHeight || 600;
    el.width = (isH ? parentW : RULER_SIZE) * dpr;
    el.height = (isH ? RULER_SIZE : parentH) * dpr;
    el.style.width = (isH ? parentW : RULER_SIZE) + "px";
    el.style.height = (isH ? RULER_SIZE : parentH) + "px";
    draw();
  }, [draw, direction, canvasWidth, canvasHeight]);

  useEffect(() => { draw(); }, [draw]);

  // Drag to create guide
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    document.body.style.cursor = direction === "horizontal" ? "row-resize" : "col-resize";
  }, [direction]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";

    const el = canvasRef.current;
    if (!el || !onGuideCreate) return;
    const rect = el.getBoundingClientRect();
    const isH = direction === "horizontal";
    const z = zoom / 100;
    const px = isH ? e.clientX - rect.left : e.clientY - rect.top;
    const scroll = isH ? scrollLeft : scrollTop;

    // Convert pixel to mm
    const mm = (px + scroll) / (scale * z) - pad;
    onGuideCreate(Math.round(mm * 100) / 100, isH ? "h" : "v");
  }, [direction, zoom, scale, scrollLeft, scrollTop, pad, onGuideCreate]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        position: "absolute",
        ...(direction === "horizontal"
          ? { top: 0, left: RULER_SIZE, right: 0, height: RULER_SIZE, cursor: "row-resize" }
          : { top: RULER_SIZE, left: 0, bottom: 0, width: RULER_SIZE, cursor: "col-resize" }
        ),
        zIndex: 20,
        userSelect: "none",
      }}
    />
  );
}

// Corner square (unit toggle)
export function RulerCorner({ unit, onToggle }: { unit: "mm" | "inch"; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        position: "absolute", top: 0, left: 0,
        width: RULER_SIZE, height: RULER_SIZE,
        zIndex: 21,
        backgroundColor: "#f3f4f6",
        borderRight: "0.5px solid #d1d5db",
        borderBottom: "0.5px solid #d1d5db",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", userSelect: "none",
        fontSize: "8px", fontWeight: 600, color: "#6b7280",
      }}
      title={`Switch to ${unit === "mm" ? "inch" : "mm"}`}
    >
      {unit}
    </div>
  );
}