"use client";
import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useI18n } from "@/components/i18n-context";

// ─── Types ───
interface UnifiedEditorProps {
  L: number; W: number; D: number;
  material: string;
  boxType: string;
  onBack: () => void;
}

type RightTab = "properties" | "aiCopy" | "aiReview" | "aiImage" | "layers";

// ─── Material helpers (same as page.tsx) ───
type MatCat = "white-cardboard" | "kraft-paperboard" | "single-flute" | "double-flute";
function getMatCat(m: string): MatCat {
  if (m.startsWith("white-")) return "white-cardboard";
  if (m.startsWith("kraft-")) return "kraft-paperboard";
  if (["eb-flute","cb-flute","bb-flute","ba-flute"].includes(m)) return "double-flute";
  return "single-flute";
}
function getTuckH(m: string): number {
  if (["c-flute","a-flute"].includes(m)) return 30;
  const c = getMatCat(m);
  return c === "double-flute" ? 35 : c === "single-flute" ? 25 : 15;
}
function getGlueW(m: string): number { return getTuckH(m); }
function getBottomH(W: number, m: string): number {
  const h = W / 2;
  if (m === "b-flute") return h + 25;
  if (["c-flute","a-flute"].includes(m)) return h + 30;
  const c = getMatCat(m);
  return c === "double-flute" ? h + 30 : c === "single-flute" ? h + 20 : h + 15;
}
function getDustH(W: number): number { return W / 2; }
function getThickness(m: string): number {
  const c = getMatCat(m);
  return c === "double-flute" ? 3 : c === "single-flute" ? 1.5 : 0.5;
}

// ─── Panel path generator ───
function panelPath(pid: string, p: {x:number;y:number;w:number;h:number}, geo: any): string {
  const { x, y, w, h } = p;
  const { tuckInset, tuckNotch, dustTaper, dustRad, glueTaper, bottomTaper, bottomDustTaper } = geo;
  switch (pid) {
    case "topTuck": return `M ${x+tuckNotch} ${y+h} L ${x} ${y+h-tuckNotch} L ${x+tuckInset} ${y} Q ${x+w/2} ${y-h*0.08} ${x+w-tuckInset} ${y} L ${x+w} ${y+h-tuckNotch} L ${x+w-tuckNotch} ${y+h} Z`;
    case "topDustL": case "topDustR": return `M ${x} ${y+h} L ${x} ${y+dustTaper} Q ${x} ${y} ${x+dustRad} ${y} L ${x+w-dustRad} ${y} Q ${x+w} ${y} ${x+w} ${y+dustTaper} L ${x+w} ${y+h} Z`;
    case "glueFlap": return `M ${x+w} ${y} L ${x} ${y+glueTaper} L ${x} ${y+h-glueTaper} L ${x+w} ${y+h} Z`;
    case "bottomFlapFront": case "bottomFlapBack": return `M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h-bottomTaper} L ${x+w-bottomTaper} ${y+h} L ${x+bottomTaper} ${y+h} L ${x} ${y+h-bottomTaper} Z`;
    case "bottomDustL": case "bottomDustR": { const r5 = Math.min(bottomDustTaper*0.8,4); return `M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h-bottomDustTaper} Q ${x+w} ${y+h} ${x+w-r5} ${y+h} L ${x+r5} ${y+h} Q ${x} ${y+h} ${x} ${y+h-bottomDustTaper} Z`; }
    default: return `M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h} L ${x} ${y+h} Z`;
  }
}

export default function UnifiedEditor({ L, W, D, material, boxType, onBack }: UnifiedEditorProps) {
  const { t, locale } = useI18n();
  
  // ─── Geometry calculations ───
  const T = getThickness(material);
  const tuckH = getTuckH(material);
  const dustH = getDustH(W);
  const glueW = getGlueW(material);
  const bottomH = getBottomH(W, material);
  const bottomDustH = dustH;

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
  const geo = { tuckInset, tuckNotch, dustTaper, dustRad, glueTaper, bottomTaper, bottomDustTaper };

  const pos: Record<string, {x:number;y:number;w:number;h:number}> = {
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

  // ─── Canvas refs & state ───
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fcRef = useRef<any>(null);
  const fabricModRef = useRef<any>(null);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(0);
  const loadingRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scaleRef = useRef(1); // px per mm

  // ─── UI state ───
  const [rightTab, setRightTab] = useState<RightTab>("properties");
  const [color, setColor] = useState("#000000");
  const [fSize, setFSize] = useState(24);
  const [selectedFont, setSelectedFont] = useState("Arial, sans-serif");
  const [zoom, setZoom] = useState(100);
  const zoomRef = useRef(100);
  const [drawMode, setDrawMode] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [showGrid, setShowGrid] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [showBarcodePanel, setShowBarcodePanel] = useState(false);
  const [showTablePanel, setShowTablePanel] = useState(false);
  const [showMarkPanel, setShowMarkPanel] = useState(false);
  const [barcodeType, setBarcodeType] = useState<'qrcode'|'ean13'|'upca'|'code128'|'code39'|'itf14'>('qrcode');
  const [barcodeValue, setBarcodeValue] = useState("");
  const [tableRows, setTableRows] = useState(4);
  const [tableCols, setTableCols] = useState(2);
  const [layersList, setLayersList] = useState<{id:string;type:string;name:string;visible:boolean;locked:boolean}[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  // AI states
  const [copyProduct, setCopyProduct] = useState("");
  const [copyBrand, setCopyBrand] = useState("");
  const [copyResult, setCopyResult] = useState<any>(null);
  const [copyLoading, setCopyLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [aiImgCategory, setAiImgCategory] = useState<'logo'|'product'|'background'|'illustration'|'icon'|'free'>('product');
  const [aiImgPrompt, setAiImgPrompt] = useState("");
  const [aiImgTransparent, setAiImgTransparent] = useState(true);
  const [aiImgLoading, setAiImgLoading] = useState(false);
  const [aiImgResults, setAiImgResults] = useState<string[]>([]);

  // ─── PADDING for die-cut display ───
  const PAD = 15; // mm padding around net
  const CANVAS_PAD = 30; // extra px padding in canvas


  // ─── Fold lines (mm coordinates) ───
  const foldLines = useMemo(() => {
    const lines: [number,number,number,number][] = [];
    // Vertical folds between body panels
    [frontX, leftX, backX, rightX, rightX + W].forEach(x => {
      lines.push([x, topLidY, x, bottomY + Math.max(bottomH, bottomDustH)]);
    });
    // Horizontal folds
    lines.push([frontX, topLidY, frontX + L, topLidY]); // tuck-lid
    lines.push([0, bodyY, totalW, bodyY]); // top of body
    lines.push([0, bottomY, totalW, bottomY]); // bottom of body
    // Glue flap top/bottom
    lines.push([0, bodyY, glueW, bodyY]);
    lines.push([0, bodyY + D, glueW, bodyY + D]);
    // Dust flap folds
    lines.push([leftX, bodyY - dustH, leftX + W, bodyY - dustH]);
    lines.push([rightX, bodyY - dustH, rightX + W, bodyY - dustH]);
    return lines;
  }, [frontX, leftX, backX, rightX, totalW, topLidY, bodyY, bottomY, L, W, D, glueW, dustH, tuckH, bottomH, bottomDustH]);

  // ─── History ───
  const pushHistory = useCallback(() => {
    const c = fcRef.current; if (!c || loadingRef.current) return;
    const json = JSON.stringify(c.toJSON(["_isDieLine","_isFoldLine","_isGuideLayer","_isPanelLabel","selectable","evented","name"]));
    const h = historyRef.current;
    h.splice(historyIdxRef.current + 1);
    h.push(json);
    if (h.length > 50) h.shift();
    historyIdxRef.current = h.length - 1;
  }, []);

  const undo = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    loadingRef.current = true;
    await c.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current]));
    c.requestRenderAll();
    loadingRef.current = false;
    refreshLayers();
  }, []);

  const redo = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    loadingRef.current = true;
    await c.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current]));
    c.requestRenderAll();
    loadingRef.current = false;
    refreshLayers();
  }, []);

  // ─── Layer management ───
  const refreshLayers = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    const objs = c.getObjects().filter((o: any) =>
      o.selectable !== false && !o._isDieLine && !o._isFoldLine && !o._isGuideLayer && !o._isPanelLabel
    );
    const list = objs.map((o: any, i: number) => ({
      id: o.__id || ("obj_" + i),
      type: o.type || "object",
      name: o.text ? (o.text.substring(0, 20) + (o.text.length > 20 ? "..." : "")) : (o.type === "image" ? "Image" : o.type || "Shape"),
      locked: !!o.lockMovementX,
      visible: o.visible !== false,
    })).reverse();
    setLayersList(list);
  }, []);

  // ─── Zoom ───
  const applyZoom = useCallback((newZoom: number) => {
    const c = fcRef.current; if (!c) return;
    const z = Math.max(25, Math.min(800, newZoom));
    const vpt = c.viewportTransform || [1,0,0,1,0,0];
    vpt[0] = z / 100;
    vpt[3] = z / 100;
    c.setViewportTransform(vpt);
    c.requestRenderAll();
    setZoom(z);
    zoomRef.current = z;
  }, []);

  // ─── Draw dieline guide layer on Fabric canvas ───
  const drawGuideLayer = useCallback(async (canvas: any, scale: number) => {
    const F = fabricModRef.current; if (!F) return;

    // Die-cut outline paths for each panel
    Object.entries(pos).forEach(([pid, p]) => {
      if (p.w <= 0 || p.h <= 0) return;
      const sp = { x: (p.x + PAD) * scale, y: (p.y + PAD) * scale, w: p.w * scale, h: p.h * scale };
      const pathStr = panelPath(pid, sp, {
        tuckInset: tuckInset * scale, tuckNotch: tuckNotch * scale,
        dustTaper: dustTaper * scale, dustRad: dustRad * scale,
        glueTaper: glueTaper * scale, bottomTaper: bottomTaper * scale,
        bottomDustTaper: bottomDustTaper * scale,
      });
      const path = new F.Path(pathStr, {
        fill: "transparent", stroke: "#FF0000", strokeWidth: 0.8,
        selectable: false, evented: false, _isDieLine: true, _isGuideLayer: true,
      });
      canvas.add(path);
    });

    // Fold lines
    foldLines.forEach(([x1, y1, x2, y2]) => {
      const line = new F.Line([
        (x1 + PAD) * scale, (y1 + PAD) * scale,
        (x2 + PAD) * scale, (y2 + PAD) * scale
      ], {
        stroke: "#00AA00", strokeWidth: 0.6, strokeDashArray: [4, 2],
        selectable: false, evented: false, _isFoldLine: true, _isGuideLayer: true,
      });
      canvas.add(line);
    });

    // Panel labels
    const labelSize = Math.max(8, Math.min(14, L * scale * 0.08));
    Object.entries(pos).forEach(([pid, p]) => {
      if (p.w <= 0 || p.h <= 0) return;
      const cx = (p.x + PAD + p.w / 2) * scale;
      const cy = (p.y + PAD + p.h / 2) * scale;
      const label = new F.FabricText(pid.replace(/([A-Z])/g, " $1").trim(), {
        left: cx, top: cy, originX: "center", originY: "center",
        fontSize: labelSize, fill: "rgba(0,0,0,0.12)",
        fontFamily: "Arial, sans-serif", selectable: false, evented: false,
        _isPanelLabel: true, _isGuideLayer: true,
      });
      canvas.add(label);
    });
  }, [pos, foldLines, PAD, tuckInset, tuckNotch, dustTaper, dustRad, glueTaper, bottomTaper, bottomDustTaper, L]);

  // ─── Canvas initialization ───
  useEffect(() => {
    let disposed = false;

    const boot = async () => {
      const waitForLayout = () => new Promise<void>(resolve => {
        const check = () => {
          if (disposed) { resolve(); return; }
          const w = wrapperRef.current;
          if (w && w.clientWidth > 100 && w.clientHeight > 100) { resolve(); return; }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });
      await waitForLayout();
      await new Promise(r => setTimeout(r, 100));
      if (disposed || !canvasElRef.current || !wrapperRef.current) return;

      const fabricMod = await import("fabric");
      fabricModRef.current = fabricMod;
      const { Canvas } = fabricMod;

      if (fcRef.current) {
        try { fcRef.current.dispose(); } catch {}
        fcRef.current = null;
      }

      const cw = wrapperRef.current!.clientWidth;
      const ch = wrapperRef.current!.clientHeight;
      const netW = totalW + PAD * 2;
      const netH = totalH + PAD * 2;

      // Calculate scale: fit net into available space
      const availW = cw - 40;
      const availH = ch - 40;
      const fitScale = Math.min(availW / netW, availH / netH);
      const pxPerMM = Math.max(fitScale, 1.5); // minimum 1.5 px/mm for clarity
      scaleRef.current = pxPerMM;

      const canvasW = Math.round(netW * pxPerMM);
      const canvasH = Math.round(netH * pxPerMM);

      const el = canvasElRef.current!;
      el.width = canvasW;
      el.height = canvasH;
      el.style.width = canvasW + "px";
      el.style.height = canvasH + "px";

      if (disposed) return;

      const canvas = new Canvas(el, {
        width: canvasW, height: canvasH,
        backgroundColor: "#FFFFFF",
        selection: true,
        perPixelTargetFind: false,
      });

      fcRef.current = canvas;
      canvas.fireRightClick = true;
      canvas.stopContextMenu = true;

      // Draw guide layer (die lines, fold lines, labels)
      await drawGuideLayer(canvas, pxPerMM);

      // Bring guide layer to back
      canvas.getObjects().filter((o: any) => o._isGuideLayer).forEach((o: any) => {
        canvas.sendObjectToBack(o);
      });

      // Event handlers
      canvas.on("object:modified", () => { if (!loadingRef.current) { pushHistory(); refreshLayers(); } });
      canvas.on("path:created", () => { if (!loadingRef.current) { pushHistory(); refreshLayers(); } });
      canvas.on("selection:created", () => refreshLayers());
      canvas.on("selection:updated", () => refreshLayers());
      canvas.on("selection:cleared", () => refreshLayers());

      // Mouse wheel zoom
      canvas.on("mouse:wheel", (opt: any) => {
        opt.e.preventDefault();
        const delta = opt.e.deltaY > 0 ? -10 : 10;
        const newZ = Math.max(25, Math.min(800, zoomRef.current + delta));
        applyZoom(newZ);
      });

      // Initial history snapshot
      pushHistory();
      refreshLayers();

      // Fit to screen
      const fitZ = Math.floor(Math.min(availW / canvasW, availH / canvasH) * 100);
      if (fitZ < 100) applyZoom(Math.max(25, fitZ));
    };

    boot();

    return () => {
      disposed = true;
      if (fcRef.current) {
        try { fcRef.current.dispose(); } catch {}
        fcRef.current = null;
      }
    };
  }, [L, W, D, material]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const c = fcRef.current; if (!c) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
      else if (e.key === "Delete" || e.key === "Backspace") {
        const active = c.getActiveObjects();
        if (active.length > 0) {
          active.filter((o: any) => o.selectable !== false).forEach((o: any) => c.remove(o));
          c.discardActiveObject(); c.requestRenderAll(); pushHistory(); refreshLayers();
        }
      }
      else if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        const sel = c.getObjects().filter((o: any) => o.selectable !== false);
        if (sel.length > 0) {
          const F = fabricModRef.current;
          const as = new F.ActiveSelection(sel, { canvas: c });
          c.setActiveObject(as); c.requestRenderAll();
        }
      }
      else if (e.key === "F1") { e.preventDefault(); setShowShortcuts(prev => !prev); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [undo, redo, pushHistory, refreshLayers]);


  // ─── Add Text ───
  const addText = useCallback(async (preset?: string) => {
    const c = fcRef.current; if (!c) return;
    const F = fabricModRef.current; if (!F) return;
    const cx = c.getWidth() / 2, cy = c.getHeight() / 2;
    let fontSize = fSize * scaleRef.current;
    let text = "Text";
    if (preset === "heading") { fontSize = 36 * scaleRef.current; text = "Heading"; }
    else if (preset === "subheading") { fontSize = 24 * scaleRef.current; text = "Subheading"; }
    else if (preset === "body") { fontSize = 14 * scaleRef.current; text = "Body text"; }
    const t = new F.IText(text, {
      left: cx, top: cy, originX: "center", originY: "center",
      fontSize: Math.round(fontSize), fill: color, fontFamily: selectedFont,
    });
    c.add(t); c.setActiveObject(t); c.renderAll(); refreshLayers(); pushHistory();
    setShowTextPanel(false);
  }, [color, fSize, selectedFont, refreshLayers, pushHistory]);

  // ─── Add Shape ───
  const addShape = useCallback(async (type: string) => {
    const c = fcRef.current; if (!c) return;
    const F = fabricModRef.current; if (!F) return;
    const { Rect, Circle, Ellipse, Triangle, Polygon, Path, Line: FL } = F;
    const cx = c.getWidth() / 2, cy = c.getHeight() / 2;
    let s: any = null;
    const sz = 30 * scaleRef.current;
    const hsz = sz / 2;

    if (type === "rect") s = new Rect({ left: cx-sz, top: cy-hsz, width: sz*2, height: sz, fill: color });
    else if (type === "roundrect") s = new Rect({ left: cx-sz, top: cy-hsz, width: sz*2, height: sz, fill: color, rx: 12, ry: 12 });
    else if (type === "circle") s = new Circle({ left: cx-hsz, top: cy-hsz, radius: hsz, fill: color });
    else if (type === "ellipse") s = new Ellipse({ left: cx-sz, top: cy-hsz*0.7, rx: sz, ry: hsz*0.7, fill: color });
    else if (type === "triangle") s = new Triangle({ left: cx-hsz, top: cy-hsz, width: sz, height: sz, fill: color });
    else if (type === "diamond") { const r = hsz; s = new Polygon([{x:cx,y:cy-r},{x:cx+r,y:cy},{x:cx,y:cy+r},{x:cx-r,y:cy}], { fill: color }); }
    else if (type === "pentagon") { const pts: {x:number;y:number}[] = []; for(let i=0;i<5;i++){const a=(Math.PI/2*3)+(i*2*Math.PI/5); pts.push({x:cx+Math.cos(a)*hsz,y:cy+Math.sin(a)*hsz});} s = new Polygon(pts, { fill: color }); }
    else if (type === "hexagon") { const pts: {x:number;y:number}[] = []; for(let i=0;i<6;i++){const a=i*Math.PI/3; pts.push({x:cx+Math.cos(a)*hsz,y:cy+Math.sin(a)*hsz});} s = new Polygon(pts, { fill: color }); }
    else if (type === "star") { const pts: {x:number;y:number}[] = []; for(let i=0;i<10;i++){const r=i%2===0?hsz:hsz*0.5; const a=(Math.PI/2*3)+(i*Math.PI/5); pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});} s = new Polygon(pts, { fill: color }); }
    else if (type === "heart") s = new Path("M 25 45 L 5 25 A 10 10 0 0 1 25 10 A 10 10 0 0 1 45 25 Z", { left: cx-22, top: cy-22, fill: color });
    else if (type === "arrow") s = new Path("M 0 15 L 50 15 L 50 5 L 70 20 L 50 35 L 50 25 L 0 25 Z", { left: cx-35, top: cy-20, fill: color });
    else if (type === "bubble") s = new Path("M 5 5 Q 5 0 10 0 L 60 0 Q 65 0 65 5 L 65 35 Q 65 40 60 40 L 25 40 L 15 50 L 18 40 L 10 40 Q 5 40 5 35 Z", { left: cx-32, top: cy-25, fill: color });
    else if (type === "line") s = new FL([cx-sz, cy, cx+sz, cy], { stroke: color, strokeWidth: 3, fill: "" });
    else if (type === "dashed") s = new FL([cx-sz, cy, cx+sz, cy], { stroke: color, strokeWidth: 3, strokeDashArray: [10,5], fill: "" });
    else if (type === "cross") { s = new Polygon([{x:cx-hsz*0.33,y:cy-hsz},{x:cx+hsz*0.33,y:cy-hsz},{x:cx+hsz*0.33,y:cy-hsz*0.33},{x:cx+hsz,y:cy-hsz*0.33},{x:cx+hsz,y:cy+hsz*0.33},{x:cx+hsz*0.33,y:cy+hsz*0.33},{x:cx+hsz*0.33,y:cy+hsz},{x:cx-hsz*0.33,y:cy+hsz},{x:cx-hsz*0.33,y:cy+hsz*0.33},{x:cx-hsz,y:cy+hsz*0.33},{x:cx-hsz,y:cy-hsz*0.33},{x:cx-hsz*0.33,y:cy-hsz*0.33}], { fill: color }); }
    else if (type === "ring") s = new Circle({ left: cx-hsz, top: cy-hsz, radius: hsz, fill: "", stroke: color, strokeWidth: 8 });

    if (s) { c.add(s); c.setActiveObject(s); c.renderAll(); refreshLayers(); pushHistory(); }
    setShowShapePanel(false);
  }, [color, refreshLayers, pushHistory]);

  // ─── Add Image ───
  const addImage = useCallback(() => { fileRef.current?.click(); }, []);
  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const c = fcRef.current; if (!c) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const { FabricImage } = await import("fabric");
      const img = await FabricImage.fromURL(reader.result as string);
      const sc = Math.min(c.getWidth() * 0.4 / (img.width || 1), c.getHeight() * 0.4 / (img.height || 1), 1);
      img.set({ left: c.getWidth() / 2, top: c.getHeight() / 2, originX: "center", originY: "center", scaleX: sc, scaleY: sc });
      c.add(img); c.setActiveObject(img); c.renderAll(); refreshLayers(); pushHistory();
    };
    reader.readAsDataURL(file); e.target.value = "";
  }, [refreshLayers, pushHistory]);

  // ─── Toggle Draw ───
  const toggleDraw = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    const fab = fabricModRef.current;
    if (drawMode) { c.isDrawingMode = false; setDrawMode(false); }
    else {
      c.isDrawingMode = true;
      if (fab && fab.PencilBrush) {
        const brush = new fab.PencilBrush(c);
        brush.color = color; brush.width = brushSize;
        c.freeDrawingBrush = brush;
      }
      setDrawMode(true);
    }
  }, [drawMode, color, brushSize]);

  // ─── Barcode ───
  const addBarcodeToCanvas = useCallback(async () => {
    const cv = fcRef.current; if (!cv || !barcodeValue.trim()) return;
    try {
      const bwipjs = await import("@bwip-js/browser" as any);
      const canvas = document.createElement("canvas");
      let val = barcodeValue.trim();
      if (barcodeType === "ean13" && val.length === 13) val = val.slice(0, 12);
      if (barcodeType === "upca" && val.length === 12) val = val.slice(0, 11);
      if (barcodeType === "itf14" && val.length >= 14) val = val.slice(0, 13);
      const opts: any = { bcid: barcodeType, text: val, scale: 3, includetext: barcodeType !== "qrcode", textxalign: "center", includecheck: true };
      if (barcodeType === "qrcode") { opts.height = 30; opts.width = 30; } else { opts.height = 12; }
      bwipjs.toCanvas(canvas, opts);
      const dataUrl = canvas.toDataURL("image/png");
      const { FabricImage } = await import("fabric");
      const img = await FabricImage.fromURL(dataUrl);
      const maxSize = Math.min(cv.getWidth(), cv.getHeight()) * 0.25;
      const scale = Math.min(maxSize / (img.width || 200), maxSize / (img.height || 200));
      img.set({ left: cv.getWidth() / 2, top: cv.getHeight() / 2, originX: "center", originY: "center", scaleX: scale, scaleY: scale });
      cv.add(img); cv.setActiveObject(img); cv.renderAll(); pushHistory();
    } catch (e: any) { alert("Barcode failed: " + (e.message || "Invalid")); }
  }, [barcodeType, barcodeValue, pushHistory]);

  // ─── Table ───
  const addTableToCanvas = useCallback(async () => {
    const cv = fcRef.current; if (!cv) return;
    const F = await import("fabric");
    const cellW = Math.min(100, Math.floor(cv.getWidth() * 0.4 / tableCols));
    const cellH = 24;
    const tw = cellW * tableCols, th = cellH * tableRows;
    const sc = 3;
    const off = document.createElement("canvas");
    off.width = (tw + 1) * sc; off.height = (th + 1) * sc;
    const ctx = off.getContext("2d")!; ctx.scale(sc, sc);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, off.width, off.height);
    ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1;
    for (let r = 0; r <= tableRows; r++) { const y = r * cellH + 0.5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tw, y); ctx.stroke(); }
    for (let c = 0; c <= tableCols; c++) { const x = c * cellW + 0.5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, th); ctx.stroke(); }
    const img = await F.FabricImage.fromURL(off.toDataURL("image/png"));
    img.set({ left: cv.getWidth() / 2, top: cv.getHeight() / 2, originX: "center", originY: "center", scaleX: 1 / sc, scaleY: 1 / sc });
    (img as any)._isTable = true;
    cv.add(img); cv.setActiveObject(img); cv.renderAll(); pushHistory();
    setShowTablePanel(false);
  }, [tableRows, tableCols, pushHistory]);

  // ─── Packaging Marks ───
  const MARKS = useMemo(() => [
    { cat: "Recycling", items: [
      { id: "recycle", label: "Recycling", svg: "M12 2L8 6h3v4H9L5 6l4-4h3zm0 20l4-4h-3v-4h2l4 4-4 4h-3z" },
      { id: "fsc", label: "FSC", text: "FSC" },
      { id: "paper", label: "Paper", text: "PAP" },
      { id: "plastic1", label: "PETE", text: "1\nPETE" },
      { id: "greenDot", label: "Green Dot", text: "GD" },
    ]},
    { cat: "Safety", items: [
      { id: "fragile", label: "Fragile", text: "FRAGILE" },
      { id: "thisWayUp", label: "This Way Up", text: "UP ↑" },
      { id: "keepDry", label: "Keep Dry", text: "☂" },
      { id: "noSun", label: "No Sunlight", text: "☀✕" },
    ]},
    { cat: "Food/Cosmetics", items: [
      { id: "pao", label: "PAO", text: "12M" },
      { id: "vegan", label: "Vegan", text: "VEGAN" },
      { id: "organic", label: "Organic", text: "ORG" },
      { id: "halal", label: "Halal", text: "HALAL" },
      { id: "kosher", label: "Kosher", text: "K" },
    ]},
    { cat: "Export", items: [
      { id: "ce", label: "CE", text: "CE" },
      { id: "ukca", label: "UKCA", text: "UKCA" },
      { id: "rohs", label: "RoHS", text: "RoHS" },
      { id: "weee", label: "WEEE", text: "WEEE" },
    ]},
    { cat: "Certification", items: [
      { id: "iso", label: "ISO", text: "ISO" },
      { id: "haccp", label: "HACCP", text: "HACCP" },
      { id: "kc", label: "KC", text: "KC" },
      { id: "gmp", label: "GMP", text: "GMP" },
    ]},
  ], []);

  const addMarkToCanvas = useCallback(async (mark: { id: string; label: string; text?: string }) => {
    const cv = fcRef.current; if (!cv) return;
    const F = fabricModRef.current; if (!F) return;
    const sz = 20 * scaleRef.current;
    // Create mark as circle + text group
    const circle = new F.Circle({ radius: sz, fill: "transparent", stroke: "#333", strokeWidth: 1.5, originX: "center", originY: "center" });
    const txt = new F.FabricText(mark.text || mark.label, {
      fontSize: Math.max(8, sz * 0.55), fill: "#333", fontFamily: "Arial, sans-serif",
      fontWeight: "bold", originX: "center", originY: "center", textAlign: "center",
    });
    const grp = new F.Group([circle, txt], {
      left: cv.getWidth() / 2, top: cv.getHeight() / 2, originX: "center", originY: "center",
    });
    cv.add(grp); cv.setActiveObject(grp); cv.renderAll(); pushHistory(); refreshLayers();
    setShowMarkPanel(false);
  }, [pushHistory, refreshLayers]);

  // ─── AI Copy ───
  const handleAiCopy = useCallback(async () => {
    if (!copyProduct.trim()) return; setCopyLoading(true); setCopyResult(null);
    try {
      const r = await fetch("/api/ai/generate-copy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productName: copyProduct, brandName: copyBrand || undefined, language: locale }) });
      const d = await r.json(); if (d.error) throw new Error(d.error); setCopyResult(d);
    } catch (e: any) { alert("AI Copy: " + e.message); }
    setCopyLoading(false);
  }, [copyProduct, copyBrand, locale]);

  const applyCopyToCanvas = useCallback((field: string, value: string) => {
    const c = fcRef.current; if (!c) return;
    const F = fabricModRef.current; if (!F) return;
    const sz: Record<string, number> = { headline: 28, description: 16, slogan: 20, features: 14, backPanel: 12 };
    const t = new F.IText(value, {
      left: c.getWidth() / 2, top: c.getHeight() / 2, originX: "center", originY: "center",
      fontSize: Math.round((sz[field] || 16) * scaleRef.current), fill: "#000", fontFamily: selectedFont,
    });
    c.add(t); c.setActiveObject(t); c.renderAll(); refreshLayers(); pushHistory();
  }, [selectedFont, refreshLayers, pushHistory]);

  // ─── AI Review ───
  const handleAiReview = useCallback(async () => {
    const c = fcRef.current; if (!c) return; setReviewLoading(true); setReviewResult(null);
    try {
      const d = c.toDataURL({ format: "png", multiplier: 2 });
      const r = await fetch("/api/ai/review-design", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: d.replace(/^data:image\/[a-z]+;base64,/, ""), boxType: boxType, dimensions: { width: totalW, height: totalH }, material: material, language: locale }) });
      const data = await r.json(); if (data.error) throw new Error(data.error); setReviewResult(data);
    } catch (e: any) { alert("AI Review: " + e.message); }
    setReviewLoading(false);
  }, [boxType, totalW, totalH, material, locale]);

  // ─── AI Image ───
  const handleAiImage = useCallback(async () => {
    if (!aiImgPrompt.trim() || aiImgLoading) return;
    setAiImgLoading(true);
    try {
      const r = await fetch("/api/ai/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: aiImgCategory, prompt: aiImgPrompt, transparent: aiImgTransparent }) });
      const data = await r.json(); if (data.error) throw new Error(data.error);
      if (data.image) setAiImgResults(prev => [data.image, ...prev].slice(0, 12));
    } catch (e: any) { alert("Image generation failed: " + (e.message || "Unknown")); }
    finally { setAiImgLoading(false); }
  }, [aiImgPrompt, aiImgCategory, aiImgTransparent, aiImgLoading]);

  const addAiImageToCanvas = useCallback(async (src: string) => {
    const cv = fcRef.current; if (!cv) return;
    const { FabricImage } = await import("fabric");
    const img = await FabricImage.fromURL(src);
    const maxSize = Math.min(cv.getWidth(), cv.getHeight()) * 0.4;
    const scale = Math.min(maxSize / (img.width || 300), maxSize / (img.height || 300));
    img.set({ left: cv.getWidth() / 2, top: cv.getHeight() / 2, originX: "center", originY: "center", scaleX: scale, scaleY: scale });
    cv.add(img); cv.setActiveObject(img); cv.renderAll(); pushHistory();
  }, [pushHistory]);

  // ─── Export ───
  const handleExport = useCallback(async (type: "png" | "pdf" | "dieline") => {
    const c = fcRef.current; if (!c) return;
    setExporting(type);
    try {
      if (type === "png") {
        // Hide guide layers, export, restore
        const guides = c.getObjects().filter((o: any) => o._isGuideLayer);
        guides.forEach((o: any) => o.set({ visible: false }));
        c.requestRenderAll();
        const dataUrl = c.toDataURL({ format: "png", multiplier: 4 });
        guides.forEach((o: any) => o.set({ visible: true }));
        c.requestRenderAll();
        const link = document.createElement("a");
        link.href = dataUrl; link.download = "packive-design.png"; link.click();
      } else if (type === "pdf") {
        const { jsPDF } = await import("jspdf");
        const guides = c.getObjects().filter((o: any) => o._isGuideLayer);
        guides.forEach((o: any) => o.set({ visible: false }));
        c.requestRenderAll();
        const dataUrl = c.toDataURL({ format: "png", multiplier: 4 });
        guides.forEach((o: any) => o.set({ visible: true }));
        c.requestRenderAll();
        const doc = new jsPDF({ orientation: totalW > totalH ? "landscape" : "portrait", unit: "mm", format: [totalW + PAD * 2, totalH + PAD * 2] });
        doc.addImage(dataUrl, "PNG", 0, 0, totalW + PAD * 2, totalH + PAD * 2);
        doc.save("packive-design.pdf");
      } else if (type === "dieline") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ orientation: totalW > totalH ? "landscape" : "portrait", unit: "mm", format: [totalW + PAD * 2, totalH + PAD * 2] });
        // Draw die-cut lines
        doc.setDrawColor(255, 0, 0); doc.setLineWidth(0.3);
        Object.entries(pos).forEach(([pid, p]) => {
          if (p.w <= 0 || p.h <= 0) return;
          const sp = { x: p.x + PAD, y: p.y + PAD, w: p.w, h: p.h };
          // Simple rect for non-special panels
          if (["front","left","back","right","topLid"].includes(pid)) {
            doc.rect(sp.x, sp.y, sp.w, sp.h);
          }
        });
        // Fold lines
        doc.setDrawColor(0, 170, 0); doc.setLineDashPattern([2, 1], 0);
        foldLines.forEach(([x1, y1, x2, y2]) => { doc.line(x1 + PAD, y1 + PAD, x2 + PAD, y2 + PAD); });
        doc.save("packive-dieline.pdf");
      }
    } catch (e: any) { alert("Export failed: " + e.message); }
    setExporting(null); setShowExport(false);
  }, [totalW, totalH, pos, foldLines, PAD]);


  // ─── Selected object properties ───
  const getSelectedProps = useCallback(() => {
    const c = fcRef.current; if (!c) return null;
    const obj = c.getActiveObject();
    if (!obj || obj._isGuideLayer) return null;
    return {
      type: obj.type || "object",
      fill: obj.fill || "#000000",
      stroke: obj.stroke || "",
      strokeWidth: obj.strokeWidth || 0,
      opacity: (obj.opacity ?? 1) * 100,
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
      height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
      angle: Math.round(obj.angle || 0),
      fontSize: obj.fontSize || 0,
      fontFamily: obj.fontFamily || "",
      fontWeight: obj.fontWeight || "normal",
      fontStyle: obj.fontStyle || "normal",
      textAlign: obj.textAlign || "left",
      text: obj.text || "",
      obj: obj,
    };
  }, []);

  const [selProps, setSelProps] = useState<any>(null);
  useEffect(() => {
    const c = fcRef.current; if (!c) return;
    const update = () => setSelProps(getSelectedProps());
    c.on("selection:created", update);
    c.on("selection:updated", update);
    c.on("selection:cleared", () => setSelProps(null));
    c.on("object:modified", update);
    c.on("object:scaling", update);
    c.on("object:moving", update);
    c.on("object:rotating", update);
    return () => {
      c.off("selection:created", update);
      c.off("selection:updated", update);
      c.off("selection:cleared");
      c.off("object:modified", update);
    };
  }, [getSelectedProps]);

  const updateProp = useCallback((key: string, value: any) => {
    const c = fcRef.current; if (!c) return;
    const obj = c.getActiveObject(); if (!obj) return;
    if (key === "opacity") obj.set({ opacity: value / 100 });
    else if (key === "fontSize") obj.set({ fontSize: Number(value) });
    else if (key === "fontFamily") obj.set({ fontFamily: value });
    else if (key === "fontWeight") obj.set({ fontWeight: value === "bold" ? "bold" : "normal" });
    else if (key === "fontStyle") obj.set({ fontStyle: value === "italic" ? "italic" : "normal" });
    else if (key === "textAlign") obj.set({ textAlign: value });
    else if (key === "fill") obj.set({ fill: value });
    else if (key === "stroke") obj.set({ stroke: value });
    else if (key === "strokeWidth") obj.set({ strokeWidth: Number(value) });
    else if (key === "angle") obj.set({ angle: Number(value) });
    c.requestRenderAll();
    setSelProps(getSelectedProps());
    pushHistory();
  }, [getSelectedProps, pushHistory]);

  // ─── Google Fonts (subset) ───
  const FONTS = useMemo(() => [
    "Arial, sans-serif", "Georgia, serif", "Courier New, monospace",
    "Noto Sans KR", "Noto Serif KR", "Black Han Sans", "Jua", "Gothic A1",
    "Noto Sans JP", "Noto Serif JP",
    "Inter", "Montserrat", "Poppins", "Lato", "Open Sans", "Roboto",
    "Playfair Display", "Lora", "Merriweather",
    "Bebas Neue", "Anton", "Oswald",
    "Pacifico", "Dancing Script",
  ], []);

  // ─── RENDER ───
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden select-none">
      {/* ═══ TOP BAR ═══ */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 z-20">
        <button onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium">
          <span className="text-lg">&#8592;</span> Back
        </button>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{boxType}</span>
          <span className="text-xs text-gray-500">{L} x {W} x {D} mm</span>
        </div>
        <div className="flex-1" />
        {/* Undo / Redo */}
        <button onClick={undo} title="Undo (Ctrl+Z)" className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600">&#8630;</button>
        <button onClick={redo} title="Redo (Ctrl+Y)" className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600">&#8631;</button>
        <div className="w-px h-8 bg-gray-200" />
        {/* Zoom */}
        <button onClick={() => applyZoom(zoom - 25)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-sm">-</button>
        <span className="text-xs text-gray-600 w-12 text-center">{zoom}%</span>
        <button onClick={() => applyZoom(zoom + 25)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-sm">+</button>
        <button onClick={() => applyZoom(100)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Fit</button>
        <div className="w-px h-8 bg-gray-200" />
        <button onClick={() => setShowExport(true)} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Export
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ═══ LEFT TOOLBAR ═══ */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-1 shrink-0 overflow-y-auto">
          {[
            { icon: "↖", label: "Select", action: () => { const c = fcRef.current; if(c){ c.isDrawingMode = false; setDrawMode(false); } } },
            { icon: "T", label: "Text", action: () => setShowTextPanel(p => !p) },
            { icon: "🖼", label: "Image", action: addImage },
            { icon: "◆", label: "Shapes", action: () => setShowShapePanel(p => !p) },
            { icon: "⊞", label: "Table", action: () => setShowTablePanel(p => !p) },
            { icon: "▮▯", label: "Barcode", action: () => setShowBarcodePanel(p => !p) },
            { icon: "◎", label: "Marks", action: () => setShowMarkPanel(p => !p) },
            { icon: "✎", label: "Draw", action: toggleDraw },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.label}
              className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-colors ${
                (btn.label === "Draw" && drawMode) ? "bg-blue-100 text-blue-700 border border-blue-300" : "hover:bg-gray-100 text-gray-600"
              }`}>
              <span className="text-base leading-none">{btn.icon}</span>
              <span className="text-[9px] mt-0.5">{btn.label}</span>
            </button>
          ))}
          <div className="w-8 h-px bg-gray-200 my-1" />
          <button onClick={() => { const c=fcRef.current; if(!c)return; const a=c.getActiveObjects(); a.filter((o:any)=>o.selectable!==false).forEach((o:any)=>c.remove(o)); c.discardActiveObject(); c.requestRenderAll(); pushHistory(); refreshLayers(); }}
            title="Delete" className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs hover:bg-red-50 text-gray-600 hover:text-red-600">
            <span className="text-base leading-none">🗑</span>
            <span className="text-[9px] mt-0.5">Delete</span>
          </button>
          <button onClick={() => setShowShortcuts(true)} title="Shortcuts (F1)"
            className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs hover:bg-gray-100 text-gray-600">
            <span className="text-base leading-none">⌨</span>
            <span className="text-[9px] mt-0.5">Keys</span>
          </button>
        </div>

        {/* ═══ Tool Popups (absolute positioned) ═══ */}
        <div className="relative flex-1 flex overflow-hidden">
          {/* Text Popup */}
          {showTextPanel && (
            <div className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-xl border p-3 w-52">
              <div className="text-xs font-semibold text-gray-700 mb-2">Add Text</div>
              {["heading", "subheading", "body"].map(p => (
                <button key={p} onClick={() => addText(p)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-sm capitalize mb-1">{p}</button>
              ))}
              <button onClick={() => addText()} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-500">Custom text...</button>
              <button onClick={() => setShowTextPanel(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">Close</button>
            </div>
          )}

          {/* Shape Popup */}
          {showShapePanel && (
            <div className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-xl border p-3 w-64 max-h-80 overflow-y-auto">
              <div className="text-xs font-semibold text-gray-700 mb-2">Shapes</div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  {id:"rect",icon:"▬"},{id:"roundrect",icon:"▢"},{id:"circle",icon:"●"},{id:"ellipse",icon:"⬮"},
                  {id:"triangle",icon:"▲"},{id:"diamond",icon:"◆"},{id:"pentagon",icon:"⬠"},{id:"hexagon",icon:"⬡"},
                  {id:"star",icon:"★"},{id:"heart",icon:"♥"},{id:"cross",icon:"✚"},{id:"ring",icon:"◯"},
                  {id:"arrow",icon:"➜"},{id:"line",icon:"─"},{id:"dashed",icon:"┅"},{id:"bubble",icon:"💬"},
                ].map(s => (
                  <button key={s.id} onClick={() => addShape(s.id)}
                    className="w-13 h-13 flex items-center justify-center rounded-lg border hover:bg-blue-50 hover:border-blue-300 text-lg" title={s.id}>
                    {s.icon}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowShapePanel(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600">Close</button>
            </div>
          )}

          {/* Barcode Popup */}
          {showBarcodePanel && (
            <div className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-xl border p-3 w-56">
              <div className="text-xs font-semibold text-gray-700 mb-2">Barcode</div>
              <select value={barcodeType} onChange={e => setBarcodeType(e.target.value as any)} className="w-full border rounded px-2 py-1 text-sm mb-2">
                <option value="qrcode">QR Code</option><option value="ean13">EAN-13</option><option value="upca">UPC-A</option>
                <option value="code128">Code 128</option><option value="code39">Code 39</option><option value="itf14">ITF-14</option>
              </select>
              <input value={barcodeValue} onChange={e => setBarcodeValue(e.target.value)} placeholder="Enter value..." className="w-full border rounded px-2 py-1 text-sm mb-2" />
              <button onClick={addBarcodeToCanvas} className="w-full py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Generate</button>
              <button onClick={() => setShowBarcodePanel(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600 block">Close</button>
            </div>
          )}

          {/* Table Popup */}
          {showTablePanel && (
            <div className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-xl border p-3 w-52">
              <div className="text-xs font-semibold text-gray-700 mb-2">Table</div>
              <div className="flex gap-2 mb-2">
                <label className="text-xs text-gray-500">Rows<input type="number" value={tableRows} onChange={e => setTableRows(Math.max(1,+e.target.value))} className="w-14 border rounded px-1 py-0.5 text-sm ml-1" /></label>
                <label className="text-xs text-gray-500">Cols<input type="number" value={tableCols} onChange={e => setTableCols(Math.max(1,+e.target.value))} className="w-14 border rounded px-1 py-0.5 text-sm ml-1" /></label>
              </div>
              <button onClick={addTableToCanvas} className="w-full py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Insert Table</button>
              <button onClick={() => setShowTablePanel(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-600 block">Close</button>
            </div>
          )}

          {/* Marks Popup */}
          {showMarkPanel && (
            <div className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-xl border p-3 w-72 max-h-96 overflow-y-auto">
              <div className="text-xs font-semibold text-gray-700 mb-2">Packaging Marks</div>
              {MARKS.map(cat => (
                <div key={cat.cat} className="mb-2">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase mb-1">{cat.cat}</div>
                  <div className="grid grid-cols-4 gap-1">
                    {cat.items.map(m => (
                      <button key={m.id} onClick={() => addMarkToCanvas(m)} title={m.label}
                        className="h-10 flex items-center justify-center rounded border hover:bg-blue-50 hover:border-blue-300 text-[10px] font-semibold text-gray-700">
                        {m.text || m.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => setShowMarkPanel(false)} className="mt-1 text-xs text-gray-400 hover:text-gray-600">Close</button>
            </div>
          )}


          {/* ═══ CANVAS AREA ═══ */}
          <div ref={wrapperRef} className="flex-1 overflow-auto bg-gray-100 relative flex items-center justify-center"
            style={{ cursor: drawMode ? "crosshair" : "default" }}>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            <canvas ref={canvasElRef} className="shadow-lg" />
            {/* Status bar */}
            <div className="absolute bottom-0 left-0 right-0 h-7 bg-white/90 border-t border-gray-200 flex items-center px-3 gap-4 text-[10px] text-gray-500">
              <span>Net: {totalW.toFixed(1)} x {totalH.toFixed(1)} mm</span>
              <span>Scale: {scaleRef.current.toFixed(1)} px/mm</span>
              <span>Zoom: {zoom}%</span>
              <span>Objects: {layersList.length}</span>
              {selectedPanel && <span className="text-blue-600 font-medium">Panel: {selectedPanel}</span>}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
          {/* Tab buttons */}
          <div className="flex border-b border-gray-200 shrink-0">
            {([
              { id: "properties", label: "Props", icon: "⚙" },
              { id: "aiCopy", label: "Copy", icon: "✍" },
              { id: "aiReview", label: "Review", icon: "🔍" },
              { id: "aiImage", label: "Image", icon: "🎨" },
              { id: "layers", label: "Layers", icon: "☰" },
            ] as { id: RightTab; label: string; icon: string }[]).map(tab => (
              <button key={tab.id} onClick={() => setRightTab(tab.id)}
                className={`flex-1 py-2 text-center text-[10px] font-medium transition-colors ${
                  rightTab === tab.id ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                <div className="text-sm leading-none">{tab.icon}</div>
                <div className="mt-0.5">{tab.label}</div>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-3">

            {/* ─── Properties Tab ─── */}
            {rightTab === "properties" && (
              <div className="space-y-3">
                {selProps ? (
                  <>
                    <div className="text-xs font-semibold text-gray-700 uppercase">{selProps.type}</div>
                    {/* Position & Size */}
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] text-gray-500">X<input type="number" value={selProps.left} onChange={e => { selProps.obj.set({left:+e.target.value}); fcRef.current?.requestRenderAll(); setSelProps(getSelectedProps()); }} className="w-full border rounded px-1.5 py-1 text-xs mt-0.5" /></label>
                      <label className="text-[10px] text-gray-500">Y<input type="number" value={selProps.top} onChange={e => { selProps.obj.set({top:+e.target.value}); fcRef.current?.requestRenderAll(); setSelProps(getSelectedProps()); }} className="w-full border rounded px-1.5 py-1 text-xs mt-0.5" /></label>
                      <label className="text-[10px] text-gray-500">W<span className="ml-1 text-gray-400">{selProps.width}px</span></label>
                      <label className="text-[10px] text-gray-500">H<span className="ml-1 text-gray-400">{selProps.height}px</span></label>
                    </div>
                    {/* Rotation & Opacity */}
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[10px] text-gray-500">Rotation<input type="number" value={selProps.angle} onChange={e => updateProp("angle", e.target.value)} className="w-full border rounded px-1.5 py-1 text-xs mt-0.5" /></label>
                      <label className="text-[10px] text-gray-500">Opacity<input type="range" min="0" max="100" value={selProps.opacity} onChange={e => updateProp("opacity", +e.target.value)} className="w-full mt-1" /><span className="text-[10px] text-gray-400">{Math.round(selProps.opacity)}%</span></label>
                    </div>
                    {/* Fill & Stroke */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 flex items-center gap-2">Fill <input type="color" value={typeof selProps.fill === "string" ? selProps.fill : "#000000"} onChange={e => updateProp("fill", e.target.value)} className="w-6 h-6 border rounded cursor-pointer" /></label>
                      <label className="text-[10px] text-gray-500 flex items-center gap-2">Stroke <input type="color" value={selProps.stroke || "#000000"} onChange={e => updateProp("stroke", e.target.value)} className="w-6 h-6 border rounded cursor-pointer" />
                        <input type="number" value={selProps.strokeWidth} onChange={e => updateProp("strokeWidth", e.target.value)} className="w-12 border rounded px-1 py-0.5 text-xs" min="0" />
                      </label>
                    </div>
                    {/* Text properties (if text) */}
                    {(selProps.type === "i-text" || selProps.type === "textbox" || selProps.type === "text") && (
                      <div className="space-y-1.5 pt-2 border-t">
                        <label className="text-[10px] text-gray-500">Font
                          <select value={selProps.fontFamily} onChange={e => updateProp("fontFamily", e.target.value)} className="w-full border rounded px-1.5 py-1 text-xs mt-0.5">
                            {FONTS.map(f => <option key={f} value={f}>{f.split(",")[0]}</option>)}
                          </select>
                        </label>
                        <div className="flex gap-2">
                          <label className="text-[10px] text-gray-500 flex-1">Size<input type="number" value={selProps.fontSize} onChange={e => updateProp("fontSize", e.target.value)} className="w-full border rounded px-1.5 py-1 text-xs mt-0.5" min="1" /></label>
                          <div className="flex gap-0.5 items-end pb-0.5">
                            <button onClick={() => updateProp("fontWeight", selProps.fontWeight === "bold" ? "normal" : "bold")}
                              className={`w-7 h-7 rounded text-xs font-bold ${selProps.fontWeight === "bold" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}>B</button>
                            <button onClick={() => updateProp("fontStyle", selProps.fontStyle === "italic" ? "normal" : "italic")}
                              className={`w-7 h-7 rounded text-xs italic ${selProps.fontStyle === "italic" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}>I</button>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {(["left","center","right"] as const).map(a => (
                            <button key={a} onClick={() => updateProp("textAlign", a)}
                              className={`flex-1 py-1 rounded text-[10px] ${selProps.textAlign === a ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-500"}`}>
                              {a === "left" ? "≡←" : a === "center" ? "≡↔" : "≡→"}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-2xl text-gray-300 mb-2">↖</div>
                    <div className="text-xs text-gray-400">Select an object to edit properties</div>
                    <div className="mt-4 pt-4 border-t">
                      <label className="text-[10px] text-gray-500">Canvas Background
                        <input type="color" value="#FFFFFF" onChange={e => { const c=fcRef.current; if(c){c.backgroundColor=e.target.value; c.requestRenderAll();} }}
                          className="w-full h-8 border rounded cursor-pointer mt-1" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── AI Copy Tab ─── */}
            {rightTab === "aiCopy" && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-700">AI Copy Generator</div>
                <input value={copyProduct} onChange={e => setCopyProduct(e.target.value)} placeholder="Product name" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input value={copyBrand} onChange={e => setCopyBrand(e.target.value)} placeholder="Brand name (optional)" className="w-full border rounded-lg px-3 py-2 text-sm" />
                <button onClick={handleAiCopy} disabled={copyLoading || !copyProduct.trim()}
                  className="w-full py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50">
                  {copyLoading ? "Generating..." : "Generate Copy"}
                </button>
                {copyResult && (
                  <div className="space-y-2 pt-2 border-t">
                    {Object.entries(copyResult).filter(([k]) => k !== "error").map(([key, val]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase">{key}</span>
                          <button onClick={() => applyCopyToCanvas(key, val as string)} className="text-[10px] text-blue-600 hover:text-blue-800">+ Add</button>
                        </div>
                        <div className="text-xs text-gray-700">{val as string}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── AI Review Tab ─── */}
            {rightTab === "aiReview" && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-700">AI Design Review</div>
                <p className="text-[10px] text-gray-400">Analyze your current design for quality, readability, and packaging best practices.</p>
                <button onClick={handleAiReview} disabled={reviewLoading}
                  className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {reviewLoading ? "Analyzing..." : "Review Design"}
                </button>
                {reviewResult && (
                  <div className="space-y-2 pt-2 border-t">
                    {reviewResult.score != null && (
                      <div className="text-center py-2">
                        <div className={`text-3xl font-bold ${reviewResult.score >= 80 ? "text-green-600" : reviewResult.score >= 60 ? "text-yellow-600" : "text-red-600"}`}>{reviewResult.score}</div>
                        <div className="text-[10px] text-gray-400">/ 100</div>
                      </div>
                    )}
                    {reviewResult.feedback && <div className="text-xs text-gray-700 bg-gray-50 rounded-lg p-2">{reviewResult.feedback}</div>}
                    {reviewResult.suggestions && Array.isArray(reviewResult.suggestions) && (
                      <div className="space-y-1">
                        {reviewResult.suggestions.map((s: string, i: number) => (
                          <div key={i} className="text-xs text-gray-600 bg-yellow-50 rounded p-1.5">&#8226; {s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── AI Image Tab ─── */}
            {rightTab === "aiImage" && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-700">AI Image Generator</div>
                <select value={aiImgCategory} onChange={e => setAiImgCategory(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="logo">Logo</option><option value="product">Product</option><option value="background">Background</option>
                  <option value="illustration">Illustration</option><option value="icon">Icon</option><option value="free">Free Prompt</option>
                </select>
                <textarea value={aiImgPrompt} onChange={e => setAiImgPrompt(e.target.value)} placeholder="Describe the image..." rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" checked={aiImgTransparent} onChange={e => setAiImgTransparent(e.target.checked)} className="rounded" />
                  Transparent background
                </label>
                <button onClick={handleAiImage} disabled={aiImgLoading || !aiImgPrompt.trim()}
                  className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {aiImgLoading ? "Generating..." : "Generate Image"}
                </button>
                {aiImgResults.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    {aiImgResults.map((src, i) => (
                      <div key={i} className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-blue-400" onClick={() => addAiImageToCanvas(src)}>
                        <img src={src} alt="" className="w-full h-24 object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">+ Add</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Layers Tab ─── */}
            {rightTab === "layers" && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-700 mb-2">Layers ({layersList.length})</div>
                {layersList.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-6">No objects yet</div>
                ) : layersList.map((layer, i) => (
                  <div key={layer.id + i}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs"
                    onClick={() => {
                      const c = fcRef.current; if (!c) return;
                      const obj = c.getObjects().filter((o: any) => o.selectable !== false && !o._isGuideLayer).reverse()[i];
                      if (obj) { c.setActiveObject(obj); c.requestRenderAll(); }
                    }}>
                    <button onClick={(e) => { e.stopPropagation(); const c=fcRef.current; if(!c)return; const obj=c.getObjects().filter((o:any)=>o.selectable!==false&&!o._isGuideLayer).reverse()[i]; if(obj){obj.visible=!obj.visible; c.requestRenderAll(); refreshLayers();} }}
                      className="text-gray-400 hover:text-gray-700">{layer.visible ? "👁" : "👁‍🗨"}</button>
                    <span className="flex-1 truncate text-gray-700">{layer.name}</span>
                    <span className="text-[10px] text-gray-400">{layer.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Export Modal ═══ */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExport(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Export Design</h3>
            <div className="space-y-3">
              {[
                { type: "png" as const, label: "PNG (High-Res)", desc: "Full net image at 4x resolution", icon: "🖼" },
                { type: "pdf" as const, label: "PDF (Print-Ready)", desc: "300 DPI print-quality PDF", icon: "📄" },
                { type: "dieline" as const, label: "Dieline Only", desc: "Cut & fold lines PDF", icon: "✂" },
              ].map(opt => (
                <button key={opt.type} onClick={() => handleExport(opt.type)} disabled={!!exporting}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border hover:border-blue-400 hover:bg-blue-50 transition-colors text-left disabled:opacity-50">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{opt.label}</div>
                    <div className="text-[10px] text-gray-400">{opt.desc}</div>
                  </div>
                  {exporting === opt.type && <span className="ml-auto text-xs text-blue-600 animate-pulse">Exporting...</span>}
                </button>
              ))}
            </div>
            <button onClick={() => setShowExport(false)} className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      {/* ═══ Shortcuts Modal ═══ */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-1.5 text-xs">
              {[
                ["Ctrl+Z","Undo"],["Ctrl+Y","Redo"],["Ctrl+A","Select All"],["Delete","Delete selected"],
                ["F1","Toggle shortcuts"],["Mouse wheel","Zoom"],
              ].map(([k,d]) => (
                <div key={k} className="flex justify-between">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">{k}</kbd>
                  <span className="text-gray-500">{d}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
