// src/app/editor/design/page.tsx
"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef, Suspense } from "react";
import { useI18n, LanguageSelector } from "@/components/i18n-context";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PanelEditor = dynamic(
  () => import("@/components/editor/panel-editor"),
  { ssr: false }
);



const Box3DPreview = dynamic(
  () => import("@/components/editor/box-3d-preview"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] bg-gray-50 rounded-xl border flex items-center justify-center text-gray-400 text-sm">
        Loading 3D...
      </div>
    ),
  }
);

interface PanelData {
  json: string | null;
  thumbnail: string | null;
  designed: boolean;
}
type PanelId =
  | "front" | "left" | "back" | "right"
  | "topLid" | "topTuck" | "topDustL" | "topDustR"
  | "bottomFlapFront" | "bottomFlapBack"
  | "bottomDustL" | "bottomDustR"
  | "glueFlap";
  type ViewMode = "overview" | PanelId;
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
type MatCat = "white-cardboard" | "kraft-paperboard" | "single-flute" | "double-flute";
function getMaterialCategory(m: string): MatCat {
  if (m.startsWith("white-")) return "white-cardboard";
  if (m.startsWith("kraft-")) return "kraft-paperboard";
  if (["eb-flute","cb-flute","bb-flute","ba-flute"].includes(m)) return "double-flute";
  return "single-flute";
}
function getTuckLength(c: MatCat): number {
  switch (c) {
    case "white-cardboard": case "kraft-paperboard": return 15;
    case "single-flute": return 25;
    case "double-flute": return 35;
  }
}
function getTuckLengthByMaterial(m: string): number {
  if (["c-flute","a-flute"].includes(m)) return 30;
  return getTuckLength(getMaterialCategory(m));
}
function getGlueFlapWidth(m: string): number { return getTuckLengthByMaterial(m); }
function getBottomFlapHeight(W: number, m: string): number {
  const h = W / 2;
  if (m === "b-flute") return h + 25;
  if (["c-flute","a-flute"].includes(m)) return h + 30;
  const c = getMaterialCategory(m);
  if (c === "double-flute") return h + 30;
  if (c === "single-flute") return h + 20;
  return h + 15;
}
function getDustFlapHeight(W: number): number { return W / 2; }
function getPaperThickness(m: string): number {
  const c = getMaterialCategory(m);
  switch (c) {
    case "white-cardboard": case "kraft-paperboard": return 0.5;
    case "single-flute": return 1.5;
    case "double-flute": return 3;
  }
}
function formatMaterialLabel(id: string): string {
  const u = ["eb","cb","bb","ba"];
  const p = id.split("-");
  if (u.includes(p[0])) {
    return p[0].toUpperCase() + " " + p.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  return p.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function formatBoxType(bt: string): string {
  return bt.replace(/fefco/gi, "FEFCO");
}
function DesignPageInner() {
  useEffect(() => {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('panelEditor_autoSave_')) localStorage.removeItem(k);
    });
  }, []);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const boxType = searchParams.get("boxType") || "FEFCO-0215";
  const L = Number(searchParams.get("L")) || 120;
  const W = Number(searchParams.get("W")) || 60;
  const D = Number(searchParams.get("D")) || 160;
  const materialId = searchParams.get("material") || "white-350";
  const previewUrl = searchParams.get("previewUrl") || "";
  const matLabel = formatMaterialLabel(materialId);
  const boxTypeDisplay = formatBoxType(boxType);
  const [currentView, setCurrentView] = useState<ViewMode>(() => { const p = searchParams.get("panel"); return (p && p !== "overview") ? p as ViewMode : "overview"; });
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [copySource, setCopySource] = useState<string | null>(null);
  const allPanelIds: PanelId[] = ["front","left","back","right","topLid","topTuck","topDustL","topDustR","bottomFlapFront","bottomFlapBack","bottomDustL","bottomDustR","glueFlap"];
  const [panels, setPanels] = useState<Record<string, PanelData>>(() => {
    const init: Record<string, PanelData> = {};
    allPanelIds.forEach((id) => { init[id] = { json: null, thumbnail: null, designed: false }; });
    return init;
  });
  const panelsRef = useRef(panels);
  useEffect(() => { panelsRef.current = panels; }, [panels]);
  const tuckH = getTuckLengthByMaterial(materialId);
  const glueW = getGlueFlapWidth(materialId);
  const dustH = getDustFlapHeight(W);
  const bottomH = getBottomFlapHeight(W, materialId);
  const bottomDustH = getDustFlapHeight(W);
  const T = getPaperThickness(materialId);
  const panelConfig: Record<PanelId, PanelConfig> = useMemo(() => ({
    front:  { name: t("panel.front"), widthMM: L, heightMM: D, guide: t("guide.front"), color: "#DCFCE7", border: "#22C55E", icon: "F", group: "body" },
    left:   { name: t("panel.left"), widthMM: W, heightMM: D, guide: t("guide.left"), color: "#EFF6FF", border: "#3B82F6", icon: "L", group: "body" },
    back:   { name: t("panel.back"), widthMM: L, heightMM: D, guide: t("guide.back"), color: "#FDF2F8", border: "#EC4899", icon: "B", group: "body" },
    right:  { name: t("panel.right"), widthMM: W, heightMM: D, guide: t("guide.right"), color: "#FFFBEB", border: "#F59E0B", icon: "R", group: "body" },
    topLid:    { name: t("panel.topLid"), widthMM: L, heightMM: W, guide: t("guide.topLid"), color: "#E0F2FE", border: "#0284C7", icon: "TL", group: "top" },
    topTuck:   { name: t("panel.topTuck"), widthMM: L, heightMM: tuckH, guide: t("guide.topTuck"), color: "#F0F9FF", border: "#0EA5E9", icon: "TT", group: "top" },
    topDustL:  { name: t("panel.topDustL"), widthMM: W, heightMM: dustH, guide: t("guide.dust"), color: "#F8FAFC", border: "#94A3B8", icon: "DL", group: "top" },
    topDustR:  { name: t("panel.topDustR"), widthMM: W, heightMM: dustH, guide: "Usually hidden", color: "#F8FAFC", border: "#94A3B8", icon: "DR", group: "top" },
    bottomFlapFront: { name: t("panel.bottomFlapFront"), widthMM: L, heightMM: bottomH, guide: t("guide.bottomFront"), color: "#FFF7ED", border: "#EA580C", icon: "BF", group: "bottom" },
    bottomFlapBack:  { name: t("panel.bottomFlapBack"), widthMM: L, heightMM: bottomH, guide: t("guide.bottomBack"), color: "#FFF7ED", border: "#EA580C", icon: "BB", group: "bottom" },
    bottomDustL: { name: t("panel.bottomDustL"), widthMM: W, heightMM: bottomDustH, guide: t("guide.sideTuck"), color: "#FAFAF9", border: "#A8A29E", icon: "DL", group: "bottom" },
    bottomDustR: { name: t("panel.bottomDustR"), widthMM: W, heightMM: bottomDustH, guide: "Side tuck", color: "#FAFAF9", border: "#A8A29E", icon: "DR", group: "bottom" },
    glueFlap: { name: t("panel.glueFlap"), widthMM: glueW, heightMM: D, guide: t("guide.glue"), color: "#F5F5F4", border: "#D6D3D1", icon: "G", group: "glue" },
  }), [L, W, D, tuckH, dustH, glueW, bottomH, bottomDustH, t]);
  const mainPanelOrder: PanelId[] = ["front","back","left","right"];
  const topPanelOrder: PanelId[] = ["topLid","topTuck","topDustL","topDustR"];
  const bottomPanelOrder: PanelId[] = ["bottomFlapFront","bottomFlapBack","bottomDustL","bottomDustR"];
  const extraPanelOrder: PanelId[] = ["glueFlap"];
  const fullOrder: PanelId[] = [...mainPanelOrder, ...topPanelOrder, ...bottomPanelOrder, ...extraPanelOrder];
  const exportFullNetPNG = useCallback(async () => {
    setExporting("net-png");
    try {
      const svgEl = document.querySelector("[data-export-net]") as SVGSVGElement;
      if (!svgEl) { alert("Net preview not found"); setExporting(null); return; }
      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("width", "4000");
      clone.setAttribute("height", "3000");
      const svgData = new XMLSerializer().serializeToString(clone);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const c2 = document.createElement("canvas");
        c2.width = 4000; c2.height = 3000;
        const ctx = c2.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 4000, 3000);
        ctx.drawImage(img, 0, 0, 4000, 3000);
        URL.revokeObjectURL(url);
        c2.toBlob((b) => {
          if (!b) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(b);
          a.download = "packive-net-" + boxType + "-" + L + "x" + W + "x" + D + ".png";
          a.click();
          URL.revokeObjectURL(a.href);
          setExporting(null);
        }, "image/png");
      };
      img.src = url;
    } catch (e) { console.error(e); setExporting(null); }
  }, [boxType, L, W, D]);

  const exportPDF = useCallback(async () => {
    setExporting("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const fX = glueW + T;
      const lX = fX + L + T;
      const bX = lX + W + T;
      const rX = bX + L + T;
      const tW = rX + W;
      const tlY = tuckH + T;
      const bY = tlY + W;
      const btY = bY + D + T;
      const tH = btY + Math.max(bottomH, bottomDustH);
      const mg = 10;
      const pW = tW + mg * 2;
      const pH = tH + mg * 2;
      const doc = new jsPDF({
        orientation: pW > pH ? "landscape" : "portrait",
        unit: "mm",
        format: [Math.max(pW, pH), Math.min(pW, pH)],
      });
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pW, pH, "F");
      const positions: Record<string, { x: number; y: number; w: number; h: number }> = {
        topTuck: { x: fX, y: 0, w: L, h: tuckH },
        topLid: { x: fX, y: tlY, w: L, h: W },
        topDustL: { x: lX, y: bY - dustH, w: W, h: dustH },
        topDustR: { x: rX, y: bY - dustH, w: W, h: dustH },
        glueFlap: { x: 0, y: bY, w: glueW, h: D },
        front: { x: fX, y: bY, w: L, h: D },
        left: { x: lX, y: bY, w: W, h: D },
        back: { x: bX, y: bY, w: L, h: D },
        right: { x: rX, y: bY, w: W, h: D },
        bottomFlapFront: { x: fX, y: btY, w: L, h: bottomH },
        bottomDustL: { x: lX, y: btY, w: W, h: bottomDustH },
        bottomFlapBack: { x: bX, y: btY, w: L, h: bottomH },
        bottomDustR: { x: rX, y: btY, w: W, h: bottomDustH },
      };
      for (const [pid, p] of Object.entries(positions)) {
        const px = mg + p.x;
        const py = mg + p.y;
        const pnl = panels[pid];
        const pc = panelConfig[pid as PanelId];
        if (p.w <= 0 || p.h <= 0) continue;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        if (pnl?.designed) {
          doc.setFillColor(250, 250, 250);
        } else {
          const hx = (pc?.color || "#f0f0f0").replace("#", "");
          doc.setFillColor(
            parseInt(hx.substring(0, 2), 16),
            parseInt(hx.substring(2, 4), 16),
            parseInt(hx.substring(4, 6), 16)
          );
        }
        doc.rect(px, py, p.w, p.h, "FD");
        if (pnl?.thumbnail) {
          try { doc.addImage(pnl.thumbnail, "PNG", px, py, p.w, p.h); } catch (e) { console.warn(e); }
        } else if (pc) {
          doc.setFontSize(Math.min(p.w * 0.15, p.h * 0.15, 8));


          doc.setTextColor(180, 180, 180);
          doc.text(pc.name, px + p.w / 2, py + p.h / 2, { align: "center", baseline: "middle" });
        }
      }
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text("Packive | " + boxTypeDisplay + " | " + L + "x" + W + "x" + D + "mm | " + matLabel, mg, tH + mg + 6);
      doc.save("packive-" + boxType + "-" + L + "x" + W + "x" + D + ".pdf");
    } catch (e) { console.error(e); alert("PDF export failed"); }
    setExporting(null);
  }, [boxType, boxTypeDisplay, L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH, matLabel, panels, panelConfig]);

    // ── Enhanced PDF Export: High-res with die lines, fold lines, bleed ──
    const exportPDFEnhanced = useCallback(async () => {
      setExporting("pdf-enhanced");
      try {
        const { jsPDF } = await import("jspdf");
        const { Canvas: FabricCanvas } = await import("fabric");
        const BLEED = 5; // mm
        const GLUE_BLEED = 5;
        const MULTIPLIER = 8; // 8x resolution for high quality
  
                // PDF에서는 T(종이두께) 갭 없이 면이 바로 붙음
                const fX = glueW;
                const lX = fX + L;
                const bX = lX + W;
                const rX = bX + L;
                const tW = rX + W;
                const tlY = tuckH;
                const bY = tlY + W;
                const btY = bY + D;
                const tH = btY + Math.max(bottomH, bottomDustH);
                const mg = BLEED + 8;
                const pW = tW + mg * 2;
                const pH = tH + mg * 2 + 12;
        
                const doc = new jsPDF({
                  orientation: pW > pH ? "landscape" : "portrait",
                  unit: "mm",
                  format: [Math.max(pW, pH), Math.min(pW, pH)],
                });
        
                doc.setFillColor(255, 255, 255);
                doc.rect(0, 0, pW + 50, pH + 50, "F");
        
                const positions: Record<string, { x: number; y: number; w: number; h: number }> = {
                  topTuck: { x: fX, y: 0, w: L, h: tuckH },
                  topLid: { x: fX, y: tlY, w: L, h: W },
                  topDustL: { x: lX, y: bY - dustH, w: W, h: dustH },
                  topDustR: { x: rX, y: bY - dustH, w: W, h: dustH },
                  glueFlap: { x: 0, y: bY, w: glueW, h: D },
                  front: { x: fX, y: bY, w: L, h: D },
                  left: { x: lX, y: bY, w: W, h: D },
                  back: { x: bX, y: bY, w: L, h: D },
                  right: { x: rX, y: bY, w: W, h: D },
                  bottomFlapFront: { x: fX, y: btY, w: L, h: bottomH },
                  bottomDustL: { x: lX, y: btY, w: W, h: bottomDustH },
                  bottomFlapBack: { x: bX, y: btY, w: L, h: bottomH },
                  bottomDustR: { x: rX, y: btY, w: W, h: bottomDustH },
                };
        
  
        const renderPanel = async (json: string, wMM: number, hMM: number): Promise<string | null> => {
          try {
            const DPI = 300;
            const MM_TO_PX = DPI / 25.4;
            const pxW = Math.round(wMM * MM_TO_PX);
            const pxH = Math.round(hMM * MM_TO_PX);
            const data = JSON.parse(json);
            const origW = data.width || 400;
            const origH = data.height || 400;
            // First: load at original size
            const offCanvas = document.createElement("canvas");
            offCanvas.width = origW;
            offCanvas.height = origH;
            const fc = new FabricCanvas(offCanvas, { width: origW, height: origH, backgroundColor: "#ffffff" });
            await new Promise<void>((resolve) => {
              fc.loadFromJSON(data).then(() => {
                fc.getObjects().forEach((obj: any) => {
                  if (obj._isSafeZone || obj._isGuideLine || obj._isGuideText || obj._isSizeLabel || obj._isBgPattern) {
                    fc.remove(obj);
                  }
                });
                fc.renderAll();
                resolve();
              });
            });
            // Second: export at high resolution using multiplier
            const multiplier = pxW / origW;
            const url = fc.toDataURL({ format: "png", multiplier: Math.max(multiplier, 1) });
            fc.dispose();
            return url;
          } catch (e) {
            console.warn("renderPanel failed", e);
            return null;
          }
        };

        // Render all designed panels at high resolution
        for (const [pid, p] of Object.entries(positions)) {
          const px = mg + p.x;
          const py = mg + p.y;
          const pnl = panels[pid];
          const pc = panelConfig[pid as PanelId];
          if (p.w <= 0 || p.h <= 0) continue;
  
          // Panel background white
          doc.setFillColor(255, 255, 255);
          doc.rect(px, py, p.w, p.h, "F");
  
          // High-res panel image
          if (pnl?.designed && pnl.json) {
            const hiRes = await renderPanel(pnl.json, p.w, p.h);
            if (hiRes) {
              try { doc.addImage(hiRes, "PNG", px, py, p.w, p.h); } catch (e) { console.warn(e); }
            } else if (pnl.thumbnail) {
              try { doc.addImage(pnl.thumbnail, "PNG", px, py, p.w, p.h); } catch (e) { console.warn(e); }
            }
          } else if (pnl?.thumbnail) {
            try { doc.addImage(pnl.thumbnail, "PNG", px, py, p.w, p.h); } catch (e) { console.warn(e); }
          }
        }
          // === BLEED lines (green, solid) - outer contour only ===
          doc.setDrawColor(0, 180, 0);
          doc.setLineWidth(0.2);
          doc.setLineDashPattern([], 0);
          // Top edge bleed (topTuck top)
          doc.line(mg + fX - BLEED, mg + 0 - BLEED, mg + fX + L + BLEED, mg + 0 - BLEED);
          // Bottom edge bleed (bottom flaps)
          doc.line(mg + fX - BLEED, mg + tH + BLEED, mg + rX + W + BLEED, mg + tH + BLEED);
          // Left edge bleed (glue flap)
          doc.line(mg + 0 - GLUE_BLEED, mg + bY - BLEED, mg + 0 - GLUE_BLEED, mg + bY + D + BLEED);
          // Right edge bleed
          doc.line(mg + tW + BLEED, mg + bY - BLEED, mg + tW + BLEED, mg + bY + D + BLEED);
          // Full outer rectangle of body area
          doc.rect(mg + 0 - GLUE_BLEED, mg + bY - BLEED, tW + GLUE_BLEED + BLEED, D + BLEED * 2);
          // Top section bleed
          doc.rect(mg + fX - BLEED, mg + 0 - BLEED, L + BLEED * 2, bY + BLEED);
          // Bottom section bleed  
          doc.rect(mg + fX - BLEED, mg + btY - BLEED, rX + W - fX + BLEED * 2, Math.max(bottomH, bottomDustH) + BLEED * 2);
  
                // === DIE CUT lines (red, solid) - outer contour only ===
                doc.setDrawColor(230, 0, 0);
                doc.setLineWidth(0.3);
                doc.setLineDashPattern([], 0);
                
                // Draw outer contour of the entire net (not individual panel rects)
                // Top tuck top edge
                doc.line(mg + fX, mg + 0, mg + fX + L, mg + 0);
                // Top tuck sides
                doc.line(mg + fX, mg + 0, mg + fX, mg + tuckH);
                doc.line(mg + fX + L, mg + 0, mg + fX + L, mg + tuckH);
                // Top lid sides
                doc.line(mg + fX, mg + tuckH, mg + fX, mg + tlY);
                doc.line(mg + fX + L, mg + tuckH, mg + fX + L, mg + tlY);
                // Top lid to dust flaps transition
                doc.line(mg + fX, mg + tlY, mg + fX, mg + bY);
                doc.line(mg + fX + L, mg + tlY, mg + lX, mg + tlY);
                doc.line(mg + lX, mg + tlY, mg + lX, mg + bY - dustH);
                // Top dust L
                doc.line(mg + lX, mg + bY - dustH, mg + lX + W, mg + bY - dustH);
                doc.line(mg + lX + W, mg + bY - dustH, mg + lX + W, mg + bY);
                // Between dust L and back
                doc.line(mg + lX + W, mg + bY, mg + bX, mg + bY);
                doc.line(mg + bX, mg + bY, mg + bX + L, mg + bY);
                // Top dust R
                doc.line(mg + bX + L, mg + bY, mg + rX, mg + bY - dustH);
                doc.line(mg + rX, mg + bY - dustH, mg + rX + W, mg + bY - dustH);
                doc.line(mg + rX + W, mg + bY - dustH, mg + rX + W, mg + bY);
                // Right side top
                doc.line(mg + rX + W, mg + bY, mg + rX + W, mg + bY);
                
                // Glue flap left side
                doc.line(mg + 0, mg + bY, mg + 0, mg + bY + D);
                // Glue flap top/bottom
                doc.line(mg + 0, mg + bY, mg + glueW, mg + bY);
                doc.line(mg + 0, mg + bY + D, mg + glueW, mg + bY + D);
                
                // Main body top edge (left of front already drawn)
                doc.line(mg + fX + L, mg + bY, mg + lX, mg + bY); // gap area if any
                
                // Right outer edge
                doc.line(mg + rX + W, mg + bY, mg + rX + W, mg + bY + D);
                
                // Bottom flaps outer
                doc.line(mg + fX, mg + btY + bottomH, mg + fX + L, mg + btY + bottomH);
                doc.line(mg + fX, mg + bY + D, mg + fX, mg + btY + bottomH);
                doc.line(mg + fX + L, mg + bY + D, mg + fX + L, mg + btY + bottomH);
                
                doc.line(mg + lX, mg + btY + bottomDustH, mg + lX + W, mg + btY + bottomDustH);
                doc.line(mg + lX, mg + bY + D, mg + lX, mg + btY + bottomDustH);
                doc.line(mg + lX + W, mg + bY + D, mg + lX + W, mg + btY + bottomDustH);
                
                doc.line(mg + bX, mg + btY + bottomH, mg + bX + L, mg + btY + bottomH);
                doc.line(mg + bX, mg + bY + D, mg + bX, mg + btY + bottomH);
                doc.line(mg + bX + L, mg + bY + D, mg + bX + L, mg + btY + bottomH);
                
                doc.line(mg + rX, mg + btY + bottomDustH, mg + rX + W, mg + btY + bottomDustH);
                doc.line(mg + rX, mg + bY + D, mg + rX, mg + btY + bottomDustH);
                doc.line(mg + rX + W, mg + bY + D, mg + rX + W, mg + btY + bottomDustH);
        
                // === FOLD / CREASE lines (blue, dashed) - internal boundaries only ===
                doc.setDrawColor(0, 0, 200);
                doc.setLineWidth(0.25);
                doc.setLineDashPattern([2, 1.5], 0);
                const foldLines: number[][] = [
                  // Tuck to lid fold
                  [fX, tuckH, fX + L, tuckH],
                  // Lid to body fold  
                  [fX, tlY, fX + L, tlY],
                  // Lid bottom = body top for front
                  [fX, bY, fX + L, bY],
                  // Dust flap folds (top)
                  [lX, bY, lX + W, bY],
                  [rX, bY, rX + W, bY],
                  // Vertical folds between body panels
                  [fX + L, bY, fX + L, bY + D],
                  [lX + W, bY, lX + W, bY + D],
                  [bX + L, bY, bX + L, bY + D],
                  // Glue flap fold
                  [glueW, bY, glueW, bY + D],
                  // Body bottom to bottom flaps
                  [fX, bY + D, fX + L, bY + D],
                  [lX, bY + D, lX + W, bY + D],
                  [bX, bY + D, bX + L, bY + D],
                  [rX, bY + D, rX + W, bY + D],
                ];
                foldLines.forEach(([x1, y1, x2, y2]) => {
                  doc.line(mg + x1, mg + y1, mg + x2, mg + y2);
                });
                doc.setLineDashPattern([], 0);
        
        // === Crop marks ===
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.15);
        const cmLen = 6;
        const cmOff = 2;
        // Corners of entire net
        const netX = mg;
        const netY = mg;
        // Top-left of body
        doc.line(mg + 0 - cmOff - cmLen, mg + bY, mg + 0 - cmOff, mg + bY);
        doc.line(mg + 0, mg + bY - cmOff - cmLen, mg + 0, mg + bY - cmOff);
        // Top-right
        doc.line(mg + tW + cmOff, mg + bY, mg + tW + cmOff + cmLen, mg + bY);
        doc.line(mg + tW, mg + bY - cmOff - cmLen, mg + tW, mg + bY - cmOff);
        // Bottom-left
        doc.line(mg + 0 - cmOff - cmLen, mg + bY + D, mg + 0 - cmOff, mg + bY + D);
        doc.line(mg + 0, mg + bY + D + cmOff, mg + 0, mg + bY + D + cmOff + cmLen);
        // Bottom-right
        doc.line(mg + tW + cmOff, mg + bY + D, mg + tW + cmOff + cmLen, mg + bY + D);
        doc.line(mg + tW, mg + bY + D + cmOff, mg + tW, mg + bY + D + cmOff + cmLen);
  
        // === Legend ===
        const legendY = tH + mg + 4;
        doc.setFontSize(6);
        // Die cut legend
        doc.setDrawColor(230, 0, 0); doc.setLineWidth(0.3); doc.setLineDashPattern([], 0);
        doc.line(mg, legendY, mg + 8, legendY);
        doc.setTextColor(80, 80, 80); doc.text("DIE CUT", mg + 10, legendY + 0.5);
        // Fold legend
        doc.setDrawColor(0, 0, 200); doc.setLineWidth(0.25); doc.setLineDashPattern([2, 1.5], 0);
        doc.line(mg + 30, legendY, mg + 38, legendY);
        doc.setLineDashPattern([], 0);
        doc.text("CREASE / FOLD", mg + 40, legendY + 0.5);
        // Bleed legend
        doc.setDrawColor(0, 180, 0); doc.setLineWidth(0.2);
        doc.line(mg + 70, legendY, mg + 78, legendY);
        doc.text("BLEED (" + BLEED + "mm)", mg + 80, legendY + 0.5);
  
        // === Footer info ===
        doc.setFontSize(5.5);
        doc.setTextColor(120, 120, 120);
        doc.text(
          "Packive | " + boxTypeDisplay + " | " + L + "×" + W + "×" + D + "mm | " + matLabel +
          " | Design Area: " + tW.toFixed(1) + "×" + tH.toFixed(1) + "mm | Bleed: " + BLEED + "mm | Paper: " + T + "mm",
          mg, legendY + 5
        );
  
        doc.save("packive-print-" + boxType + "-" + L + "x" + W + "x" + D + "mm-HQ.pdf");
      } catch (e) { console.error(e); alert("Enhanced PDF export failed"); }
      setExporting(null);
    }, [boxType, boxTypeDisplay, L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH, matLabel, panels, panelConfig]);
  
  const exportIndividualPNG = useCallback(async () => {
    setExporting("individual");
    try {
      const dp = Object.entries(panels).filter(([, d]) => d.designed && d.thumbnail);
      if (dp.length === 0) { alert(t("ov.noDesigned")); setExporting(null); return; }
      for (const [pid, data] of dp) {
        const pc = panelConfig[pid as PanelId];
        if (!pc || !data.thumbnail) continue;
        const a = document.createElement("a");
        a.href = data.thumbnail;
        a.download = "packive-" + pid + "-" + pc.widthMM + "x" + pc.heightMM + "mm.png";
        a.click();
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (e) { console.error(e); }
    setExporting(null);
  }, [panels, panelConfig]);

  const export3DScreenshot = useCallback(() => {
    setExporting("3d");
    try {
      const el = document.querySelector("[data-export-3d] canvas") as HTMLCanvasElement;
      if (!el) { alert("3D not found"); setExporting(null); return; }
      const a = document.createElement("a");
      a.href = el.toDataURL("image/png");
      a.download = "packive-3d-" + boxType + "-" + L + "x" + W + "x" + D + ".png";
      a.click();
    } catch (e) { console.error(e); }
    setExporting(null);
  }, [boxType, L, W, D]);

  const handleSave = useCallback((panelId: string, json: string, thumbnail: string) => {
    setPanels((prev) => ({ ...prev, [panelId]: { json, thumbnail, designed: true } }));
    // Auto-save to localStorage
    try {
      const storageKey = "packive_project_" + boxType + "_" + L + "_" + W + "_" + D;
      const up = Object.assign({}, panelsRef.current, { [panelId]: { json: json, thumbnail: thumbnail, designed: true } });
      localStorage.setItem(storageKey, JSON.stringify({ panels: up, savedAt: new Date().toISOString() }));
    } catch (e) { console.warn("auto-save failed", e); }
  }, []);
  const copyDesign = useCallback((fromId: string, toId: string) => {
    const source = panels[fromId];
    if (!source || !source.designed) return;
    setPanels(prev => ({
      ...prev,
      [toId]: { json: source.json, thumbnail: source.thumbnail, designed: true }
    }));
    setCopySource(null);
  }, [panels]);
  

  // ── Save/Load entire project ──
  const saveProject = useCallback(async () => {
    const projectData = {
      version: 1,
      boxType, boxTypeDisplay, L, W, D, materialId, matLabel,
      panels,
      savedAt: new Date().toISOString(),
    };
    const data = JSON.stringify(projectData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const fileName = 'packive-' + boxType + '-' + L + 'x' + W + 'x' + D + '.json';
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'Packive Project', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  }, [boxType, boxTypeDisplay, L, W, D, materialId, matLabel, panels]);

  const loadProject = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (!text || !text.trim()) { alert('Empty file'); return; }
        const project = JSON.parse(text);
        if (!project.version || !project.panels) {
          alert('Invalid project file');
          return;
        }
        // Restore all panels
        const restored: Record<string, PanelData> = {};
        allPanelIds.forEach((id) => {
          if (project.panels[id] && project.panels[id].designed) {
            restored[id] = project.panels[id];
          } else {
            restored[id] = { json: null, thumbnail: null, designed: false };
          }
        });
        setPanels(restored);
      } catch (err) {
        console.error('Project load error:', err);
        alert('Failed to load project file');
      }
    };
    input.click();
  }, []);

  // Sync currentView to URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentView === "overview") {
      url.searchParams.delete("panel");
    } else {
      url.searchParams.set("panel", currentView);
    }
    window.history.replaceState({}, "", url.toString());
  }, [currentView]);


  const navigatePanel = useCallback((direction: "next" | "prev") => {
    const idx = fullOrder.indexOf(currentView as PanelId);
    if (direction === "next" && idx < fullOrder.length - 1) setCurrentView(fullOrder[idx + 1]);
    else if (direction === "prev" && idx > 0) setCurrentView(fullOrder[idx - 1]);
    else setCurrentView("overview");
  }, [currentView, fullOrder]);

  const bodyDesigned = mainPanelOrder.filter((id: PanelId) => panels[id].designed).length;
  const topDesigned = topPanelOrder.filter((id: PanelId) => panels[id].designed).length;
  const bottomDesigned = [...bottomPanelOrder, ...extraPanelOrder].filter((id: PanelId) => panels[id].designed).length;
  const totalDesigned = bodyDesigned + topDesigned + bottomDesigned;
  
  if (currentView === "overview") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b shadow-sm px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/editor/new")} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                {t("ov.back")}
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{t("ov.title")}</h1>
                <p className="text-xs text-gray-500">
                  {boxTypeDisplay} | L{L} x W{W} x D{D} mm | {matLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{totalDesigned}/13</span>
              <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: (totalDesigned / 13) * 100 + "%" }} />
              </div>
              <button
                onClick={saveProject}
                className="px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                title={t("ov.saveProject")}
              >
                {t("ov.saveProject")}
              </button>
              <button
                onClick={loadProject}
                className="px-3 py-2 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                title={t("ov.loadProject")}
              >
                {t("ov.loadProject")}
              </button>
              <button
                disabled={bodyDesigned === 0}
                onClick={() => setShowExport(true)}
                className={"px-4 py-2 text-sm rounded-lg transition " + (bodyDesigned > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
              >
                {t("ov.export")}
              </button>
            <LanguageSelector />
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("ov.diecutRef")}</h3>
              {previewUrl ? (
                <img src={previewUrl} alt="Die-cut" className="w-full h-auto rounded-lg" style={{ maxHeight: "260px", objectFit: "contain" }} />
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">{t("ov.noPreview")}</div>
              )}
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t("ov.designPreview")}</h3>
            <FullNetPreview
                L={L} W={W} D={D} T={T}
                tuckH={tuckH} dustH={dustH} glueW={glueW}
                bottomH={bottomH} bottomDustH={bottomDustH}
                panels={panels} panelConfig={panelConfig}
                onClickPanel={(pid: PanelId) => setCurrentView(pid)}
                previewUrl={previewUrl}
              />
              <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-0.5 text-[10px] text-gray-400">

                <span>{t("ov.tuck")}: {tuckH}mm</span>
                <span>{t("ov.glue")}: {glueW}mm</span>
                <span>{t("ov.dust")}: {dustH}mm</span>
                <span>{t("ov.bottom")}: {bottomH}mm</span>
                <span>{t("ov.paper")}: {T}mm</span>
                <span>{t("ov.material")}: {matLabel}</span>
              </div>
            </div>
          </div>
          <div data-export-3d>
            <Box3DPreview L={L} W={W} D={D} panels={panels} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t("ov.mainBody")}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {mainPanelOrder.map((pid: PanelId, idx: number) => (
             <PanelCard key={pid} idx={idx} cfg={panelConfig[pid]} data={panels[pid]} onClick={() => setCurrentView(pid)} onCopy={() => setCopySource(pid)} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">{t("ov.topSection")}</h3>
            <p className="text-xs text-gray-400 mb-3">{t("ov.topDesc")}</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {topPanelOrder.map((pid: PanelId) => (
                <SmallPanelCard key={pid} cfg={panelConfig[pid]} data={panels[pid]} onClick={() => setCurrentView(pid)} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">{t("ov.bottomSection")}</h3>
            <p className="text-xs text-gray-400 mb-3">{t("ov.bottomDesc")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[...bottomPanelOrder, ...extraPanelOrder].map((pid: PanelId) => (
                <SmallPanelCard key={pid} cfg={panelConfig[pid]} data={panels[pid]} onClick={() => setCurrentView(pid)} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                {[
                  { label: t("ov.stepDieCut"), done: true, partial: false },
                  { label: t("ov.stepBody") + " (" + bodyDesigned + "/4)", done: bodyDesigned === 4, partial: bodyDesigned > 0 },
                  { label: t("ov.stepTop") + " (" + topDesigned + "/4)", done: topDesigned === 4, partial: topDesigned > 0 },
                  { label: t("ov.stepBottom") + " (" + bottomDesigned + "/5)", done: bottomDesigned === 5, partial: bottomDesigned > 0 },
                  { label: t("ov.stepExport"), done: false, partial: false },
                ].map((step, i, arr) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={"w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold " + (step.done ? "bg-green-500 text-white" : step.partial ? "bg-amber-400 text-white" : "bg-gray-200 text-gray-400")}>
                      {step.done ? "V" : i + 1}
                    </div>
                    <span className={"text-xs " + (step.done ? "text-green-700 font-medium" : step.partial ? "text-amber-700" : "text-gray-400")}>{step.label}</span>
                    {i < arr.length - 1 && <div className={"w-6 h-0.5 " + (step.done ? "bg-green-300" : "bg-gray-200")} />}
                  </div>
                ))}
              </div>
             
             

              <button onClick={() => setCurrentView("front")} className="px-4 py-2 text-sm rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition shrink-0">
                {totalDesigned === 0 ? t("ov.startDesigning") : totalDesigned < 13 ? t("ov.continue") : t("ov.reviewExport")}
              </button>
            </div>
          </div>
        </div>
        {showExport && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowExport(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{t("ov.exportDesign")}</h2>
                <button onClick={() => setShowExport(false)} className="text-gray-400 hover:text-gray-600 text-xl">X</button>
              </div>
              <p className="text-sm text-gray-500">
                {boxTypeDisplay} | {L}x{W}x{D}mm | {matLabel} | {totalDesigned}/13 panels
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={exportFullNetPNG} disabled={exporting !== null} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition text-center">
                  <span className="text-2xl">NET</span>
                  <span className="text-sm font-semibold text-gray-800">{t("ov.fullNetPng")}</span>
                  <span className="text-[10px] text-gray-400">{t("ov.fullNetDesc")}</span>
                  {exporting === "net-png" && <span className="text-[10px] text-blue-500">{t("ov.exporting")}</span>}
                </button>
                <button onClick={exportPDFEnhanced} disabled={exporting !== null} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition text-center">
                  <span className="text-2xl font-bold text-red-600">PDF</span>
                  <span className="text-sm font-semibold text-gray-800">HQ Print-Ready</span>
                  <span className="text-[10px] text-gray-400">300dpi / Die-cut / Fold / Bleed</span>
                  {exporting === "pdf-enhanced" && <span className="text-[10px] text-red-500">Rendering...</span>}
                </button>
                <button onClick={exportIndividualPNG} disabled={exporting !== null || totalDesigned === 0} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition text-center disabled:opacity-40">
                  <span className="text-2xl">PNG</span>
                  <span className="text-sm font-semibold text-gray-800">Individual Panels</span>
                  <span className="text-[10px] text-gray-400">{totalDesigned} panel(s) as PNGs</span>
                  {exporting === "individual" && <span className="text-[10px] text-green-500">{t("ov.exporting")}</span>}
                </button>
                <button onClick={export3DScreenshot} disabled={exporting !== null} className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition text-center">
                  <span className="text-2xl">3D</span>
                  <span className="text-sm font-semibold text-gray-800">{t("ov.screenshot3d")}</span>
                  <span className="text-[10px] text-gray-400">{t("ov.screenshot3dDesc")}</span>
                  {exporting === "3d" && <span className="text-[10px] text-purple-500">Exporting...</span>}
                </button>
              </div>
              <div className="pt-2 border-t text-center">
                <button onClick={() => setShowExport(false)} className="text-sm text-gray-500 hover:text-gray-700">{t("ov.close")}</button>
              </div>
            </div>
          </div>
        )}

        {copySource && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setCopySource(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-80" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-1">{t("ov.copyDesign")}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Copy <strong>{panelConfig[copySource as PanelId]?.name}</strong> design to:
              </p>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {(Object.keys(panelConfig) as PanelId[]).filter(pid => pid !== copySource).map(pid => (
                  <button key={pid} onClick={() => copyDesign(copySource, pid)}
                    className="text-left px-3 py-2 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition text-sm flex justify-between items-center">
                    <span>{panelConfig[pid].name}</span>
                    <span className="text-xs text-gray-400">{panelConfig[pid].widthMM}x{panelConfig[pid].heightMM}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setCopySource(null)} className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const cfg = panelConfig[currentView as PanelId];
  if (!cfg) { setCurrentView("overview"); return null; }
  const currentIdx = fullOrder.indexOf(currentView as PanelId);
  return (
    <PanelEditor
      panelId={currentView}
      panelName={cfg.name}

      widthMM={cfg.widthMM}
      heightMM={cfg.heightMM}
      guideText={cfg.guide}
      savedJSON={panels[currentView]?.json || null}
      onSave={handleSave}
      onBack={() => setCurrentView("overview")}
      onPrevPanel={currentIdx > 0 ? () => navigatePanel("prev") : undefined}
      onNextPanel={currentIdx < fullOrder.length - 1 ? () => navigatePanel("next") : undefined}
    />
  );
}
function PanelCard({ idx, cfg, data, onClick, onCopy }: { idx: number; cfg: PanelConfig; data: PanelData; onClick: () => void; onCopy?: () => void }) {
  const { t } = useI18n();
  return (
    <button onClick={onClick} className="group bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all overflow-hidden text-left" style={{ borderColor: data.designed ? "#22C55E" : cfg.border }}>
      <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ aspectRatio: cfg.widthMM + "/" + cfg.heightMM, backgroundColor: data.designed ? "#FAFAFA" : cfg.color, maxHeight: "180px" }}>
        {data.thumbnail ? (
          <img src={data.thumbnail} alt={cfg.name} className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl opacity-30">{cfg.icon}</span>
            <span className="text-xs text-gray-400 group-hover:text-gray-600 transition">{t("ov.clickToDesign")}</span>
          </div>
        )}
        <span className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: cfg.border }}>{idx + 1}</span>
        {data.designed && <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow">V</span>}
      </div>
      <div className="p-3 border-t">
        <p className="text-sm font-semibold text-gray-900">{cfg.name}</p>
        <p className="text-xs text-gray-500">{cfg.widthMM} x {cfg.heightMM} mm</p>
        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{cfg.guide}</p>
        {data.designed && onCopy && (
  <span role="button" onClick={(e) => { e.stopPropagation(); onCopy(); }}
  className="mt-1 text-[10px] text-blue-500 hover:text-blue-700 font-medium cursor-pointer">
  {t("ov.copyTo")}
</span>
)}
      </div>
    </button>
  );
}

function SmallPanelCard({ cfg, data, onClick }: { cfg: PanelConfig; data: PanelData; onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button onClick={onClick} className="bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all overflow-hidden text-left" style={{ borderColor: data.designed ? "#22C55E" : cfg.border + "60" }}>
      <div className="w-full flex items-center justify-center overflow-hidden" style={{ height: "70px", backgroundColor: data.designed ? "#FAFAFA" : cfg.color }}>
        {data.thumbnail ? <img src={data.thumbnail} alt={cfg.name} className="h-full object-contain" /> : <span className="text-xl opacity-30">{cfg.icon}</span>}
      </div>
      <div className="p-2 border-t">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-800 truncate">{cfg.name}</p>
          {data.designed && <span className="text-[9px] text-green-600 font-bold">V</span>}
        </div>
        <p className="text-[10px] text-gray-400">{cfg.widthMM} x {cfg.heightMM} mm</p>
      </div>
    </button>
  );
}

function FullNetPreview({ L, W, D, T, tuckH, dustH, glueW, bottomH, bottomDustH, panels, panelConfig, onClickPanel, previewUrl }: {
  L: number; W: number; D: number; T: number;
  tuckH: number; dustH: number; glueW: number;
  bottomH: number; bottomDustH: number;
  panels: Record<string, PanelData>;
  panelConfig: Record<string, PanelConfig>;
  onClickPanel: (pid: PanelId) => void;
  previewUrl?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState(100);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });
  const [hoveredPanel, setHoveredPanel] = React.useState<string | null>(null);

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
  const tuckInset = Math.min(tuckH * 0.35, L * 0.12);
  const tuckNotch = tuckH * 0.18;
  const dustTaper = Math.min(dustH * 0.4, 6);
  const dustRad = Math.min(dustH * 0.35, 5);
  const glueTaper = Math.min(glueW * 0.3, D * 0.12);
  const bottomTaper = Math.min(bottomH * 0.25, 5);
  const bottomDustTaper = Math.min(bottomDustH * 0.4, 6);

  function pp(pid: string, p: { x: number; y: number; w: number; h: number }): string {
    const x = p.x, y = p.y, w = p.w, h = p.h;
    switch (pid) {
      case "topTuck": return "M "+(x+tuckNotch)+" "+(y+h)+" L "+x+" "+(y+h-tuckNotch)+" L "+(x+tuckInset)+" "+y+" Q "+(x+w/2)+" "+(y-h*0.08)+" "+(x+w-tuckInset)+" "+y+" L "+(x+w)+" "+(y+h-tuckNotch)+" L "+(x+w-tuckNotch)+" "+(y+h)+" Z";
      case "topDustL": case "topDustR": return "M "+x+" "+(y+h)+" L "+x+" "+(y+dustTaper)+" Q "+x+" "+y+" "+(x+dustRad)+" "+y+" L "+(x+w-dustRad)+" "+y+" Q "+(x+w)+" "+y+" "+(x+w)+" "+(y+dustTaper)+" L "+(x+w)+" "+(y+h)+" Z";
      case "glueFlap": return "M "+(x+w)+" "+y+" L "+x+" "+(y+glueTaper)+" L "+x+" "+(y+h-glueTaper)+" L "+(x+w)+" "+(y+h)+" Z";
      case "bottomFlapFront": case "bottomFlapBack": return "M "+x+" "+y+" L "+(x+w)+" "+y+" L "+(x+w)+" "+(y+h-bottomTaper)+" L "+(x+w-bottomTaper)+" "+(y+h)+" L "+(x+bottomTaper)+" "+(y+h)+" L "+x+" "+(y+h-bottomTaper)+" Z";
      case "bottomDustL": case "bottomDustR": { const r5 = Math.min(bottomDustTaper * 0.8, 4); return "M "+x+" "+y+" L "+(x+w)+" "+y+" L "+(x+w)+" "+(y+h-bottomDustTaper)+" Q "+(x+w)+" "+(y+h)+" "+(x+w-r5)+" "+(y+h)+" L "+(x+r5)+" "+(y+h)+" Q "+x+" "+(y+h)+" "+x+" "+(y+h-bottomDustTaper)+" Z"; }
      default: return "M "+x+" "+y+" L "+(x+w)+" "+y+" L "+(x+w)+" "+(y+h)+" L "+x+" "+(y+h)+" Z";
    }
  }

  const pos: Record<string, { x: number; y: number; w: number; h: number }> = {
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
  };

  const pad = 4;
  const anyDesigned = Object.values(panels).some((p) => p.designed);

  // 줌 프리셋
  const ZOOM_PRESETS = [25, 33, 50, 66, 100, 150, 200, 300, 400];

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom(prev => Math.max(10, Math.min(800, prev + delta)));
  }, []);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = React.useCallback(() => {
    setIsPanning(false);
  }, []);

  const fitToScreen = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth - 20;
    const ch = container.clientHeight - 20;
    const scaleX = cw / (totalW + pad * 2);
    const scaleY = ch / (totalH + pad * 2);
    const fitZoom = Math.floor(Math.min(scaleX, scaleY) * 100);
    setZoom(Math.max(10, Math.min(800, fitZoom)));
    setPan({ x: 0, y: 0 });
  }, [totalW, totalH]);

  // 초기 fit
  React.useEffect(() => { fitToScreen(); }, [fitToScreen]);

  return (
    <div className="relative">
      {/* 줌 컨트롤 바 */}
      <div className="flex items-center justify-between bg-gray-100 border border-gray-200 rounded-t-lg px-3 py-1.5">
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(prev => Math.max(10, prev - 25))} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 text-sm font-bold">−</button>
          <select value={ZOOM_PRESETS.includes(zoom) ? zoom : ''} onChange={e => { if (e.target.value === 'fit') { fitToScreen(); } else { setZoom(Number(e.target.value)); } }}
            className="text-xs bg-white border border-gray-300 rounded px-1 py-0.5 w-20 text-center outline-none">
            {ZOOM_PRESETS.map(z => <option key={z} value={z}>{z}%</option>)}
            <option value="fit">Fit</option>
            {!ZOOM_PRESETS.includes(zoom) && <option value={zoom}>{zoom}%</option>}
          </select>
          <button onClick={() => setZoom(prev => Math.min(800, prev + 25))} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 text-sm font-bold">+</button>
          <span className="text-[10px] text-gray-400 ml-2">Scroll to zoom · Alt+drag to pan</span>
        </div>
        <button onClick={fitToScreen} className="text-[10px] text-blue-600 hover:text-blue-800 font-medium">Fit to Screen</button>
      </div>

      {/* 캔버스 영역 */}
      <div ref={containerRef}
        className="bg-white border border-t-0 border-gray-200 rounded-b-lg overflow-hidden relative"
        style={{ height: '400px', cursor: isPanning ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 체크 패턴 배경 */}
        <div className="absolute inset-0 bg-white" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`, transformOrigin: 'center center', transition: isPanning ? 'none' : 'transform 0.15s ease' }}>
            {!anyDesigned && previewUrl ? (
              <img src={previewUrl} alt="Die-cut net" style={{ maxWidth: totalW + 'px', maxHeight: totalH + 'px' }} />
            ) : (
              <svg data-export-net viewBox={(-pad)+" "+(-pad)+" "+(totalW+pad*2)+" "+(totalH+pad*2)} width={totalW + pad * 2} height={totalH + pad * 2}>
                <defs>
                  {Object.entries(pos).map(([pid, p]) => {
                    if (p.w <= 0 || p.h <= 0) return null;
                    return <clipPath key={"clip-"+pid} id={"clip-"+pid}><path d={pp(pid, p)} /></clipPath>;
                  })}
                </defs>
                <rect x={-pad} y={-pad} width={totalW+pad*2} height={totalH+pad*2} fill="#ffffff" rx={1} />
                {/* 접힘선 */}
                {[
                  [frontX, bodyY, frontX+L, bodyY], [frontX+L, bodyY, frontX+L, bodyY+D],
                  [leftX+W, bodyY, leftX+W, bodyY+D], [backX+L, bodyY, backX+L, bodyY+D],
                  [frontX, bottomY, frontX+L, bottomY], [leftX, bottomY, leftX+W, bottomY],
                  [backX, bottomY, backX+L, bottomY], [rightX, bottomY, rightX+W, bottomY],
                  [frontX, topLidY, frontX+L, topLidY], [frontX, tuckY+tuckH, frontX+L, tuckY+tuckH],
                  [leftX, bodyY, leftX+W, bodyY], [rightX, bodyY, rightX+W, bodyY],
                  [glueW, bodyY, glueW, bodyY+D],
                ].map((ln, i) => (
                  <line key={"fl"+i} x1={ln[0]} y1={ln[1]} x2={ln[2]} y2={ln[3]} stroke="#00AA00" strokeWidth={0.3} strokeDasharray="2 1" />
                ))}
                {/* 패널들 */}
                {Object.entries(pos).map(([pid, p]) => {
                  const pc = panelConfig[pid as PanelId];
                  const d = panels[pid];
                  if (!pc || p.w <= 0 || p.h <= 0) return null;
                  const isHovered = hoveredPanel === pid;
                  return (
                    <g key={pid} className="cursor-pointer"
                      onClick={() => onClickPanel(pid as PanelId)}
                      onMouseEnter={() => setHoveredPanel(pid)}
                      onMouseLeave={() => setHoveredPanel(null)}>
                        {/* 투명 히트 영역 - 클릭/호버 감지용 */}
                        <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="transparent" />
                        <path d={pp(pid, p)}
                        fill={d?.designed ? "#FAFAFA" : pc.color}
                        fillOpacity={1}
                        stroke={isHovered ? "#2563EB" : d?.designed ? "#22C55E" : pc.border}
                        strokeWidth={isHovered ? 1.5 : d?.designed ? 0.8 : 0.5}
                        style={{ transition: 'stroke 0.15s, stroke-width 0.15s', pointerEvents: 'all' }} />

                      {d?.thumbnail && (
                        <image href={d.thumbnail} x={p.x} y={p.y} width={p.w} height={p.h} preserveAspectRatio="none" clipPath={"url(#clip-"+pid+")"} />
                      )}
                      {!d?.thumbnail && p.w > 10 && p.h > 6 && (
                        <text x={p.x+p.w/2} y={p.y+p.h/2} textAnchor="middle" dominantBaseline="middle"
                          fontSize={Math.max(Math.min(p.w*0.06, p.h*0.08, 6), 2)} fill={isHovered ? "#2563EB" : "#9CA3AF"}
                          className="pointer-events-none select-none">{pc.name.replace(" (Main)","")}</text>
                      )}
                      {d?.designed && p.w > 6 && (
                        <React.Fragment>
                          <circle cx={p.x+p.w-3} cy={p.y+3} r={2} fill="#22C55E" />
                          <text x={p.x+p.w-3} y={p.y+3} textAnchor="middle" dominantBaseline="central" fontSize={2} fill="white" fontWeight="bold" className="pointer-events-none">✓</text>
                        </React.Fragment>
                      )}
                      {/* 호버 시 패널 이름 툴팁 */}
                      {isHovered && (
                        <React.Fragment>
                          <rect x={p.x + p.w/2 - 20} y={p.y - 8} width={40} height={7} rx={1} fill="rgba(0,0,0,0.75)" />
                          <text x={p.x + p.w/2} y={p.y - 4.5} textAnchor="middle" dominantBaseline="middle"
                            fontSize={3.5} fill="white" className="pointer-events-none select-none">{pc.name}</text>
                        </React.Fragment>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* 줌 표시 */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
          {zoom}%
        </div>
      </div>
    </div>
  );
}


export default function DesignPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-500">Loading editor...</div>}>
      <DesignPageInner />
    </Suspense>
  );
}
