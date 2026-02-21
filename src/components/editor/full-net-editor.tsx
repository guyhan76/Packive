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

const PX_PER_MM = 3;
const PADDING = 60;

export default function FullNetEditor({
  L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH,
  panels, panelConfig, onSave, onBack, onEditPanel
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fcRef = useRef<any>(null);
  const [zoom, setZoom] = useState(100);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const frontX = glueW + T;
  const leftX = frontX + L + T;
  const backX = leftX + W + T;
  const rightX = backX + L + T;
  const bodyY = tuckH + T + W;
  const bottomY = bodyY + D + T;
  const totalW = rightX + W;
  const totalH = bottomY + Math.max(bottomH, bottomDustH);

  const positions: Record<string, { x: number; y: number; w: number; h: number }> = useMemo(() => ({
    topTuck: { x: frontX, y: 0, w: L, h: tuckH },
    topLid: { x: frontX, y: tuckH + T, w: L, h: W },
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
  }), [L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH, frontX, leftX, backX, rightX, bodyY, bottomY]);

  const canvasW = totalW * PX_PER_MM + PADDING * 2;
  const canvasH = totalH * PX_PER_MM + PADDING * 2;

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;

    (async () => {
      const fabric = await import("fabric");
      if (disposed) return;
      const FabricCanvas = fabric.Canvas;
      const Rect = fabric.Rect;
      const Textbox = fabric.Textbox;
      const FabricLine = fabric.Line;
      const FabricImage = fabric.FabricImage;

      const fc = new FabricCanvas(canvasRef.current!, {
        width: canvasW,
        height: canvasH,
        backgroundColor: "#f3f4f6",
        selection: true,
      });
      fcRef.current = fc;

      Object.entries(positions).forEach(([pid, pos]) => {
        if (pos.w <= 0 || pos.h <= 0) return;
        const px = PADDING + pos.x * PX_PER_MM;
        const py = PADDING + pos.y * PX_PER_MM;
        const pw = pos.w * PX_PER_MM;
        const ph = pos.h * PX_PER_MM;
        const pc = panelConfig[pid];
        const pnl = panels[pid];

        const bg = new Rect({
          left: px, top: py, width: pw, height: ph,
          fill: pnl?.designed ? "#ffffff" : (pc?.color || "#f9fafb"),
          stroke: pnl?.designed ? "#22C55E" : (pc?.border || "#d1d5db"),
          strokeWidth: pnl?.designed ? 1.5 : 0.8,
          selectable: false, evented: true,
          hoverCursor: "pointer",
        } as any);
        (bg as any)._panelId = pid;
        (bg as any)._isBg = true;
        fc.add(bg);

        if (!pnl?.designed && pw > 30 && ph > 20) {
          const label = new Textbox(pc?.name || pid, {
            left: px + pw / 2, top: py + ph / 2 - 6,
            width: pw - 10,
            fontSize: Math.max(Math.min(pw * 0.08, ph * 0.1, 14), 8),
            fill: "#9ca3af", fontFamily: "sans-serif",
            textAlign: "center", originX: "center", originY: "center",
            selectable: false, evented: false,
          } as any);
          (label as any)._panelId = pid;
          (label as any)._isLabel = true;
          fc.add(label);

          const sizeLabel = new Textbox(pos.w + "x" + pos.h + "mm", {
            left: px + pw / 2, top: py + ph / 2 + 8,
            width: pw - 10,
            fontSize: Math.max(Math.min(pw * 0.06, 10), 6),
            fill: "#d1d5db", fontFamily: "sans-serif",
            textAlign: "center", originX: "center", originY: "center",
            selectable: false, evented: false,
          } as any);
          (sizeLabel as any)._panelId = pid;
          (sizeLabel as any)._isLabel = true;
          fc.add(sizeLabel);
        }
      });

      const foldLines: number[][] = [
        [frontX, bodyY, frontX, bodyY + D],
        [frontX + L, bodyY, frontX + L, bodyY + D],
        [leftX + W, bodyY, leftX + W, bodyY + D],
        [backX + L, bodyY, backX + L, bodyY + D],
        [glueW, bodyY, glueW, bodyY + D],
        [frontX, bodyY, frontX + L, bodyY],
        [frontX, bodyY + D, rightX + W, bodyY + D],
        [frontX, tuckH + T, frontX + L, tuckH + T],
        [frontX, tuckH, frontX + L, tuckH],
        [leftX, bodyY - dustH, leftX, bodyY],
        [leftX + W, bodyY - dustH, leftX + W, bodyY],
        [rightX, bodyY - dustH, rightX, bodyY],
        [rightX + W, bodyY - dustH, rightX + W, bodyY],
        [frontX, bottomY, rightX + W, bottomY],
        [leftX, bottomY, leftX, bottomY + bottomDustH],
        [leftX + W, bottomY, leftX + W, bottomY + bottomDustH],
        [backX, bottomY, backX, bottomY + bottomH],
        [backX + L, bottomY, backX + L, bottomY + bottomH],
        [rightX, bottomY, rightX, bottomY + bottomDustH],
        [rightX + W, bottomY, rightX + W, bottomY + bottomDustH],
      ];
      foldLines.forEach(([x1, y1, x2, y2]) => {
        const line = new FabricLine([
          PADDING + x1 * PX_PER_MM, PADDING + y1 * PX_PER_MM,
          PADDING + x2 * PX_PER_MM, PADDING + y2 * PX_PER_MM,
        ], {
          stroke: "#93c5fd", strokeWidth: 1,
          strokeDashArray: [6, 3],
          selectable: false, evented: false,
        });
        (line as any)._isFold = true;
        fc.add(line);
      });

      const cutLines: number[][] = [
        [frontX, 0, frontX + L, 0],
        [frontX, 0, frontX, tuckH],
        [frontX + L, 0, frontX + L, tuckH],
        [frontX, tuckH + T, frontX, bodyY],
        [frontX + L, tuckH + T, frontX + L, bodyY],
        [leftX, bodyY - dustH, leftX + W, bodyY - dustH],
        [leftX, bodyY - dustH, leftX, bodyY],
        [leftX + W, bodyY - dustH, leftX + W, bodyY],
        [rightX, bodyY - dustH, rightX + W, bodyY - dustH],
        [rightX, bodyY - dustH, rightX, bodyY],
        [rightX + W, bodyY - dustH, rightX + W, bodyY],
        [0, bodyY, glueW, bodyY],
        [0, bodyY, 0, bodyY + D],
        [0, bodyY + D, glueW, bodyY + D],
        [rightX + W, bodyY, rightX + W, bodyY + D],
        [frontX, bottomY + bottomH, frontX + L, bottomY + bottomH],
        [frontX, bottomY, frontX, bottomY + bottomH],
        [leftX, bottomY + bottomDustH, leftX + W, bottomY + bottomDustH],
        [backX, bottomY + bottomH, backX + L, bottomY + bottomH],
        [backX, bottomY, backX, bottomY + bottomH],
        [rightX, bottomY + bottomDustH, rightX + W, bottomY + bottomDustH],
        [rightX + W, bottomY, rightX + W, bottomY + bottomDustH],
        [leftX + W, bottomY, leftX + W, bottomY + bottomDustH],
      ];
      cutLines.forEach(([x1, y1, x2, y2]) => {
        const line = new FabricLine([
          PADDING + x1 * PX_PER_MM, PADDING + y1 * PX_PER_MM,
          PADDING + x2 * PX_PER_MM, PADDING + y2 * PX_PER_MM,
        ], {
          stroke: "#ef4444", strokeWidth: 1.5,
          selectable: false, evented: false,
        });
        (line as any)._isCut = true;
        fc.add(line);
      });

      for (const [pid, pos] of Object.entries(positions)) {
        const pnl = panels[pid];
        if (!pnl?.designed || !pnl.thumbnail) continue;
        const px = PADDING + pos.x * PX_PER_MM;
        const py = PADDING + pos.y * PX_PER_MM;
        const pw = pos.w * PX_PER_MM;
        const ph = pos.h * PX_PER_MM;
        try {
          const img = await FabricImage.fromURL(pnl.thumbnail);
          img.set({
            left: px, top: py,
            scaleX: pw / (img.width || 1),
            scaleY: ph / (img.height || 1),
            selectable: false, evented: false,
          });
          const clipRect = new Rect({ left: px, top: py, width: pw, height: ph, absolutePositioned: true });
          img.clipPath = clipRect;
          (img as any)._panelId = pid;
          (img as any)._isThumb = true;
          fc.add(img);
        } catch (e) {
          console.warn("Failed to load thumbnail for", pid, e);
        }
      }

      fc.on("mouse:wheel", (opt: any) => {
        const delta = opt.e.deltaY;
        let z = fc.getZoom();
        z *= 0.999 ** delta;
        z = Math.max(0.15, Math.min(6, z));
        fc.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), z);
        setZoom(Math.round(z * 100));
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      let panning = false;
      let lastPanX = 0, lastPanY = 0;
      fc.on("mouse:down", (opt: any) => {
        if (opt.e.altKey || opt.e.button === 1) {
          panning = true;
          lastPanX = opt.e.clientX;
          lastPanY = opt.e.clientY;
          fc.selection = false;
          opt.e.preventDefault();
        }
      });
      fc.on("mouse:move", (opt: any) => {
        if (panning) {
          const vpt = fc.viewportTransform;
          vpt[4] += opt.e.clientX - lastPanX;
          vpt[5] += opt.e.clientY - lastPanY;
          lastPanX = opt.e.clientX;
          lastPanY = opt.e.clientY;
          fc.requestRenderAll();
        }
      });
      fc.on("mouse:up", () => { panning = false; fc.selection = true; });

      fc.on("mouse:dblclick", (opt: any) => {
        const pointer = fc.getScenePoint(opt.e);
        for (const [pid, pos] of Object.entries(positions)) {
          const px = PADDING + pos.x * PX_PER_MM;
          const py = PADDING + pos.y * PX_PER_MM;
          const pw = pos.w * PX_PER_MM;
          const ph = pos.h * PX_PER_MM;
          if (pointer.x >= px && pointer.x <= px + pw && pointer.y >= py && pointer.y <= py + ph) {
            onEditPanel(pid as PanelId);
            return;
          }
        }
      });

      fc.on("mouse:down", (opt: any) => {
        if (opt.e.altKey || opt.e.button === 1) return;
        const pointer = fc.getScenePoint(opt.e);
        let found: string | null = null;
        for (const [pid, pos] of Object.entries(positions)) {
          const px = PADDING + pos.x * PX_PER_MM;
          const py = PADDING + pos.y * PX_PER_MM;
          const pw = pos.w * PX_PER_MM;
          const ph = pos.h * PX_PER_MM;
          if (pointer.x >= px && pointer.x <= px + pw && pointer.y >= py && pointer.y <= py + ph) {
            found = pid;
            break;
          }
        }
        setActivePanel(found);
      });

      const wrapper = canvasRef.current?.parentElement;
      if (wrapper) {
        const ww = wrapper.clientWidth;
        const wh = wrapper.clientHeight;
        const scaleX = (ww - 40) / canvasW;
        const scaleY = (wh - 40) / canvasH;
        const fitZoom = Math.min(scaleX, scaleY, 1);
        fc.setZoom(fitZoom);
        setZoom(Math.round(fitZoom * 100));
        const vpt = fc.viewportTransform;
        vpt[4] = (ww - canvasW * fitZoom) / 2;
        vpt[5] = (wh - canvasH * fitZoom) / 2;
        fc.requestRenderAll();
      }

      fc.renderAll();
      setIsReady(true);
    })();

    return () => {
      disposed = true;
      if (fcRef.current) { fcRef.current.dispose(); fcRef.current = null; }
    };
  }, []);

  const fitToScreen = useCallback(() => {
    const fc = fcRef.current;
    const wrapper = canvasRef.current?.parentElement;
    if (!fc || !wrapper) return;
    const ww = wrapper.clientWidth;
    const wh = wrapper.clientHeight;
    const scaleX = (ww - 40) / canvasW;
    const scaleY = (wh - 40) / canvasH;
    const fitZoom = Math.min(scaleX, scaleY, 1);
    fc.setZoom(fitZoom);
    setZoom(Math.round(fitZoom * 100));
    const vpt = fc.viewportTransform;
    vpt[4] = (ww - canvasW * fitZoom) / 2;
    vpt[5] = (wh - canvasH * fitZoom) / 2;
    fc.requestRenderAll();
  }, [canvasW, canvasH]);

  const activeCfg = activePanel ? panelConfig[activePanel] : null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            Back
          </button>
          <span className="font-bold text-base">Full Net Editor</span>
          <span className="text-xs text-gray-400">L{L} x W{W} x D{D}mm</span>
        </div>
        <div className="flex items-center gap-3">
          {activePanel && activeCfg && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: activeCfg.color, color: activeCfg.border }}>
                {activeCfg.name}
              </span>
              <button onClick={() => onEditPanel(activePanel as PanelId)}
                className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                Edit Panel
              </button>
            </div>
          )}
          <span className="text-xs text-gray-400">Zoom: {zoom}%</span>
          <button onClick={fitToScreen} className="text-xs text-blue-600 hover:text-blue-800">Fit</button>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 py-1.5 bg-white border-b text-xs text-gray-500">
        <span>Scroll: Zoom</span>
        <span className="text-gray-300">|</span>
        <span>Alt+Drag: Pan</span>
        <span className="text-gray-300">|</span>
        <span>Double-click: Edit panel</span>
        <span className="text-gray-300">|</span>
        <span>Click: Select panel</span>
        {activePanel && activeCfg && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-blue-600 font-semibold">Selected: {activeCfg.name}</span>
          </>
        )}
      </div>
      <div className="flex-1 overflow-hidden relative" style={{ cursor: "grab" }}>
        <canvas ref={canvasRef} />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <span className="text-gray-400">Loading Full Net Editor...</span>
          </div>
        )}
      </div>
    </div>
  );
}


