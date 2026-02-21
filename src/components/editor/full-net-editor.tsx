"use client";
import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";

interface PanelData {
  json: string | null;
  thumbnail: string | null;
  designed: boolean;
}

interface PanelConfig {
  name: string;
  widthMM: number;
  heightMM: number;
  guide: string;
  color: string;
  border: string;
  icon: string;
  group: "body" | "top" | "bottom" | "glue";
}

type PanelId =
  | "front" | "left" | "back" | "right"
  | "topLid" | "topTuck" | "topDustL" | "topDustR"
  | "bottomFlapFront" | "bottomFlapBack"
  | "bottomDustL" | "bottomDustR"
  | "glueFlap";

interface Props {
  L: number; W: number; D: number; T: number;
  tuckH: number; dustH: number; glueW: number;
  bottomH: number; bottomDustH: number;
  panels: Record<string, PanelData>;
  panelConfig: Record<string, PanelConfig>;
  onSave: (panelId: string, json: string, thumbnail: string) => void;
  onBack: () => void;
  onEditPanel: (pid: PanelId) => void;
}

const SCALE = 3;
const PAD = 20;

export default function FullNetEditor({
  L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH,
  panels, panelConfig, onSave, onBack, onEditPanel
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fcRef = useRef<any>(null);
  const [zoom, setZoom] = useState(100);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Same coordinates as FullNetPreview
  const frontX = glueW + T;
  const leftX = frontX + L + T;
  const backX = leftX + W + T;
  const rightX = backX + L + T;
  const totalW = rightX + W;
  const tuckY = 0;
  const topLidY = tuckH + T;
  const bodyY = topLidY + W;
  const bottomY = bodyY + D + T;
  const totalH = bottomY + Math.max(bottomH, bottomDustH);

  const positions: Record<string, { x: number; y: number; w: number; h: number }> = useMemo(() => ({
    topTuck: { x: frontX, y: tuckY, w: L, h: tuckH },
    topLid: { x: frontX, y: topLidY, w: L, h: W },
    topDustL: { x: leftX, y: bodyY - dustH, w: W, h: dustH },
    topDustR: { x: rightX, y: bodyY - dustH, w: W, h: dustH },
    glueFlap: { x: 0, y: bodyY, w: glueW, h: D },
    front: { x: frontX, y: bodyY, w: L, h: D },
    left: { x: leftX, y: bodyY, w: W, h: D },
    back: { x: backX, y: bodyY, w: L, h: D },
    right: { x: rightX, y: bodyY, w: W, h: D },
    bottomFlapFront: { x: frontX, y: bottomY, w: L, h: bottomH },
    bottomDustL: { x: leftX, y: bottomY, w: W, h: bottomDustH },
    bottomFlapBack: { x: backX, y: bottomY, w: L, h: bottomH },
    bottomDustR: { x: rightX, y: bottomY, w: W, h: bottomDustH },
  }), [L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH, frontX, leftX, backX, rightX, bodyY, bottomY, topLidY, tuckY]);

  const canvasW = (totalW + PAD * 2) * SCALE;
  const canvasH = (totalH + PAD * 2) * SCALE;

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;

    (async () => {
      const fabric = await import("fabric");
      if (disposed) return;

      const fc = new fabric.Canvas(canvasRef.current!, {
        width: canvasW,
        height: canvasH,
        backgroundColor: "#f8f9fa",
        selection: false,
      });
      fcRef.current = fc;

      const S = SCALE;
      const P = PAD * S;

      // Draw each panel
      Object.entries(positions).forEach(([pid, pos]) => {
        if (pos.w <= 0 || pos.h <= 0) return;
        const px = P + pos.x * S;
        const py = P + pos.y * S;
        const pw = pos.w * S;
        const ph = pos.h * S;
        const pc = panelConfig[pid];
        const pnl = panels[pid];

        // Background
        const bg = new fabric.Rect({
          left: px, top: py, width: pw, height: ph,
          fill: pnl?.designed ? "#ffffff" : (pc?.color || "#f9fafb"),
          stroke: pnl?.designed ? "#22C55E" : (pc?.border || "#d1d5db"),
          strokeWidth: pnl?.designed ? 2 : 1,
          selectable: false, evented: true,
          hoverCursor: "pointer",
        } as any);
        (bg as any)._pid = pid;
        fc.add(bg);

        // Label (only if not designed)
        if (!pnl?.designed) {
          const fs = Math.max(Math.min(pw * 0.1, ph * 0.12, 16), 7);
          const label = new fabric.Textbox(pc?.name || pid, {
            left: px + pw / 2, top: py + ph / 2 - fs * 0.3,
            width: pw - 4,
            fontSize: fs,
            fill: "#9ca3af", fontFamily: "sans-serif",
            textAlign: "center", originX: "center", originY: "center",
            selectable: false, evented: false,
          });
          fc.add(label);
          if (pw > 40 && ph > 30) {
            const sz = new fabric.Textbox(pos.w + "x" + pos.h + "mm", {
              left: px + pw / 2, top: py + ph / 2 + fs * 0.8,
              width: pw - 4,
              fontSize: Math.max(fs * 0.65, 6),
              fill: "#d1d5db", fontFamily: "sans-serif",
              textAlign: "center", originX: "center", originY: "center",
              selectable: false, evented: false,
            });
            fc.add(sz);
          }
        }
      });

      // Fold lines (blue dashed) — same as FullNetPreview
      const folds: number[][] = [
        // Vertical body
        [frontX, bodyY, frontX, bodyY + D],
        [frontX + L, bodyY, frontX + L, bodyY + D],
        [leftX + W, bodyY, leftX + W, bodyY + D],
        [backX + L, bodyY, backX + L, bodyY + D],
        // Horizontal
        [frontX, bodyY, rightX + W, bodyY],
        [frontX, bodyY + D, rightX + W, bodyY + D],
        [frontX, topLidY, frontX + L, topLidY],
        [frontX, tuckH, frontX + L, tuckH],
        // Dust top
        [leftX, bodyY - dustH, leftX, bodyY],
        [leftX + W, bodyY - dustH, leftX + W, bodyY],
        [rightX, bodyY - dustH, rightX, bodyY],
        [rightX + W, bodyY - dustH, rightX + W, bodyY],
        // Bottom
        [frontX, bottomY, rightX + W, bottomY],
        [frontX, bottomY, frontX, bottomY + bottomH],
        [frontX + L, bottomY, frontX + L, bottomY + bottomH],
        [leftX, bottomY, leftX, bottomY + bottomDustH],
        [leftX + W, bottomY, leftX + W, bottomY + bottomDustH],
        [backX, bottomY, backX, bottomY + bottomH],
        [backX + L, bottomY, backX + L, bottomY + bottomH],
        [rightX, bottomY, rightX, bottomY + bottomDustH],
        [rightX + W, bottomY, rightX + W, bottomY + bottomDustH],
        // Glue
        [glueW, bodyY, glueW, bodyY + D],
      ];
      folds.forEach(([x1, y1, x2, y2]) => {
        fc.add(new fabric.Line([P + x1 * S, P + y1 * S, P + x2 * S, P + y2 * S], {
          stroke: "#93c5fd", strokeWidth: 1, strokeDashArray: [8, 4],
          selectable: false, evented: false,
        }));
      });

      // Die-cut lines (red solid) — outer contour
      const cuts: number[][] = [
        // Top tuck
        [frontX, 0, frontX + L, 0],
        [frontX, 0, frontX, tuckH],
        [frontX + L, 0, frontX + L, tuckH],
        // Top lid sides
        [frontX, topLidY, frontX, bodyY],
        [frontX + L, topLidY, frontX + L, bodyY],
        // Top dust L
        [leftX, bodyY - dustH, leftX + W, bodyY - dustH],
        [leftX, bodyY - dustH, leftX, bodyY],
        [leftX + W, bodyY - dustH, leftX + W, bodyY],
        // Top dust R
        [rightX, bodyY - dustH, rightX + W, bodyY - dustH],
        [rightX, bodyY - dustH, rightX, bodyY],
        [rightX + W, bodyY - dustH, rightX + W, bodyY],
        // Glue flap
        [0, bodyY, glueW, bodyY],
        [0, bodyY, 0, bodyY + D],
        [0, bodyY + D, glueW, bodyY + D],
        // Right outer
        [rightX + W, bodyY, rightX + W, bodyY + D],
        // Bottom flap front
        [frontX, bottomY + bottomH, frontX + L, bottomY + bottomH],
        [frontX, bottomY, frontX, bottomY + bottomH],
        [frontX + L, bottomY, frontX + L, bottomY + bottomH],
        // Bottom dust L
        [leftX, bottomY + bottomDustH, leftX + W, bottomY + bottomDustH],
        [leftX, bottomY, leftX, bottomY + bottomDustH],
        [leftX + W, bottomY, leftX + W, bottomY + bottomDustH],
        // Bottom flap back
        [backX, bottomY + bottomH, backX + L, bottomY + bottomH],
        [backX, bottomY, backX, bottomY + bottomH],
        [backX + L, bottomY, backX + L, bottomY + bottomH],
        // Bottom dust R
        [rightX, bottomY + bottomDustH, rightX + W, bottomY + bottomDustH],
        [rightX, bottomY, rightX, bottomY + bottomDustH],
        [rightX + W, bottomY, rightX + W, bottomY + bottomDustH],
      ];
      cuts.forEach(([x1, y1, x2, y2]) => {
        fc.add(new fabric.Line([P + x1 * S, P + y1 * S, P + x2 * S, P + y2 * S], {
          stroke: "#ef4444", strokeWidth: 1.5,
          selectable: false, evented: false,
        }));
      });

      // Load thumbnails
      for (const [pid, pos] of Object.entries(positions)) {
        const pnl = panels[pid];
        if (!pnl?.designed || !pnl.thumbnail) continue;
        const px = P + pos.x * S;
        const py = P + pos.y * S;
        const pw = pos.w * S;
        const ph = pos.h * S;
        try {
          const img = await fabric.FabricImage.fromURL(pnl.thumbnail);
          img.set({
            left: px, top: py,
            scaleX: pw / (img.width || 1),
            scaleY: ph / (img.height || 1),
            selectable: false, evented: false,
          });
          img.clipPath = new fabric.Rect({ left: px, top: py, width: pw, height: ph, absolutePositioned: true });
          (img as any)._pid = pid;
          fc.add(img);
        } catch (e) { console.warn("thumb load fail", pid, e); }
      }

      // Zoom
      fc.on("mouse:wheel", (opt: any) => {
        const e = opt.e;
        let z = fc.getZoom();
        z *= 0.999 ** e.deltaY;
        z = Math.max(0.1, Math.min(8, z));
        fc.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), z);
        setZoom(Math.round(z * 100));
        e.preventDefault();
        e.stopPropagation();
      });

      // Pan (Alt+drag or middle mouse)
      let panning = false, lx = 0, ly = 0;
      fc.on("mouse:down", (opt: any) => {
        if (opt.e.altKey || opt.e.button === 1) {
          panning = true; lx = opt.e.clientX; ly = opt.e.clientY;
          fc.selection = false;
        }
      });
      fc.on("mouse:move", (opt: any) => {
        if (!panning) return;
        const vpt = fc.viewportTransform!;
        vpt[4] += opt.e.clientX - lx;
        vpt[5] += opt.e.clientY - ly;
        lx = opt.e.clientX; ly = opt.e.clientY;
        fc.requestRenderAll();
      });
      fc.on("mouse:up", () => { panning = false; fc.selection = false; });

      // Double-click → edit panel
      fc.on("mouse:dblclick", (opt: any) => {
        const pt = fc.getScenePoint(opt.e);
        for (const [pid, pos] of Object.entries(positions)) {
          const px = P + pos.x * S, py = P + pos.y * S;
          const pw = pos.w * S, ph = pos.h * S;
          if (pt.x >= px && pt.x <= px + pw && pt.y >= py && pt.y <= py + ph) {
            onEditPanel(pid as PanelId);
            return;
          }
        }
      });

      // Click → select panel
      fc.on("mouse:down", (opt: any) => {
        if (opt.e.altKey || opt.e.button === 1) return;
        const pt = fc.getScenePoint(opt.e);
        let found: string | null = null;
        for (const [pid, pos] of Object.entries(positions)) {
          const px = P + pos.x * S, py = P + pos.y * S;
          const pw = pos.w * S, ph = pos.h * S;
          if (pt.x >= px && pt.x <= px + pw && pt.y >= py && pt.y <= py + ph) { found = pid; break; }
        }
        setActivePanel(found);
      });

      // Fit to screen
      const wrapper = containerRef.current;
      if (wrapper) {
        const ww = wrapper.clientWidth - 20;
        const wh = wrapper.clientHeight - 20;
        const fitZ = Math.min(ww / canvasW, wh / canvasH, 1);
        fc.setZoom(fitZ);
        setZoom(Math.round(fitZ * 100));
        const vpt = fc.viewportTransform!;
        vpt[4] = (wrapper.clientWidth - canvasW * fitZ) / 2;
        vpt[5] = (wrapper.clientHeight - canvasH * fitZ) / 2;
        fc.requestRenderAll();
      }

      fc.renderAll();
      setIsReady(true);
    })();

    return () => { disposed = true; if (fcRef.current) { fcRef.current.dispose(); fcRef.current = null; } };
  }, []);

  const fitToScreen = useCallback(() => {
    const fc = fcRef.current;
    const wrapper = containerRef.current;
    if (!fc || !wrapper) return;
    const ww = wrapper.clientWidth - 20;
    const wh = wrapper.clientHeight - 20;
    const fitZ = Math.min(ww / canvasW, wh / canvasH, 1);
    fc.setZoom(fitZ);
    setZoom(Math.round(fitZ * 100));
    const vpt = fc.viewportTransform!;
    vpt[4] = (wrapper.clientWidth - canvasW * fitZ) / 2;
    vpt[5] = (wrapper.clientHeight - canvasH * fitZ) / 2;
    fc.requestRenderAll();
  }, [canvasW, canvasH]);

  const activeCfg = activePanel ? panelConfig[activePanel] : null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition">Back</button>
          <span className="font-bold text-base">Full Net Editor</span>
          <span className="text-xs text-gray-400">L{L} x W{W} x D{D}mm</span>
        </div>
        <div className="flex items-center gap-3">
          {activePanel && activeCfg && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: activeCfg.color, color: activeCfg.border }}>{activeCfg.name}</span>
              <button onClick={() => onEditPanel(activePanel as PanelId)} className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
            </div>
          )}
          <span className="text-xs text-gray-400">{zoom}%</span>
          <button onClick={fitToScreen} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Fit</button>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-1 bg-white border-b text-[11px] text-gray-400">
        <span>Scroll: Zoom</span><span>|</span>
        <span>Alt+Drag: Pan</span><span>|</span>
        <span>Double-click: Edit</span><span>|</span>
        <span>Click: Select</span>
        {activePanel && activeCfg && <><span>|</span><span className="text-blue-600 font-semibold">{activeCfg.name}</span></>}
      </div>
      <div ref={containerRef} className="flex-1 overflow-hidden relative" style={{ cursor: "grab" }}>
        <canvas ref={canvasRef} />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}
