"use client";
import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n-context";
import { PACKIVE_SPOT_COLORS } from "@/data/packive-spot-colors";
import Ruler, { RulerCorner, RULER_THICK } from "@/components/editor/ruler";
import { HLC_COLORS, HLC_HUE_CATEGORIES } from "@/data/cielab-hlc-colors";
import { loadFOGRA39LUT, cmykToSrgb, cmykToHex as iccCmykToHex, srgbToCmyk, isLUTReady, isReverseLUTReady } from "@/lib/cmyk-engine";

// ─── Types ───
interface UnifiedEditorProps {
  L: number; W: number; D: number;
  material: string;
  boxType: string;
  onBack: () => void;
}

type RightTab = "properties" | "ai" | "layers";

type ColorMode = "cmyk" | "spot";

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

// ─── CMYK Helpers ───
function hexToCmyk(hex: string): [number,number,number,number] {
  const ri = parseInt(hex.slice(1,3),16), gi = parseInt(hex.slice(3,5),16), bi = parseInt(hex.slice(5,7),16);
  if (ri <= 5 && gi <= 5 && bi <= 5) return [0,0,0,100]; if (ri >= 250 && gi >= 250 && bi >= 250) return [0,0,0,0]; const raw = srgbToCmyk(ri, gi, bi); return [Math.max(0,Math.round(raw[0])),Math.max(0,Math.round(raw[1])),Math.max(0,Math.round(raw[2])),Math.max(0,Math.round(raw[3]))] as [number,number,number,number];
}
function cmykToHex(c:number,m:number,y:number,k:number): string {
  if (c === 0 && m === 0 && y === 0 && k === 100) return "#000000"; if (c === 0 && m === 0 && y === 0 && k === 0) return "#ffffff"; if (isLUTReady()) return iccCmykToHex(c, m, y, k);
  const r = Math.round(255*(1-c/100)*(1-k/100)), g = Math.round(255*(1-m/100)*(1-k/100)), b = Math.round(255*(1-y/100)*(1-k/100));
  return "#" + [r,g,b].map(v => Math.max(0,Math.min(255,v)).toString(16).padStart(2,"0")).join("");
}
function hsvToHex(h:number,s:number,v:number): string {
  const c=v*s, x=c*(1-Math.abs((h/60)%2-1)), m=v-c;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
  return "#"+[r+m,g+m,b+m].map(v=>Math.max(0,Math.min(255,Math.round(v*255))).toString(16).padStart(2,"0")).join("");
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
  const [aiSubView, setAiSubView] = useState<"menu" | "copy" | "review" | "image">("menu");
  const [spotTarget, setSpotTarget] = useState<"fill" | "stroke">("fill");
  const [accOpen, setAccOpen] = useState<Record<string, boolean>>({ position: true, typography: true, color: false, spot: false });
  const toggleAcc = (key: string) => setAccOpen(prev => ({ ...prev, [key]: !prev[key] }));
  const [color, setColor] = useState("#000000");
  const [fSize, setFSize] = useState(24);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [googleFonts, setGoogleFonts] = useState<string[]>(["Inter", "Noto Sans KR", "Noto Sans JP", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins"]);
  const [koFonts, setKoFonts] = useState<string[]>([]);
  const [jaFonts, setJaFonts] = useState<string[]>([]);
  const [fontsLoaded, setFontsLoaded] = useState<Set<string>>(new Set());
  const [fontSearch, setFontSearch] = useState("");
  const [fontDropOpen, setFontDropOpen] = useState(false);
  const [fontCategory, setFontCategory] = useState<"all"|"en"|"ko"|"ja">("all");
  const fontSearchRef = useRef<HTMLInputElement>(null);
  const fontBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAx3bN9fSS61y6FKewBaDZ4azs6W4XFnPk&sort=popularity")
      .then(r => r.json())
      .then(data => {
        if (data.items) {
          const names = data.items.map((f: any) => f.family);
          const priority = ["Inter", "Noto Sans KR", "Noto Sans JP", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins"];
          const sorted = [...priority, ...names.filter((n: string) => !priority.includes(n))];
          setGoogleFonts([...new Set(sorted)]);
        }
      }).catch(() => {});
  }, []);
  useEffect(() => {
    const key = "AIzaSyAx3bN9fSS61y6FKewBaDZ4azs6W4XFnPk";
    fetch("https://www.googleapis.com/webfonts/v1/webfonts?key="+key+"&subset=korean&sort=popularity")
      .then(r => r.json()).then(d => { if(d.items) setKoFonts(d.items.map((f:any)=>f.family)); }).catch(()=>{});
    fetch("https://www.googleapis.com/webfonts/v1/webfonts?key="+key+"&subset=japanese&sort=popularity")
      .then(r => r.json()).then(d => { if(d.items) setJaFonts(d.items.map((f:any)=>f.family)); }).catch(()=>{});

  }, []);
  const loadGoogleFont = useCallback(async (family: string) => {
    if (fontsLoaded.has(family)) return;
    setFontsLoaded(prev => new Set([...prev, family]));
    try {
      const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400&display=swap`;
      const resp = await fetch(cssUrl);
      const cssText = await resp.text();
      // 모든 @font-face 블록 로드 (한글 서브셋 포함)
      const blocks = cssText.match(/@font-face\s*\{[^}]+\}/g) || [];
      const promises: Promise<void>[] = [];
      for (const block of blocks) {
        const urlM = block.match(/url\((https:\/\/[^)]+)\)/);
        if (!urlM) continue;
        const rangeM = block.match(/unicode-range:\s*([^;]+)/);
        const p = (async () => {
          try {
            const opts: any = { weight: "400" };
            if (rangeM) opts.unicodeRange = rangeM[1].trim();
            const face = new FontFace(family, `url(${urlM[1]})`, opts);
            await face.load();
            document.fonts.add(face);
          } catch(e) {}
        })();
        promises.push(p);
      }
      await Promise.all(promises);
      console.log("[FONT] Loaded:", family, blocks.length, "subsets");
    } catch (e) {
      console.warn("[FONT] Load failed:", family, e);
    }
  }, [fontsLoaded]);

  const detectFontForText = useCallback((text: string): string => {
    const koRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;
    if (koRegex.test(text)) return "Noto Sans KR";
    if (jpRegex.test(text)) return "Noto Sans JP";
    return "Inter";
  }, []);
  const [zoom, setZoom] = useState(100);
  const [rulerUnit, setRulerUnit] = useState<"mm" | "inch">("mm");
  const [rulerScroll, setRulerScroll] = useState({ left: 0, top: 0 });
  const [guides, setGuides] = useState<Array<{ id: string; pos: number; dir: "h" | "v" }>>([]);
  const [mousePos, setMousePos] = useState<{x: number; y: number}>({x: -100, y: -100});
  const zoomRef = useRef(100);
  const [drawMode, setDrawMode] = useState(false);
  const [eyedropperMode, setEyedropperMode] = useState(false);
  const [eyedropperResult, setEyedropperResult] = useState<{hex:string;cmyk:[number,number,number,number];spot?:string}|null>(null);
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
  const [tableEditCell, setTableEditCell] = useState<{row:number;col:number}|null>(null);
  const [tableSelStart, setTableSelStart] = useState<{row:number;col:number}|null>(null);
  const [tableCmykOpen, setTableCmykOpen] = useState<"bg"|"text"|"border"|null>(null);
  const [tblHue, setTblHue] = useState(0);
  const [tblPickPos, setTblPickPos] = useState<{s:number;v:number}>({s:50,v:50});
  const tblPickRef = useRef<HTMLDivElement>(null);
  const tblDragging = useRef(false);
  const [tableSelEnd, setTableSelEnd] = useState<{row:number;col:number}|null>(null);
  const tableSelection = tableSelStart && tableSelEnd ? {
    sr: Math.min(tableSelStart.row, tableSelEnd.row),
    sc: Math.min(tableSelStart.col, tableSelEnd.col),
    er: Math.max(tableSelStart.row, tableSelEnd.row),
    ec: Math.max(tableSelStart.col, tableSelEnd.col),
  } : tableEditCell ? { sr: tableEditCell.row, sc: tableEditCell.col, er: tableEditCell.row, ec: tableEditCell.col } : null;
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

  // ─── Color Mode & CMYK/Spot states ───
  const [colorMode, setColorMode] = useState<ColorMode>("cmyk");
  const [spotLib, setSpotLib] = useState<"packive"|"hlc"|"custom">("packive");
  const [spotSearch, setSpotSearch] = useState("");
  const [hlcHue, setHlcHue] = useState("All");
  const [spotCategory, setSpotCategory] = useState<string>("All");
  const [spotPreview, setSpotPreview] = useState<any>(null);
  const [hlcLightness, setHlcLightness] = useState<number[]>([20, 90]);
  const [hlcSearch, setHlcSearch] = useState("");
  const [hlcPreview, setHlcPreview] = useState<any>(null);
  const [customSpotColors, setCustomSpotColors] = useState<Array<{id:string;name:string;hex:string;cmyk:[number,number,number,number];pantoneRef?:string}>>([]);
  const [customName, setCustomName] = useState("");
  const [customHex, setCustomHex] = useState("#FF0000");
  const [customPantoneRef, setCustomPantoneRef] = useState("");
  const [showUploadGuide, setShowUploadGuide] = useState(false);
  const [dielineVisible, setDielineVisible] = useState(true);
  const [dielineLocked, setDielineLocked] = useState(true);
  const [dielineFileName, setDielineFileName] = useState<string>('');
  const dielineFileRef = useRef<HTMLInputElement>(null);
  const [fillHue, setFillHue] = useState(0);
  const [strokeHue, setStrokeHue] = useState(0);
  const cmykPickRef = useRef<HTMLDivElement>(null);
  const cmykDragging = useRef(false);
  const [cmykPickPos, setCmykPickPos] = useState<{s:number;v:number}>({s:50,v:50});
  const strokePickRef = useRef<HTMLDivElement>(null);
  const strokeDragging = useRef(false);
  const [strokePickPos, setStrokePickPos] = useState<{s:number;v:number}>({s:50,v:50});
  const useEngineRef = useRef(true);

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
    const jsonObj = c.toJSON(["_isDieLine","_isFoldLine","_isGuideLayer","_isPanelLabel","selectable","evented","name","_cmykFill","_cmykStroke","_spotFillName","_spotStrokeName","_spotFillPantone","_spotStrokePantone","_isTable","_tableConfig","_tableRole","_tableRow","_tableCol","_tableId"]);
    // Fabric toJSON may drop custom props on Image - inject manually
    const objs = c.getObjects();
    if (jsonObj.objects) {
      objs.forEach((obj: any, i: number) => {
        if (!jsonObj.objects[i]) return;
        ["_isTable","_tableConfig","_cmykFill","_cmykStroke","_spotFillName","_spotStrokeName","_spotFillPantone","_spotStrokePantone","_isDieLine","_isFoldLine","_isGuideLayer","_isPanelLabel","_tableRole","_tableRow","_tableCol","_tableId","name"].forEach((k: string) => {
          if ((obj as any)[k] !== undefined) jsonObj.objects[i][k] = (obj as any)[k];
        });
      });
    }
    const json = JSON.stringify(jsonObj);
    const h = historyRef.current;
    h.splice(historyIdxRef.current + 1);
    h.push(json);
    if (h.length > 50) h.shift();
    historyIdxRef.current = h.length - 1;
  }, []);

  const restoreCustomProps = (canvas: any, snapshot: any) => {
    const objs = canvas.getObjects();
    const jsonObjs = snapshot.objects || [];
    objs.forEach((obj: any, i: number) => {
      const src = jsonObjs[i];
      if (!src) return;
      ["_isTable","_tableConfig","_tableId","_cmykFill","_cmykStroke","_spotFillName","_spotStrokeName","_spotFillPantone","_spotStrokePantone","_isDieLine","_isFoldLine","_isGuideLayer","_isPanelLabel","_tableRole","_tableRow","_tableCol","name","selectable","evented"].forEach(k => {
        if (src[k] !== undefined) obj[k] = src[k];
      });
      // Group 내부 objects도 복원
      if (obj._objects && src.objects) {
        obj._objects.forEach((child: any, ci: number) => {
          const csrc = src.objects[ci];
          if (!csrc) return;
          ["_isTable","_tableConfig","_tableRole","_tableRow","_tableCol","_tableId","name","selectable","evented"].forEach(k => {
            if (csrc[k] !== undefined) child[k] = csrc[k];
          });
        });
      }
    });
    // 표 객체 바운딩박스/컨트롤 제거
    objs.forEach((obj: any) => {
      if (obj._tableId) {
        if (obj._tableRole === "bg") {
          obj.set({ hasControls: false, hasBorders: false, lockRotation: true });
        } else {
          obj.set({ selectable: false, hasControls: false, hasBorders: false });
        }
      }
    });
  };

  const undo = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    loadingRef.current = true;
    const snapshot = JSON.parse(historyRef.current[historyIdxRef.current]);
    await c.loadFromJSON(snapshot);
    restoreCustomProps(c, snapshot);
    c.requestRenderAll();
    loadingRef.current = false;
    refreshLayers();
    setTimeout(() => { setSelProps(null); setTableEditCell(null); }, 30);
  }, []);

  const redo = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    loadingRef.current = true;
    const snapshot = JSON.parse(historyRef.current[historyIdxRef.current]);
    await c.loadFromJSON(snapshot);
    restoreCustomProps(c, snapshot);
    c.requestRenderAll();
    loadingRef.current = false;
    refreshLayers();
    setTimeout(() => { setSelProps(null); setTableEditCell(null); }, 30);
  }, []);
  const SAVE_KEY = "packive-temp-design";
  const SAVE_META_KEY = "packive-temp-meta";
  const JSON_PROPS = ["_isDieLine","_isFoldLine","_isGuideLayer","_isPanelLabel","selectable","evented","name","_cmykFill","_cmykStroke","_spotFillName","_spotStrokeName","_spotFillPantone","_spotStrokePantone","_isTable","_tableConfig","_tableRole","_tableRow","_tableCol","_tableId"];

  const [saveStatus, setSaveStatus] = useState<string|null>(null);

  const fileSave = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    try {
      const json = JSON.stringify(c.toJSON(JSON_PROPS), null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const name = "packive-design-" + new Date().toISOString().slice(0,16).replace(/[T:]/g,"-") + ".pkv.json";
      const a = document.createElement("a");
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
      console.log("[SAVE] File saved:", name, (json.length/1024).toFixed(1), "KB");
    } catch (e: any) { alert("Save failed: " + e.message); }
  }, []);

  const fileLoadRef = useRef<HTMLInputElement>(null);

  const fileLoad = useCallback(async (file: File) => {
    const c = fcRef.current; if (!c) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      loadingRef.current = true;
      await c.loadFromJSON(json);
      c.requestRenderAll();
      loadingRef.current = false;
      pushHistory();
      try {
        const objs = c.getObjects().filter((o:any) => o.selectable !== false && !o._isGuideLayer);
        setLayersList(objs.map((o:any,i:number) => ({ name: o.name || o.type || "Object", type: o.type, visible: o.visible !== false, idx: i })).reverse());
      } catch {}
      setSaveStatus("loaded");
      setTimeout(() => setSaveStatus(null), 2000);
      console.log("[SAVE] File loaded:", file.name);
    } catch (e: any) {
      loadingRef.current = false;
      alert("Load failed: " + e.message);
    }
  }, [pushHistory]);

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

  // ─── Ruler Guide ───
  const addGuide = useCallback((pos: number, dir: "h" | "v") => {
    const cv = fcRef.current;
    if (!cv) return;
    const s = scaleRef.current;
    const pad = 15; // PAD
    const id = "guide_" + Date.now();
    const F = (window as any).__fabric || require("fabric");
    if (dir === "h") {
      const y = (pos + pad) * s;
      const line = new F.Line([0, y, cv.getWidth(), y], {
        stroke: "#00bcd4", strokeWidth: 0.8, strokeDashArray: [6, 3],
        selectable: false, evented: false, _isGuide: true, _guideId: id, _guidePos: pos, _guideDir: dir,
        name: `Guide H ${pos.toFixed(1)}mm`
      });
      cv.add(line);
    } else {
      const x = (pos + pad) * s;
      const line = new F.Line([x, 0, x, cv.getHeight()], {
        stroke: "#00bcd4", strokeWidth: 0.8, strokeDashArray: [6, 3],
        selectable: false, evented: false, _isGuide: true, _guideId: id, _guidePos: pos, _guideDir: dir,
        name: `Guide V ${pos.toFixed(1)}mm`
      });
      cv.add(line);
    }
    cv.requestRenderAll();
    setGuides(prev => [...prev, { id, pos, dir }]);
    console.log(`[RULER] Guide added: ${dir === "h" ? "horizontal" : "vertical"} at ${pos.toFixed(1)}mm`);
  }, []);

  const applyZoom = useCallback((newZoom: number, point?: {x: number, y: number}) => {
    const c = fcRef.current; if (!c) return;
    const z = Math.max(25, Math.min(800, newZoom));
    const vpt = c.viewportTransform || [1,0,0,1,0,0];
    if (point) { c.zoomToPoint(new (c as any).constructor.__proto__.constructor === Object ? {x: point.x, y: point.y} : point, z / 100); }
    else { const vpt = c.viewportTransform || [1,0,0,1,0,0]; vpt[0] = z / 100; vpt[3] = z / 100; c.setViewportTransform(vpt); }
    c.requestRenderAll();
    c.requestRenderAll();
    setZoom(z);
    zoomRef.current = z;
  }, []);

  // ─── Draw dieline guide layer on Fabric canvas ───
  const drawGuideLayer = useCallback(async (canvas: any, scale: number) => {
    const F = fabricModRef.current; if (!F) return;
    if (L === 0 && W === 0 && D === 0) return; // blank canvas mode - no guide layer

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

  // ─── Load FOGRA39 ICC LUT ───
  useEffect(() => {
    loadFOGRA39LUT().then(() => console.log("FOGRA39 LUT ready"));
  }, []);

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

      // Canvas creation (blank or normal mode)
      const isBlank = (L === 0 && W === 0 && D === 0);
      let canvasW: number, canvasH: number, availW: number, availH: number;
      availW = cw - 20; availH = ch - 60;
      if (isBlank) {
        canvasW = cw - 20;
        canvasH = ch - 60;
        scaleRef.current = 1;
      } else {
        const netW = totalW + PAD * 2;
        const netH = totalH + PAD * 2;
        const fitScale = Math.min(availW / netW, availH / netH);
        const pxPerMM = Math.max(fitScale, 2.0);
        scaleRef.current = pxPerMM;
        canvasW = Math.min(Math.round(netW * pxPerMM), cw - 20);
        canvasH = Math.min(Math.round(netH * pxPerMM), ch - 60);
      }

      const el = canvasElRef.current!;
      el.width = canvasW; el.height = canvasH;
      el.style.width = canvasW + 'px'; el.style.height = canvasH + 'px';

      if (disposed) return;

      const canvas = new Canvas(el, {
        width: canvasW, height: canvasH,
        backgroundColor: '#FFFFFF',
        selection: true,
        perPixelTargetFind: false,
      });

      fcRef.current = canvas;
      setCanvasReady(true);
      canvas.fireRightClick = true;
      canvas.stopContextMenu = true;

      // Draw guide layer only for normal mode
      if (!isBlank) {
        await drawGuideLayer(canvas, scaleRef.current);
        canvas.getObjects().filter((o: any) => o._isGuideLayer).forEach((o: any) => {
          canvas.sendObjectToBack(o);
        });
      }

      // Event handlers
      canvas.on("object:modified", () => { if (!loadingRef.current) { pushHistory(); refreshLayers(); } });

    // ─── Table double-click: enter group for cell editing ───
    canvas.on("mouse:dblclick", (e: any) => {
      const target = e.target;
      if (!target) return;
      if ((target as any)._isTable && target.type === "group") {
        // Enter the table group for sub-object interaction
        const subTarget = e.subTargets?.[0];
        if (subTarget && (subTarget as any)._tableRole === "cell-bg") {
          const row = (subTarget as any)._tableRow;
          const col = (subTarget as any)._tableCol;
          // Find matching text object
          const textObj = target._objects?.find((o: any) =>
            o._tableRole === "cell-text" && o._tableRow === row && o._tableCol === col
          );
          if (textObj) {
            // Highlight selected cell
            target._objects?.forEach((o: any) => {
              if (o._tableRole === "cell-bg") {
                o.set({ strokeWidth: o._tableRow === row && o._tableCol === col ? 2 : 1 });
                o.set({ stroke: o._tableRow === row && o._tableCol === col ? "#2563eb" : "#333333" });
              }
            });
            // Store selected cell info
            (target as any)._selectedCell = { row, col };
            canvas.renderAll();
            console.log("[TABLE] Cell selected:", row, col);
          }
        }
        // If double-click on text, try to enter editing
        if (subTarget && (subTarget as any)._tableRole === "cell-text") {
          if (subTarget.type === "i-text" && typeof subTarget.enterEditing === "function") {
            subTarget.set({ selectable: true, evented: true });
            canvas.setActiveObject(subTarget);
            subTarget.enterEditing();
            subTarget.selectAll();
            console.log("[TABLE] Editing cell text:", (subTarget as any)._tableRow, (subTarget as any)._tableCol);
          }
        }
      }
    });

    // ─── Table: exit cell editing on click outside ───
    canvas.on("mouse:down", (e: any) => {
      const target = e.target;
      // If clicking on canvas (not on table), reset any table cell highlights
      const objs = canvas.getObjects();
      objs.forEach((obj: any) => {
        if ((obj as any)._isTable && obj.type === "group") {
          const hadSelection = (obj as any)._selectedCell;
          if (hadSelection && target !== obj) {
            obj._objects?.forEach((o: any) => {
              if (o._tableRole === "cell-bg") {
                o.set({ strokeWidth: 1, stroke: "#333333" });
              }
              if (o._tableRole === "cell-text") {
                o.set({ selectable: false, evented: false });
                if (typeof o.exitEditing === "function") o.exitEditing();
              }
            });
            delete (obj as any)._selectedCell;
            canvas.renderAll();
          }
        }
      });
    });
      canvas.on("object:scaling", (e: any) => {
        const t = e.target;
        if (t && (t.type === "i-text" || t.type === "textbox") && t.fontSize && t.scaleX) {
          const rawSize = Math.round(t.fontSize * t.scaleX / scaleRef.current);
          const realSize = Math.max(24, rawSize);
          setSelProps(prev => ({ ...prev, fontSize: realSize }));
          setFSize(realSize);
        }
      });
      canvas.on("path:created", () => { if (!loadingRef.current) { pushHistory(); refreshLayers(); } });
      canvas.on("selection:created", () => refreshLayers());
      canvas.on("selection:updated", () => refreshLayers());
      canvas.on("selection:cleared", () => refreshLayers());

      // Mouse wheel zoom
      canvas.on("mouse:wheel", (opt: any) => {
        opt.e.preventDefault(); opt.e.stopPropagation();
        const delta = opt.e.deltaY > 0 ? -10 : 10;
        const newZ = Math.max(25, Math.min(800, zoomRef.current + delta));
        const pointer = canvas.getScenePoint(opt.e); applyZoom(newZ, pointer);
      });

      // Panning: Space+drag or middle mouse button
      let _isPanning = false; let _panStart = {x:0, y:0};
      const _spaceDown = new Set<string>();
      const onKeyDown = (e: KeyboardEvent) => { const tag = (document.activeElement?.tagName || "").toLowerCase(); if (tag === "input" || tag === "textarea" || tag === "select" || (document.activeElement as any)?.contentEditable === "true") return; if (e.code === "Space") { _spaceDown.add("Space"); e.preventDefault(); } };
      const onKeyUp = (e: KeyboardEvent) => { _spaceDown.delete(e.code); };
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);

      canvas.on("mouse:down", (opt: any) => {
        if (_spaceDown.has("Space") || opt.e.button === 1) {
          _isPanning = true; _panStart = {x: opt.e.clientX, y: opt.e.clientY};
          canvas.selection = false; canvas.setCursor("grabbing"); opt.e.preventDefault();
        }
      });
      canvas.on("mouse:move", (opt: any) => {
        if (!_isPanning) return;
        const vpt = canvas.viewportTransform || [1,0,0,1,0,0];
        vpt[4] += opt.e.clientX - _panStart.x;
        vpt[5] += opt.e.clientY - _panStart.y;
        _panStart = {x: opt.e.clientX, y: opt.e.clientY};
        canvas.setViewportTransform(vpt); canvas.requestRenderAll();
      });
      canvas.on("mouse:up", () => {
        if (_isPanning) { _isPanning = false; canvas.selection = true; canvas.setCursor("default"); }
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
      setCanvasReady(false);
        fcRef.current = null;
      }
    };
  }, [L, W, D, material]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const c = fcRef.current; if (!c) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); redo(); }
      else if ((e.ctrlKey||e.metaKey) && e.key==="s") { e.preventDefault(); fileSave(); }
      else if ((e.ctrlKey||e.metaKey) && e.key==="c") {
        e.preventDefault();
        const cv=fcRef.current; if(!cv) return;
        const o=cv.getActiveObject(); if(!o) return;
        if ((o as any)._tableId) {
          // Table: 전체 표 객체들의 config 저장
          const tableId = (o as any)._tableId;
          const cfg = (o as any)._tableConfig;
          const allObjs = cv.getObjects().filter((obj:any) => obj._tableId === tableId);
          const baseLeft = Math.min(...allObjs.map((obj:any) => obj.left || 0));
          const baseTop = Math.min(...allObjs.map((obj:any) => obj.top || 0));
          (window as any).__pkClip = { type: "table", config: cfg, left: baseLeft, top: baseTop };
        } else {
          const cloned = await o.clone();
          ["_cmykFill","_cmykStroke","_spotFillName","_spotFillPantone","_spotStrokeName","_spotStrokePantone"].forEach(k => {
            if ((o as any)[k] !== undefined) (cloned as any)[k] = (o as any)[k];
          });
          (window as any).__pkClip = { type: "object", obj: cloned };
        }
      }
      else if ((e.ctrlKey||e.metaKey) && e.key==="v") {
        e.preventDefault();
        const cv=fcRef.current; if(!cv) return;
        const clip = (window as any).__pkClip; if(!clip) return;
        if (clip.type === "table" && clip.config) {
          // Table paste: rebuildTable 사용하지 않고 직접 생성
          try {
            const cfg = JSON.parse(clip.config);
            const { buildTableObjects } = await import("@/lib/table-engine");
            const F = await import("fabric");
            const objs = buildTableObjects(cfg, F);
            const newLeft = (clip.left || 100) + 30;
            const newTop = (clip.top || 100) + 30;
            objs.forEach((o: any) => {
              o.set({ left: o.left + newLeft, top: o.top + newTop });
              o._isTable = true;
              o._tableConfig = JSON.stringify(cfg);
              o.name = `Table ${cfg.rows}\u00d7${cfg.cols}`;
            });
            const bgObj = objs.find((o:any) => o._tableRole === "bg");
            objs.forEach((o: any) => cv.add(o));
            if (bgObj) cv.setActiveObject(bgObj);
            cv.requestRenderAll();
            pushHistory(); refreshLayers();
          } catch(err) { console.error("[PASTE] Table paste error:", err); }
        } else if (clip.type === "object" && clip.obj) {
          const p = await clip.obj.clone();
          ["_cmykFill","_cmykStroke","_spotFillName","_spotFillPantone","_spotStrokeName","_spotStrokePantone"].forEach(k => {
            if ((clip.obj as any)[k] !== undefined) (p as any)[k] = (clip.obj as any)[k];
          });
          p.set({left:(p.left||0)+20,top:(p.top||0)+20});
          cv.add(p); cv.setActiveObject(p);
          cv.requestRenderAll(); pushHistory(); refreshLayers();
        }
      }
      else if ((e.ctrlKey||e.metaKey) && e.key==="x") {
        e.preventDefault();
        const cv=fcRef.current; if(!cv) return;
        const o=cv.getActiveObject(); if(!o) return;
        if ((o as any)._tableId) {
          const tableId = (o as any)._tableId;
          const cfg = (o as any)._tableConfig;
          const allObjs = cv.getObjects().filter((obj:any) => obj._tableId === tableId);
          const baseLeft = Math.min(...allObjs.map((obj:any) => obj.left || 0));
          const baseTop = Math.min(...allObjs.map((obj:any) => obj.top || 0));
          (window as any).__pkClip = { type: "table", config: cfg, left: baseLeft, top: baseTop };
          allObjs.forEach((obj:any) => cv.remove(obj));
        } else {
          const cloned = await o.clone();
          ["_cmykFill","_cmykStroke","_spotFillName","_spotFillPantone","_spotStrokeName","_spotStrokePantone"].forEach(k => {
            if ((o as any)[k] !== undefined) (cloned as any)[k] = (o as any)[k];
          });
          (window as any).__pkClip = { type: "object", obj: cloned };
          cv.remove(o);
        }
        cv.discardActiveObject(); cv.requestRenderAll();
        pushHistory(); refreshLayers();
      }
      else if (e.key === "Delete" || e.key === "Backspace") {
        const active = c.getActiveObjects();
        if (active.length > 0) {
          const toRemove: any[] = [];
          active.forEach((o: any) => {
            if (o._tableId) {
              // Table object: remove ALL objects with same tableId
              c.getObjects().forEach((obj: any) => {
                if (obj._tableId === o._tableId && !toRemove.includes(obj)) toRemove.push(obj);
              });
            } else if (o.selectable !== false) {
              toRemove.push(o);
            }
          });
          toRemove.forEach((o: any) => c.remove(o));
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
      else if (e.key.startsWith("Arrow")) {
        const obj = c.getActiveObject(); if (!obj) return;
        e.preventDefault();
        const step = e.ctrlKey ? 1 : 10;
        if (e.key === "ArrowUp") obj.set("top", (obj.top || 0) - step);
        else if (e.key === "ArrowDown") obj.set("top", (obj.top || 0) + step);
        else if (e.key === "ArrowLeft") obj.set("left", (obj.left || 0) - step);
        else if (e.key === "ArrowRight") obj.set("left", (obj.left || 0) + step);
        obj.setCoords(); c.requestRenderAll(); pushHistory();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [undo, redo, pushHistory, refreshLayers]);

  // ─── Add Text ───
  const addText = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const F = fabricModRef.current; if (!F) return;
    const cx = c.getWidth() / 2, cy = c.getHeight() / 2;
    loadGoogleFont("Inter");
    const t = new F.IText("Text", {
      left: cx, top: cy, originX: "center", originY: "center",
      fontSize: Math.round(24 * scaleRef.current), fill: color, fontFamily: "Inter",
    });
    t.on("changed", () => {
      const newFont = detectFontForText(t.text || "");
      if (newFont !== t.fontFamily) {
        loadGoogleFont(newFont);
        t.set({ fontFamily: newFont });
        setSelectedFont(newFont);
        c.requestRenderAll();
      }
      setSelProps(getSelectedProps());
    });
    c.add(t); c.setActiveObject(t); c.renderAll(); refreshLayers(); pushHistory();
    setSelectedFont("Inter");
    setFSize(24);
  }, [color, loadGoogleFont, detectFontForText, refreshLayers, pushHistory]);

  // ─── Add Shape ───
  const addShape = useCallback(async (type: string) => {
    const c = fcRef.current; if (!c) return;
    const F = fabricModRef.current; if (!F) return;
    const { Rect, Circle, Ellipse, Triangle, Polygon, Path, Line: FL, Polyline } = F;
    const cx = c.getWidth() / 2, cy = c.getHeight() / 2;
    let s: any = null;
    const sz = 30 * scaleRef.current;
    const hsz = sz / 2;
    const mkPoly = (n: number, outerR = hsz, innerR?: number) => {
      const pts: {x:number;y:number}[] = [];
      const total = innerR ? n * 2 : n;
      for (let i = 0; i < total; i++) {
        const r = innerR ? (i % 2 === 0 ? outerR : innerR) : outerR;
        const a = -Math.PI/2 + (i * 2 * Math.PI / total);
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }
      return pts;
    };

    // === Basic Shapes ===
    if (type === "rect") s = new Rect({ left: cx-sz, top: cy-hsz, width: sz*2, height: sz, fill: color });
    else if (type === "square") s = new Rect({ left: cx-hsz, top: cy-hsz, width: sz, height: sz, fill: color });
    else if (type === "roundrect") s = new Rect({ left: cx-sz, top: cy-hsz, width: sz*2, height: sz, fill: color, rx: 12, ry: 12 });
    else if (type === "roundsquare") s = new Rect({ left: cx-hsz, top: cy-hsz, width: sz, height: sz, fill: color, rx: 10, ry: 10 });
    else if (type === "circle") s = new Circle({ left: cx-hsz, top: cy-hsz, radius: hsz, fill: color });
    else if (type === "ellipse") s = new Ellipse({ left: cx-sz, top: cy-hsz*0.7, rx: sz, ry: hsz*0.7, fill: color });
    else if (type === "ring") s = new Circle({ left: cx-hsz, top: cy-hsz, radius: hsz, fill: "", stroke: color, strokeWidth: 8 });
    else if (type === "semicircle") s = new Path(`M ${cx-hsz} ${cy} A ${hsz} ${hsz} 0 0 1 ${cx+hsz} ${cy} Z`, { fill: color });
    else if (type === "quarter") s = new Path(`M ${cx} ${cy} L ${cx+hsz} ${cy} A ${hsz} ${hsz} 0 0 0 ${cx} ${cy-hsz} Z`, { fill: color });

    // === Polygons ===
    else if (type === "triangle") s = new Triangle({ left: cx-hsz, top: cy-hsz, width: sz, height: sz, fill: color });
    else if (type === "righttri") s = new Polygon([{x:cx-hsz,y:cy+hsz},{x:cx+hsz,y:cy+hsz},{x:cx-hsz,y:cy-hsz}], { fill: color });
    else if (type === "diamond") s = new Polygon([{x:cx,y:cy-hsz},{x:cx+hsz,y:cy},{x:cx,y:cy+hsz},{x:cx-hsz,y:cy}], { fill: color });
    else if (type === "pentagon") s = new Polygon(mkPoly(5), { fill: color });
    else if (type === "hexagon") s = new Polygon(mkPoly(6), { fill: color });
    else if (type === "heptagon") s = new Polygon(mkPoly(7), { fill: color });
    else if (type === "octagon") s = new Polygon(mkPoly(8), { fill: color });
    else if (type === "decagon") s = new Polygon(mkPoly(10), { fill: color });
    else if (type === "parallelogram") s = new Polygon([{x:cx-sz+hsz*0.3,y:cy-hsz*0.5},{x:cx+sz,y:cy-hsz*0.5},{x:cx+sz-hsz*0.3,y:cy+hsz*0.5},{x:cx-sz,y:cy+hsz*0.5}], { fill: color });
    else if (type === "trapezoid") s = new Polygon([{x:cx-hsz*0.6,y:cy-hsz*0.5},{x:cx+hsz*0.6,y:cy-hsz*0.5},{x:cx+sz,y:cy+hsz*0.5},{x:cx-sz,y:cy+hsz*0.5}], { fill: color });

    // === Stars & Badges ===
    else if (type === "star4") s = new Polygon(mkPoly(4, hsz, hsz*0.4), { fill: color });
    else if (type === "star") s = new Polygon(mkPoly(5, hsz, hsz*0.45), { fill: color });
    else if (type === "star6") s = new Polygon(mkPoly(6, hsz, hsz*0.5), { fill: color });
    else if (type === "star8") s = new Polygon(mkPoly(8, hsz, hsz*0.5), { fill: color });
    else if (type === "burst12") s = new Polygon(mkPoly(12, hsz, hsz*0.7), { fill: color });
    else if (type === "burst24") s = new Polygon(mkPoly(24, hsz, hsz*0.8), { fill: color });
    else if (type === "badge") s = new Polygon(mkPoly(16, hsz, hsz*0.85), { fill: color });

    // === Arrows ===
    else if (type === "arrowright") s = new Path("M 0 15 L 50 15 L 50 5 L 70 20 L 50 35 L 50 25 L 0 25 Z", { left: cx-35, top: cy-20, fill: color });
    else if (type === "arrowleft") s = new Path("M 70 15 L 20 15 L 20 5 L 0 20 L 20 35 L 20 25 L 70 25 Z", { left: cx-35, top: cy-20, fill: color });
    else if (type === "arrowup") s = new Path("M 15 70 L 15 20 L 5 20 L 20 0 L 35 20 L 25 20 L 25 70 Z", { left: cx-17, top: cy-35, fill: color });
    else if (type === "arrowdown") s = new Path("M 15 0 L 15 50 L 5 50 L 20 70 L 35 50 L 25 50 L 25 0 Z", { left: cx-17, top: cy-35, fill: color });
    else if (type === "arrowdouble") s = new Path("M 0 20 L 15 5 L 15 13 L 55 13 L 55 5 L 70 20 L 55 35 L 55 27 L 15 27 L 15 35 Z", { left: cx-35, top: cy-20, fill: color });
    else if (type === "arrowcurve") s = new Path("M 5 40 Q 5 5 40 5 L 40 0 L 55 10 L 40 20 L 40 15 Q 15 15 15 40 Z", { left: cx-27, top: cy-20, fill: color });
    else if (type === "chevron") s = new Path("M 0 0 L 50 0 L 70 20 L 50 40 L 0 40 L 20 20 Z", { left: cx-35, top: cy-20, fill: color });

    // === Lines ===
    else if (type === "line") s = new FL([cx-sz, cy, cx+sz, cy], { stroke: color, strokeWidth: 3, fill: "" });
    else if (type === "dashed") s = new FL([cx-sz, cy, cx+sz, cy], { stroke: color, strokeWidth: 3, strokeDashArray: [10,5], fill: "" });
    else if (type === "dotted") s = new FL([cx-sz, cy, cx+sz, cy], { stroke: color, strokeWidth: 3, strokeDashArray: [3,3], fill: "" });
    else if (type === "thick") s = new FL([cx-sz, cy, cx+sz, cy], { stroke: color, strokeWidth: 8, fill: "" });
    else if (type === "diagonal") s = new FL([cx-hsz, cy+hsz, cx+hsz, cy-hsz], { stroke: color, strokeWidth: 3, fill: "" });

    // === Symbols ===
    else if (type === "heart") s = new Path("M 25 45 L 5 25 A 10 10 0 0 1 25 10 A 10 10 0 0 1 45 25 Z", { left: cx-22, top: cy-22, fill: color });
    else if (type === "cross") s = new Polygon([{x:cx-hsz*0.33,y:cy-hsz},{x:cx+hsz*0.33,y:cy-hsz},{x:cx+hsz*0.33,y:cy-hsz*0.33},{x:cx+hsz,y:cy-hsz*0.33},{x:cx+hsz,y:cy+hsz*0.33},{x:cx+hsz*0.33,y:cy+hsz*0.33},{x:cx+hsz*0.33,y:cy+hsz},{x:cx-hsz*0.33,y:cy+hsz},{x:cx-hsz*0.33,y:cy+hsz*0.33},{x:cx-hsz,y:cy+hsz*0.33},{x:cx-hsz,y:cy-hsz*0.33},{x:cx-hsz*0.33,y:cy-hsz*0.33}], { fill: color });
    else if (type === "check") s = new Path("M 5 25 L 20 40 L 50 5 L 45 0 L 20 30 L 10 20 Z", { left: cx-25, top: cy-20, fill: color });
    else if (type === "xmark") s = new Path("M 5 0 L 25 20 L 45 0 L 50 5 L 30 25 L 50 45 L 45 50 L 25 30 L 5 50 L 0 45 L 20 25 L 0 5 Z", { left: cx-25, top: cy-25, fill: color });
    else if (type === "moon") s = new Path(`M ${cx} ${cy-hsz} A ${hsz} ${hsz} 0 1 0 ${cx} ${cy+hsz} A ${hsz*0.65} ${hsz} 0 1 1 ${cx} ${cy-hsz} Z`, { fill: color });
    else if (type === "lightning") s = new Path("M 25 0 L 10 25 L 20 25 L 5 50 L 35 20 L 25 20 L 40 0 Z", { left: cx-20, top: cy-25, fill: color });
    else if (type === "cloud") s = new Path("M 25 45 Q 5 45 5 33 Q 5 23 15 20 Q 12 5 28 5 Q 42 5 42 18 Q 50 20 50 30 Q 50 45 35 45 Z", { left: cx-25, top: cy-22, fill: color });
    else if (type === "droplet") s = new Path("M 20 0 Q 20 0 0 30 A 20 20 0 1 0 40 30 Q 20 0 20 0 Z", { left: cx-20, top: cy-25, fill: color });

    // === Callouts ===
    else if (type === "bubble") s = new Path("M 5 5 Q 5 0 10 0 L 60 0 Q 65 0 65 5 L 65 35 Q 65 40 60 40 L 25 40 L 15 50 L 18 40 L 10 40 Q 5 40 5 35 Z", { left: cx-32, top: cy-25, fill: color });
    else if (type === "bubbleround") s = new Path("M 5 20 A 30 20 0 1 1 55 35 L 30 50 L 35 35 A 30 20 0 0 1 5 20 Z", { left: cx-30, top: cy-25, fill: color });
    else if (type === "ribbon") s = new Path("M 0 10 L 10 10 L 10 0 L 60 0 L 60 10 L 70 10 L 60 20 L 70 30 L 60 30 L 60 40 L 10 40 L 10 30 L 0 30 L 10 20 Z", { left: cx-35, top: cy-20, fill: color });
    else if (type === "tag") s = new Path("M 0 0 L 50 0 L 65 20 L 50 40 L 0 40 Z", { left: cx-32, top: cy-20, fill: color });
    else if (type === "seal") s = new Polygon(mkPoly(20, hsz, hsz*0.88), { fill: color });

    // === Packaging ===
    else if (type === "tab") s = new Path("M 0 10 Q 0 0 10 0 L 50 0 Q 60 0 60 10 L 60 40 L 0 40 Z", { left: cx-30, top: cy-20, fill: color });
    else if (type === "capsule") s = new Rect({ left: cx-sz, top: cy-hsz*0.5, width: sz*2, height: hsz, fill: color, rx: hsz*0.5, ry: hsz*0.5 });
    else if (type === "arch") s = new Path(`M ${cx-sz} ${cy+hsz} L ${cx-sz} ${cy-hsz*0.3} A ${sz} ${sz*0.7} 0 0 1 ${cx+sz} ${cy-hsz*0.3} L ${cx+sz} ${cy+hsz} Z`, { fill: color });
    else if (type === "frame") { s = new Rect({ left: cx-sz, top: cy-hsz, width: sz*2, height: sz, fill: "", stroke: color, strokeWidth: 6 }); }
    else if (type === "roundframe") { s = new Rect({ left: cx-sz, top: cy-hsz, width: sz*2, height: sz, fill: "", stroke: color, strokeWidth: 6, rx: 12, ry: 12 }); }
    else if (type === "circleframe") { s = new Circle({ left: cx-hsz, top: cy-hsz, radius: hsz, fill: "", stroke: color, strokeWidth: 6 }); }

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

  // ─── Table (Vector Group) ───
  const addTableToCanvas = useCallback(async () => {
    const cv = fcRef.current; if (!cv) return;
    const F = await import("fabric");
    const { createTableConfig, buildTableObjects } = await import("@/lib/table-engine");
    const cellW = Math.min(100, Math.floor(cv.getWidth() * 0.4 / tableCols));
    const cellH = 32;
    const config = createTableConfig(tableRows, tableCols, cellW, cellH);
    const objs = buildTableObjects(config, F);
    const totalW = config.colWidths.reduce((a: number, b: number) => a + b, 0);
    const totalH = config.rowHeights.reduce((a: number, b: number) => a + b, 0);
    const offsetX = Math.floor(cv.getWidth() / 2 - totalW / 2);
    const offsetY = Math.floor(cv.getHeight() / 2 - totalH / 2);
    objs.forEach((o: any) => {
      o.set({ left: o.left + offsetX, top: o.top + offsetY });
      o._isTable = true;
      o._tableConfig = JSON.stringify(config);
      o.name = `Table ${tableRows}\u00d7${tableCols}`;
      cv.add(o);
    });
    // Select bg object for immediate editing
    const bgObj = objs.find((o: any) => o._tableRole === "bg");
    if (bgObj) cv.setActiveObject(bgObj);
    cv.requestRenderAll();
    pushHistory();
    setShowTablePanel(false);
    console.log("[TABLE] Inserted", tableRows, "x", tableCols, "table with", objs.length, "objects");
  }, [tableRows, tableCols, pushHistory]);

  // ─── Packaging Marks (SVG-based) ───
  const [markUploadRef] = useState(() => ({ current: null as HTMLInputElement | null }));
  // ─── Compliance Marks (Upload Only) ───
  // Built-in SVG marks removed — official compliance marks require certified artwork.
  // Users should upload official mark files from certification bodies.

  // addMarkToCanvas removed — using upload-only approach for compliance marks

  const uploadMarkImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const cv = fcRef.current; if (!cv) return;
    const F = fabricModRef.current; if (!F) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const img = await F.FabricImage.fromURL(reader.result as string);
      const maxSz = 50 * scaleRef.current;
      const scale = maxSz / Math.max(img.width || 1, img.height || 1);
      img.set({
        left: cv.getWidth() / 2, top: cv.getHeight() / 2,
        originX: "center", originY: "center",
        scaleX: scale, scaleY: scale,
      });
      (img as any).name = file.name.replace(/\.[^.]+$/, "");
      cv.add(img); cv.setActiveObject(img); cv.renderAll(); pushHistory(); refreshLayers();
    };
    reader.readAsDataURL(file);
    setShowMarkPanel(false);
    e.target.value = "";
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
        const pureGuides = c.getObjects().filter((o: any) => o._isGuideLayer && !o._isDieLine);
        pureGuides.forEach((o: any) => o.set({ visible: false }));
        c.requestRenderAll();
        const dataUrl = c.toDataURL({ format: "png", multiplier: 4 });
        pureGuides.forEach((o: any) => o.set({ visible: true }));
        c.requestRenderAll();
        const link = document.createElement("a");
        link.href = dataUrl; link.download = "packive-design.png"; link.click();
      } else if (type === "pdf") {
        const { exportCmykPdf } = await import("@/lib/pdf-cmyk-export");
        await exportCmykPdf(c, {
          width: c.getWidth(),
          height: c.getHeight(),
          filename: "packive-design.pdf",
          includeDieline: true,
          dielineOnly: false
        });
      } else if (type === "dieline") {
        const { exportCmykPdf } = await import("@/lib/pdf-cmyk-export");
        await exportCmykPdf(c, {
          width: c.getWidth(),
          height: c.getHeight(),
          filename: "packive-dieline.pdf",
          includeDieline: true,
          dielineOnly: true
        });
      }
    } catch (e: any) { alert("Export failed: " + e.message); }
    setExporting(null); setShowExport(false);
  }, [])

  // ─── Selected object properties ───
  const getSelectedProps = useCallback(() => {
    const c = fcRef.current; if (!c) return null;
    const obj = c.getActiveObject();
    if (!obj || (obj as any)._isGuideLayer) return null;
    const isTable = !!(obj as any)._isTable;
    let tableConfig = null;
    if (isTable && (obj as any)._tableConfig) {
      try { tableConfig = JSON.parse((obj as any)._tableConfig); } catch {}
    }
    return {
      type: obj.type || "object",
      fill: obj.fill || "#000000",
      stroke: obj.stroke || "",
      strokeWidth: obj.strokeWidth || 0,
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
      height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
      angle: Math.round(obj.angle || 0),
      opacity: Math.round((obj.opacity || 1) * 100),
      fontSize: obj.type === "i-text" || obj.type === "textbox" ? Math.max(24, Math.round(((obj as any).fontSize || 24) * ((obj as any).scaleX || 1) / scaleRef.current)) : undefined,
      fontFamily: (obj as any).fontFamily || "Inter",
      fontWeight: (obj as any).fontWeight || "normal",
      fontStyle: (obj as any).fontStyle || "normal",
      textAlign: (obj as any).textAlign || "left",
      name: (obj as any).name || "",
      _isTable: isTable,
      _tableConfig: tableConfig,
    };
  }, []);

  const [canvasReady, setCanvasReady] = useState(false);
  const [selProps, setSelProps] = useState<any>(null);
  useEffect(() => {
    const c = fcRef.current; if (!c) return;
    const update = () => {
      const props = getSelectedProps();
      setSelProps(props);
      if (props) {
        const obj = c.getActiveObject();
        if (obj && (obj.type === "i-text" || obj.type === "textbox")) {
          const objFont = (obj as any).fontFamily || "Inter";
          const objSize = Math.max(24, Math.round(((obj as any).fontSize || 24) * ((obj as any).scaleX || 1) / scaleRef.current));
          setSelectedFont(objFont);
          setFSize(objSize);
        }
      }
        if (props?._isTable && props._tableConfig) {
          setTableEditCell(prev => prev || {row: 0, col: 0});
        }
    };
    c.on("selection:created", update);
    c.on("selection:updated", update);
    c.on("selection:cleared", () => {
      setSelProps(null);
      setSelectedFont("Inter");
      setFSize(24);
    });
    
    // Init _prevLeft/_prevTop when table bg is selected
    c.on("selection:created", (e: any) => {
      const obj = e.selected?.[0];
      if (obj?._tableId && obj._tableRole === "bg") {
        obj._prevLeft = obj.left;
        obj._prevTop = obj.top;
      }
    });
    // === Table group move: drag bg moves all table objects ===
    c.on("object:moving", (e: any) => {
      const obj = e.target;
      if (!obj?._tableId || obj._tableRole !== "bg") return;
      // Init prev position on first move
      if (obj._prevLeft === undefined) { obj._prevLeft = obj.left; obj._prevTop = obj.top; return; }
      const tableId = obj._tableId;
      const dx = obj.left - obj._prevLeft;
      const dy = obj.top - obj._prevTop;
      if (dx === 0 && dy === 0) return;
      c.getObjects().forEach((o: any) => {
        if (o._tableId === tableId && o !== obj) {
          o.set({ left: o.left + dx, top: o.top + dy });
          o.setCoords();
        }
      });
      obj._prevLeft = obj.left;
      obj._prevTop = obj.top;
    });
    c.on("object:modified", (e: any) => {
      const obj = e.target;
      if (obj?._tableId) {
        delete obj._prevLeft;
        delete obj._prevTop;
      }
    });
    c.on("mouse:down", (e: any) => {
      // If clicked object belongs to a table, select the bg instead
      const target = e.target;
      if (target && target._tableId && target._tableRole !== "bg") {
        const bg = c.getObjects().find((o: any) => o._tableId === target._tableId && o._tableRole === "bg");
        if (bg) { setTimeout(() => { c.setActiveObject(bg); c.requestRenderAll(); }, 10); }
      }
      setTimeout(() => { const props = getSelectedProps(); if (props) { setSelProps(props); if (props._isTable && props._tableConfig) { setTableEditCell(prev => prev || {row: 0, col: 0}); } } }, 50);
    });
    c.on("object:modified", (e: any) => {
      const t = e.target;
      if (t && (t.type === "i-text" || t.type === "textbox") && t.scaleX && t.scaleX !== 1) {
        const newFS = Math.max(Math.round(24 * scaleRef.current), Math.round(t.fontSize * t.scaleX));
        t.set({ fontSize: newFS, scaleX: 1, scaleY: 1 });
        t.setCoords();
        c.requestRenderAll();
        const dSize = Math.max(24, Math.round(newFS / scaleRef.current));
        setFSize(dSize);
        setSelProps(prev => prev ? { ...prev, fontSize: dSize } : prev);
      }
      update();
      if (!loadingRef.current) { pushHistory(); refreshLayers(); }
    });
    c.on("object:scaling", (e: any) => {
      const t = e.target;
      if (t && (t.type === "i-text" || t.type === "textbox") && t.fontSize && t.scaleX) {
        const rawSize = Math.round(t.fontSize * t.scaleX / scaleRef.current);
        const realSize = Math.max(24, rawSize);
        setSelProps(prev => prev ? { ...prev, fontSize: realSize } : prev);
        setFSize(realSize);
      } else { update(); }
    });
    c.on("object:moving", update);
    c.on("object:rotating", update);
    return () => {
      c.off("selection:created", update);
      c.off("selection:updated", update);
      c.off("selection:cleared");
      c.off("object:modified");
      c.off("object:scaling");
      c.off("object:moving", update);
      c.off("object:rotating", update);
    };
  }, [getSelectedProps, canvasReady, pushHistory, refreshLayers]);

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
    else if (key === "fillCmyk") { const cm = value as {c:number;m:number;y:number;k:number}; obj.set({ fill: cmykToHex(cm.c,cm.m,cm.y,cm.k) }); (obj as any)._cmykFill = cm; }
    else if (key === "strokeCmyk") { const cm = value as {c:number;m:number;y:number;k:number}; obj.set({ stroke: cmykToHex(cm.c,cm.m,cm.y,cm.k) }); (obj as any)._cmykStroke = cm; }
    else if (key === "spotFill") { const s = value as {name:string;hex:string;cmyk?:[number,number,number,number]}; obj.set({ fill: s.hex }); (obj as any)._spotFill = true; (obj as any)._spotFillName = s.name; if (s.cmyk) { (obj as any)._cmykFill = {c:s.cmyk[0],m:s.cmyk[1],y:s.cmyk[2],k:s.cmyk[3]}; } }
    else if (key === "spotStroke") { const s = value as {name:string;hex:string;cmyk?:[number,number,number,number]}; obj.set({ stroke: s.hex }); (obj as any)._spotStroke = true; (obj as any)._spotStrokeName = s.name; if (s.cmyk) { (obj as any)._cmykStroke = {c:s.cmyk[0],m:s.cmyk[1],y:s.cmyk[2],k:s.cmyk[3]}; } if (!obj.strokeWidth || obj.strokeWidth < 0.5) obj.set({ strokeWidth: 1 }); }
    else if (key === "clearSpotFill") { delete (obj as any)._spotFillName; delete (obj as any)._spotFillPantone; }
    else if (key === "clearSpotStroke") { delete (obj as any)._spotStrokeName; delete (obj as any)._spotStrokePantone; }
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
      {/* TOP BAR */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2 shrink-0 z-20">
        <button onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"><span className="text-base">&#8592;</span> Back</button>
        <div className="w-px h-7 bg-gray-200 mx-1" />
        {boxType && <span className="text-sm font-semibold text-gray-800">{boxType}</span>}
        {dielineFileName && <span className="text-[11px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium truncate max-w-[200px]" title={dielineFileName}>{dielineFileName}</span>}
        {!dielineFileName && boxType && <span className="text-xs text-gray-400">{L} x {W} x {D} mm</span>}
        <div className="flex-1" />
        <input ref={dielineFileRef} type="file" accept=".eps,.ai,.pdf,.svg" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          const c = fcRef.current; if (!c) return;
          const F = fabricModRef.current; if (!F) return;
          setDielineFileName(f.name);
          // Remove existing dielines first
          const oldDielines = c.getObjects().filter((o: any) => o._isDieLine || o._isGuideLayer || o._isFoldLine || o._isPanelLabel);
          oldDielines.forEach((o: any) => c.remove(o));
          
          const ext = f.name.split(".").pop()?.toLowerCase() || "";
          let svgStr = "";
          
          if (ext === "svg") {
            svgStr = await f.text();
          } else if (ext === "eps" || ext === "ai" || ext === "pdf") {
            // Primary: Ghostscript + Inkscape pipeline (full fidelity)
            try {
              const fd = new FormData(); fd.append("file", f);
              const res = await fetch("/api/convert-file", { method: "POST", body: fd });
              const data = await res.json();
              if (data.svg) { svgStr = data.svg; }
              else if (ext === "eps") {
                // Fallback: CorelDRAW native parser for EPS only
                const fd2 = new FormData(); fd2.append("file", f);
                const res2 = await fetch("/api/convert-eps", { method: "POST", body: fd2 });
                const data2 = await res2.json();
                if (data2.svg) svgStr = data2.svg;
                else { alert("EPS conversion failed: " + (data2.error || "Unknown")); return; }
              } else {
                alert(ext.toUpperCase() + " conversion failed: " + (data.error || "Unknown")); return;
              }
            } catch (err: any) { alert(ext.toUpperCase() + " upload failed: " + err.message); return; }
          } else {
            alert("Unsupported format: " + ext); return;
          }
          
          if (!svgStr) { alert("No SVG data received"); return; }
          
          try {
            const result = await F.loadSVGFromString(svgStr);
            // Force all uploaded dieline strokes to solid dark black with visible width
            const forceBlack = (objs: any[]) => {
              if (!objs) return;
              objs.forEach((obj: any) => {
                obj.set({ stroke: "#111111", strokeWidth: Math.max(obj.strokeWidth || 1, 1.5), opacity: 1, strokeDashArray: null });
                if (obj._objects) forceBlack(obj._objects);
              });
            };
            if (ext !== "svg") forceBlack(result.objects);
            const group = F.util.groupSVGElements(result.objects, result.options);
            group.set({ _isDieLine: true, _isGuideLayer: true, selectable: !dielineLocked, evented: !dielineLocked, name: "__dieline_upload__" });
            const cw2 = c.getWidth(), ch2 = c.getHeight();
            const sw = cw2 * 0.9 / (group.width || 1), sh = ch2 * 0.9 / (group.height || 1);
            const sc = Math.min(sw, sh);
            group.set({ scaleX: sc, scaleY: sc, left: cw2 / 2, top: ch2 / 2, originX: "center", originY: "center" });
            c.add(group); c.sendObjectToBack(group); c.requestRenderAll();
          } catch (err: any) { alert("Failed to load dieline: " + err.message); }
          e.target.value = "";
        }} />
        <button onClick={() => { if (!window.confirm("Start a completely new blank canvas?\nAll current work including dielines will be permanently removed.")) return; const c = fcRef.current; if (!c) return; c.clear(); c.backgroundColor = "#ffffff"; c.requestRenderAll(); setDielineFileName(""); pushHistory(); refreshLayers(); }} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors" title="Start a completely new blank canvas">New</button>
        <button onClick={() => dielineFileRef.current?.click()} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors">Upload Dieline (EPS/AI/PDF/SVG)</button>
        <button onClick={() => { const c = fcRef.current; if (!c) return; const nv = !dielineVisible; setDielineVisible(nv); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine || o._isPanelLabel) o.set({ visible: nv }); }); c.requestRenderAll(); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${dielineVisible ? "bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-300" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>{dielineVisible ? "Hide Lines" : "Show Lines"}</button>
        <button onClick={() => { const c = fcRef.current; if (!c) return; const nl = !dielineLocked; setDielineLocked(nl); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine || o._isPanelLabel) o.set({ selectable: !nl, evented: !nl }); }); c.requestRenderAll(); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${dielineLocked ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>{dielineLocked ? "\uD83D\uDD12 Locked" : "\uD83D\uDD13 Unlocked"}</button>
        <div className="w-px h-7 bg-gray-200 mx-1" />
        <button onClick={undo} title="Undo (Ctrl+Z)" className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">&#8630;</button>
        <button onClick={redo} title="Redo (Ctrl+Y)" className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">&#8631;</button>
        <div className="w-px h-7 bg-gray-200 mx-1" />
        <button onClick={() => applyZoom(zoom - 25)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 text-sm">-</button>
        <span className="text-[11px] text-gray-600 w-10 text-center">{zoom}%</span>
        <button onClick={() => applyZoom(zoom + 25)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 text-sm">+</button>
        <button onClick={() => applyZoom(100)} className="text-[11px] text-blue-600 hover:text-blue-800 font-medium ml-1">Fit</button>
        <div className="w-px h-7 bg-gray-200 mx-1" />
        <button onClick={fileSave} title="Save Design (Ctrl+S)" className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">{saveStatus === "saved" ? "✓ Saved!" : "💾 Save"}</button>
        <button onClick={() => fileLoadRef.current?.click()} title="Load Design File" className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors">{saveStatus === "loaded" ? "✓ Loaded!" : "📂 Load"}</button>
        <input ref={fileLoadRef} type="file" accept=".json,.pkv.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (window.confirm("Loading will replace current canvas. Continue?")) { fileLoad(f); } } e.target.value = ""; }} />
        <div className="w-px h-7 bg-gray-200 mx-1" />
        <button onClick={() => setShowExport(true)} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">Export</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ═══ LEFT TOOLBAR ═══ */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-3 shrink-0 overflow-y-auto">
          <span className="text-[8px] font-bold text-gray-400 tracking-wider mb-1">DESIGN</span>
          {[
            { icon: "\u2196", label: "Select", action: () => { const c = fcRef.current; if(c){ c.isDrawingMode = false; setDrawMode(false); setEyedropperMode(false); c.defaultCursor = "default"; c.hoverCursor = "move"; } } },
            { icon: "T", label: "Text", action: addText },
            { icon: "\uD83D\uDDBC", label: "Image", action: addImage },
            { icon: "\u25C6", label: "Shapes", action: () => setShowShapePanel(p => !p) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.label}
              className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-colors hover:bg-gray-100 text-gray-600">
              <span className="text-base leading-none">{btn.icon}</span>
              <span className="text-[9px] mt-0.5">{btn.label}</span>
            </button>
          ))}
          <div className="w-8 h-px bg-gray-200 my-2" />
          <span className="text-[8px] font-bold text-gray-400 tracking-wider mb-1">PACKAGE</span>
          {[
            { icon: "\u229E", label: "Table", action: () => setShowTablePanel(p => !p) },
            { icon: "\u25AE\u25AF", label: "Barcode", action: () => setShowBarcodePanel(p => !p) },
            { icon: "\u25CE", label: "Marks", action: () => setShowMarkPanel(p => !p) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} title={btn.label}
              className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-colors hover:bg-gray-100 text-gray-600">
              <span className="text-base leading-none">{btn.icon}</span>
              <span className="text-[9px] mt-0.5">{btn.label}</span>
            </button>
          ))}
          <div className="w-8 h-px bg-gray-200 my-2" />
          <span className="text-[8px] font-bold text-gray-400 tracking-wider mb-1">UTILS</span>
          <button onClick={() => { const c = fcRef.current; if (!c) return; const nm = !eyedropperMode; setEyedropperMode(nm); if (nm) { c.isDrawingMode = false; setDrawMode(false); c.defaultCursor = "crosshair"; c.hoverCursor = "crosshair"; const handler = (opt: any) => { const t = opt.target; if (!t) return; const fill = t.fill || "#000000"; const hex = typeof fill === "string" && fill.match(/^#[0-9a-fA-F]{6}$/) ? fill : "#000000"; const cmyk = hexToCmyk(hex); setEyedropperResult({ hex, cmyk, spot: t._spotColorName || undefined }); setEyedropperMode(false); c.defaultCursor = "default"; c.hoverCursor = "move"; c.off("mouse:down", handler); }; c.on("mouse:down", handler); } else { c.defaultCursor = "default"; c.hoverCursor = "move"; } }} title="Eyedropper (CMYK/Spot)"
            className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-colors ${eyedropperMode ? "bg-blue-100 text-blue-700 border border-blue-300" : "hover:bg-gray-100 text-gray-600"}`}>
            <span className="text-base leading-none">{"\uD83D\uDCA7"}</span>
            <span className="text-[9px] mt-0.5">Picker</span>
          </button>
          {eyedropperResult && (
            <div className="w-14 mt-1 p-1 bg-gray-50 rounded border text-[8px] text-center">
              <div className="w-6 h-6 mx-auto rounded border mb-0.5" style={{ backgroundColor: eyedropperResult.hex }} />
              <div className="text-gray-500">{eyedropperResult.hex}</div>
              <div className="text-gray-400">C{eyedropperResult.cmyk[0]} M{eyedropperResult.cmyk[1]}</div>
              <div className="text-gray-400">Y{eyedropperResult.cmyk[2]} K{eyedropperResult.cmyk[3]}</div>
              {eyedropperResult.spot && <div className="text-orange-500 font-bold">{eyedropperResult.spot}</div>}
            </div>
          )}
          <button onClick={() => { const c=fcRef.current; if(!c)return; const a=c.getActiveObjects(); const toRm: any[]=[]; a.forEach((o:any)=>{ if(o._tableId){ c.getObjects().forEach((obj:any)=>{ if(obj._tableId===o._tableId && !toRm.includes(obj)) toRm.push(obj); }); } else if(o.selectable!==false){ toRm.push(o); } }); toRm.forEach((o:any)=>c.remove(o)); c.discardActiveObject(); c.requestRenderAll(); pushHistory(); refreshLayers(); }}
            title="Delete" className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs hover:bg-red-50 text-gray-600 hover:text-red-600">
            <span className="text-base leading-none">{"\uD83D\uDDD1"}</span>
            <span className="text-[9px] mt-0.5">Delete</span>
          </button>
          <button onClick={() => setShowShortcuts(true)} title="Shortcuts (F1)"
            className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs hover:bg-gray-100 text-gray-600">
            <span className="text-base leading-none">{"\u2328"}</span>
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
            <div className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-2xl border p-3 w-72 max-h-[520px] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-700">Shapes</div>
                <button onClick={() => setShowShapePanel(false)} className="text-gray-400 hover:text-gray-600 text-sm">×</button>
              </div>

              {/* Basic */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Basic</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"rect",icon:"▬"},{id:"square",icon:"■"},{id:"roundrect",icon:"▢"},{id:"roundsquare",icon:"▣"},{id:"circle",icon:"●"},
                    {id:"ellipse",icon:"⬮"},{id:"ring",icon:"◯"},{id:"semicircle",icon:"◗"},{id:"quarter",icon:"◔"},{id:"frame",icon:"□"},
                    {id:"roundframe",icon:"▢"},{id:"circleframe",icon:"○"},
                  ] as {id:string;icon:string}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-base transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Polygons */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Polygons</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"triangle",icon:"▲"},{id:"righttri",icon:"◣"},{id:"diamond",icon:"◆"},{id:"pentagon",icon:"⬠"},{id:"hexagon",icon:"⬡"},
                    {id:"heptagon",icon:"7⬡"},{id:"octagon",icon:"⯃"},{id:"decagon",icon:"10"},{id:"parallelogram",icon:"▱"},{id:"trapezoid",icon:"⏢"},
                  ] as {id:string;icon:string}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-[11px] font-medium transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Stars & Badges */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Stars & Badges</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"star4",icon:"✦"},{id:"star",icon:"★"},{id:"star6",icon:"✶"},{id:"star8",icon:"✴"},{id:"burst12",icon:"✺"},
                    {id:"burst24",icon:"❊"},{id:"badge",icon:"🏷"},{id:"seal",icon:"◎"},
                  ] as {id:string;icon:string}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-base transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Arrows */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Arrows</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"arrowright",icon:"➜"},{id:"arrowleft",icon:"⬅"},{id:"arrowup",icon:"⬆"},{id:"arrowdown",icon:"⬇"},{id:"arrowdouble",icon:"⬌"},
                    {id:"arrowcurve",icon:"↩"},{id:"chevron",icon:"❯"},
                  ] as {id:string;icon:string}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-base transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Lines */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Lines</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"line",icon:"─"},{id:"dashed",icon:"┅"},{id:"dotted",icon:"···"},{id:"thick",icon:"━"},{id:"diagonal",icon:"╱"},
                  ] as {id:string;icon:string}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-base transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Symbols */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Symbols</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"heart",icon:"♥"},{id:"cross",icon:"✚"},{id:"check",icon:"✓"},{id:"xmark",icon:"✗"},{id:"moon",icon:"☽"},
                    {id:"lightning",icon:"⚡"},{id:"cloud",icon:"☁"},{id:"droplet",icon:"💧"},
                  ] as {id:string;icon:string}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-base transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Callouts & Labels */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Callouts & Labels</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"bubble",icon:"💬"},{id:"bubbleround",icon:"🗨"},{id:"ribbon",icon:"🎀"},{id:"tag",icon:"🏷"},
                  ] as {id:string;icon:string}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-base transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Packaging */}
              <div className="mb-1">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Packaging</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"tab",icon:"⌐"},{id:"capsule",icon:"💊"},{id:"arch",icon:"⌓"},
                  ] as {id:string;icon:string}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-base transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

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
            <div className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-2xl border p-4 w-60">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-gray-800">Insert Table</div>
                <button onClick={() => setShowTablePanel(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
              </div>
              <div className="flex gap-3 mb-3">
                <label className="flex-1">
                  <span className="text-xs text-gray-500 block mb-1">Rows</span>
                  <input type="number" value={tableRows} onChange={e => setTableRows(Math.max(1, Math.min(20, +e.target.value)))} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min={1} max={20} />
                </label>
                <label className="flex-1">
                  <span className="text-xs text-gray-500 block mb-1">Columns</span>
                  <input type="number" value={tableCols} onChange={e => setTableCols(Math.max(1, Math.min(10, +e.target.value)))} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min={1} max={10} />
                </label>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 mb-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Preview</div>
                <div className="inline-grid gap-px bg-gray-300 p-px rounded" style={{ gridTemplateColumns: `repeat(${Math.min(tableCols, 10)}, 1fr)` }}>
                  {Array.from({ length: Math.min(tableRows, 6) * Math.min(tableCols, 10) }).map((_, i) => (
                    <div key={i} className={`w-4 h-3 ${i < Math.min(tableCols, 10) ? "bg-blue-100" : "bg-white"} rounded-sm`} />
                  ))}
                </div>
                {tableRows > 6 && <div className="text-[10px] text-gray-400 mt-1">+{tableRows - 6} more rows</div>}
              </div>
                <button onClick={addTableToCanvas} className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Insert {tableRows} &times; {tableCols} Table
              </button>
            </div>
          )}

          {/* Marks Popup - Upload Only */}
          {showMarkPanel && (
            <div className="absolute left-1 top-1 z-30 bg-white rounded-xl shadow-2xl border p-4 w-72">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-gray-700">Compliance Marks</div>
                <button onClick={() => setShowMarkPanel(false)} className="text-gray-400 hover:text-gray-600 text-sm">×</button>
              </div>

              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById("mark-upload-input")?.click()}>
                <div className="text-2xl mb-1">📁</div>
                <div className="text-xs font-medium text-gray-700">Upload Mark Image</div>
                <div className="text-[10px] text-gray-400 mt-1">SVG, PNG, JPG, PDF</div>
                <input id="mark-upload-input" type="file" accept=".svg,.png,.jpg,.jpeg,.pdf" className="hidden" onChange={uploadMarkImage} />
              </div>

              {/* Common marks guide */}
              <div className="mt-3 space-y-1.5">
                <div className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">Common Packaging Marks</div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    "♻ Recycling (Mobius Loop)",
                    "🔢 Resin ID (1-7)",
                    "📦 Corrugated (PAP 20)",
                    "🌿 FSC Certified",
                    "🟢 Green Dot",
                    "🗑 Tidy Man",
                    "⚡ WEEE",
                    "🇪🇺 CE Mark",
                    "🇬🇧 UKCA",
                    "⚠️ RoHS",
                    "🧴 PAO (Period After Opening)",
                    "🐰 Cruelty Free",
                  ].map(m => (
                    <div key={m} className="text-[8px] text-gray-400 py-0.5">{m}</div>
                  ))}
                </div>
                <div className="text-[8px] text-gray-400 italic mt-1 pt-1.5 border-t border-gray-100">
                  Download official marks from certification bodies and upload here.
                  Using unofficial marks may cause legal issues.
                </div>
              </div>
            </div>
          )}

          {/* ═══ CANVAS AREA ═══ */}
          <div ref={wrapperRef} onScroll={(e) => { const t = e.target as HTMLDivElement; setRulerScroll({ left: t.scrollLeft, top: t.scrollTop }); }} onMouseMove={(e) => { const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); setMousePos({ x: e.clientX - r.left - RULER_THICK + (rulerScroll?.left || 0), y: e.clientY - r.top - RULER_THICK + (rulerScroll?.top || 0) }); }} onMouseLeave={() => setMousePos({x:-100,y:-100})} className="flex-1 overflow-auto bg-gray-100 relative pb-7"
            style={{ paddingLeft: RULER_THICK, paddingTop: RULER_THICK, cursor: drawMode ? "crosshair" : "default" }}>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              {/* ─── Rulers (Illustrator-style) ─── */}
              <RulerCorner unit={rulerUnit} onToggle={() => setRulerUnit(u => u === "mm" ? "inch" : "mm")} />
              <Ruler direction="horizontal" canvasWidth={fcRef.current?.getWidth() || 800} canvasHeight={fcRef.current?.getHeight() || 600}
                scale={scaleRef.current} zoom={zoom} scrollLeft={rulerScroll.left} scrollTop={rulerScroll.top}
                pad={15} unit={rulerUnit} mouseX={mousePos.x} mouseY={mousePos.y} onGuideCreate={addGuide} />
              <Ruler direction="vertical" canvasWidth={fcRef.current?.getWidth() || 800} canvasHeight={fcRef.current?.getHeight() || 600}
                scale={scaleRef.current} zoom={zoom} scrollLeft={rulerScroll.left} scrollTop={rulerScroll.top}
                pad={15} unit={rulerUnit} mouseX={mousePos.x} mouseY={mousePos.y} onGuideCreate={addGuide} />
            <canvas ref={canvasElRef} className="shadow-lg" />
            {/* Status bar */}
              {/* Status bar (Illustrator-style) */}
              <div className="absolute bottom-0 left-0 right-0 h-7 bg-[#2b2b2b] border-t border-[#1a1a1a] flex items-center px-3 gap-3 text-[10px] text-[#888888] font-mono select-none">
                {mousePos.x >= 0 && mousePos.y >= 0 && (
                  <span className="text-[#aaaaaa]">
                    X: {((mousePos.x + rulerScroll.left) / scaleRef.current - 15).toFixed(1)}{rulerUnit === "mm" ? "mm" : "in"}
                    {" "}Y: {((mousePos.y + rulerScroll.top) / scaleRef.current - 15).toFixed(1)}{rulerUnit === "mm" ? "mm" : "in"}
                  </span>
                )}
                {mousePos.x >= 0 && <span className="border-l border-[#444] h-3" />}
                <span>Net: {totalW.toFixed(1)} × {totalH.toFixed(1)} mm</span>
                <span>Zoom: {zoom}%</span>
                <span>Objects: {layersList.length}</span>
                {selectedPanel && <span className="text-[#4fc3f7] font-medium">Panel: {selectedPanel}</span>}
              </div>
        </div>
            </div>

        {/* ═══ RIGHT PANEL ═══ */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
          {/* Tab buttons - 3 tabs */}
          <div className="flex border-b border-gray-200 shrink-0">
            {([
              { id: "properties", label: "Props", icon: "⚙" },
              { id: "ai", label: "AI", icon: "🤖" },
              { id: "layers", label: "Layers", icon: "☰" },
            ] as { id: RightTab; label: string; icon: string }[]).map(tab => (
              <button key={tab.id} onClick={() => { setRightTab(tab.id); if (tab.id === "ai") setAiSubView("menu"); }}
                className={`flex-1 py-2 text-center text-[10px] font-medium transition-colors ${
                  rightTab === tab.id ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}>
                <div className="text-sm leading-none">{tab.icon}</div>
                <div className="mt-0.5">{tab.label}</div>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-3" data-panel-scroll>

            {/* ─── Properties Tab ─── */}
            {rightTab === "properties" && (
              <div className="space-y-1">
                {selProps ? (
                  <>
                    <div className="text-xs font-semibold text-gray-700 uppercase mb-2">{selProps.type}</div>

                    {/* ▶ Position & Size Accordion */}
                    <div className="border rounded-lg overflow-hidden">
                      <button onClick={() => toggleAcc("position")} className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <span className="text-[10px] font-semibold text-gray-600">Position & Size</span>
                        <span className="text-[9px] text-gray-400">{accOpen.position ? "▲" : "▼"}</span>
                      </button>
                      {accOpen.position && (
                        <div className="p-2 space-y-1.5 border-t">
                          <div className="grid grid-cols-2 gap-1.5">
                            {(["left","top","width","height"] as const).map(k => (
                              <label key={k} className="text-[10px] text-gray-500">{k === "left" ? "X" : k === "top" ? "Y" : k === "width" ? "W" : "H"}
                                <input type="number" value={Math.round(selProps[k] || 0)} onChange={e => updateProp(k, Number(e.target.value))} className="w-full border rounded px-2 py-1 text-xs mt-0.5" />
                              </label>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <label className="text-[10px] text-gray-500">Rotation
                              <input type="number" value={Math.round(selProps.angle || 0)} onChange={e => updateProp("angle", Number(e.target.value))} className="w-full border rounded px-2 py-1 text-xs mt-0.5" />
                            </label>
                            <label className="text-[10px] text-gray-500">Opacity
                              <input type="range" min={0} max={100} value={Math.round((selProps.opacity ?? 1) * 100)} onChange={e => updateProp("opacity", Number(e.target.value))} className="w-full mt-1" />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

              {/* ▶ Table Editor */}
              {selProps._isTable && selProps._tableConfig && (() => {
                const tc = selProps._tableConfig;
                const sel = tableSelection;
                const isMulti = sel && (sel.sr !== sel.er || sel.sc !== sel.ec);
                const _rebuildLock = { current: false };
                const rebuildTable = async (newCfg: any) => {
                  if (_rebuildLock.current) return;
                  _rebuildLock.current = true;
                  const _scrollEl = document.querySelector("[data-panel-scroll]") as HTMLElement;
                  const _scrollPos = _scrollEl?.scrollTop ?? 0;
                  try {
                     const cv = fcRef.current!;
                     const obj = cv.getActiveObject() as any;
                     if (!obj) { _rebuildLock.current = false; return; }
                     const tableId = obj._tableId;
                     const tableObjs = tableId ? cv.getObjects().filter((o: any) => o._tableId === tableId) : [obj];
                     const bgObj = tableObjs.find((o: any) => o._tableRole === "bg") || obj;
                     const baseLeft = bgObj.left || 0;
                     const baseTop = bgObj.top || 0;

                     // 1. 셀 폰트 로드 (400 weight만 빠르게)
                     const usedFonts = new Set<string>();
                     newCfg.cells.forEach((row: any[]) => row.forEach((c: any) => { if (c.fontFamily && c.fontFamily !== "Inter") usedFonts.add(c.fontFamily); }));
                     for (const ff of usedFonts) {
                       if (!document.fonts.check(`16px "${ff}"`)) {
                         try {
                           const r = await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(ff)}:wght@400&display=swap`);
                           const css = await r.text();
                           const u = css.match(/url\((https:\/\/[^)]+)\)/);
                           if (u) { const f = new FontFace(ff, `url(${u[1]})`); await f.load(); document.fonts.add(f); }
                         } catch(e) {}
                       }
                     }

                     // 2. 기존 표 제거
                     cv.discardActiveObject();
                     tableObjs.forEach((o: any) => cv.remove(o));

                     // 3. 새 표 빌드
                     const { buildTableObjects } = await import("@/lib/table-engine");
                     const F = await import("fabric");
                     const objs = buildTableObjects(newCfg, F);

                     // 4. 캔버스에 추가
                     objs.forEach((o: any) => {
                       o.set({ left: o.left + baseLeft, top: o.top + baseTop });
                       o._isTable = true;
                       o._tableConfig = JSON.stringify(newCfg);
                       o.name = `Table ${newCfg.rows}\u00d7${newCfg.cols}`;
                       cv.add(o);
                     });

                     // 5. bg 선택
                     const newBg = objs.find((o: any) => o._tableRole === "bg");
                     if (newBg) cv.setActiveObject(newBg);
                     cv.requestRenderAll();
                     // 폰트 강제 재적용 (즉시 + 지연)
                       cv.getObjects().forEach((o: any) => {
                         if (o.type === "textbox" && o._tableId) {
                           o.dirty = true;
                           o.initDimensions?.();
                           o._clearCache?.();
                         }
                       });
                       cv.requestRenderAll();
                     setSelProps((p: any) => ({...p, _tableConfig: newCfg, _tableId: objs[0]?._tableId}));
                     if (!loadingRef.current) pushHistory();
                     refreshLayers();
                  } catch (err: any) {
                    console.error("[TABLE] rebuildTable ERROR:", err);
                  } finally {
                    _rebuildLock.current = false;
                    requestAnimationFrame(() => { if (_scrollEl) _scrollEl.scrollTop = _scrollPos; requestAnimationFrame(() => { if (_scrollEl) _scrollEl.scrollTop = _scrollPos; }); });
                  }
                };
                return (
                  <div className="mb-3 border border-blue-200 rounded-xl p-3 bg-blue-50/30">
                    <div className="text-[10px] font-semibold text-blue-700 mb-2">TABLE EDITOR ({tc.rows} × {tc.cols})</div>
                    {/* Mini table grid */}
                    <div className="bg-white rounded-lg p-2 mb-2 overflow-auto max-h-52 select-none">
                      <table className="border-collapse w-full" style={{tableLayout:"fixed"}}>
                        <tbody>
                          {tc.cells.map((row: any[], ri: number) => (
                            <tr key={ri}>
                              {row.map((cell: any, ci: number) => {
                                if (cell.merged) return null;
                                const isSel = sel && ri >= sel.sr && ri <= sel.er && ci >= sel.sc && ci <= sel.ec;
                                return (
                                  <td key={ci} colSpan={cell.colSpan || 1} rowSpan={cell.rowSpan || 1}
                                    onMouseDown={() => { setTableSelStart({row:ri,col:ci}); setTableSelEnd({row:ri,col:ci}); setTableEditCell({row:ri,col:ci}); }}
                                    onMouseEnter={(e) => { if (e.buttons === 1 && tableSelStart) setTableSelEnd({row:ri,col:ci}); }}
                                    onMouseUp={() => {}}
                                    className={`border border-gray-300 text-[8px] p-0.5 cursor-pointer text-center min-w-[16px] transition-colors ${isSel ? "bg-blue-200 ring-1 ring-blue-500" : "hover:bg-gray-50"}`}
                                    style={{height: `${(tc.rowHeights?.[ri] || 32) * 0.4}px`, width: `${(tc.colWidths?.[ci] || 80) * 0.4}px`, backgroundColor: isSel ? undefined : cell.bgColor || "#fff", fontWeight: cell.fontWeight}}>
                                    <div style={{textAlign: cell.textAlign || "left", fontSize: "7px", lineHeight: "1.2", whiteSpace: "pre-wrap", wordBreak: "break-all", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: cell.verticalAlign === "top" ? "flex-start" : cell.verticalAlign === "bottom" ? "flex-end" : "center", minHeight: "100%"}}><span style={{textAlign: cell.textAlign || "left", display: "block"}}>{cell.text || <span className="text-gray-300">·</span>}</span></div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Merge/Unmerge buttons */}
                    {sel && (
                      <div className="flex gap-1 mb-2">
                        {isMulti && (
                          <button onClick={async () => {
                            const { mergeCells } = await import("@/lib/table-engine");
                            const obj = fcRef.current?.getActiveObject() as any;
                            const currentCfg = obj?._tableConfig ? JSON.parse(obj._tableConfig) : tc;
                            const newCfg = mergeCells(currentCfg, sel.sr, sel.sc, sel.er, sel.ec);
                            console.log("[TABLE] Merge:", sel, "cells merged:", newCfg.cells[sel.sr][sel.sc].colSpan, "x", newCfg.cells[sel.sr][sel.sc].rowSpan);
                            await rebuildTable(newCfg);
                            setTableSelStart(null); setTableSelEnd(null); setTableEditCell({row:sel.sr,col:sel.sc});
                          }} className="text-[9px] px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium">Merge Cells</button>
                        )}
                        {!isMulti && tc.cells[sel.sr]?.[sel.sc] && (tc.cells[sel.sr][sel.sc].colSpan > 1 || tc.cells[sel.sr][sel.sc].rowSpan > 1) && (
                          <button onClick={async () => {
                            const obj = fcRef.current?.getActiveObject() as any;
                            const { unmergeCells } = await import("@/lib/table-engine");
                            const currentCfg = obj?._tableConfig ? JSON.parse(obj._tableConfig) : tc;
                            const newCfg = unmergeCells(currentCfg, sel.sr, sel.sc);
                            console.log("[TABLE] Unmerge:", sel.sr, sel.sc);
                            await rebuildTable(newCfg);
                          }} className="text-[9px] px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded font-medium">Unmerge</button>
                        )}
                        <span className="text-[8px] text-gray-400 self-center ml-1">
                          {isMulti ? `[${sel.sr},${sel.sc}] → [${sel.er},${sel.ec}]` : `Cell [${sel.sr},${sel.sc}]`}
                        </span>
                      </div>
                    )}
                    {/* Cell editing controls */}
                    {/* Cell editing */}
                    {tableEditCell && tc.cells[tableEditCell.row]?.[tableEditCell.col] && (() => {
                      const cell = tc.cells[tableEditCell.row][tableEditCell.col];
                       const updateAndRebuild = (prop: string, value: any) => {
                         const cv = fcRef.current;
                         const obj = cv?.getActiveObject() as any;
                         if (!obj?._tableConfig || !cv) return;
                         const cfg = JSON.parse(obj._tableConfig);
                         const sr = tableSelStart && tableSelEnd ? Math.min(tableSelStart.row, tableSelEnd.row) : tableEditCell.row;
                         const er = tableSelStart && tableSelEnd ? Math.max(tableSelStart.row, tableSelEnd.row) : tableEditCell.row;
                         const sc = tableSelStart && tableSelEnd ? Math.min(tableSelStart.col, tableSelEnd.col) : tableEditCell.col;
                         const ec = tableSelStart && tableSelEnd ? Math.max(tableSelStart.col, tableSelEnd.col) : tableEditCell.col;
                         for (let r = sr; r <= er; r++) for (let c = sc; c <= ec; c++) { if (cfg.cells[r]?.[c] && !cfg.cells[r][c].merged) cfg.cells[r][c][prop] = value; }

                         // fontFamily, fontWeight, fontStyle, fontSize, fill(textColor) 등은 기존 객체에 직접 적용
                         const directProps = ["fontFamily","fontWeight","fontStyle","fontSize","textAlign","lineHeight"];
                         const fabricPropMap: Record<string,string> = { textColor: "fill" };
                         const fabricProp = fabricPropMap[prop] || prop;
                         if (directProps.includes(prop) || fabricPropMap[prop]) {
                           const tableId = obj._tableId;
                           const allObjs = cv.getObjects().filter((o: any) => o._tableId === tableId && o.type === "textbox");
                           allObjs.forEach((o: any) => {
                             const r = o._tableRow, c = o._tableCol;
                             if (r >= sr && r <= er && c >= sc && c <= ec) {
                               o.set({ [fabricProp]: value, dirty: true });
                               o.initDimensions?.();
                               o._clearCache?.();
                             }
                           });
                           // config 업데이트 (모든 표 객체에 저장)
                           const newCfgStr = JSON.stringify(cfg);
                           cv.getObjects().filter((o: any) => o._tableId === tableId).forEach((o: any) => { o._tableConfig = newCfgStr; });
                           cv.requestRenderAll();
                           setSelProps((p: any) => ({...p, _tableConfig: cfg}));
                           if (!loadingRef.current) pushHistory();
                           return;
                         }

                         // 나머지 속성(text, bgColor, border 등)은 rebuildTable
                         rebuildTable(cfg);
                       };
                      return (
                        <div className="space-y-2 border-t pt-2">
                            <textarea defaultValue={cell.text || ""} placeholder="Cell text..." rows={2}
                              key={`cell-${tableEditCell.row}-${tableEditCell.col}`}
                              onChange={e => { const val = e.target.value; clearTimeout((window as any).__txtTimer); (window as any).__txtTimer = setTimeout(() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); const r = tableEditCell.row, c = tableEditCell.col; if (cfg.cells[r]?.[c]) { cfg.cells[r][c].text = val; } rebuildTable(cfg); }, 300); }}
                              onBlur={e => updateAndRebuild("text", e.target.value)}
                              className="w-full border rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 resize-none" />
                            {tableCmykOpen && createPortal(
                              <div className="fixed bg-white border border-gray-300 rounded-lg shadow-xl p-3 w-64 z-[9999]" style={{top: "80px", right: "16px"}} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-medium text-gray-600">{tableCmykOpen === "bg" ? "BG" : tableCmykOpen === "text" ? "Text" : "Border"} Color</span>
                                  <button onClick={() => setTableCmykOpen(null)} className="text-gray-400 hover:text-gray-600 text-sm leading-none">✕</button>
                                </div>
                                {(() => {
                                  const prop = tableCmykOpen === "bg" ? "bgColor" : tableCmykOpen === "text" ? "textColor" : "cellBorderColor";
                                  const curHex = tableCmykOpen === "bg" ? (cell.bgColor || "#ffffff") : tableCmykOpen === "text" ? (cell.textColor || "#000000") : (cell.cellBorderColor || "#000000");
                                  const cmyk = hexToCmyk(curHex);
                                  return (<>
                                    <div ref={tblPickRef} className="relative w-full h-36 rounded cursor-crosshair border border-gray-200"
                                      style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsvToHex(tblHue, 1, 1)})` }}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        tblDragging.current = true;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const s = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                                        const v = Math.max(0, Math.min(100, (1 - (e.clientY - rect.top) / rect.height) * 100));
                                        setTblPickPos({s, v});
                                        const hex = hsvToHex(tblHue, s/100, v/100);
                                        const ck = hexToCmyk(hex);
                                        updateAndRebuild(prop, cmykToHex(ck[0],ck[1],ck[2],ck[3]));
                                        const onMove = (ev: MouseEvent) => {
                                          if (!tblDragging.current) return;
                                          const r = tblPickRef.current?.getBoundingClientRect();
                                          if (!r) return;
                                          const ms = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100));
                                          const mv = Math.max(0, Math.min(100, (1 - (ev.clientY - r.top) / r.height) * 100));
                                          setTblPickPos({s: ms, v: mv});
                                          const mhex = hsvToHex(tblHue, ms/100, mv/100);
                                          const mck = hexToCmyk(mhex);
                                          updateAndRebuild(prop, cmykToHex(mck[0],mck[1],mck[2],mck[3]));
                                        };
                                        const onUp = () => {
                                          tblDragging.current = false;
                                          document.removeEventListener("mousemove", onMove);
                                          document.removeEventListener("mouseup", onUp);
                                        };
                                        document.addEventListener("mousemove", onMove);
                                        document.addEventListener("mouseup", onUp);
                                      }}>
                                      <div className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none" style={{
                                        left: `calc(${tblPickPos.s}% - 8px)`, top: `calc(${100 - tblPickPos.v}% - 8px)`,
                                        backgroundColor: curHex,
                                        boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)"
                                      }} />
                                    </div>
                                    <div className="relative mt-2">
                                      <input onMouseDown={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} type="range" min="0" max="360" value={tblHue}
                                        onChange={(e) => {
                                          const h = Number(e.target.value);
                                          setTblHue(h);
                                          const hex = hsvToHex(h, tblPickPos.s/100, tblPickPos.v/100);
                                          const ck = hexToCmyk(hex);
                                          updateAndRebuild(prop, cmykToHex(ck[0],ck[1],ck[2],ck[3]));
                                        }}
                                        className="w-full h-3 rounded-full cursor-pointer appearance-none"
                                        style={{background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"}}
                                      />
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 mb-1">
                                      <span className="text-[10px] font-medium text-gray-600">{tableCmykOpen === "bg" ? "BG" : tableCmykOpen === "text" ? "Text" : "Border"}</span>
                                      <div className="w-6 h-6 rounded border border-gray-300" style={{backgroundColor: curHex}} />
                                      <span className="text-[9px] text-gray-400 font-mono">{curHex}</span>
                                    </div>
                                    {(["C","M","Y","K"] as const).map((ch, ci) => {
                                      const colors = ["#00BCD4","#E91E63","#FFC107","#424242"];
                                      return (
                                        <div key={ch} className="flex items-center gap-2 mb-1">
                                          <span className="text-[9px] w-4 font-bold" style={{color:colors[ci]}}>{ch}</span>
                                          <input onMouseDown={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} type="range" min="0" max="100" value={cmyk[ci]}
                                            onChange={e => { const nc = [...cmyk] as [number,number,number,number]; nc[ci] = Number(e.target.value); updateAndRebuild(prop, cmykToHex(nc[0],nc[1],nc[2],nc[3])); }}
                                            className="flex-1 h-1.5 rounded-full cursor-pointer" style={{accentColor:colors[ci]}} />
                                          <span className="w-8 text-[9px] text-right text-gray-600 font-mono">{cmyk[ci]}</span>
                                        </div>
                                      );
                                    })}
                                  </>);
                                })()}
                              </div>
                            , document.body)}
                          <div className="relative">
                            <button onClick={() => setSelProps((p:any) => ({...p, _tableFontOpen: !p._tableFontOpen}))}
                              className="w-full border rounded px-2 py-1.5 text-[10px] text-left hover:bg-gray-50 flex justify-between items-center">
                              <span style={{fontFamily: cell.fontFamily || "Inter"}}>{cell.fontFamily || "Inter"}</span>
                              <span className="text-gray-400">▼</span>
                            </button>
                            {selProps._tableFontOpen && (
                               <div className="absolute z-50 w-full bg-white border rounded-lg shadow-lg max-h-60 flex flex-col mt-0.5">
                                 <input type="text" placeholder="Search fonts..." autoFocus
                                   value={fontSearch} onChange={e => setFontSearch(e.target.value)}
                                   className="border-b px-2 py-1.5 text-[10px] shrink-0 focus:outline-none" />
                                 <div className="flex border-b shrink-0">
                                   {(["all","en","ko","ja"] as const).map(cat => (
                                     <button key={cat} onClick={() => setFontCategory(cat)}
                                       className={`flex-1 py-1 text-[9px] font-medium ${fontCategory===cat?"text-blue-600 border-b-2 border-blue-600":"text-gray-400 hover:text-gray-600"}`}>
                                       {cat==="all"?"All":cat==="en"?"English":cat==="ko"?"한국어":cat==="ja"?"日本語":cat}</button>
                                   ))}
                                 </div>
                                 <div className="overflow-auto">
                                   {(() => {
                                     let list = googleFonts;
                                     if (fontCategory === "ko") list = koFonts.length > 0 ? koFonts : ["Noto Sans KR","Black Han Sans","Gothic A1","Nanum Gothic","Nanum Myeongjo","Do Hyeon","Jua","Sunflower","Gaegu","Gugi","Song Myung","Gamja Flower","Nanum Brush Script","Nanum Pen Script","Poor Story","Stylish","Cute Font","Hi Melody","East Sea Dokdo","Dokdo","Kirang Haerang","Yeon Sung","Black And White Picture"];
                                     if (fontCategory === "ja") list = jaFonts.length > 0 ? jaFonts : ["Noto Sans JP","Noto Serif JP","M PLUS Rounded 1c","M PLUS 1p","Kosugi Maru","Kosugi","Sawarabi Mincho","Sawarabi Gothic","Shippori Mincho","Zen Maru Gothic","Zen Kaku Gothic New","Hina Mincho","Dela Gothic One"];
                                     if (fontCategory === "en") list = googleFonts.filter(f => !koFonts.includes(f) && !jaFonts.includes(f));
                                     const filtered = list.filter(f => !fontSearch || f.toLowerCase().includes(fontSearch.toLowerCase())).slice(0, 100);
                                     return filtered.map(f => (
                                       <button key={f} onClick={async () => { await loadGoogleFont(f); updateAndRebuild("fontFamily", f); setSelProps((p:any) => ({...p, _tableFontOpen: false})); setFontSearch(""); }}
                                         className={`w-full text-left px-2 py-1.5 text-[10px] hover:bg-blue-50 ${(cell.fontFamily||"Inter")===f?"bg-blue-100 font-bold":""}`}
                                         style={{fontFamily: f}}>{f}</button>
                                     ));
                                   })()}
                                 </div>
                               </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {/* Colors & Weight */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-gray-400">BG</span>
                      <div className="w-5 h-5 border border-gray-200 rounded cursor-pointer p-0" style={{backgroundColor: cell.bgColor || "#ffffff"}} onClick={() => setTableCmykOpen(tableCmykOpen === "bg" ? null : "bg")} />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-gray-400">Text</span>
                      <div className="w-5 h-5 border border-gray-200 rounded cursor-pointer p-0" style={{backgroundColor: cell.textColor || "#000000"}} onClick={() => setTableCmykOpen(tableCmykOpen === "text" ? null : "text")} />
                              </div>
                              <select value={cell.fontWeight || "normal"}
                                onChange={e => updateAndRebuild("fontWeight", e.target.value)}
                                className="flex-1 h-6 text-[9px] border border-gray-200 rounded px-1">
                                <option value="normal">Regular</option>
                                <option value="bold">Bold</option>
                                <option value="300">Light</option>
                                <option value="500">Medium</option>
                                <option value="600">SemiBold</option>
                                <option value="800">ExtraBold</option>
                              </select>
                            </div>

                            {/* Size & Line Height */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[9px] text-gray-400 block mb-0.5">Size</span>
                                <div className="flex items-center border border-gray-200 rounded overflow-hidden h-7">
                                  <input type="number" min={6} max={200} step={1}
                                    key={`fs-${tableEditCell.row}-${tableEditCell.col}-${cell.fontSize}`}
                                    defaultValue={cell.fontSize || 14}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const v = parseInt((e.target as any).value); if (v >= 6 && v <= 200) updateAndRebuild("fontSize", v); (e.target as any).blur(); } }}
                                    onBlur={e => { const v = parseInt(e.target.value); if (v >= 6 && v <= 200) updateAndRebuild("fontSize", v); }}
                                    className="w-full h-full text-center text-[11px] border-none outline-none bg-transparent" />
                                  <div className="flex flex-col border-l border-gray-200">
                                    <button onClick={() => updateAndRebuild("fontSize", Math.min(200, (cell.fontSize || 14) + 1))}
                                      className="w-5 h-3.5 bg-gray-50 hover:bg-gray-200 text-[8px] leading-none flex items-center justify-center border-b border-gray-100">&#9650;</button>
                                    <button onClick={() => updateAndRebuild("fontSize", Math.max(6, (cell.fontSize || 14) - 1))}
                                      className="w-5 h-3.5 bg-gray-50 hover:bg-gray-200 text-[8px] leading-none flex items-center justify-center">&#9660;</button>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] text-gray-400 block mb-0.5">Line H</span>
                                <div className="flex items-center border border-gray-200 rounded overflow-hidden h-7">
                                  <input type="number" min={0.8} max={3} step={0.1}
                                    key={`lh-${tableEditCell?.row}-${tableEditCell?.col}-${cell.lineHeight}`}
                                    defaultValue={cell.lineHeight || 1.4}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const v = parseFloat((e.target as any).value); if (v >= 0.8 && v <= 3) updateAndRebuild("lineHeight", v); (e.target as any).blur(); } }}
                                    onBlur={e => { const v = parseFloat(e.target.value); if (v >= 0.8 && v <= 3) updateAndRebuild("lineHeight", v); }}
                                    className="w-full h-full text-center text-[11px] border-none outline-none bg-transparent" />
                                  <div className="flex flex-col border-l border-gray-200">
                                    <button onClick={() => updateAndRebuild("lineHeight", Math.min(3, parseFloat(((cell.lineHeight || 1.4) + 0.1).toFixed(1))))}
                                      className="w-5 h-3.5 bg-gray-50 hover:bg-gray-200 text-[8px] leading-none flex items-center justify-center border-b border-gray-100">&#9650;</button>
                                    <button onClick={() => updateAndRebuild("lineHeight", Math.max(0.8, parseFloat(((cell.lineHeight || 1.4) - 0.1).toFixed(1))))}
                                      className="w-5 h-3.5 bg-gray-50 hover:bg-gray-200 text-[8px] leading-none flex items-center justify-center">&#9660;</button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Alignment */}
                            <div className="grid grid-cols-6 gap-0.5">
                              {(["left","center","right"] as const).map(a => (
                                <button key={a} onClick={() => updateAndRebuild("textAlign", a)}
                                  className={`h-6 rounded text-[9px] font-medium transition-colors ${cell.textAlign === a ? "bg-blue-100 text-blue-700 font-bold" : "bg-gray-50 hover:bg-gray-100 text-gray-500"}`}>
                                  {a === "left" ? "L" : a === "right" ? "R" : "C"}</button>
                              ))}
                              {(["top","middle","bottom"] as const).map(v => (
                                <button key={v} onClick={() => updateAndRebuild("verticalAlign", v)}
                                  className={`h-6 rounded text-[9px] font-medium transition-colors ${cell.verticalAlign === v ? "bg-green-100 text-green-700 font-bold" : "bg-gray-50 hover:bg-gray-100 text-gray-500"}`}>
                                  {v === "top" ? "T" : v === "bottom" ? "B" : "M"}</button>
                              ))}
                            </div>

                            {/* Borders */}
                            <div className="pt-1.5 mt-0.5 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] font-semibold text-gray-600">Borders</span>
                      <div className="w-4 h-4 border border-gray-200 rounded cursor-pointer p-0" style={{backgroundColor: cell.cellBorderColor || "#000000"}} onClick={() => setTableCmykOpen(tableCmykOpen === "border" ? null : "border")} />
                              </div>
                              <div className="space-y-1 mb-1.5">
                                {(["Outer","Inner"] as const).map(type => {
                                  const isOuter = type === "Outer";
                                  const val = isOuter ? (tc.cells[0]?.[0]?.borderTop || 0.5) : (tc.cells[Math.min(1, tc.rows-1)]?.[0]?.borderTop || 0.5);
                                  return (
                                    <div key={type} className="flex items-center">
                                      <span className="text-[9px] text-gray-400 w-10">{type}</span>
                                      <div className="flex items-center border border-gray-200 rounded overflow-hidden h-6 flex-1">
                                        <button onClick={() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); for (let r = 0; r < cfg.rows; r++) for (let c = 0; c < cfg.cols; c++) { const cl = cfg.cells[r]?.[c]; if (!cl) continue; if (cl.merged) continue; const rs = cl.rowSpan || 1; const cs = cl.colSpan || 1; if (isOuter) { if (r===0) cl.borderTop=Math.max(0.25,(cl.borderTop??0.5)-0.25); if (r+rs>=cfg.rows) cl.borderBottom=Math.max(0.25,(cl.borderBottom??0.5)-0.25); if (c===0) cl.borderLeft=Math.max(0.25,(cl.borderLeft??0.5)-0.25); if (c+cs>=cfg.cols) cl.borderRight=Math.max(0.25,(cl.borderRight??0.5)-0.25); } else { if (r>0) cl.borderTop=Math.max(0.25,(cl.borderTop??0.5)-0.25); if (r+rs<cfg.rows) cl.borderBottom=Math.max(0.25,(cl.borderBottom??0.5)-0.25); if (c>0) cl.borderLeft=Math.max(0.25,(cl.borderLeft??0.5)-0.25); if (c+cs<cfg.cols) cl.borderRight=Math.max(0.25,(cl.borderRight??0.5)-0.25); } } rebuildTable(cfg);
                                        }} className="w-6 h-full bg-gray-50 hover:bg-gray-200 text-[10px] flex items-center justify-center">-</button>
                                        <span className="flex-1 text-center text-[10px] font-mono">{val.toFixed(2)}</span>
                                        <button onClick={() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); for (let r = 0; r < cfg.rows; r++) for (let c = 0; c < cfg.cols; c++) { const cl = cfg.cells[r]?.[c]; if (!cl) continue; if (cl.merged) continue; const rs = cl.rowSpan || 1; const cs = cl.colSpan || 1; if (isOuter) { if (r===0) cl.borderTop=Math.min(5,(cl.borderTop??0.5)+0.25); if (r+rs>=cfg.rows) cl.borderBottom=Math.min(5,(cl.borderBottom??0.5)+0.25); if (c===0) cl.borderLeft=Math.min(5,(cl.borderLeft??0.5)+0.25); if (c+cs>=cfg.cols) cl.borderRight=Math.min(5,(cl.borderRight??0.5)+0.25); } else { if (r>0) cl.borderTop=Math.min(5,(cl.borderTop??0.5)+0.25); if (r+rs<cfg.rows) cl.borderBottom=Math.min(5,(cl.borderBottom??0.5)+0.25); if (c>0) cl.borderLeft=Math.min(5,(cl.borderLeft??0.5)+0.25); if (c+cs<cfg.cols) cl.borderRight=Math.min(5,(cl.borderRight??0.5)+0.25); } } rebuildTable(cfg);
                                        }} className="w-6 h-full bg-gray-50 hover:bg-gray-200 text-[10px] flex items-center justify-center">+</button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                {(["Top","Right","Bottom","Left"] as const).map(side => {
                                  const prop = `border${side}` as "borderTop"|"borderRight"|"borderBottom"|"borderLeft";
                                  const val = cell[prop] ?? 0.5;
                                  return (
                                    <div key={side} className="flex items-center">
                                      <span className="text-[9px] text-gray-400 w-4 mr-0.5">{side[0]}</span>
                                      <div className="flex items-center border border-gray-200 rounded overflow-hidden h-5 flex-1">
                                        <button onClick={() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); const sr = sel ? sel.sr : tableEditCell.row, er = sel ? sel.er : tableEditCell.row; const sc = sel ? sel.sc : tableEditCell.col, ec = sel ? sel.ec : tableEditCell.col; for (let r = sr; r <= er; r++) for (let cc = sc; cc <= ec; cc++) { if (cfg.cells[r]?.[cc]) cfg.cells[r][cc][prop] = Math.max(0.25, (cfg.cells[r][cc][prop]??0.5) - 0.25); } rebuildTable(cfg);
                                        }} className="w-5 h-full bg-gray-50 hover:bg-gray-200 text-[9px] flex items-center justify-center">-</button>
                                        <span className="flex-1 text-center text-[9px] font-mono">{val.toFixed(2)}</span>
                                        <button onClick={() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); const sr = sel ? sel.sr : tableEditCell.row, er = sel ? sel.er : tableEditCell.row; const sc = sel ? sel.sc : tableEditCell.col, ec = sel ? sel.ec : tableEditCell.col; for (let r = sr; r <= er; r++) for (let cc = sc; cc <= ec; cc++) { if (cfg.cells[r]?.[cc]) cfg.cells[r][cc][prop] = Math.min(5, (cfg.cells[r][cc][prop]??0.5) + 0.25); } rebuildTable(cfg);
                                        }} className="w-5 h-full bg-gray-50 hover:bg-gray-200 text-[9px] flex items-center justify-center">+</button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Row/Col Size + Actions - always visible */}
                    {(() => {
                      const editRow = tableEditCell ? tableEditCell.row : 0;
                      const editCol = tableEditCell ? tableEditCell.col : 0;
                      return (
                        <div className="border-t pt-2 mt-1 space-y-2">
                          <div className="text-[9px] font-medium text-gray-500">Row / Col Size</div>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] text-gray-400 w-10">Row H</span>
                            <button onClick={() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); cfg.rowHeights[editRow] = Math.max(16, (cfg.rowHeights[editRow]||32)-1); rebuildTable(cfg); }}
                              className="w-7 h-7 rounded border text-sm hover:bg-gray-100 flex items-center justify-center">-</button>
                            <input type="number" min={16} max={120} step={1}
                              defaultValue={tc.rowHeights[editRow] || 32} key={`rh-${editRow}-${tc.rowHeights[editRow]}`}
                              onKeyDown={e => { if (e.key === "Enter") { const v = parseInt((e.target as HTMLInputElement).value); if (!isNaN(v)&&v>=16&&v<=120) { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); cfg.rowHeights[editRow] = v; rebuildTable(cfg); } } }} onBlur={e => { const v = parseInt(e.target.value); if (!isNaN(v)&&v>=16&&v<=120) { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); cfg.rowHeights[editRow] = v; rebuildTable(cfg); } }}
                              className="w-14 text-center border rounded text-[11px] py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            <button onClick={() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); cfg.rowHeights[editRow] = Math.min(120, (cfg.rowHeights[editRow]||32)+1); rebuildTable(cfg); }}
                              className="w-7 h-7 rounded border text-sm hover:bg-gray-100 flex items-center justify-center">+</button>
                            <button onClick={() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); const avg = Math.round(cfg.rowHeights.reduce((a:number,b:number)=>a+b,0)/cfg.rows); cfg.rowHeights = cfg.rowHeights.map(()=>avg); rebuildTable(cfg); }}
                              className="text-[7px] px-1.5 py-1 bg-gray-50 hover:bg-gray-100 rounded border ml-auto">Equal</button>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] text-gray-400 w-10">Col W</span>
                            <button onClick={() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); cfg.colWidths[editCol] = Math.max(20, (cfg.colWidths[editCol]||90)-1); rebuildTable(cfg); }}
                              className="w-7 h-7 rounded border text-sm hover:bg-gray-100 flex items-center justify-center">-</button>
                            <input type="number" min={20} max={300} step={1}
                              defaultValue={tc.colWidths[editCol] || 90} key={`cw-${editCol}-${tc.colWidths[editCol]}`}
                              onKeyDown={e => { if (e.key === "Enter") { const v = parseInt((e.target as HTMLInputElement).value); if (!isNaN(v)&&v>=20&&v<=300) { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); cfg.colWidths[editCol] = v; rebuildTable(cfg); } } }} onBlur={e => { const v = parseInt(e.target.value); if (!isNaN(v)&&v>=20&&v<=300) { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); cfg.colWidths[editCol] = v; rebuildTable(cfg); } }}
                              className="w-14 text-center border rounded text-[11px] py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            <button onClick={() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); cfg.colWidths[editCol] = Math.min(300, (cfg.colWidths[editCol]||90)+1); rebuildTable(cfg); }}
                              className="w-7 h-7 rounded border text-sm hover:bg-gray-100 flex items-center justify-center">+</button>
                            <button onClick={() => { const obj = fcRef.current?.getActiveObject() as any; if (!obj?._tableConfig) return; const cfg = JSON.parse(obj._tableConfig); const avg = Math.round(cfg.colWidths.reduce((a:number,b:number)=>a+b,0)/cfg.cols); cfg.colWidths = cfg.colWidths.map(()=>avg); rebuildTable(cfg); }}
                              className="text-[7px] px-1.5 py-1 bg-gray-50 hover:bg-gray-100 rounded border ml-auto">Equal</button>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            <button onClick={async () => { const { addRow } = await import("@/lib/table-engine"); await rebuildTable(addRow(tc, tableEditCell ? tableEditCell.row : 0)); }}
                              className="text-[9px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">+Row</button>
                            <button onClick={async () => { const { addCol } = await import("@/lib/table-engine"); await rebuildTable(addCol(tc, tableEditCell ? tableEditCell.col : 0)); }}
                              className="text-[9px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">+Col</button>
                            <button onClick={async () => { if (tc.rows <= 1) return; const { deleteRow } = await import("@/lib/table-engine"); await rebuildTable(deleteRow(tc, tableEditCell ? tableEditCell.row : 0)); setTableEditCell(null); }}
                              className="text-[9px] px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded">-Row</button>
                            <button onClick={async () => { if (tc.cols <= 1) return; const { deleteCol } = await import("@/lib/table-engine"); await rebuildTable(deleteCol(tc, tableEditCell ? tableEditCell.col : 0)); setTableEditCell(null); }}
                              className="text-[9px] px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded">-Col</button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}

                    {(selProps.type === "i-text" || selProps.type === "textbox" || selProps.type === "text") && (
                      <div className="border rounded-lg overflow-hidden">
                        <button onClick={() => toggleAcc("typography")} className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="text-[10px] font-semibold text-gray-600">Typography</span>
                          <span className="text-[9px] text-gray-400">{accOpen.typography ? "▲" : "▼"}</span>
                        </button>
                        {accOpen.typography && (
                          <div className="p-2 space-y-2 border-t">
                             {/* Font selector */}
                             <div className="relative">
                               <button ref={fontBtnRef} onClick={() => { setFontDropOpen(p => !p); setTimeout(() => fontSearchRef.current?.focus(), 100); }}
                                 className="w-full border rounded px-2 py-1.5 text-xs text-left flex items-center justify-between hover:border-blue-400"
                                 style={{fontFamily: selProps.fontFamily}}>
                                 <span className="truncate">{selProps.fontFamily}</span>
                                 <span className="text-gray-400 text-[9px]">{fontDropOpen ? "\u25B2" : "\u25BC"}</span>
                               </button>
                               {fontDropOpen && createPortal(
                                 <div className="fixed z-[9999] bg-white border rounded-lg shadow-2xl flex flex-col"
                                   style={{
                                     top: (fontBtnRef.current?.getBoundingClientRect().bottom ?? 0) + 4,
                                     left: fontBtnRef.current?.getBoundingClientRect().left ?? 0,
                                     width: fontBtnRef.current?.getBoundingClientRect().width ?? 260,
                                     maxHeight: "min(480px, calc(100vh - " + ((fontBtnRef.current?.getBoundingClientRect().bottom ?? 200) + 20) + "px))",
                                   }}>
                                   {/* Backdrop */}
                                   <div className="fixed inset-0 z-[-1]" onClick={() => { setFontDropOpen(false); setFontSearch(""); }} />
                                   <div className="p-1.5 border-b shrink-0">
                                     <input ref={fontSearchRef} value={fontSearch} onChange={e => setFontSearch(e.target.value)}
                                       placeholder="Search fonts..." className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
                                   </div>
                                   <div className="flex border-b shrink-0">
                                     {(["all","en","ko","ja"] as const).map(cat => (
                                       <button key={cat} onClick={() => setFontCategory(cat)}
                                         className={"px-2 py-1 text-[10px] border-b-2 " + (fontCategory===cat?"border-blue-500 text-blue-600":"border-transparent text-gray-500")}>
                                         {cat==="all"?"All":cat==="en"?"English":cat==="ko"?"Korean":"Japanese"}
                                       </button>
                                     ))}
                                   </div>
                                   <div className="overflow-y-auto flex-1">
                                     {(() => {
                                       const enPriority = ["Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Oswald","Raleway","Merriweather","Playfair Display","Source Sans 3","Nunito","Ubuntu","Rubik","Work Sans","Quicksand","Barlow","Mulish","Karla","Libre Baskerville","DM Sans","Manrope","Space Grotesk","Archivo","Bitter","Crimson Text","Cormorant Garamond","Josefin Sans","Cabin","Overpass","Fira Sans","PT Sans","Dosis","Titillium Web","Oxygen","Catamaran","Comfortaa","Abel","Asap","Exo 2","Maven Pro","Prompt","Signika","Varela Round","Heebo","Outfit","Lexend","Figtree","Sora","Plus Jakarta Sans","Albert Sans","Red Hat Display","Wix Madefor Display"];
                                       let pool = googleFonts;
                                       if (fontCategory === "en") pool = enPriority.filter(f => googleFonts.includes(f));
                                       else if (fontCategory === "ko") pool = koFonts.length > 0 ? koFonts : ["Noto Sans KR","Noto Serif KR","Gothic A1","Nanum Gothic","Nanum Myeongjo"];
                                       else if (fontCategory === "ja") pool = jaFonts.length > 0 ? jaFonts : ["Noto Sans JP","Noto Serif JP","M PLUS Rounded 1c","M PLUS 1p","Kosugi Maru"];
                                       const filtered = pool.filter(f => !fontSearch || f.toLowerCase().includes(fontSearch.toLowerCase()));
                                       return filtered.slice(0, 200).map(f => (
                                         <button key={f} onClick={() => { loadGoogleFont(f); updateProp("fontFamily", f); setSelectedFont(f); setFontDropOpen(false); setFontSearch(""); }}
                                           className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors ${selProps.fontFamily === f ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"}`}
                                           style={{fontFamily: f}}>
                                           {f}
                                         </button>
                                       ));
                                     })()}
                                   </div>
                                 </div>,
                                 document.body
                               )}
                             </div>
                            {/* Font size + style */}
                            <div className="flex items-center gap-1.5">
                              <input type="number" min={1} value={fSize} onChange={e => { const v = Math.max(1, Number(e.target.value)); setFSize(v); updateProp("fontSize", v * scaleRef.current); }} className="w-16 border rounded px-2 py-1 text-xs" />
                              <button onClick={() => updateProp("fontWeight", selProps.fontWeight === "bold" ? "normal" : "bold")}
                                className={`w-7 h-7 rounded text-xs font-bold ${selProps.fontWeight === "bold" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}>B</button>
                              <button onClick={() => updateProp("fontStyle", selProps.fontStyle === "italic" ? "normal" : "italic")}
                                className={`w-7 h-7 rounded text-xs italic ${selProps.fontStyle === "italic" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}>I</button>
                            </div>
                            {/* Text align */}
                            <div className="flex gap-1">
                              {(["left","center","right"] as const).map(a => (
                                <button key={a} onClick={() => updateProp("textAlign", a)}
                                  className={`flex-1 py-1 rounded text-[10px] ${selProps.textAlign === a ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-500"}`}>
                                  {a === "left" ? "◧" : a === "center" ? "◫" : "◨"}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ▶ Color Accordion */}
                    <div className="border rounded-lg overflow-hidden">
                      <button onClick={() => toggleAcc("color")} className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <span className="text-[10px] font-semibold text-gray-600">Color</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded border" style={{ backgroundColor: selProps.fill || "#000" }} />
                          <span className="text-[9px] text-gray-400">{accOpen.color ? "▲" : "▼"}</span>
                        </div>
                      </button>
                      {accOpen.color && (
                        <div className="p-2 space-y-2 border-t">
                          {/* Color mode tabs */}
                          <div className="flex bg-gray-100 rounded-lg p-0.5">
                            {(["cmyk","spot"] as ColorMode[]).map(m => (
                              <button key={m} onClick={() => setColorMode(m)}
                                className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${colorMode === m ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                {m.toUpperCase()}
                              </button>
                            ))}
                          </div>
                          {/* CMYK */}
                          {colorMode === "cmyk" && selProps.fill && (() => {
                const fc = (fcRef.current?.getActiveObject() as any)?._cmykFill || (() => { try { const h = typeof selProps.fill === "string" ? selProps.fill : "#000000"; const r=parseInt(h.slice(1,3),16)||0,g=parseInt(h.slice(3,5),16)||0,b=parseInt(h.slice(5,7),16)||0; const k2=1-Math.max(r,g,b)/255; if(k2>=1)return{c:0,m:0,y:0,k:100}; return{c:Math.round((1-r/255-k2)/(1-k2)*100),m:Math.round((1-g/255-k2)/(1-k2)*100),y:Math.round((1-b/255-k2)/(1-k2)*100),k:Math.round(k2*100)}; } catch { return {c:0,m:0,y:0,k:0}; } })();
                const sc = (fcRef.current?.getActiveObject() as any)?._cmykStroke || (() => { try { const h = selProps.stroke || "#000000"; const r=parseInt(h.slice(1,3),16)||0,g=parseInt(h.slice(3,5),16)||0,b=parseInt(h.slice(5,7),16)||0; const k2=1-Math.max(r,g,b)/255; if(k2>=1)return{c:0,m:0,y:0,k:100}; return{c:Math.round((1-r/255-k2)/(1-k2)*100),m:Math.round((1-g/255-k2)/(1-k2)*100),y:Math.round((1-b/255-k2)/(1-k2)*100),k:Math.round(k2*100)}; } catch { return {c:0,m:0,y:0,k:0}; } })();
                            return (
                              <div className="space-y-3">
                                {/* Fill 2D Color Picker */}
                                <div>
                                  <div className="text-[10px] font-medium text-gray-600 mb-1">Fill Color</div>
                                  <div ref={cmykPickRef} className="relative w-full h-40 rounded cursor-crosshair border border-gray-200 select-none"
                                    style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${fillHue}, 100%, 50%))` }}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      cmykDragging.current = true;
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const s = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                                      const v = Math.max(0, Math.min(100, (1 - (e.clientY - rect.top) / rect.height) * 100));
                                      setCmykPickPos({s, v});
                                      const hex = hsvToHex(fillHue, s/100, v/100);
                                      const cmyk = hexToCmyk(hex);
                                      updateProp("fillCmyk", {c:cmyk[0],m:cmyk[1],y:cmyk[2],k:cmyk[3]});
                                      const onMove = (ev: MouseEvent) => {
                                        if (!cmykDragging.current) return;
                                        const r = cmykPickRef.current?.getBoundingClientRect();
                                        if (!r) return;
                                        const ms = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100));
                                        const mv = Math.max(0, Math.min(100, (1 - (ev.clientY - r.top) / r.height) * 100));
                                        setCmykPickPos({s: ms, v: mv});
                                        const mhex = hsvToHex(fillHue, ms/100, mv/100);
                                        const mcmyk = hexToCmyk(mhex);
                                        updateProp("fillCmyk", {c:mcmyk[0],m:mcmyk[1],y:mcmyk[2],k:mcmyk[3]});
                                      };
                                      const onUp = () => {
                                        cmykDragging.current = false;
                                        document.removeEventListener("mousemove", onMove);
                                        document.removeEventListener("mouseup", onUp);
                                      };
                                      document.addEventListener("mousemove", onMove);
                                      document.addEventListener("mouseup", onUp);
                                    }}>
                                    <div className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none" style={{
                                      left: `calc(${cmykPickPos.s}% - 8px)`, top: `calc(${100 - cmykPickPos.v}% - 8px)`,
                                      backgroundColor: cmykToHex(fc.c,fc.m,fc.y,fc.k),
                                      boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)"
                                    }} />
                                  </div>
                                  <div className="relative mt-2">
                                    <input type="range" min="0" max="360" value={fillHue}
                                      onChange={(e) => {
                                        const h = Number(e.target.value);
                                        setFillHue(h);
                                        const hex = hsvToHex(h, cmykPickPos.s/100, cmykPickPos.v/100);
                                        const cmyk = hexToCmyk(hex);
                                        updateProp("fillCmyk", {c:cmyk[0],m:cmyk[1],y:cmyk[2],k:cmyk[3]});
                                      }}
                                      className="w-full h-3 rounded-full cursor-pointer appearance-none"
                                      style={{background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"}}
                                    />
                                  </div>
                                </div>
                                {/* Fill CMYK Sliders */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-medium text-gray-600">Fill</span>
                                    <div className="w-6 h-6 rounded border border-gray-300" style={{backgroundColor: cmykToHex(fc.c,fc.m,fc.y,fc.k)}} />
                                    <span className="text-[9px] text-gray-400 font-mono">{cmykToHex(fc.c,fc.m,fc.y,fc.k)}</span>
                                  </div>
                                  {(["c","m","y","k"] as const).map(ch => {
                                    const colors = {c:"#00BCD4",m:"#E91E63",y:"#FFC107",k:"#424242"};
                                    return (
                                      <div key={ch} className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] w-4 font-bold" style={{color:colors[ch]}}>{ch.toUpperCase()}</span>
                                        <input type="range" min="0" max="100" value={fc[ch]}
                                          onChange={e => updateProp("fillCmyk", {...fc, [ch]: Number(e.target.value)})}
                                          className="flex-1 h-1.5 rounded-full cursor-pointer" style={{accentColor:colors[ch]}} />
                                        <input type="number" min="0" max="100" value={fc[ch]}
                                          onChange={e => updateProp("fillCmyk", {...fc, [ch]: Math.max(0,Math.min(100,Number(e.target.value)))})}
                                          className="w-10 border rounded px-1 py-0.5 text-[9px] text-center" />
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Stroke 2D Color Picker */}
                                <div>
                                  <div className="text-[10px] font-medium text-gray-600 mb-1">Stroke Color</div>
                                  <div ref={strokePickRef} className="relative w-full h-32 rounded cursor-crosshair border border-gray-200 select-none"
                                    style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${strokeHue}, 100%, 50%))` }}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      strokeDragging.current = true;
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const s = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                                      const v = Math.max(0, Math.min(100, (1 - (e.clientY - rect.top) / rect.height) * 100));
                                      setStrokePickPos({s, v});
                                      const hex = hsvToHex(strokeHue, s/100, v/100);
                                      const cmyk = hexToCmyk(hex);
                                      updateProp("strokeCmyk", {c:cmyk[0],m:cmyk[1],y:cmyk[2],k:cmyk[3]});
                                      const onMove = (ev: MouseEvent) => {
                                        if (!strokeDragging.current) return;
                                        const r = strokePickRef.current?.getBoundingClientRect();
                                        if (!r) return;
                                        const ms = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100));
                                        const mv = Math.max(0, Math.min(100, (1 - (ev.clientY - r.top) / r.height) * 100));
                                        setStrokePickPos({s: ms, v: mv});
                                        const mhex = hsvToHex(strokeHue, ms/100, mv/100);
                                        const mcmyk = hexToCmyk(mhex);
                                        updateProp("strokeCmyk", {c:mcmyk[0],m:mcmyk[1],y:mcmyk[2],k:mcmyk[3]});
                                      };
                                      const onUp = () => {
                                        strokeDragging.current = false;
                                        document.removeEventListener("mousemove", onMove);
                                        document.removeEventListener("mouseup", onUp);
                                      };
                                      document.addEventListener("mousemove", onMove);
                                      document.addEventListener("mouseup", onUp);
                                    }}>
                                    <div className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none" style={{
                                      left: `calc(${strokePickPos.s}% - 8px)`, top: `calc(${100 - strokePickPos.v}% - 8px)`,
                                      backgroundColor: cmykToHex(sc.c,sc.m,sc.y,sc.k),
                                      boxShadow: "0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)"
                                    }} />
                                  </div>
                                  <div className="relative mt-2">
                                    <input type="range" min="0" max="360" value={strokeHue}
                                      onChange={(e) => {
                                        const h = Number(e.target.value);
                                        setStrokeHue(h);
                                        const hex = hsvToHex(h, strokePickPos.s/100, strokePickPos.v/100);
                                        const cmyk = hexToCmyk(hex);
                                        updateProp("strokeCmyk", {c:cmyk[0],m:cmyk[1],y:cmyk[2],k:cmyk[3]});
                                      }}
                                      className="w-full h-3 rounded-full cursor-pointer appearance-none"
                                      style={{background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"}}
                                    />
                                  </div>
                                </div>
                                {/* Stroke CMYK Sliders */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-medium text-gray-600">Stroke</span>
                                    <div className="w-6 h-6 rounded border border-gray-300" style={{backgroundColor: cmykToHex(sc.c,sc.m,sc.y,sc.k)}} />
                                    <span className="text-[9px] text-gray-400 font-mono">{cmykToHex(sc.c,sc.m,sc.y,sc.k)}</span>
                                    <input type="number" value={selProps.strokeWidth || 0} onChange={e => updateProp("strokeWidth", e.target.value)} className="w-12 border rounded px-1 py-0.5 text-[9px]" min="0" step="0.25" />
                                  </div>
                                  {(["c","m","y","k"] as const).map(ch => {
                                    const colors = {c:"#00BCD4",m:"#E91E63",y:"#FFC107",k:"#424242"};
                                    return (
                                      <div key={ch} className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] w-4 font-bold" style={{color:colors[ch]}}>{ch.toUpperCase()}</span>
                                        <input type="range" min="0" max="100" value={sc[ch]}
                                          onChange={e => updateProp("strokeCmyk", {...sc, [ch]: Number(e.target.value)})}
                                          className="flex-1 h-1.5 rounded-full cursor-pointer" style={{accentColor:colors[ch]}} />
                                        <input type="number" min="0" max="100" value={sc[ch]}
                                          onChange={e => updateProp("strokeCmyk", {...sc, [ch]: Math.max(0,Math.min(100,Number(e.target.value)))})}
                                          className="w-10 border rounded px-1 py-0.5 text-[9px] text-center" />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                          {/* SPOT */}
                          {colorMode === "spot" && (
                            <div className="space-y-2">
                              <div className="flex bg-gray-100 rounded p-0.5">
                                {(["packive","hlc","custom"] as const).map(t => (
                                  <button key={t} onClick={() => setSpotLib(t)}
                                    className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${spotLib === t ? "bg-white text-purple-600 shadow-sm" : "text-gray-500"}`}>
                                    {t === "packive" ? "Packive" : t === "hlc" ? "HLC" : "Custom"}
                                  </button>
                                ))}
                              </div>
                              {/* Fill/Stroke target toggle */}
                              <div className="flex bg-gray-100 rounded p-0.5">
                                <button onClick={() => setSpotTarget("fill")}
                                  className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${spotTarget === "fill" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>Fill</button>
                                <button onClick={() => setSpotTarget("stroke")}
                                  className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${spotTarget === "stroke" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>Stroke</button>
                              </div>
                               {spotLib === "packive" && (
                                 <>
                                   {/* Search bar */}
                                   <div className="relative">
                                     <input value={spotSearch} onChange={e => { setSpotSearch(e.target.value); setSpotCategory("All"); }}
                                       placeholder="Search by name, HEX, ID..."
                                       className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[10px] focus:border-purple-400 outline-none pr-7" />
                                     {spotSearch && <button onClick={() => setSpotSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">×</button>}
                                   </div>

                                   {/* Category color chips */}
                                   <div className="flex gap-1 flex-wrap">
                                     <button onClick={() => { setSpotCategory("All"); setSpotSearch(""); }}
                                       className={`px-2 py-0.5 rounded-full text-[9px] font-medium transition-all ${spotCategory === "All" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>All</button>
                                     {["Red","Orange","Yellow","Green","Blue","Purple","Pink","Brown","Neutral","Metallic","Pastel"].map(cat => {
                                       const catColors: Record<string, string> = { Red:"#E03C31", Orange:"#FF6B35", Yellow:"#FFD700", Green:"#228B22", Blue:"#0047AB", Purple:"#7F00FF", Pink:"#FF69B4", Brown:"#7B3F00", Neutral:"#808080", Metallic:"#D4AF37", Pastel:"#FFD1DC" };
                                       const isActive = spotCategory === cat;
                                       return (
                                         <button key={cat} onClick={() => { setSpotCategory(cat); setSpotSearch(""); }}
                                           className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium transition-all ${isActive ? "ring-2 ring-purple-400 bg-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                                           <span className="w-3 h-3 rounded-full border border-gray-300 shrink-0" style={{backgroundColor: catColors[cat]}} />
                                           <span className={isActive ? "text-purple-700" : ""}>{cat}</span>
                                         </button>
                                       );
                                     })}
                                   </div>

                                   {/* Color grid - sorted light to dark */}
                                   {(() => {
                                     const filtered = PACKIVE_SPOT_COLORS.filter(c => {
                                       const catMatch = spotCategory === "All" || c.category === spotCategory;
                                       if (!spotSearch) return catMatch;
                                       const q = spotSearch.toLowerCase();
                                       return catMatch && (c.name.toLowerCase().includes(q) || c.nameKo.includes(q) || c.id.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q));
                                     }).sort((a, b) => {
                                       // Sort by lightness (lighter first)
                                       const lum = (hex: string) => { const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), bl = parseInt(hex.slice(5,7),16); return 0.299*r + 0.587*g + 0.114*bl; };
                                       return lum(b.hex) - lum(a.hex);
                                     });
                                     return (
                                       <>
                                         <div className="text-[9px] text-gray-400">{filtered.length} colors</div>
                                         <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-1.5">
                                           <div className="grid grid-cols-6 gap-1">
                                             {filtered.map(c => (
                                               <button key={c.id}
                                                 onClick={() => { updateProp(spotTarget === "fill" ? "spotFill" : "spotStroke", {name:c.name, hex:c.hex, cmyk:c.cmyk}); setSpotPreview(c); }}
                                                 
                                                 title={`${c.name}${locale === "ko" ? ` (${c.nameKo})` : ""}\n${c.id}\n${c.hex}`}
                                                 className={`w-full aspect-square rounded-md border-2 transition-all hover:scale-110 hover:shadow-lg hover:z-10 ${
                                                   (spotTarget === "fill" && selProps._spotFillName === c.name) || (spotTarget === "stroke" && selProps._spotStrokeName === c.name)
                                                     ? "border-purple-500 ring-1 ring-purple-300 scale-110" : "border-gray-200 hover:border-gray-400"}`}
                                                 style={{backgroundColor: c.hex}} />
                                             ))}
                                           </div>
                                         </div>
                                       </>
                                     );
                                   })()}

                                   {/* Preview card */}
                                   {spotPreview && (
                                     <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-100 shadow-sm animate-in fade-in duration-150">
                                       <div className="w-10 h-10 rounded-lg border border-gray-200 shrink-0" style={{backgroundColor: spotPreview.hex}} />
                                       <div className="flex-1 min-w-0">
                                         <div className="text-[11px] font-semibold text-gray-800 truncate">{spotPreview.name}</div>
                                         {locale === "ko" && <div className="text-[9px] text-gray-500">{spotPreview.nameKo}</div>}
                                         <div className="flex gap-2 mt-0.5">
                                           <span className="text-[8px] font-mono text-gray-400">{spotPreview.id}</span>
                                           <span className="text-[8px] font-mono text-gray-400">{spotPreview.hex}</span>
                                           <span className="text-[8px] font-mono text-gray-400">C{spotPreview.cmyk[0]} M{spotPreview.cmyk[1]} Y{spotPreview.cmyk[2]} K{spotPreview.cmyk[3]}</span>
                                         </div>
                                       </div>
                                     </div>
                                   )}
                                 </>
                               )}
                               {spotLib === "hlc" && (
                                 <>
                                   {/* Search */}
                                   <div className="relative">
                                     <input value={hlcSearch} onChange={e => { setHlcSearch(e.target.value); setHlcHue("All"); }}
                                       placeholder="Search by name, HEX, ID..."
                                       className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[10px] focus:border-purple-400 outline-none pr-7" />
                                     {hlcSearch && <button onClick={() => setHlcSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">×</button>}
                                   </div>

                                   {/* Hue category chips */}
                                   <div className="flex gap-1 flex-wrap">
                                     {(() => {
                                       const hueColors: Record<string, string> = { "All":"#808080", "Red":"#C83232", "Orange":"#E07020", "Yellow":"#D4C020", "Yellow-Green":"#80B030", "Green":"#30A050", "Cyan":"#20A0A0", "Blue":"#2060C0", "Violet":"#5030A0", "Purple":"#8020A0", "Magenta":"#C020A0", "Pink":"#E06080" };
                                       return HLC_HUE_CATEGORIES.map(cat => (
                                         <button key={cat} onClick={() => { setHlcHue(cat); setHlcSearch(""); }}
                                           className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium transition-all ${hlcHue === cat ? "ring-2 ring-purple-400 bg-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                                           {cat !== "All" && <span className="w-3 h-3 rounded-full border border-gray-300 shrink-0" style={{backgroundColor: hueColors[cat]}} />}
                                           <span className={hlcHue === cat ? "text-purple-700" : ""}>{cat}</span>
                                         </button>
                                       ));
                                     })()}
                                   </div>

                                   {/* Lightness presets */}
                                   <div className="flex gap-1">
                                     {([
                                       { label: "All", range: [10, 95] },
                                       { label: "Light", range: [65, 95] },
                                       { label: "Mid", range: [35, 65] },
                                       { label: "Dark", range: [10, 35] },
                                     ] as { label: string; range: number[] }[]).map(p => (
                                       <button key={p.label} onClick={() => setHlcLightness(p.range)}
                                         className={`flex-1 py-1 rounded text-[9px] font-medium transition-all ${
                                           hlcLightness[0] === p.range[0] && hlcLightness[1] === p.range[1]
                                             ? "bg-purple-100 text-purple-700 ring-1 ring-purple-300"
                                             : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                                         {p.label}
                                       </button>
                                     ))}
                                   </div>

                                   {/* Color grid */}
                                   {(() => {
                                     const filtered = HLC_COLORS.filter(c => {
                                       const hueMatch = hlcHue === "All" || c.hueName === hlcHue;
                                       const lightMatch = c.l >= hlcLightness[0] && c.l <= hlcLightness[1];
                                       if (!hlcSearch) return hueMatch && lightMatch;
                                       const q = hlcSearch.toLowerCase();
                                       return hueMatch && lightMatch && (c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q));
                                     }).sort((a, b) => {
                                       const lum = (hex: string) => { const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), bl = parseInt(hex.slice(5,7),16); return 0.299*r + 0.587*g + 0.114*bl; };
                                       return lum(b.hex) - lum(a.hex);
                                     });
                                     const display = filtered.slice(0, 200);
                                     return (
                                       <>
                                         <div className="text-[9px] text-gray-400">{filtered.length} colors{filtered.length > 200 ? ` (showing 200)` : ""}</div>
                                         <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-1.5">
                                           <div className="grid grid-cols-8 gap-0.5">
                                             {display.map(c => (
                                               <button key={c.id}
                                                 onClick={() => { updateProp(spotTarget === "fill" ? "spotFill" : "spotStroke", {name:c.name, hex:c.hex, cmyk:c.cmyk}); setHlcPreview(c); }}
                                                 
                                                 title={`${c.name}\nH${c.h} L${c.l} C${c.c}\n${c.hex}`}
                                                 className={`w-full aspect-square rounded-sm border transition-all hover:scale-125 hover:shadow-lg hover:z-10 ${
                                                   (spotTarget === "fill" && selProps._spotFillName === c.name) || (spotTarget === "stroke" && selProps._spotStrokeName === c.name)
                                                     ? "border-purple-500 ring-1 ring-purple-300 scale-110" : "border-transparent hover:border-gray-400"}`}
                                                 style={{backgroundColor: c.hex}} />
                                             ))}
                                           </div>
                                         </div>
                                       </>
                                     );
                                   })()}

                                   {/* Preview card */}
                                   {hlcPreview && (
                                     <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-100 shadow-sm">
                                       <div className="w-10 h-10 rounded-lg border border-gray-200 shrink-0" style={{backgroundColor: hlcPreview.hex}} />
                                       <div className="flex-1 min-w-0">
                                         <div className="text-[11px] font-semibold text-gray-800">{hlcPreview.name}</div>
                                         <div className="flex gap-2 mt-0.5">
                                           <span className="text-[9px] text-gray-500">H{hlcPreview.h}</span>
                                           <span className="text-[9px] text-gray-500">L{hlcPreview.l}</span>
                                           <span className="text-[9px] text-gray-500">C{hlcPreview.c}</span>
                                         </div>
                                         <div className="flex gap-2 mt-0.5">
                                           <span className="text-[8px] font-mono text-gray-400">{hlcPreview.hex}</span>
                                           <span className="text-[8px] font-mono text-gray-400">C{hlcPreview.cmyk[0]} M{hlcPreview.cmyk[1]} Y{hlcPreview.cmyk[2]} K{hlcPreview.cmyk[3]}</span>
                                         </div>
                                       </div>
                                     </div>
                                   )}

                                   <div className="text-[8px] text-gray-400 text-center">CIELAB HLC Colour Atlas — freieFarbe e.V. (CC BY 4.0)</div>
                                 </>
                               )}
                              {spotLib === "custom" && (
                                <>
                                  {/* Save current spot color to custom */}
                                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                                    <div className="text-[10px] font-semibold text-gray-600">Save to My Colors</div>
                                    <p className="text-[9px] text-gray-400">Packive 또는 HLC에서 색상을 선택한 후 여기에 저장하세요.</p>
                               {/* Fill spot info */}
                               {selProps._spotFillName && (
                                 <div className="flex items-center gap-2 p-1.5 bg-white rounded border border-blue-100">
                                   <div className="w-5 h-5 rounded border" style={{backgroundColor: selProps.fill}} />
                                   <div className="flex-1">
                                     <div className="text-[9px] text-blue-500 font-medium">Fill</div>
                                     <div className="text-[10px] text-gray-700">{selProps._spotFillName}</div>
                                   </div>
                                 </div>
                               )}
                               {/* Stroke spot info */}
                               {selProps._spotStrokeName && (
                                 <div className="flex items-center gap-2 p-1.5 bg-white rounded border border-purple-100">
                                   <div className="w-5 h-5 rounded border" style={{backgroundColor: selProps.stroke}} />
                                   <div className="flex-1">
                                     <div className="text-[9px] text-purple-500 font-medium">Stroke</div>
                                     <div className="text-[10px] text-gray-700">{selProps._spotStrokeName}</div>
                                   </div>
                                 </div>
                               )}
                               <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Save as name (e.g. Brand Red)" className="w-full border border-gray-200 rounded px-2 py-1 text-[10px] focus:border-purple-400 outline-none" />
                               <input value={customPantoneRef} onChange={e => setCustomPantoneRef(e.target.value)} placeholder="Pantone ref (e.g. 485 C)" className="w-full border border-gray-200 rounded px-2 py-1 text-[10px] focus:border-purple-400 outline-none" />
                               {/* Save Fill button */}
                               {selProps._spotFillName && (
                                 <button onClick={() => {
                                   const saveName = customName.trim() || selProps._spotFillName;
                                   const newColor = { id: Date.now().toString(), name: saveName, hex: selProps.fill, cmyk: [0,0,0,0] as [number,number,number,number], pantoneRef: customPantoneRef.trim() || undefined };
                                   const updated = [...customSpotColors, newColor];
                                   setCustomSpotColors(updated);
                                   localStorage.setItem("packive-custom-spots", JSON.stringify(updated));
                                   setCustomName(""); setCustomPantoneRef("");
                                 }}
                                   className="w-full py-1.5 bg-blue-600 text-white rounded text-[10px] font-medium hover:bg-blue-700 transition-colors">
                                   Save Fill Color
                                 </button>
                               )}
                               {/* Save Stroke button */}
                               {selProps._spotStrokeName && (
                                 <button onClick={() => {
                                   const saveName = customName.trim() || selProps._spotStrokeName;
                                   const newColor = { id: Date.now().toString() + "s", name: saveName, hex: selProps.stroke, cmyk: [0,0,0,0] as [number,number,number,number], pantoneRef: customPantoneRef.trim() || undefined };
                                   const updated = [...customSpotColors, newColor];
                                   setCustomSpotColors(updated);
                                   localStorage.setItem("packive-custom-spots", JSON.stringify(updated));
                                   setCustomName(""); setCustomPantoneRef("");
                                 }}
                                   className="w-full py-1.5 bg-purple-600 text-white rounded text-[10px] font-medium hover:bg-purple-700 transition-colors">
                                   Save Stroke Color
                                 </button>
                               )}
                                  </div>
                                  {/* Saved custom colors list */}
                                  {customSpotColors.length > 0 && (
                                    <div className="space-y-1">
                                      <div className="text-[10px] font-semibold text-gray-600">My Colors ({customSpotColors.length})</div>
                                      <div className="max-h-40 overflow-y-auto space-y-1">
                                        {customSpotColors.map(s => (
                                          <div key={s.id} className="flex items-center gap-2 group hover:bg-gray-50 rounded p-1.5 border border-transparent hover:border-gray-200">
                                            <div className="w-6 h-6 rounded border" style={{backgroundColor: s.hex}} />
                                            <div className="flex-1 min-w-0">
                                              <span className="text-[10px] text-gray-700 block truncate font-medium">{s.name}</span>
                                              {s.pantoneRef && <span className="text-[8px] text-purple-500 block">Pantone {s.pantoneRef}</span>}
                                            </div>
                                            <button onClick={() => updateProp(spotTarget === "fill" ? "spotFill" : "spotStroke", {name:s.name, hex:s.hex, cmyk:(s as any).cmyk})}
                                              className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100">Apply</button>
                                            <button onClick={() => { const u = customSpotColors.filter(c => c.id !== s.id); setCustomSpotColors(u); localStorage.setItem("packive-custom-spots", JSON.stringify(u)); }}
                                              className="text-[9px] text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">×</button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                              {selProps._spotStrokeName && <div className="text-[9px] bg-purple-50 text-purple-700 px-2 py-1 rounded">Stroke: {selProps._spotStrokeName}</div>}
                              {(selProps._spotFillName || selProps._spotStrokeName) && (
                                <button onClick={() => { updateProp("clearSpotFill", null); updateProp("clearSpotStroke", null); }} className="text-[9px] text-red-500 hover:underline">Clear Spot Colors</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

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

            {/* ─── AI Tab (unified) ─── */}
            {rightTab === "ai" && (
              <div className="space-y-3">
                {aiSubView === "menu" && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-700">AI Assistant</div>
                    <button onClick={() => setAiSubView("copy")} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-lg group-hover:bg-purple-200 transition-colors">✍</div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-gray-700">Copy Generator</div>
                        <div className="text-[10px] text-gray-400">AI가 제품 카피를 생성합니다</div>
                      </div>
                    </button>
                    <button onClick={() => setAiSubView("review")} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50/50 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-lg group-hover:bg-green-200 transition-colors">🔍</div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-gray-700">Design Review</div>
                        <div className="text-[10px] text-gray-400">디자인 품질을 AI가 분석합니다</div>
                      </div>
                    </button>
                    <button onClick={() => setAiSubView("image")} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-lg group-hover:bg-indigo-200 transition-colors">🎨</div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-gray-700">Image Generator</div>
                        <div className="text-[10px] text-gray-400">AI 이미지를 생성합니다</div>
                      </div>
                    </button>
                  </div>
                )}

                {aiSubView === "copy" && (
                  <div className="space-y-3">
                    <button onClick={() => setAiSubView("menu")} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700">← Back</button>
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

                {aiSubView === "review" && (
                  <div className="space-y-3">
                    <button onClick={() => setAiSubView("menu")} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700">← Back</button>
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

                {aiSubView === "image" && (
                  <div className="space-y-3">
                    <button onClick={() => setAiSubView("menu")} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700">← Back</button>
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
                { type: "pdf" as const, label: "PDF (CMYK Print-Ready)", desc: "Vector CMYK PDF with dieline", icon: "📄" },
                { type: "png" as const, label: "PNG (High-Res)", desc: "Full net image at 4x resolution", icon: "🖼" },
                
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
                ["F1","Toggle shortcuts"],["Mouse wheel","Zoom"],["Space+Drag","Pan canvas"],["Middle+Drag","Pan canvas"],
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
