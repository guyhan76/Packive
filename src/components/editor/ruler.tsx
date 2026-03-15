"use client";
import React, { useRef, useEffect, useCallback, useState } from "react";

const RULER_THICK = 26;
const INCH_MM = 25.4;

const C = {
  bg: "#2c2c2c", border: "#1a1a1a", tick: "#666", tickMajor: "#b0b0b0",
  label: "#999", origin: "#ff5252", cursor: "#4fc3f7", guidePreview: "#00e5ff",
  corner: "#2c2c2c", cornerText: "#888", cornerHover: "#404040",
};

interface RulerProps {
  direction: "horizontal" | "vertical";
  canvasWidth: number; canvasHeight: number;
  scale: number; zoom: number;
  scrollLeft: number; scrollTop: number;
  pad: number; unit: "mm" | "inch";
  mouseX?: number; mouseY?: number;
  onGuideCreate?: (pos: number, dir: "h" | "v") => void;
}

function getTickSpacing(unit: "mm"|"inch", pxPerMM: number, z: number): [number, number] {
  if (unit === "mm") {
    const p = pxPerMM * z; // px per 1mm at current zoom
    // Show finer divisions at all zoom levels
    if (p >= 40) return [5, 5];     // major=5mm, minor=1mm
    if (p >= 20) return [5, 5];     // major=5mm, minor=1mm
    if (p >= 10) return [10, 10];   // major=10mm, minor=1mm
    if (p >= 5) return [10, 5];     // major=10mm, minor=2mm
    if (p >= 2) return [20, 4];     // major=20mm, minor=5mm
    if (p >= 1) return [50, 5];     // major=50mm, minor=10mm
    if (p >= 0.5) return [100, 10]; // major=100mm, minor=10mm
    return [100, 5];                // major=100mm, minor=20mm
  } else {
    const p = pxPerMM * INCH_MM * z; // px per 1inch
    if (p >= 400) return [0.125, 2]; // major=1/8in, minor=1/16in
    if (p >= 200) return [0.25, 4];  // major=1/4in, minor=1/16in
    if (p >= 100) return [0.5, 4];   // major=1/2in, minor=1/8in
    if (p >= 50) return [1, 8];      // major=1in, minor=1/8in
    if (p >= 20) return [2, 4];      // major=2in, minor=1/2in
    return [5, 5];                   // major=5in, minor=1in
  }
}

export default function Ruler({ direction, canvasWidth, canvasHeight, scale, zoom, scrollLeft, scrollTop, pad, unit, mouseX, mouseY, onGuideCreate }: RulerProps) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef(false);
  const [dragPos, setDragPos] = useState<number|null>(null);
  const isH = direction === "horizontal";
  const z = zoom / 100;

  const draw = useCallback(() => {
    const el = cvRef.current; if (!el) return;
    const ctx = el.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = el.width / dpr, H = el.height / dpr;
    const len = isH ? W : H;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.border; ctx.lineWidth = 1; ctx.beginPath();
    if (isH) { ctx.moveTo(0, RULER_THICK - 0.5); ctx.lineTo(W, RULER_THICK - 0.5); }
    else { ctx.moveTo(RULER_THICK - 0.5, 0); ctx.lineTo(RULER_THICK - 0.5, H); }
    ctx.stroke();
    const scroll = isH ? scrollLeft : scrollTop;
    const [majorStep, minorDiv] = getTickSpacing(unit, scale, z);
    const minorStep = majorStep / minorDiv;
    const unitScale = unit === "mm" ? scale * z : scale * INCH_MM * z;
    const padU = pad / (unit === "mm" ? 1 : INCH_MM);
    const startU = scroll / unitScale - padU;
    const endU = (len + scroll) / unitScale - padU;
    const firstTick = Math.floor(startU / minorStep) * minorStep;
    const lastTick = Math.ceil(endU / minorStep) * minorStep;
    ctx.font = "500 9px Inter, -apple-system, system-ui, sans-serif";
    for (let u = firstTick; u <= lastTick; u = +(u + minorStep).toFixed(8)) {
      const px = (u + padU) * unitScale - scroll;
      if (px < -20 || px > len + 20) continue;
      const rem = Math.abs(u % majorStep);
      const isMajor = rem < minorStep * 0.01 || Math.abs(rem - majorStep) < minorStep * 0.01;
      const halfS = majorStep / 2;
      const remH = Math.abs(u % halfS);
      const isMid = !isMajor && (remH < minorStep * 0.01 || Math.abs(remH - halfS) < minorStep * 0.01);
      const tickLen = isMajor ? 14 : isMid ? 8 : 4;
      ctx.strokeStyle = isMajor ? C.tickMajor : C.tick;
      ctx.lineWidth = isMajor ? 1 : 0.5;
      const snapped = Math.round(px * 2) / 2;
      ctx.beginPath();
      if (isH) { ctx.moveTo(snapped, RULER_THICK - 1); ctx.lineTo(snapped, RULER_THICK - 1 - tickLen); }
      else { ctx.moveTo(RULER_THICK - 1, snapped); ctx.lineTo(RULER_THICK - 1 - tickLen, snapped); }
      ctx.stroke();
      if (isMajor) {
        const label = unit === "mm" ? String(Math.round(u)) : (u % 1 === 0 ? String(Math.round(u)) : u.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));
        ctx.fillStyle = C.label;
        if (isH) { ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(label, snapped, 3); }
        else { ctx.save(); ctx.translate(3, snapped); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(label, 0, 0); ctx.restore(); }
      }
    }
    const originPx = padU * unitScale - scroll;
    if (originPx > -10 && originPx < len + 10) {
      ctx.fillStyle = C.origin; ctx.beginPath();
      if (isH) { ctx.moveTo(originPx, RULER_THICK-1); ctx.lineTo(originPx-3, RULER_THICK-6); ctx.lineTo(originPx+3, RULER_THICK-6); }
      else { ctx.moveTo(RULER_THICK-1, originPx); ctx.lineTo(RULER_THICK-6, originPx-3); ctx.lineTo(RULER_THICK-6, originPx+3); }
      ctx.fill();
    }
    const mousePx = isH ? (mouseX ?? -100) : (mouseY ?? -100);
    if (mousePx >= 0 && mousePx <= len) {
      ctx.strokeStyle = C.cursor; ctx.lineWidth = 1; ctx.setLineDash([]); ctx.beginPath();
      if (isH) { ctx.moveTo(mousePx, 0); ctx.lineTo(mousePx, RULER_THICK); }
      else { ctx.moveTo(0, mousePx); ctx.lineTo(RULER_THICK, mousePx); }
      ctx.stroke();
    }
    if (dragPos !== null) {
      ctx.strokeStyle = C.guidePreview; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath();
      if (isH) { ctx.moveTo(dragPos, 0); ctx.lineTo(dragPos, RULER_THICK); }
      else { ctx.moveTo(0, dragPos); ctx.lineTo(RULER_THICK, dragPos); }
      ctx.stroke(); ctx.setLineDash([]);
      const unitVal = (dragPos + scroll) / unitScale - padU;
      const tip = unit === "mm" ? unitVal.toFixed(1) + " mm" : unitVal.toFixed(3) + " in";
      ctx.fillStyle = C.guidePreview; ctx.font = "bold 9px Inter, system-ui";
      if (isH) { ctx.textAlign = dragPos > len - 60 ? "right" : "left"; ctx.textBaseline = "bottom"; ctx.fillText(tip, dragPos + (dragPos > len - 60 ? -4 : 4), RULER_THICK - 2); }
      else { ctx.save(); ctx.translate(2, dragPos + (dragPos > len - 40 ? -4 : 14)); ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(tip, 0, 0); ctx.restore(); }
    }
  }, [direction, scale, zoom, scrollLeft, scrollTop, pad, unit, canvasWidth, canvasHeight, mouseX, mouseY, isH, dragPos, z]);

  useEffect(() => {
    const wrap = wrapRef.current; const el = cvRef.current; if (!wrap || !el) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1; const rect = wrap.getBoundingClientRect();
      const w = isH ? rect.width : RULER_THICK; const h = isH ? RULER_THICK : rect.height;
      el.width = w * dpr; el.height = h * dpr; el.style.width = w + "px"; el.style.height = h + "px"; draw();
    }); ro.observe(wrap); return () => ro.disconnect();
  }, [draw, isH]);

  useEffect(() => { draw(); }, [draw]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); dragRef.current = true;
    document.body.style.cursor = isH ? "s-resize" : "e-resize";
    const rect = cvRef.current?.getBoundingClientRect();
    if (rect) setDragPos(isH ? e.clientX - rect.left : e.clientY - rect.top);
  }, [isH]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (!dragRef.current) return; const rect = cvRef.current?.getBoundingClientRect(); if (rect) setDragPos(isH ? e.clientX - rect.left : e.clientY - rect.top); };
    const onUp = (e: MouseEvent) => {
      if (!dragRef.current) return; dragRef.current = false; document.body.style.cursor = ""; setDragPos(null);
      const el = cvRef.current; if (!el || !onGuideCreate) return;
      const rect = el.getBoundingClientRect(); const px = isH ? e.clientX - rect.left : e.clientY - rect.top;
      const scroll = isH ? scrollLeft : scrollTop; const mm = (px + scroll) / (scale * z) - pad;
      if (isH ? (e.clientY > rect.bottom) : (e.clientX > rect.right)) onGuideCreate(Math.round(mm * 100) / 100, isH ? "h" : "v");
    };
    document.addEventListener("mousemove", onMove); document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, [isH, scale, z, scrollLeft, scrollTop, pad, onGuideCreate]);

  return (
    <div ref={wrapRef} style={{ position: "absolute", ...(isH ? { top: 0, left: RULER_THICK, right: 0, height: RULER_THICK } : { top: RULER_THICK, left: 0, bottom: 28, width: RULER_THICK }), zIndex: 30, overflow: "hidden" }}>
      <canvas ref={cvRef} onMouseDown={onMouseDown} style={{ display: "block", cursor: isH ? "s-resize" : "e-resize" }} />
    </div>
  );
}

export function RulerCorner({ unit, onToggle }: { unit: "mm"|"inch"; onToggle: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onToggle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: "absolute", top: 0, left: 0, width: RULER_THICK, height: RULER_THICK, zIndex: 31, background: hover ? C.cornerHover : C.corner, borderRight: "1px solid " + C.border, borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", userSelect: "none", transition: "background 0.15s" }}
      title={"Switch to " + (unit === "mm" ? "inch" : "mm")}>
      <span style={{ fontSize: "8px", fontWeight: 700, color: hover ? "#fff" : C.cornerText, letterSpacing: "0.3px", textTransform: "uppercase", transition: "color 0.15s" }}>{unit}</span>
    </div>
  );
}

export { RULER_THICK };
