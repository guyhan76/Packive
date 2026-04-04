"use client";
import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { generatePanelMap, detectPanelsFromSVG, type PanelMap, type Panel, panelToCanvas } from '@/lib/panel-map';
import { DIELINE_TEMPLATES, BOX_CATEGORIES, getTemplatesByCategory, getCategoriesWithTemplates, getTemplateByCode, DielineTemplate } from '@/lib/dieline-templates';
import { generateDieline, BoxDimensions } from '@/lib/dieline-generator';
import { useI18n } from "@/components/i18n-context";
import { PACKIVE_SPOT_COLORS } from "@/data/packive-spot-colors";
import Ruler, { RulerCorner, RULER_THICK } from "@/components/editor/ruler";
import { HLC_COLORS, HLC_HUE_CATEGORIES } from "@/data/cielab-hlc-colors";
import { loadFOGRA39LUT, cmykToSrgb, cmykToHex as iccCmykToHex, srgbToCmyk, isLUTReady, isReverseLUTReady } from "@/lib/cmyk-engine";
import { calcSnap, type SnapLine } from "@/lib/snap-engine";
import { alignObjects, distributeObjects } from "@/lib/align-utils";
import { addBleedGuides, removeBleedGuides, toggleBleedGuides } from "@/lib/bleed-guide";
import { runPreflight, type PreflightResult } from "@/lib/preflight";
import dynamic from 'next/dynamic';
const Box3DMockupModal = dynamic(() => import("@/components/editor/box-3d-mockup-modal"), { ssr: false });
import { RECRAFT_STYLES, PACKAGING_PRESETS } from "@/lib/recraft";
import { DESIGN_CATEGORIES, DESIGN_TEMPLATES, getDesignTemplatesByCategory, placeTemplateOnCanvas, generateTemplatePreviewSVG, type DesignTemplate } from "@/lib/design-templates";
import { PACKAGING_SYMBOLS, SYMBOL_CATEGORIES } from "@/lib/packaging-symbols";

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
     a.download = `packive-3d-mockup-${L}x${W}x${D}.png`;

}
function hsvToHex(h:number,s:number,v:number): string {
  const c=v*s, x=c*(1-Math.abs((h/60)%2-1)), m=v-c;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
  return "#"+[r+m,g+m,b+m].map(v=>Math.max(0,Math.min(255,Math.round(v*255))).toString(16).padStart(2,"0")).join("");
}

export default function UnifiedEditor({ L, W, D, material, boxType, onBack }: UnifiedEditorProps) {
  const { t, locale } = useI18n();
  


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
  const scaleXRef = useRef(1); // px per mm (X axis, may differ from Y due to Fabric SVG distortion)
  const scaleYRef = useRef(1); // px per mm (Y axis)
  const svgMmWRef = useRef(0);
  const svgMmHRef = useRef(0);

  // ─── UI state ───
  const [rightTab, setRightTab] = useState<RightTab>("properties");
  const [panelMapData, setPanelMapData] = useState<any>(null);
  const [spotTarget, setSpotTarget] = useState<"fill" | "stroke">("fill");
  const [accOpen, setAccOpen] = useState<Record<string, boolean>>({ position: true, typography: true, color: false, spot: false });
  const toggleAcc = (key: string) => setAccOpen(prev => ({ ...prev, [key]: !prev[key] }));
  const [color, setColor] = useState("#000000");
  const [fSize, setFSize] = useState(24);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [googleFonts, setGoogleFonts] = useState<string[]>(["Inter", "Noto Sans KR", "Noto Sans JP", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins"]);
  const [koFonts, setKoFonts] = useState<string[]>([]);
  const [jaFonts, setJaFonts] = useState<string[]>([]);
  const [calliFonts, setCalliFonts] = useState<string[]>([]);
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

    // Fetch handwriting/display fonts for Calli tab
    fetch("https://www.googleapis.com/webfonts/v1/webfonts?key="+key+"&category=handwriting&sort=popularity")
      .then(r=>r.json()).then(d=>{
        const hw = (d.items||[]).map((f:any)=>f.family).slice(0,80);
        fetch("https://www.googleapis.com/webfonts/v1/webfonts?key="+key+"&category=display&sort=popularity")
          .then(r=>r.json()).then(d2=>{
            const disp = (d2.items||[]).map((f:any)=>f.family).slice(0,40);
            setCalliFonts([...new Set([...hw,...disp])]);
          }).catch(()=>{});
      }).catch(()=>{});
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
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showBleedGuides, setShowBleedGuides] = useState(false);
  const [dielineInfoVisible, setDielineInfoVisible] = useState(true);
  const [dielineSizes, setDielineSizes] = useState<any>(null);
  const [dielineDims, setDielineDims] = useState<any>(null);
  const [show3DMockup, setShow3DMockup] = useState(false);
  const [mockupFaces, setMockupFaces] = useState<{face:string;dataUrl:string|null}[]>([]);
  const [dielineModelInfo, setDielineModelInfo] = useState<string>('');
  const [gradHex1, setGradHex1] = useState("#ff0000");
  const [gradHex2, setGradHex2] = useState("#0000ff");
  const [gradHue1, setGradHue1] = useState(0);
  const [gradHue2, setGradHue2] = useState(240);
  const [gradPickPos1, setGradPickPos1] = useState({s:100,v:100});
  const [gradPickPos2, setGradPickPos2] = useState({s:100,v:100});
  const gradDrag1 = useRef(false);
  const gradDrag2 = useRef(false);
  const gradPickRef1 = useRef<HTMLDivElement>(null);
  const gradPickRef2 = useRef<HTMLDivElement>(null);



 const [gradDirection, setGradDirection] = useState<"r"|"br"|"b"|"bl"|"l"|"tl"|"t"|"tr"|"radial">("r");

  const [preflightResult, setPreflightResult] = useState<PreflightResult | null>(null);
  const [showPreflight, setShowPreflight] = useState(false);
  // ─── AI Panel State ───
  const [aiTab, setAiTab] = useState<"generate"|"vectorize"|"removebg"|"credits">("generate");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCategory, setAiCategory] = useState<"illustration"|"pattern"|"icon">("illustration");
  const [aiModel, setAiModel] = useState<"recraftv4_vector"|"recraftv4_pro_vector">("recraftv4_vector");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{svgUrl:string; svgContent:string; creditsUsed:number} | null>(null);
  const [aiError, setAiError] = useState("");
  const [aiCredits, setAiCredits] = useState<number|null>(null);
  const [aiVecLoading, setAiVecLoading] = useState(false);
  const [aiVecResult, setAiVecResult] = useState<{svgUrl:string; svgContent:string} | null>(null);
  const [aiBgLoading, setAiBgLoading] = useState(false);
  const [aiBgResult, setAiBgResult] = useState<string|null>(null);
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  const [mousePos, setMousePos] = useState<{x:number;y:number}>({x:-100,y:-100});
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePts, setMeasurePts] = useState<{x:number;y:number}[]>([]);
  const [measureResult, setMeasureResult] = useState("");
  const [measureMouseMm, setMeasureMouseMm] = useState<{x:number;y:number}|null>(null);
  const measurePtsRef = useRef<{x:number;y:number}[]>([]);
  const [showRuler, setShowRuler] = useState(true);
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
  const [showMarkPanel, setShowMarkPanel] = useState(false);
  const [markMode, setMarkMode] = useState("spot");
const [customMarkName, setCustomMarkName] = useState("");
const [customMarkCmyk, setCustomMarkCmyk] = useState<[number,number,number,number]>([0,100,100,0]);
const [savedCustomMarks, setSavedCustomMarks] = useState<{name:string;cmyk:[number,number,number,number]}[]>(() => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("packive_custom_marks") || "[]"); } catch { return []; }
});

  const [showTablePanel, setShowTablePanel] = useState(false);
  const [showSymbolPanel, setShowSymbolPanel] = useState(false);
  const [showHandlePanel, setShowHandlePanel] = useState(false);
  const [handleType, setHandleType] = useState<string | null>(null);
  const [handleW, setHandleW] = useState(80);
  const [handleH, setHandleH] = useState(30);
  const [symbolSearch, setSymbolSearch] = useState("");
  const [symbolCategory, setSymbolCategory] = useState<string>("all");
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<string>("all");
  const [showDielinePanel, setShowDielinePanel] = useState(false);
  const [boxCategoryFilter, setBoxCategoryFilter] = useState('all');
  const [showDimModal, setShowDimModal] = useState(false);
  const [selectedBoxCode, setSelectedBoxCode] = useState('');
  const [selectedBoxName, setSelectedBoxName] = useState('');
  const [dimLength, setDimLength] = useState(0);
  const [dimWidth, setDimWidth] = useState(0);
  const [dimHeight, setDimHeight] = useState(0);

  // ─── Effective dimensions (props or modal input) ───
  const eL = L > 0 ? L : dimLength;
  const eW = W > 0 ? W : dimWidth;
  const eD = D > 0 ? D : dimHeight;

  // ─── Geometry calculations ───
  const T = getThickness(material);
  const tuckH = getTuckH(material);
  const dustH = getDustH(eW);
  const glueW = getGlueW(material);
  const bottomH = getBottomH(eW, material);
  const bottomDustH = dustH;

  const frontX = glueW + T;
  const leftX = frontX + eL + T;
  const backX = leftX + eW + T;
  const rightX = backX + eL + T;
  const totalW = rightX + eW;
  const tuckY = 0;
  const topLidY = tuckH + T;
  const bodyY = topLidY + eW;
  const bottomY = bodyY + eD + T;
  const totalH = bottomY + Math.max(bottomH, bottomDustH);

  const tuckInset = Math.min(tuckH * 0.35, eL * 0.12);
  const tuckNotch = tuckH * 0.18;
  const dustTaper = Math.min(dustH * 0.4, 6);
  const dustRad = Math.min(dustH * 0.35, 5);
  const glueTaper = Math.min(glueW * 0.3, eD * 0.12);
  const bottomTaper = Math.min(bottomH * 0.25, 5);
  const bottomDustTaper = Math.min(bottomDustH * 0.4, 6);
  const geo = { tuckInset, tuckNotch, dustTaper, dustRad, glueTaper, bottomTaper, bottomDustTaper };

  const pos: Record<string, {x:number;y:number;w:number;h:number}> = {
    topTuck: { x: frontX, y: tuckY, w: eL, h: tuckH },
    topLid: { x: frontX, y: topLidY, w: eL, h: eW },
    topDustL: { x: leftX, y: bodyY - dustH, w: eW, h: dustH },
    topDustR: { x: rightX, y: bodyY - dustH, w: eW, h: dustH },
    glueFlap: { x: 0, y: bodyY, w: glueW, h: eD },
    front: { x: frontX, y: bodyY, w: eL, h: eD },
    left: { x: leftX, y: bodyY, w: eW, h: eD },
    back: { x: backX, y: bodyY, w: eL, h: eD },
    right: { x: rightX, y: bodyY, w: eW, h: eD },
    bottomFlapFront: { x: frontX, y: bottomY, w: eL, h: bottomH },
    bottomDustL: { x: leftX, y: bottomY, w: eW, h: bottomDustH },
    bottomFlapBack: { x: backX, y: bottomY, w: eL, h: bottomH },
    bottomDustR: { x: rightX, y: bottomY, w: eW, h: bottomDustH },
  };
  const [fluteType, setFluteType] = useState('C');
  const [thickness, setThickness] = useState(4.0);
  const [isEcma, setIsEcma] = useState(false);

  // Flute type → thickness auto-mapping
  const FLUTE_MAP: Record<string, { label: string; thickness: number; desc: string }> = {
    A:  { label: "A flute",   thickness: 5.0, desc: "Large shipping boxes" },
    B:  { label: "B flute",   thickness: 3.0, desc: "Small retail boxes" },
    C:  { label: "C flute",   thickness: 4.0, desc: "Most common, general use" },
    E:  { label: "E flute",   thickness: 1.5, desc: "Cosmetic & premium boxes" },
    F:  { label: "F flute",   thickness: 1.0, desc: "Ultra-thin micro flute" },
    G:  { label: "G flute",   thickness: 0.8, desc: "Finest micro flute" },
    CA: { label: "CA double", thickness: 8.7, desc: "Heavy-duty double wall" },
    BA: { label: "BA double", thickness: 7.8, desc: "Double wall, strong" },
    CB: { label: "CB double", thickness: 6.8, desc: "Double wall, standard" },
    BB: { label: "BB double", thickness: 5.8, desc: "Double wall, compact" },
    EC: { label: "EC double", thickness: 5.3, desc: "Double wall, medium" },
    EB: { label: "EB double", thickness: 4.4, desc: "Double wall, thin" },
  };

  const ECMA_THICKNESS = [
    { label: "0.3 mm (SBS thin)",    value: 0.3 },
    { label: "0.4 mm (SBS standard)", value: 0.4 },
    { label: "0.5 mm (FBB light)",   value: 0.5 },
    { label: "0.6 mm (FBB standard)", value: 0.6 },
    { label: "0.8 mm (CRB heavy)",   value: 0.8 },
  ];
  useEffect(() => {
    if (!isEcma && FLUTE_MAP[fluteType]) {
      setThickness(FLUTE_MAP[fluteType].thickness);
    }
  }, [fluteType, isEcma]);
  const [barcodeType, setBarcodeType] = useState<'qrcode'|'ean13'|'upca'|'code128'|'code39'|'itf14'>('qrcode');
  const [barcodeValue, setBarcodeValue] = useState("");
  const [tableRows, setTableRows] = useState(4);
  const [tableCols, setTableCols] = useState(2);
  const [layersList, setLayersList] = useState<{id:string;type:string;name:string;visible:boolean;locked:boolean;thumb?:string;markType?:string;markCmyk?:number[]}[]>([]);
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
  const [showSizeConfirm, setShowSizeConfirm] = useState(false);
  const [uploadSizeW, setUploadSizeW] = useState(0);
  const [uploadSizeH, setUploadSizeH] = useState(0);
  const pendingDielineRef = useRef<{group:any; origMmW:number; origMmH:number; svgOrigW:number; svgOrigH:number} | null>(null);
  const [dielineVisible, setDielineVisible] = useState(true);
  const [dielineLocked, setDielineLocked] = useState(true);
  const [dielineUngrouped, setDielineUngrouped] = useState(false);
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
    const jsonObj = c.toJSON(["_isDieLine","_isFoldLine","_isGuideLayer","_isPanelLabel","_isPanelOverlay","_panelId","_panelRole","selectable","evented","name","_cmykFill","_cmykStroke","_spotFillName","_spotStrokeName","_spotFillPantone","_spotStrokePantone","_isTable","_tableConfig","_tableRole","_tableRow","_tableCol","_tableId"]);
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
    refreshLayers();
    setTimeout(() => { setSelProps(null); setTableEditCell(null); }, 30);
    setTimeout(() => { loadingRef.current = false; }, 200);
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
    refreshLayers();
    setTimeout(() => { setSelProps(null); setTableEditCell(null); }, 30);
    setTimeout(() => { loadingRef.current = false; }, 200);
  }, []);
  const SAVE_KEY = "packive-temp-design";
  const SAVE_META_KEY = "packive-temp-meta";
 const JSON_PROPS = ["_isDieLine","_isFoldLine","_isGuideLayer","_isPanelLabel","_isPanelOverlay","_panelId","_panelRole","selectable","evented","name","_cmykFill","_cmykStroke","_spotFillName","_spotStrokeName","_spotFillPantone","_spotStrokePantone","_isTable","_tableConfig","_tableRole","_tableRow","_tableCol","_tableId","_markType","_markMemo","_markCmyk","_markHex","_isMarkAnnotation"];
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

    // ── Always bring dieline/guide objects to top so they are never hidden ──
    const allObjs = c.getObjects();
    const dieObjs = allObjs.filter((o: any) =>
      o._isDieLine || o._isFoldLine || o._isGuideLayer || o._isPanelLabel || o._isDieline
    );
    if (dieObjs.length > 0) {
      dieObjs.forEach((o: any) => c.bringObjectToFront(o));
    }

    // ── Build layer list (user objects only) ──
    const objs = c.getObjects().filter((o: any) =>
      o.selectable !== false && !o._isDieLine && !o._isFoldLine && !o._isGuideLayer && !o._isPanelLabel && !o._isDieline
    );
    let imgCount = 1, rectCount = 1, circCount = 1, triCount = 1, ellCount = 1, polyCount = 1, lineCount = 1, pathCount = 1, grpCount = 1;
    const list = objs.map((o: any, i: number) => ({
      id: o.__id || ("obj_" + i),
      type: o.type || "object",
      name: (() => {
        if (o.type === "i-text" || o.type === "text" || o.type === "textbox") {
          const preview = (o.text || "").substring(0, 15);
          return preview ? preview + (o.text.length > 15 ? "..." : "") : "Empty Text";
        }
        if (o.type === "image") {
          const elSrc = o._element?.src || o._originalElement?.src || "";
          if (elSrc.startsWith("data:")) return "Image " + (imgCount++);
          const fname = elSrc.split("/").pop()?.split("?")[0] || "";
          if (fname && fname.length > 3 && !fname.startsWith("data")) return fname.length > 18 ? fname.substring(0, 15) + "..." : fname;
          return "Image " + (imgCount++);
        }
        if (o.type === "rect") return "Rectangle " + (rectCount++);
        if (o.type === "circle") return "Circle " + (circCount++);
        if (o.type === "triangle") return "Triangle " + (triCount++);
        if (o.type === "ellipse") return "Ellipse " + (ellCount++);
        if (o.type === "line") return "Line " + (lineCount++);
        if (o.type === "polygon") return "Polygon " + (polyCount++);
        if (o.type === "polyline") return "Polyline " + (polyCount++);
        if (o.type === "path") return o.name || ("Path " + (pathCount++));
        if (o.type === "group") return "Group " + (grpCount++) + " (" + (o._objects?.length || 0) + ")";
        return o.name || o.type || "Object";
      })(),
            locked: !!o.lockMovementX,
      thumb: o.type === "image" ? (o._element?.src || o.toDataURL?.({multiplier: 0.1}) || "") : "",
      visible: o.visible !== false,
      markType: o._markType || undefined,
      markCmyk: o._markCmyk || undefined,
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

  const removeGuide = useCallback((id: string) => {
    const cv = fcRef.current; if (!cv) return;
    const guideObj = cv.getObjects().find((o: any) => o._guideId === id);
    if (guideObj) { cv.remove(guideObj); cv.requestRenderAll(); }
    setGuides(prev => prev.filter(g => g.id !== id));
    console.log("[RULER] Guide removed:", id);
  }, []);

  const clearAllGuides = useCallback(() => {
    const cv = fcRef.current; if (!cv) return;
    const guideObjs = cv.getObjects().filter((o: any) => o._isGuide);
    guideObjs.forEach(o => cv.remove(o));
    cv.requestRenderAll();
    setGuides([]);
    console.log("[RULER] All guides cleared");
  }, []);
  // ─── AI: Fetch Credits ───
  const fetchAiCredits = useCallback(async () => {
    try {
      const resp = await fetch("/api/ai/credits");
      const data = await resp.json();
      if (data.success) setAiCredits(data.credits);
    } catch {}
  }, []);

  // ─── AI: Generate Vector ───
  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const categoryPromptPrefix: Record<string, string> = {
        illustration: "vector illustration style, ",
        pattern: "seamless pattern design, ",
        icon: "minimal icon design, ",
      };
      const enhancedPrompt = categoryPromptPrefix[aiCategory] + aiPrompt.trim();
      const resp = await fetch("/api/ai/generate-vector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          model: aiModel,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setAiResult({ svgUrl: data.svgUrl, svgContent: data.svgContent, creditsUsed: data.creditsUsed });
        fetchAiCredits();
      } else {
        setAiError(data.error || "Generation failed - check console for details"); console.error("[AI Generate]", data);
      }
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "Network error");
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, aiModel, aiCategory, aiLoading, fetchAiCredits]);

  // ─── AI: Add SVG to Canvas ───
  const addAiSvgToCanvas = useCallback((svgContent: string) => {
    const c = fcRef.current;
    const F = fabricModRef.current;
    if (!c || !F || !svgContent) return;
    F.loadSVGFromString(svgContent).then(({ objects, options }: { objects: fabric.Object[]; options: { width?: number; height?: number } }) => {
      const filtered = objects.filter(Boolean) as fabric.Object[];
      if (filtered.length === 0) return;
      const group = new F.Group(filtered, {
        left: (c.getWidth() / 2) - ((options.width || 200) / 4),
        top: (c.getHeight() / 2) - ((options.height || 200) / 4),
        scaleX: 0.5,
        scaleY: 0.5,
      });
      c.add(group);
      c.setActiveObject(group);
      c.renderAll();
      pushHistory();
    }).catch((e: unknown) => { console.error("[AI SVG Load]", e); });
  }, [pushHistory]);

  // ─── AI: Vectorize Image ───
  const handleAiVectorize = useCallback(async (file: File) => {
    setAiVecLoading(true);
    setAiVecResult(null);
    setAiError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch("/api/ai/vectorize", { method: "POST", body: formData });
      const data = await resp.json();
      if (data.success) {
        setAiVecResult({ svgUrl: data.svgUrl, svgContent: data.svgContent });
        fetchAiCredits();
      } else {
        setAiError(data.error || "Vectorization failed");
      }
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "Network error");
    } finally {
      setAiVecLoading(false);
    }
  }, [fetchAiCredits]);

  // ─── AI: Remove Background ───
  const handleAiRemoveBg = useCallback(async (file: File) => {
    setAiBgLoading(true);
    setAiBgResult(null);
    setAiError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch("/api/ai/remove-bg", { method: "POST", body: formData });
      const data = await resp.json();
      if (data.success) {
        setAiBgResult(data.imageUrl);
        fetchAiCredits();
      } else {
        setAiError(data.error || "Background removal failed");
      }
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "Network error");
    } finally {
      setAiBgLoading(false);
    }
  }, [fetchAiCredits]);


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

  // ─── Measure Tool ───
  const handleMeasureClick = useCallback((opt: any) => {
    if (!measureMode) return;
    const cv = fcRef.current; if (!cv) return;
    const pt = opt.scenePoint || opt.viewportPoint || { x: 0, y: 0 }; const px = pt.x; const py = pt.y;
    const sX = scaleXRef.current; const sY = scaleYRef.current;
    const mmX = +(px / sX - 15).toFixed(2);
    const mmY = +(py / sY - 15).toFixed(2);
    setMeasurePts(prev => {
      let snapX = mmX, snapY = mmY;
      if (prev.length === 1 && opt.e?.shiftKey) {
        const adx = Math.abs(mmX - prev[0].x), ady = Math.abs(mmY - prev[0].y);
        if (adx > ady * 2) { snapY = prev[0].y; }
        else if (ady > adx * 2) { snapX = prev[0].x; }
        else { const avg = (adx + ady) / 2; snapX = prev[0].x + avg * Math.sign(mmX - prev[0].x); snapY = prev[0].y + avg * Math.sign(mmY - prev[0].y); }
      }
      const next = prev.length >= 2 ? [{x:snapX,y:snapY}] : [...prev, {x:snapX,y:snapY}];
      if (next.length === 2) {
        const dx = next[1].x - next[0].x, dy = next[1].y - next[0].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        setMeasureResult(dist.toFixed(4) + " mm (dx:" + dx.toFixed(2) + " dy:" + dy.toFixed(2) + ")");
      } else { setMeasureResult("Click second point..."); }
      measurePtsRef.current = next;
      return next;
    });
  }, [measureMode]);

  useEffect(() => {
    const cv = fcRef.current; if (!cv) return;
    cv.getObjects().filter((o:any) => o._isMeasure || o._isMeasureLive).forEach((o:any) => cv.remove(o));
    if (!measureMode || measurePts.length === 0) { cv.renderAll(); return; }
    const sX2 = scaleXRef.current; const sY2 = scaleYRef.current;
    const F = (window as any).__fabric; if (!F) return;
    const pts = measurePts.map(p => ({x:(p.x+15)*sX2, y:(p.y+15)*sY2}));
    pts.forEach((p,i) => {
      cv.add(new F.Circle({left:p.x-4, top:p.y-4, radius:4, fill:i===0?"#4fc3f7":"#ff5252", stroke:"#fff", strokeWidth:1.5, selectable:false, evented:false, _isMeasure:true}));
    });
    if (pts.length === 2) {
      cv.add(new F.Line([pts[0].x,pts[0].y,pts[1].x,pts[1].y], {stroke:"#4fc3f7", strokeWidth:1.5, strokeDashArray:[6,3], selectable:false, evented:false, _isMeasure:true}));
      const mx=(pts[0].x+pts[1].x)/2, my=(pts[0].y+pts[1].y)/2;
      const dx=measurePts[1].x-measurePts[0].x, dy=measurePts[1].y-measurePts[0].y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      cv.add(new F.Text(dist.toFixed(4)+" mm", {left:mx+8,top:my-10,fontSize:12,fill:"#4fc3f7",fontFamily:"Inter",fontWeight:"bold",backgroundColor:"rgba(0,0,0,0.7)",padding:3,selectable:false,evented:false,_isMeasure:true}));
    }
    cv.renderAll();
  }, [measureMode, measurePts]);

  useEffect(() => {
    const cv = fcRef.current; if (!cv) return;
    if (measureMode) {
      const onMoveM = (opt: any) => {
        const pt = opt.scenePoint || opt.viewportPoint || {x:0,y:0};
        const F2 = fabricModRef.current; if (!F2) return;


        const sX2 = scaleXRef.current, sY2 = scaleYRef.current;
        // Remove old live line
        cv.getObjects().filter((o:any) => o._isMeasureLive).forEach((o:any) => cv.remove(o));
        // Draw live line from first point to cursor
        const curPts = measurePtsRef.current;
        if (curPts && curPts.length === 1) {
          const p0x = (curPts[0].x + 15) * sX2, p0y = (curPts[0].y + 15) * sY2;
          const liveX = pt.x, liveY = pt.y;
          cv.add(new F2.Line([p0x, p0y, liveX, liveY], {stroke:"#333333", strokeWidth:0.8, selectable:false, evented:false, _isMeasure:true, _isMeasureLive:true}));
          const mmX = +(pt.x / sX2 - 15).toFixed(2), mmY = +(pt.y / sY2 - 15).toFixed(2);
          const ldx = mmX - curPts[0].x, ldy = mmY - curPts[0].y;
          const ldist = Math.sqrt(ldx*ldx + ldy*ldy);
          cv.add(new F2.Text(ldist.toFixed(4)+" mm", {left:(p0x+liveX)/2+8, top:(p0y+liveY)/2-12, fontSize:11, fill:"#333333", fontFamily:"Inter", fontWeight:"600", selectable:false, evented:false, _isMeasure:true, _isMeasureLive:true}));
          cv.requestRenderAll();
        }
      };
      cv.on("mouse:move", onMoveM);
      const cleanup0 = () => cv.off("mouse:move", onMoveM);
      // original click handler below - merge cleanup
      cv.on("mouse:down", handleMeasureClick);
      return () => { cleanup0(); cv.off("mouse:down", handleMeasureClick); };
    }
  }, [measureMode, handleMeasureClick]);

  // ─── Draw dieline guide layer on Fabric canvas ───
  const drawGuideLayer = useCallback(async (canvas: any, scale: number) => {
    const F = fabricModRef.current; if (!F) return;
    if (eL === 0 && eW === 0 && eD === 0) return; // blank canvas mode - no guide layer

    // Check if API-generated dieline exists on canvas
    const hasApiDieline = canvas.getObjects().some((o: any) => o._isDieline || o.name === "__dieline_upload__");

    // Die-cut outline paths - only if NO API dieline
    if (!hasApiDieline) {
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

      // Fold lines - only if NO API dieline
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
    }

  }, [pos, foldLines, PAD, tuckInset, tuckNotch, dustTaper, dustRad, glueTaper, bottomTaper, bottomDustTaper, eL]);



  // ─── Load FOGRA39 ICC LUT ───
  useEffect(() => {
    loadFOGRA39LUT().then(() => console.log("FOGRA39 LUT ready"));
  }, []);

  // ─── Canvas initialization ───
  useEffect(() => {
    let _onKeyDown: ((e: KeyboardEvent) => void) | null = null;
    let _onKeyUp: ((e: KeyboardEvent) => void) | null = null;
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
      const rulerPad = showRuler ? RULER_THICK : 0;
      availW = cw - rulerPad - 8; availH = ch - rulerPad - 8;
      if (isBlank) {
        canvasW = Math.max(availW - 12, 400);
        canvasH = Math.max(availH - 12, 300);
        scaleRef.current = 1; scaleXRef.current = 1; scaleYRef.current = 1;
      } else {
        const netW = totalW + PAD * 2;
        const netH = totalH + PAD * 2;
        const fitScale = Math.min(availW / netW, availH / netH);
        const pxPerMM = Math.max(fitScale, 2.0);
        scaleRef.current = pxPerMM; scaleXRef.current = pxPerMM; scaleYRef.current = pxPerMM;
        canvasW = Math.min(Math.round(netW * pxPerMM), availW);
        canvasH = Math.min(Math.round(netH * pxPerMM), availH);
      }

      const el = canvasElRef.current!;
      el.width = canvasW; el.height = canvasH;
      console.log("[Canvas Init] wrapper:", cw, "x", ch, "| rulerPad:", showRuler ? RULER_THICK : 0, "| availW:", availW, "availH:", availH, "| canvasW:", canvasW, "canvasH:", canvasH, "| isBlank:", isBlank);
      el.style.width = canvasW + 'px'; el.style.height = canvasH + 'px';

      if (disposed) return;

      const canvas = new Canvas(el, {
        width: canvasW, height: canvasH,
        backgroundColor: '#FFFFFF',
        selection: true,
        perPixelTargetFind: false,
      });

      fcRef.current = canvas; (window as any).__pc = canvas;
      canvas.backgroundColor = '#FFFFFF';
      canvas.requestRenderAll();
      setCanvasReady(true);
      canvas.fireRightClick = true;
      canvas.stopContextMenu = true;


      // ── Canvas auto-resize on window/wrapper size change ──
      let resizeTimer: ReturnType<typeof setTimeout> | null = null;
      let skipResize = false;
      const resizeObserver = new ResizeObserver(() => {
        if (skipResize || !fcRef.current || !wrapperRef.current) return;
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (!fcRef.current || !wrapperRef.current) return;
          const c = fcRef.current;
          const wrapper = wrapperRef.current;
          const rPad = showRuler ? RULER_THICK : 0;
          const newAvailW = wrapper.clientWidth - rPad - 8;
          const newAvailH = wrapper.clientHeight - rPad - 8;
          if (newAvailW < 100 || newAvailH < 100) return;

          const hasDieline = c.getObjects().some((o: any) => o._isDieLine || o._isDieline);
          if (!hasDieline) {
            const newW = Math.max(newAvailW - 12, 400);
            const newH = Math.max(newAvailH - 12, 300);
            if (Math.abs(c.getWidth() - newW) > 5 || Math.abs(c.getHeight() - newH) > 5) {
              skipResize = true;
              c.setDimensions({ width: newW, height: newH });
              c.requestRenderAll();
              setTimeout(() => { skipResize = false; }, 100);
            }
          }
          // dieline exists: do NOT resize here (already sized during dieline creation)
        }, 150);
      });
      resizeObserver.observe(wrapperRef.current!);

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

    // ─── Polygon/Path point editing on double-click ───
    // Supports: polygon (star, pentagon, etc.), path (bezier curves),
    // and rect/triangle/ellipse (auto-converted to path first)
    canvas.on('mouse:dblclick', (e: any) => {
      const target = e.target;
      if (!target) return;
      if (target._isGuideLayer || target._isDieLine) return;

      const F = fabricModRef.current;
      if (!F) return;

      // ── Helper: Convert any shape to editable Path ──
      const convertToPath = (obj: any): any => {
        let pathData = '';
        const w = obj.width || 0;
        const h = obj.height || 0;

        if (obj.type === 'rect') {
          // Rect → Path (4 corners)
          const rx = Math.min(obj.rx || 0, w / 2);
          const ry = Math.min(obj.ry || 0, h / 2);
          if (rx > 0 || ry > 0) {
            pathData = `M ${-w/2 + rx} ${-h/2} L ${w/2 - rx} ${-h/2} Q ${w/2} ${-h/2} ${w/2} ${-h/2 + ry} L ${w/2} ${h/2 - ry} Q ${w/2} ${h/2} ${w/2 - rx} ${h/2} L ${-w/2 + rx} ${h/2} Q ${-w/2} ${h/2} ${-w/2} ${h/2 - ry} L ${-w/2} ${-h/2 + ry} Q ${-w/2} ${-h/2} ${-w/2 + rx} ${-h/2} Z`;
          } else {
            pathData = `M ${-w/2} ${-h/2} L ${w/2} ${-h/2} L ${w/2} ${h/2} L ${-w/2} ${h/2} Z`;
          }
        } else if (obj.type === 'triangle') {
          pathData = `M ${0} ${-h/2} L ${w/2} ${h/2} L ${-w/2} ${h/2} Z`;
        } else if (obj.type === 'ellipse' || obj.type === 'circle') {
          const rx2 = obj.rx || obj.radius || w / 2;
          const ry2 = obj.ry || obj.radius || h / 2;
          pathData = `M ${-rx2} 0 A ${rx2} ${ry2} 0 1 1 ${rx2} 0 A ${rx2} ${ry2} 0 1 1 ${-rx2} 0 Z`;
        } else {
          return null; // Cannot convert
        }

        const newPath = new F.Path(pathData, {
          left: obj.left,
          top: obj.top,
          fill: obj.fill || 'transparent',
          stroke: obj.stroke || '#000000',
          strokeWidth: obj.strokeWidth || 1,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          angle: obj.angle || 0,
          opacity: obj.opacity || 1,
          originX: obj.originX || 'center',
          originY: obj.originY || 'center',
          objectCaching: false,
        });

        // Copy custom properties
        if (obj._cmykFill) (newPath as any)._cmykFill = obj._cmykFill;
        if (obj._cmykStroke) (newPath as any)._cmykStroke = obj._cmykStroke;

        canvas.remove(obj);
        canvas.add(newPath);
        canvas.setActiveObject(newPath);
        canvas.requestRenderAll();
        console.log('[ShapeEdit] Converted', obj.type, '→ Path');
        return newPath;
      };

      // ── Determine action based on type ──
      const editableTypes = ['polygon', 'path'];
      const convertibleTypes = ['rect', 'triangle', 'ellipse', 'circle'];
      let editTarget = target;

      // Auto-convert basic shapes to path on double-click
      if (convertibleTypes.includes(target.type)) {
        const converted = convertToPath(target);
        if (!converted) return;
        editTarget = converted;
      }

      // ── Polygon editing (star, pentagon, hex, etc.) ──
      if (editTarget.type === 'polygon' && editTarget.points) {
        const poly = editTarget;
        poly.edit = !poly.edit;

        if (poly.edit) {
          poly.__savedControls = { ...poly.controls };
          poly.cornerStyle = 'circle';
          poly.cornerColor = 'rgba(33,150,243,0.8)';
          poly.transparentCorners = false;
          poly.cornerSize = 12;
          poly.hasBorders = false;
          poly.objectCaching = false;

          if (F.controlsUtils?.createPolyControls) {
            poly.controls = F.controlsUtils.createPolyControls(poly, {
              cursorStyle: 'move',
            });
            console.log('[PolyEdit] Editing', poly.points.length, 'polygon points');
          }
          poly.dirty = true;
          poly.setCoords();
          canvas.requestRenderAll();

        } else {
          if (poly.__savedControls) {
            poly.controls = poly.__savedControls;
            delete poly.__savedControls;
          } else if (F.controlsUtils?.createObjectDefaultControls) {
            poly.controls = F.controlsUtils.createObjectDefaultControls();
          }
          poly.cornerStyle = 'rect';
          poly.cornerColor = 'blue';
          poly.hasBorders = true;
          poly.objectCaching = true;
          poly.dirty = true;
          poly.setCoords();
          canvas.requestRenderAll();
          console.log('[PolyEdit] Exited polygon edit mode');
        }
        return;
      }

      // ── Path editing (bezier curves, arcs, lines) ──
      if (editTarget.type === 'path' && editTarget.path) {
        const pathObj = editTarget;
        pathObj.edit = !pathObj.edit;

        if (pathObj.edit) {
          pathObj.__savedControls = { ...pathObj.controls };
          pathObj.cornerStyle = 'circle';
          pathObj.cornerColor = 'rgba(33,150,243,0.8)';
          pathObj.transparentCorners = false;
          pathObj.cornerSize = 10;
          pathObj.hasBorders = false;
          pathObj.objectCaching = false;

          if (F.controlsUtils?.createPathControls) {
            pathObj.controls = F.controlsUtils.createPathControls(pathObj, {
              cursorStyle: 'move',
              controlPointStyle: {
                controlFill: 'rgba(255,255,255,0.9)',
                controlStroke: 'rgba(33,150,243,0.8)',
                connectionDashArray: [3, 3],
              },
              pointStyle: {
                controlFill: 'rgba(33,150,243,0.9)',
                controlStroke: 'rgba(33,150,243,1)',
              },
            });
            console.log('[PathEdit] Editing path with', pathObj.path.length, 'commands');
          }
          pathObj.dirty = true;
          pathObj.setCoords();
          canvas.requestRenderAll();

        } else {
          if (pathObj.__savedControls) {
            pathObj.controls = pathObj.__savedControls;
            delete pathObj.__savedControls;
          } else if (F.controlsUtils?.createObjectDefaultControls) {
            pathObj.controls = F.controlsUtils.createObjectDefaultControls();
          }
          pathObj.cornerStyle = 'rect';
          pathObj.cornerColor = 'blue';
          pathObj.hasBorders = true;
          pathObj.objectCaching = true;
          pathObj.dirty = true;
          pathObj.setCoords();
          canvas.requestRenderAll();
          console.log('[PathEdit] Exited path edit mode');
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

        // ─── Snap on move ───
        canvas.on("object:moving", (e: any) => {
          if (!e.target) return;
          if (!snapEnabled) { setSnapLines([]); return; }
          const snap = calcSnap(e.target, canvas, 8);
          e.target.set({ left: snap.x, top: snap.y });
          e.target.setCoords();
          setSnapLines(snap.lines);
        });
        canvas.on("object:modified", () => setSnapLines([]));
        canvas.on("mouse:up", () => setSnapLines([]));
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
      _onKeyDown = onKeyDown; _onKeyUp = onKeyUp;
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
            if (fitZ < 95) applyZoom(Math.max(25, fitZ)); // 95~100 → keep 100%
    };

    boot();

    return () => {
        document.removeEventListener("keydown", _onKeyDown!);
        document.removeEventListener("keyup", _onKeyUp!);
      disposed = true; try { if (resizeTimer) clearTimeout(resizeTimer); resizeObserver.disconnect(); } catch(e) {}
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
      else if ((e.ctrlKey||e.metaKey) && e.key==="c") { console.log("[KEY] Ctrl+C → copy, canvas:", !!fcRef.current, "active:", fcRef.current?.getActiveObject()?.type);
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
          } else if (o.type === 'activeselection' || o.type === 'activeSelection') {
          const objs = (o as any).getObjects();
          const clones: any[] = [];
          for (const child of objs) {
            const cl = await child.clone();
            ["_cmykFill","_cmykStroke","_spotFillName","_spotFillPantone","_spotStrokeName","_spotStrokePantone"].forEach(k => {
              if ((child as any)[k] !== undefined) (cl as any)[k] = (child as any)[k];
            });
            clones.push(cl);
          }
          (window as any).__pkClip = { type: "multi", objects: clones };
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
                          } else if (clip.type === "multi" && clip.objects) {
          const F = fabricModRef.current;
          const active = cv.getActiveObject();
          const groupLeft = active ? (active.left || 0) : 0;
          const groupTop = active ? (active.top || 0) : 0;
          cv.discardActiveObject();
          const newObjs: any[] = [];
          for (const orig of clip.objects) {
            const p = await orig.clone();
            ["_cmykFill","_cmykStroke","_spotFillName","_spotFillPantone","_spotStrokeName","_spotStrokePantone"].forEach(k => {
              if ((orig as any)[k] !== undefined) (p as any)[k] = (orig as any)[k];
            });
            newObjs.push(p);
          }
          // Calculate bounding box of cloned objects
          let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
          newObjs.forEach(p => {
            const l = p.left || 0, t = p.top || 0;
            const w = (p.width || 0) * (p.scaleX || 1);
            const h = (p.height || 0) * (p.scaleY || 1);
            minL = Math.min(minL, l); minT = Math.min(minT, t);
            maxR = Math.max(maxR, l + w); maxB = Math.max(maxB, t + h);
          });
          // Place group at original position + 30px offset to bottom-right
          const offsetX = groupLeft - minL + 30;
          const offsetY = groupTop - minT + 30;
          newObjs.forEach(p => {
            p.set({ left: (p.left || 0) + offsetX, top: (p.top || 0) + offsetY });
            cv.add(p);
          });
          if (newObjs.length > 0) {
            const as = new F.ActiveSelection(newObjs, { canvas: cv });
            cv.setActiveObject(as);
          }
          cv.requestRenderAll(); pushHistory(); refreshLayers();

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
            else if (e.key === "Escape") { if (drawMode) { const cv = fcRef.current; if (cv) { cv.isDrawingMode = false; } setDrawMode(false); } if (measureMode) { const cv = fcRef.current; if(cv){cv.selection=true;cv.forEachObject((o:any)=>{o.selectable=o._prevSelectable!==undefined?o._prevSelectable:true;o.evented=o._prevEvented!==undefined?o._prevEvented:true;delete o._prevSelectable;delete o._prevEvented;});cv.requestRenderAll();} setMeasureMode(false);setMeasureResult("");setMeasurePts([]);setMeasureMouseMm(null); } }

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
        }, [undo, redo, pushHistory, refreshLayers, drawMode, measureMode]);



  // ─── Add Text ───
  // ─── Confirm Dieline Size (Upload) ───
  const confirmDielineSize = useCallback(() => {
    const p = pendingDielineRef.current; if (!p) return;
    const c = fcRef.current; if (!c) return;
    const origMmW = uploadSizeW;
    const origMmH = uploadSizeH;
    const group = p.group;
    svgMmWRef.current = origMmW; svgMmHRef.current = origMmH;
    console.log("[Dieline] User confirmed size:", origMmW, "x", origMmH, "mm");

    console.log("[Dieline] group.width:", group.width, "group.height:", group.height, "scX:", (origMmW * scaleRef.current / (group.width || 1)).toFixed(6), "scY:", (origMmH * scaleRef.current / (group.height || 1)).toFixed(6));
    console.log("[Dieline] Canvas scale:", scaleRef.current, "px/mm");

    // ── Accurate mm scaling (compensate Fabric viewBox distortion) ──
    // Fabric.js may apply partial viewBox transforms during SVG parsing,
    // resulting in group.width != svgOrigW (e.g. 2849 vs 3125).
    // We MUST use per-axis scaling to compensate this distortion.
    // This is NOT stretching the SVG - it is UNDOING Fabric's distortion.
    const s = scaleRef.current; // px per mm

    // Per-axis scale: origMm * px/mm / fabricGroupSize = correct scale
    const scX = (origMmW * s) / (group.width || 1);
    const scY = (origMmH * s) / (group.height || 1);

    // Verify: the ratio between scX and scY should match
    // the inverse of Fabric's distortion ratio
    const fabricDistortion = scX / scY;
    console.log("[Dieline] Fabric distortion factor:", fabricDistortion.toFixed(4),
    fabricDistortion > 1.01 || fabricDistortion < 0.99 ? "(compensating)" : "(minimal)");

    // Final rendered size in mm (should match origMm exactly)
    const finalMmW = ((group.width || 1) * scX) / s;
    const finalMmH = ((group.height || 1) * scY) / s;
    console.log("[Dieline] Expected:", origMmW.toFixed(2), "x", origMmH.toFixed(2), "mm");
    console.log("[Dieline] Final:   ", finalMmW.toFixed(2), "x", finalMmH.toFixed(2), "mm");
    console.log("[Dieline] Error: W=", (finalMmW - origMmW).toFixed(4), "mm, H=", (finalMmH - origMmH).toFixed(4), "mm");

    // ── Resize canvas to fit dieline ──
    const wrapper = wrapperRef.current;
    const rulerPadD = showRuler ? RULER_THICK : 0;
    const dieAvailW = wrapper ? wrapper.clientWidth - rulerPadD - 8 : 1200;
    const dieAvailH = wrapper ? wrapper.clientHeight - rulerPadD - 8 : 800;

    // Use a fixed high-quality px/mm (at least 2.0), canvas = full available area
    const PAD_MM = 15;
    const totalMmW = origMmW + PAD_MM * 2;
    const totalMmH = origMmH + PAD_MM * 2;

    // Canvas uses full available space
    const newCanvasW = dieAvailW;
    const newCanvasH = dieAvailH;
    c.setDimensions({ width: newCanvasW, height: newCanvasH });

    // Calculate px/mm so dieline fits in canvas, then apply as zoom
    const fitPxPerMmW = (newCanvasW - PAD_MM * 2) / origMmW;
    const fitPxPerMmH = (newCanvasH - PAD_MM * 2) / origMmH;
    const newPxPerMm = Math.min(fitPxPerMmW, fitPxPerMmH);
    scaleRef.current = newPxPerMm;
    c.backgroundColor = '#FFFFFF';
    c.requestRenderAll();
    console.log("[Dieline Resize] wrapper:", wrapper?.clientWidth, "x", wrapper?.clientHeight, "| canvas:", newCanvasW, "x", newCanvasH, "| pxPerMm:", newPxPerMm.toFixed(3));

    // Recalculate scale with new px/mm
    const finalScX = (origMmW * newPxPerMm) / (group.width || 1);
    const finalScY = (origMmH * newPxPerMm) / (group.height || 1);

    // Position: center with padding
    const leftPos = PAD_MM * newPxPerMm + (origMmW * newPxPerMm) / 2;
    const topPos = PAD_MM * newPxPerMm + (origMmH * newPxPerMm) / 2;
    group.set({ scaleX: finalScX, scaleY: finalScY, left: leftPos, top: topPos, originX: "center", originY: "center" });

    // Verify accuracy
    const verifyW = ((group.width || 1) * finalScX) / newPxPerMm;
    const verifyH = ((group.height || 1) * finalScY) / newPxPerMm;
    console.log("[Dieline] Expected:", origMmW.toFixed(2), "x", origMmH.toFixed(2), "mm");
    console.log("[Dieline] Verify: ", verifyW.toFixed(4), "x", verifyH.toFixed(4), "mm");
    console.log("[Dieline] Scale: scX=", finalScX.toFixed(6), "scY=", finalScY.toFixed(6), "px/mm=", newPxPerMm.toFixed(4));
    // Store per-axis px/mm for Measure tool
    scaleXRef.current = newPxPerMm * (finalScX / finalScY); // X has different density due to Fabric distortion
    scaleYRef.current = newPxPerMm; // Y axis is reference (least distorted)
    console.log("[Dieline] Measure scale: X=", scaleXRef.current.toFixed(4), "Y=", scaleYRef.current.toFixed(4), "px/mm");
    c.add(group); c.sendObjectToBack(group); c.requestRenderAll();
        (window as any).__pc = c; // keep ref fresh after dieline load
    setShowSizeConfirm(false);
    pendingDielineRef.current = null;
  }, [uploadSizeW, uploadSizeH]);

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
    else if (type === "ring") s = new Circle({ left: cx-hsz, top: cy-hsz, radius: hsz, fill: "", stroke: color, strokeWidth: 0.5 });
    else if (type === "semicircle") s = new Path(`M ${cx-hsz} ${cy} A ${hsz} ${hsz} 0 0 1 ${cx+hsz} ${cy} Z`, { fill: color });
    else if (type === "quarter") s = new Path(`M ${cx} ${cy} L ${cx+hsz} ${cy} A ${hsz} ${hsz} 0 0 0 ${cx} ${cy-hsz} Z`, { fill: color });
    else if (type === "ellipseframe") s = new Ellipse({ left: cx-sz, top: cy-hsz*0.7, rx: sz, ry: hsz*0.7, fill: "", stroke: color, strokeWidth: 0.5 });
    else if (type === "semicircleframe") s = new Path(`M ${cx-hsz} ${cy} A ${hsz} ${hsz} 0 0 1 ${cx+hsz} ${cy} L ${cx-hsz} ${cy}`, { fill: "", stroke: color, strokeWidth: 0.5 });
    else if (type === "quarterframe") s = new Path(`M ${cx} ${cy} L ${cx} ${cy-hsz} A ${hsz} ${hsz} 0 0 1 ${cx+hsz} ${cy} Z`, { fill: "", stroke: color, strokeWidth: 0.5, strokeLineJoin: "round" });



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
    else if (type === "seal") s = new Polygon(mkPoly(20, hsz, hsz*0.87), { fill: color });
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
    else if (type === "arc") s = new Path(`M ${cx-hsz} ${cy} Q ${cx} ${cy-hsz*1.5} ${cx+hsz} ${cy}`, { fill: "", stroke: color, strokeWidth: 1 });
    else if (type === "semicircleline") s = new Path(`M ${cx-hsz} ${cy} A ${hsz} ${hsz} 0 0 1 ${cx+hsz} ${cy}`, { fill: "", stroke: color, strokeWidth: 1 });
    else if (type === "waveline") s = new Path(`M ${cx-sz} ${cy} Q ${cx-hsz*0.5} ${cy-hsz} ${cx} ${cy} Q ${cx+hsz*0.5} ${cy+hsz} ${cx+sz} ${cy}`, { fill: "", stroke: color, strokeWidth: 1 });
        else if (type === "freehand") {
      if (c.isDrawingMode) {
        c.isDrawingMode = false;
        setDrawMode(false);
      } else {
        c.isDrawingMode = true;
        const fab = (window as any).__fabric || require("fabric");
        if (fab && fab.PencilBrush) {
          const brush = new fab.PencilBrush(c);
          brush.color = color; brush.width = brushSize;
          c.freeDrawingBrush = brush;
        }
        setDrawMode(true);
      }
      return;
    }


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
    else if (type === "frame") { s = new Rect({ left: cx-sz, top: cy-hsz, width: sz*2, height: sz, fill: "", stroke: color, strokeWidth: 0.5 }); }
    else if (type === "squareframe") { s = new Rect({ left: cx-hsz, top: cy-hsz, width: sz, height: sz, fill: "", stroke: color, strokeWidth: 0.5, rx: 6, ry: 6 }); }
    else if (type === "roundframe") { s = new Rect({ left: cx-sz, top: cy-hsz, width: sz*2, height: sz, fill: "", stroke: color, strokeWidth: 0.5, rx: 12, ry: 12 }); }

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
      _spotFillName: (obj as any)._spotFillName || '',
      _spotStrokeName: (obj as any)._spotStrokeName || '',
      _spotFillPantone: (obj as any)._spotFillPantone || '',
      _spotStrokePantone: (obj as any)._spotStrokePantone || '',
      fontSize: obj.type === "i-text" || obj.type === "textbox" ? Math.max(24, Math.round(((obj as any).fontSize || 24) * ((obj as any).scaleX || 1) / scaleRef.current)) : undefined,
      fontFamily: (obj as any).fontFamily || "Inter",
      fontWeight: (obj as any).fontWeight || "normal",
      fontStyle: (obj as any).fontStyle || "normal",
      textAlign: (obj as any).textAlign || "left",
      name: (obj as any).name || "",
      _isTable: isTable,
      _tableConfig: tableConfig,
            _markType: (obj as any)._markType || '',
      _markMemo: (obj as any)._markMemo || '',
      _markCmyk: (obj as any)._markCmyk || null,

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
    else if (key === "fontFamily") {
      obj.set({ fontFamily: value });
      if (obj.type === "textbox" || obj.type === "i-text" || obj.type === "text") {
        const tObj = obj as any;
        const recalc = () => {
          tObj._clearCache?.();
          tObj.dirty = true;
          tObj.initDimensions?.();
          // Force width recalculation: temporarily switch to auto-width
          const oldW = tObj.width;
          const text = tObj.text || "";
          // Measure actual text width with new font
          const ctx = c.getContext();
          if (ctx) {
            ctx.font = (tObj.fontStyle||"normal") + " " + (tObj.fontWeight||"normal") + " " + (tObj.fontSize||40) + "px " + value;
            const measured = ctx.measureText(text);
            const newW = measured.width * 1.3 + 30;
            if (newW > oldW) {
              tObj.set({ width: newW });
            }
          }
          tObj.initDimensions?.();
          tObj.setCoords?.();
          c.requestRenderAll();
        };
        recalc();
        setTimeout(recalc, 400);
        setTimeout(recalc, 1000);
      }
    }
    else if (key === "fontWeight") obj.set({ fontWeight: value === "bold" ? "bold" : "normal" });
    else if (key === "fontStyle") obj.set({ fontStyle: value === "italic" ? "italic" : "normal" });
    else if (key === "textAlign") obj.set({ textAlign: value });
    else if (key === "fill") {
      obj.set({ fill: value });
      if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { const cf = child.fill; if (cf && cf !== "none" && cf !== "transparent" && cf !== "") { child.set({ fill: value }); } if (child._objects) child._objects.forEach((gc: any) => { const gf = gc.fill; if (gf && gf !== "none" && gf !== "transparent" && gf !== "") { gc.set({ fill: value }); } }); }); }
    }
    else if (key === "stroke") {
      obj.set({ stroke: value });
      if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { child.set({ stroke: value }); if (child._objects) child._objects.forEach((gc: any) => gc.set({ stroke: value })); }); }
    }
        else if (key === "strokeWidth") {
      const sw = Number(value);
      obj.set({ strokeWidth: sw });
      if ((obj as any)._objects) {
        (obj as any)._objects.forEach((child: any) => {
          child.set({ strokeWidth: sw });
          if (child._objects) child._objects.forEach((gc: any) => gc.set({ strokeWidth: sw }));
        });
      }
    }
    else if (key === "angle") obj.set({ angle: Number(value) });
    else if (key === "fillCmyk") { const cm = value as {c:number;m:number;y:number;k:number}; const hex = cmykToHex(cm.c,cm.m,cm.y,cm.k); obj.set({ fill: hex }); (obj as any)._cmykFill = cm; if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { const cf = child.fill; if (cf && cf !== "none" && cf !== "transparent" && cf !== "") { child.set({ fill: hex }); } if (child._objects) child._objects.forEach((gc: any) => { const gf = gc.fill; if (gf && gf !== "none" && gf !== "transparent" && gf !== "") { gc.set({ fill: hex }); } }); }); } }
    else if (key === "strokeCmyk") { const cm = value as {c:number;m:number;y:number;k:number}; const hex = cmykToHex(cm.c,cm.m,cm.y,cm.k); obj.set({ stroke: hex }); (obj as any)._cmykStroke = cm; if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { child.set({ stroke: hex }); if (child._objects) child._objects.forEach((gc: any) => gc.set({ stroke: hex })); }); } }
    else if (key === "spotFill") { const s = value as {name:string;hex:string;cmyk?:[number,number,number,number]}; obj.set({ fill: s.hex }); (obj as any)._spotFill = true; (obj as any)._spotFillName = s.name; if (s.cmyk) { (obj as any)._cmykFill = {c:s.cmyk[0],m:s.cmyk[1],y:s.cmyk[2],k:s.cmyk[3]}; } if ((obj as any)._objects) { (obj as any)._objects.forEach((child: any) => { const cf = child.fill; if (cf && cf !== "none" && cf !== "transparent" && cf !== "") { child.set({ fill: s.hex }); } if (child._objects) child._objects.forEach((gc: any) => { const gf = gc.fill; if (gf && gf !== "none" && gf !== "transparent" && gf !== "") { gc.set({ fill: s.hex }); } }); }); } }
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
      <div className="h-11 bg-white border-b border-gray-200 flex items-center pl-3 pr-2 shrink-0 z-20">

        {/* LEFT: Logo + File info */}
        <a href="/" className="flex items-center shrink-0 mr-3" title="Home">
          <img src="/packive-logo.png" alt="Packive" className="h-16 object-contain" />
        </a>
        {boxType && <span className="text-xs font-semibold text-gray-700 mr-1">{boxType}</span>}
        {dielineFileName && <span className="text-[11px] text-blue-600 truncate max-w-[140px] font-medium" title={dielineFileName}>{dielineFileName}</span>}
        {!dielineFileName && boxType && <span className="text-[11px] text-gray-400">{L}x{W}x{D}</span>}

        <div className="flex-1" />

        {/* CENTER: Dieline tools (icon buttons) */}
        <div className="flex items-center gap-1">
          {/* New */}
          <button onClick={() => { if (!window.confirm("Start a completely new blank canvas?\nAll current work will be removed.")) return; const c = fcRef.current; if(!c) return; c.getObjects().slice().forEach((o:any) => c.remove(o)); c.requestRenderAll(); setDielineFileName(""); setDielineSizes(null); setDielineModelInfo(""); pushHistory(); refreshLayers(); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="New Canvas">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          </button>

          {/* Upload */}
          <button onClick={() => dielineFileRef.current?.click()}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Upload Dieline (.eps, .svg, .pdf)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </button>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Dieline On/Off */}
          <button onClick={() => { const c = fcRef.current; if (!c) return; const nv = !dielineVisible; setDielineVisible(nv); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine) { o.visible = nv; } }); c.requestRenderAll(); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${dielineVisible ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
            title={dielineVisible ? "Hide Dieline" : "Show Dieline"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{dielineVisible ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>}</svg>
          </button>

          {/* Info On/Off */}
          <button onClick={() => { const c = fcRef.current; if (!c) return; const hasDieline = dielineVisible && c.getObjects().some((o: any) => o._isGuideLayer || o._isDieLine); if (!hasDieline) return; const nv = !dielineInfoVisible; setDielineInfoVisible(nv); let count = 0; const toggleDeep = (obj: any) => { if (obj._isDielineInfo || obj._isPanelLabel || obj._isPanelOverlay || obj._isDimLine || obj._isDimArrow) { obj.visible = nv; obj.dirty = true; obj.setCoords?.(); count++; } if (obj.type === "group" && typeof obj.getObjects === "function") { obj.getObjects().forEach((child: any) => toggleDeep(child)); obj.dirty = true; obj.setCoords?.(); } }; c.getObjects().forEach((o: any) => toggleDeep(o)); console.log("[Info toggle]", nv ? "ON" : "OFF", count, "objects"); c.requestRenderAll(); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${dielineInfoVisible ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
            title={dielineInfoVisible ? "Hide Info & Dimensions" : "Show Info & Dimensions"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </button>

          {/* Lock */}
          <button onClick={() => { const c = fcRef.current; if (!c) return; const nl = !dielineLocked; setDielineLocked(nl); c.getObjects().forEach((o: any) => { if (o._isGuideLayer || o._isDieLine || o._isFoldLine) { o.selectable = !nl; o.evented = !nl; } }); c.requestRenderAll(); }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${dielineLocked ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-100"}`}
            title={dielineLocked ? "Unlock Dieline" : "Lock Dieline"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{dielineLocked ? <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> : <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></>}</svg>
          </button>
        </div>

        <div className="flex-1" />

        {/* RIGHT: Undo/Redo + Zoom + Save/Export - aligned with right panel (w-80) */}
        <div className="flex items-center justify-end gap-0.5 w-80 shrink-0">
          {/* Undo */}
          <button onClick={undo} title="Undo (Ctrl+Z)" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
          {/* Redo */}
          <button onClick={redo} title="Redo (Ctrl+Y)" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Zoom */}
          <button onClick={() => applyZoom(zoom - 25)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-xs font-medium">−</button>
          <span className="text-[11px] text-gray-500 w-10 text-center font-medium select-none">{zoom}%</span>
          <button onClick={() => applyZoom(zoom + 25)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-xs font-medium">+</button>
          <button onClick={() => { const c = fcRef.current; if (!c) return; const objs = c.getObjects(); if (objs.length === 0) { applyZoom(100); return; } let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity; objs.forEach((o:any) => { const b=o.getBoundingRect(); minX=Math.min(minX,b.left); minY=Math.min(minY,b.top); maxX=Math.max(maxX,b.left+b.width); maxY=Math.max(maxY,b.top+b.height); }); const cw=c.getWidth(), ch=c.getHeight(), ow=maxX-minX, oh=maxY-minY; const z=Math.floor(Math.min(cw/ow, ch/oh)*90); applyZoom(Math.min(Math.max(z,25),400)); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Fit to View">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Load */}
          <button onClick={() => fileLoadRef.current?.click()} title="Load Project"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </button>
          {/* Save */}
          <button onClick={fileSave} title="Save (Ctrl+S)"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          </button>
          {/* Export */}
          <button onClick={() => setShowExport(true)}
            className="px-4 py-1.5 text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
            Export
          </button>
        </div>
        {/* Hidden file inputs */}
        <input ref={dielineFileRef} type="file" accept=".eps,.ai,.pdf,.svg" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          const c = fcRef.current; if (!c) return;
          const F = fabricModRef.current; if (!F) return;
          setDielineFileName(f.name); setDielineUngrouped(false);
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
            // Force strokes for non-SVG files
            const forceBlack = (objs: any[]) => {
              if (!objs) return;
              objs.forEach((obj: any) => {
                obj.set({ stroke: "#111111", strokeWidth: Math.max(obj.strokeWidth || 1, 1.5), opacity: 1, strokeDashArray: null });
                if (obj._objects) forceBlack(obj._objects);
              });
            };
            if (ext !== "svg") forceBlack(result.objects);

            const allObjs = result.objects || [];


            const group = F.util.groupSVGElements(allObjs, result.options);



            group.set({ _isDieLine: true, _isGuideLayer: true, selectable: !dielineLocked, evented: !dielineLocked, name: "__dieline_upload__" });

            // Tag info children for uploaded dieline
            if (group._objects) {
              group._objects.forEach((child: any) => {
                const ct = (child.type || "").toLowerCase();
                const isText = (ct === "text" || ct === "i-text" || ct === "textbox");
                const isThinPath = (ct === "path" || ct === "line" || ct === "polyline") && !/(237,\s*28,\s*36|ed1c24|0,\s*166,\s*80|00a650)/i.test(child.stroke || "");
                const isSmallPoly = (ct === "polygon") && ((child.width || 0) < 15 && (child.height || 0) < 15);
                if (isText || isThinPath || isSmallPoly) {
                  child._isDielineInfo = true;
                }
              });
              const infoCount = group._objects.filter((ch: any) => ch._isDielineInfo).length;
              console.log("[Dieline-Upload] Tagged " + infoCount + " info children inside group");
            }

            // ─── Accurate mm scaling ───
            // SVG/EPS coordinates are in pt (1pt = 0.3528mm = 1/72 inch)
            // Parse viewBox or width/height to determine original dimensions
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgStr, "image/svg+xml");
            const svgEl = svgDoc.documentElement;
            const vb = svgEl.getAttribute("viewBox");
            let svgOrigW = group.width || 1;
            let svgOrigH = group.height || 1;
            if (vb) {
              const parts = vb.split(/[\s,]+/).map(Number);
              if (parts.length === 4) { svgOrigW = parts[2]; svgOrigH = parts[3]; }
            }

            // Detect unit from width/height attributes
            const widthAttr = svgEl.getAttribute("width") || "";
            const heightAttr = svgEl.getAttribute("height") || "";
            let origMmW: number, origMmH: number;

            if (widthAttr.includes("mm")) {
              origMmW = parseFloat(widthAttr);
              origMmH = parseFloat(heightAttr);
            } else if (widthAttr.includes("cm")) {
              origMmW = parseFloat(widthAttr) * 10;
              origMmH = parseFloat(heightAttr) * 10;
            } else if (widthAttr.includes("in")) {
              origMmW = parseFloat(widthAttr) * 25.4;
              origMmH = parseFloat(heightAttr) * 25.4;
            } else {
              // Default: assume pt (1pt = 0.3528mm)
              origMmW = svgOrigW * 0.3528;
              origMmH = svgOrigH * 0.3528;
            }

            console.log("[Dieline] SVG original:", svgOrigW, "x", svgOrigH, "units, =", origMmW.toFixed(2), "x", origMmH.toFixed(2), "mm");
            svgMmWRef.current = origMmW; svgMmHRef.current = origMmH;
            const infoObjs: any[] = []; pendingDielineRef.current = { group, origMmW, origMmH, svgOrigW, svgOrigH, infoObjs };
            setUploadSizeW(parseFloat(origMmW.toFixed(2)));
            setUploadSizeH(parseFloat(origMmH.toFixed(2)));
            setShowSizeConfirm(true);
            return;
          } catch (err: any) { alert("Failed to load dieline: " + err.message); }
          e.target.value = "";
        }} />
        <input ref={fileLoadRef} type="file" accept=".json,.pkv.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (window.confirm("Loading will replace current canvas. Continue?")) { fileLoad(f); } } e.target.value = ""; }} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ═══ LEFT TOOLBAR ═══ */}
        <div className="w-14 bg-[#fafafa] border-r border-gray-200 flex flex-col items-center py-2 shrink-0 overflow-y-auto gap-0.5">
          <button onClick={() => setShowDielinePanel(p => !p)} title="Box"
            className="w-11 h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-md mb-1">
            <span className="text-sm leading-none">📦</span>
            <span className="text-[8px] mt-0.5 font-bold">Box</span>
          </button>
          <div className="w-8 h-px bg-gray-200 my-1" />
          <span className="text-[7px] font-bold text-gray-400 tracking-widest mb-0.5">DESIGN</span>
          {[
            { icon: "T", label: "Text", action: addText },
            { icon: "🏞", label: "Image", action: addImage },
            { icon: "◆", label: "Shapes", action: () => setShowShapePanel(p => !p) },
            { icon: "⚠", label: "Symbols", action: () => setShowSymbolPanel(p => !p) },
            { icon: "▭", label: "Handle", action: () => setShowHandlePanel(p => !p) },
            { icon: "⊞", label: "Table", action: () => setShowTablePanel(p => !p) },
            { icon: "⫼", label: "Barcode", action: () => setShowBarcodePanel(p => !p) },
            { icon: "✎", label: "Mark", action: () => setShowMarkPanel(p => !p) },
          ].map(btn => (            
            <button key={btn.label} onClick={btn.action} title={btn.label}
              className="w-11 h-11 flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800">
              <span className="text-sm leading-none">{btn.icon}</span>
              <span className="text-[8px] mt-0.5 font-medium">{btn.label}</span>
            </button>
          ))}
          <div className="w-8 h-px bg-gray-200 my-1" />
          <span className="text-[7px] font-bold text-gray-400 tracking-widest mb-0.5">MEASURE</span>
                    <button onClick={() => { setMeasureMode(m => { const c = fcRef.current; if(!m){setMeasurePts([]);setMeasureMouseMm(null);setMeasureResult("Click first point..."); if(c){c.selection=false;c.forEachObject((o:any)=>{o._prevSelectable=o.selectable;o._prevEvented=o.evented;o.selectable=false;o.evented=false;});c.discardActiveObject();c.requestRenderAll();}} else {setMeasureResult(""); if(c){c.selection=true;c.forEachObject((o:any)=>{o.selectable=o._prevSelectable!==undefined?o._prevSelectable:true;o.evented=o._prevEvented!==undefined?o._prevEvented:true;delete o._prevSelectable;delete o._prevEvented;});c.requestRenderAll();}} return !m; }); }}
            className={`w-11 h-11 flex flex-col items-center justify-center rounded-lg transition-all ${measureMode ? "bg-cyan-50 text-cyan-600 shadow-sm" : "text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-800"}`}>
            <span className="text-sm">📏</span>
            <span className="text-[8px] mt-0.5 font-medium">Measure</span>
          </button>
          <button onClick={() => setShowRuler(r => !r)}
            className={`w-11 h-11 flex flex-col items-center justify-center rounded-lg transition-all ${showRuler ? "bg-gray-100 text-gray-700 shadow-sm" : "text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-800"}`}>
            <span className="text-sm">📐</span>
            <span className="text-[8px] mt-0.5 font-medium">Ruler</span>
          </button>
          <div className="flex-1" />
          <div className="w-8 h-px bg-gray-200 my-1" />
          <button onClick={() => setShowShortcuts(true)} title="Shortcuts (F1)"
            className="w-11 h-11 flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800">
            <span className="text-sm leading-none">⌨</span>
            <span className="text-[8px] mt-0.5 font-medium">Keys</span>
          </button>
        </div>

        {/* ═══ Tool Popups (absolute positioned) ═══ */}
        <div className="relative flex-1 flex overflow-hidden">
          {/* Text Popup */}
          {showTextPanel && (
            <div className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-xl border p-3 w-52">
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
            <div className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-2xl border p-3 w-72 max-h-[520px] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-700">Shapes</div>
                <button onClick={() => setShowShapePanel(false)} className="text-gray-400 hover:text-gray-600 text-sm">×</button>
              </div>

              {/* Basic */}
                            <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Basic</div>
                <div className="grid grid-cols-5 gap-1">

                                  {([
                    {id:"rect",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="2" y="6" width="20" height="12" fill="currentColor"/></svg>},
                    {id:"square",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="4" y="4" width="16" height="16" fill="currentColor"/></svg>},
                    {id:"roundrect",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="2" y="6" width="20" height="12" rx="4" fill="currentColor"/></svg>},
                    {id:"roundsquare",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor"/></svg>},
                    {id:"circle",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>},
                    {id:"ellipse",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><ellipse cx="12" cy="12" rx="11" ry="7" fill="currentColor"/></svg>},
                    {id:"semicircle",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M2 14 A10 10 0 0 1 22 14 Z" fill="currentColor"/></svg>},
                    {id:"quarter",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 12 L12 2 A10 10 0 0 1 22 12 Z" fill="currentColor"/></svg>},
                    {id:"frame",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="3" y="5" width="18" height="14" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>},
                    {id:"squareframe",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>},
                    {id:"roundframe",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="3" y="5" width="18" height="14" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>},
                    {id:"ring",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>},
                    {id:"ellipseframe",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><ellipse cx="12" cy="12" rx="11" ry="7" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>},
                    {id:"semicircleframe",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M2 14 A10 10 0 0 1 22 14 M2 14 L22 14" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>},
                    {id:"quarterframe",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2 A10 10 0 0 1 22 12 L12 12 L12 2" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>},
                  ] as {id:string;icon:React.ReactNode}[]).map(s => (             

                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Polygons */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Polygons</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"triangle",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="12,2 22,22 2,22" fill="currentColor"/></svg>},
                    {id:"righttri",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="2,22 22,22 2,2" fill="currentColor"/></svg>},
                    {id:"diamond",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="12,2 22,12 12,22 2,12" fill="currentColor"/></svg>},
                    {id:"pentagon",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="12,2 22,9 19,21 5,21 2,9" fill="currentColor"/></svg>},
                    {id:"hexagon",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill="currentColor"/></svg>},
                    {id:"heptagon",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="12,2 20,5 22,14 17,21 7,21 2,14 4,5" fill="currentColor"/></svg>},
                    {id:"octagon",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="8,2 16,2 22,8 22,16 16,22 8,22 2,16 2,8" fill="currentColor"/></svg>},
                    {id:"decagon",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="12,2 18,4 22,9 22,15 18,20 12,22 6,20 2,15 2,9 6,4" fill="currentColor"/></svg>},
                    {id:"parallelogram",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="6,6 22,6 18,18 2,18" fill="currentColor"/></svg>},
                    {id:"trapezoid",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="7,6 17,6 22,18 2,18" fill="currentColor"/></svg>},
                  ] as {id:string;icon:React.ReactNode}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

                            {/* Stars & Badges */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Stars & Badges</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"star4",icon:<svg viewBox="0 0 24 24" className="w-5 h-5">{(() => { const pts: string[] = []; for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 11 : 4.4; const a = -Math.PI/2 + i * Math.PI / 4; pts.push(`${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`); } return <polygon points={pts.join(' ')} fill="currentColor"/>; })()}</svg>},
                    {id:"star",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="12,2 14.9,8.6 22,9.4 16.8,14.1 18.2,21 12,17.5 5.8,21 7.2,14.1 2,9.4 9.1,8.6" fill="currentColor"/></svg>},
                    {id:"star6",icon:<svg viewBox="0 0 24 24" className="w-5 h-5">{(() => { const pts: string[] = []; for (let i = 0; i < 12; i++) { const r = i % 2 === 0 ? 11 : 5.5; const a = -Math.PI/2 + i * Math.PI / 6; pts.push(`${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`); } return <polygon points={pts.join(' ')} fill="currentColor"/>; })()}</svg>},
                    {id:"star8",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="12,1 13.8,8.2 20.5,3.5 16,10 23,12 16,14 20.5,20.5 13.8,15.8 12,23 10.2,15.8 3.5,20.5 8,14 1,12 8,10 3.5,3.5 10.2,8.2" fill="currentColor"/></svg>},
                    {id:"burst12",icon:<svg viewBox="0 0 24 24" className="w-5 h-5">{(() => { const pts: string[] = []; for (let i = 0; i < 24; i++) { const r = i % 2 === 0 ? 11 : 7.7; const a = -Math.PI/2 + i * Math.PI / 12; pts.push(`${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`); } return <polygon points={pts.join(' ')} fill="currentColor"/>; })()}</svg>},
                    {id:"burst24",icon:<svg viewBox="0 0 24 24" className="w-5 h-5">{(() => { const pts: string[] = []; for (let i = 0; i < 48; i++) { const r = i % 2 === 0 ? 11 : 8.8; const a = -Math.PI/2 + i * Math.PI / 24; pts.push(`${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`); } return <polygon points={pts.join(' ')} fill="currentColor"/>; })()}</svg>},
                    {id:"badge",icon:<svg viewBox="0 0 24 24" className="w-5 h-5">{(() => { const pts: string[] = []; for (let i = 0; i < 32; i++) { const r = i % 2 === 0 ? 11 : 9.35; const a = -Math.PI/2 + i * Math.PI / 16; pts.push(`${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`); } return <polygon points={pts.join(' ')} fill="currentColor"/>; })()}</svg>},
                    {id:"seal",icon:<svg viewBox="0 0 24 24" className="w-5 h-5">{(() => { const pts: string[] = []; for (let i = 0; i < 40; i++) { const r = i % 2 === 0 ? 11 : 9.5; const a = -Math.PI/2 + i * Math.PI / 20; pts.push(`${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`); } return <polygon points={pts.join(' ')} fill="currentColor"/>; })()}</svg>},
                  ] as {id:string;icon:React.ReactNode}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Arrows */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Arrows</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"arrowright",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M2 10h14V6l6 6-6 6v-4H2z" fill="currentColor"/></svg>},
                    {id:"arrowleft",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22 10H8V6L2 12l6 6v-4h14z" fill="currentColor"/></svg>},
                    {id:"arrowup",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M10 22V8H6l6-6 6 6h-4v14z" fill="currentColor"/></svg>},
                    {id:"arrowdown",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M10 2v14H6l6 6 6-6h-4V2z" fill="currentColor"/></svg>},
                    {id:"arrowdouble",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M2 12l5-5v3h10V7l5 5-5 5v-3H7v3z" fill="currentColor"/></svg>},
                    {id:"arrowcurve",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M4 18Q4 8 14 8V4l6 6-6 6v-4Q8 12 8 18z" fill="currentColor"/></svg>},
                    {id:"chevron",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M2 4h12l6 8-6 8H2l6-8z" fill="currentColor"/></svg>},
                  ] as {id:string;icon:React.ReactNode}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Lines */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Lines</div>
                <div className="grid grid-cols-5 gap-1">
                                 {([
                    {id:"line",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2"/></svg>},
                    {id:"dashed",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"/></svg>},
                    {id:"dotted",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/></svg>},
                    {id:"thick",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="5"/></svg>},
                    {id:"diagonal",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2"/></svg>},
                    {id:"arc",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 16 Q12 2 21 16" fill="none" stroke="currentColor" strokeWidth="2"/></svg>},
                    {id:"semicircleline",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 14 A9 9 0 0 1 21 14" fill="none" stroke="currentColor" strokeWidth="2"/></svg>},
                    {id:"waveline",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M2 12 Q7 4 12 12 Q17 20 22 12" fill="none" stroke="currentColor" strokeWidth="2"/></svg>},
                    {id:"freehand",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 17 C5 14 7 8 10 10 C13 12 14 6 17 8 C20 10 21 7 22 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>},
                                    ] as {id:string;icon:React.ReactNode}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className={`w-full aspect-square flex items-center justify-center rounded-lg border transition-all hover:scale-105 ${s.id === 'freehand' && drawMode ? 'border-blue-500 bg-blue-100 text-blue-600' : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600'}`}>{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Symbols */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Symbols</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"heart",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 21C12 21 3 13.5 3 8.5 3 5.4 5.4 3 8.5 3c1.7 0 3.4.8 3.5 2.1C12.1 3.8 13.8 3 15.5 3 18.6 3 21 5.4 21 8.5 21 13.5 12 21 12 21z" fill="currentColor"/></svg>},
                    {id:"cross",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M8 2h8v6h6v8h-6v6H8v-6H2V8h6z" fill="currentColor"/></svg>},
                    {id:"check",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M2 12l7 7L22 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>},
                    {id:"xmark",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>},
                    {id:"moon",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/></svg>},
                    {id:"lightning",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="13,2 4,14 11,14 10,22 20,10 13,10" fill="currentColor"/></svg>},
                    {id:"cloud",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M6 19a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 16.8 8 4.5 4.5 0 1 1 18 17H6z" fill="currentColor"/></svg>},
                    {id:"droplet",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2C12 2 4 12 4 16a8 8 0 1 0 16 0c0-4-8-14-8-14z" fill="currentColor"/></svg>},
                  ] as {id:string;icon:React.ReactNode}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Callouts & Labels */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Callouts & Labels</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"bubble",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z" fill="currentColor"/></svg>},
                    {id:"bubbleround",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><ellipse cx="12" cy="10" rx="10" ry="8" fill="currentColor"/><polygon points="8,16 4,22 14,16" fill="currentColor"/></svg>},
                    {id:"ribbon",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M1 8l3 4-3 4h7v4h8v-4h7l-3-4 3-4h-7V4H8v4z" fill="currentColor"/></svg>},
                    {id:"tag",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M2 6h14l5 6-5 6H2z" fill="currentColor"/></svg>},
                  ] as {id:string;icon:React.ReactNode}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Packaging */}
              <div className="mb-1">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Packaging</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"tab",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v12H4z" fill="currentColor"/></svg>},
                    {id:"capsule",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="2" y="8" width="20" height="8" rx="4" fill="currentColor"/></svg>},
                    {id:"arch",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 20V12a9 9 0 0 1 18 0v8z" fill="currentColor"/></svg>},
                  ] as {id:string;icon:React.ReactNode}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>
              {/* Symbols */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Symbols</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"heart",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 21C12 21 3 13.5 3 8.5 3 5.4 5.4 3 8.5 3c1.7 0 3.4.8 3.5 2.1C12.1 3.8 13.8 3 15.5 3 18.6 3 21 5.4 21 8.5 21 13.5 12 21 12 21z" fill="currentColor"/></svg>},
                    {id:"cross",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M8 2h8v6h6v8h-6v6H8v-6H2V8h6z" fill="currentColor"/></svg>},
                    {id:"check",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M2 12l7 7L22 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>},
                    {id:"xmark",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>},
                    {id:"moon",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/></svg>},
                    {id:"lightning",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><polygon points="13,2 4,14 11,14 10,22 20,10 13,10" fill="currentColor"/></svg>},
                    {id:"cloud",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M6 19a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 16.8 8 4.5 4.5 0 1 1 18 17H6z" fill="currentColor"/></svg>},
                    {id:"droplet",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M12 2C12 2 4 12 4 16a8 8 0 1 0 16 0c0-4-8-14-8-14z" fill="currentColor"/></svg>},
                  ] as {id:string;icon:React.ReactNode}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Callouts & Labels */}
              <div className="mb-3">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Callouts & Labels</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"bubble",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z" fill="currentColor"/></svg>},
                    {id:"bubbleround",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><ellipse cx="12" cy="10" rx="10" ry="8" fill="currentColor"/><polygon points="8,16 4,22 14,16" fill="currentColor"/></svg>},
                    {id:"ribbon",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M1 8l3 4-3 4h7v4h8v-4h7l-3-4 3-4h-7V4H8v4z" fill="currentColor"/></svg>},
                    {id:"tag",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M2 6h14l5 6-5 6H2z" fill="currentColor"/></svg>},
                  ] as {id:string;icon:React.ReactNode}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>

              {/* Packaging */}
              <div className="mb-1">
                <div className="text-[9px] text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Packaging</div>
                <div className="grid grid-cols-5 gap-1">
                  {([
                    {id:"tab",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v12H4z" fill="currentColor"/></svg>},
                    {id:"capsule",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><rect x="2" y="8" width="20" height="8" rx="4" fill="currentColor"/></svg>},
                    {id:"arch",icon:<svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 20V12a9 9 0 0 1 18 0v8z" fill="currentColor"/></svg>},
                  ] as {id:string;icon:React.ReactNode}[]).map(s => (
                    <button key={s.id} onClick={() => addShape(s.id)} title={s.id}
                      className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 transition-all hover:scale-105">{s.icon}</button>
                  ))}
                </div>
              </div>


            </div>
          )}


          {/* Barcode Popup */}
          {showBarcodePanel && (
            <div className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-xl border p-3 w-56">
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

          {/* Packaging Symbols Popup */}
          {showSymbolPanel && (
            <div className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-xl border p-3 w-72 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-bold text-gray-700">Packaging Symbols ({PACKAGING_SYMBOLS.length})</div>
                <button onClick={() => setShowSymbolPanel(false)} className="text-gray-400 hover:text-gray-600 text-sm">x</button>
              </div>
              <input value={symbolSearch} onChange={e => setSymbolSearch(e.target.value)}
                placeholder="Search symbols..."
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] mb-2 focus:border-blue-400 outline-none" />
              <div className="flex gap-1 flex-nowrap mb-2 overflow-x-auto">
                {SYMBOL_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSymbolCategory(cat.id)}
                    className={"px-1.5 py-0.5 rounded-full text-[8px] font-medium whitespace-nowrap transition-all " + (symbolCategory === cat.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {PACKAGING_SYMBOLS
                  .filter(s => symbolCategory === "all" || s.category === symbolCategory)
                  .filter(s => !symbolSearch || s.name.toLowerCase().includes(symbolSearch.toLowerCase()) || s.nameKo.includes(symbolSearch))
                  .map(sym => (
                  <button key={sym.id} onClick={() => {
                    const c = fcRef.current; if (!c) return;
                    (async () => {
                      try {
                        const F = fabricModRef.current;
                        if (!F) { console.error("No Fabric module"); return; }
                        const result = await F.loadSVGFromString(sym.svg);
                        const objects = (result.objects || []).filter((o: any) => o != null);
                        if (objects.length === 0) { console.error("No SVG objects loaded for", sym.name); return; }
                        const group = F.util.groupSVGElements(objects, result.options);
                        const cw = c.getWidth(); const ch = c.getHeight();
                        group.set({ left: cw / 2, top: ch / 2, originX: "center", originY: "center" });
                        group.scaleToWidth(80);
                        c.add(group);
                        c.setActiveObject(group);
                        c.requestRenderAll();
                        if (typeof refreshLayers === "function") refreshLayers();
                        console.log("Symbol added to canvas:", sym.name);
                      } catch (e) { console.error("Symbol load error:", sym.name, e); }
                    })();
                    setShowSymbolPanel(false);
                  }}
                   className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    title={sym.name}>
                    <div className="w-10 h-10 flex items-center justify-center" dangerouslySetInnerHTML={{__html: sym.svg.replace(/currentColor/g, "#333")}} />
                    <span className="text-[8px] text-gray-400 group-hover:text-blue-600 truncate w-full text-center">{sym.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Handle Panel */}
                   {showHandlePanel && (
            <div className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-xl border p-3 w-80 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs font-bold text-gray-700">Handle Types (5)</div>
                <button onClick={() => { setShowHandlePanel(false); setHandleType(null); }} className="text-gray-400 hover:text-gray-600 text-sm">X</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  {id:"fullcut",label:"Full Cut Handle",desc:"All cut lines (red)",dw:80,dh:30,icon:<svg viewBox="0 0 140 55" className="w-full h-10"><rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" strokeWidth="2"/></svg>},
                  {id:"halfcut",label:"Half Cut Handle",desc:"Top: crease, Rest: cut",dw:80,dh:30,icon:<svg viewBox="0 0 140 55" className="w-full h-10"><rect x="15" y="7" width="110" height="40" rx="20" ry="20" fill="none" stroke="#FF0000" strokeWidth="2"/><line x1="35" y1="7" x2="105" y2="7" stroke="#00AA00" strokeWidth="3"/></svg>},
                  {id:"fingercircle",label:"Finger Hole (Circle)",desc:"Full cut (red)",dw:25,dh:25,icon:<svg viewBox="0 0 60 60" className="w-12 h-12 mx-auto"><circle cx="30" cy="30" r="22" fill="none" stroke="#FF0000" strokeWidth="2"/></svg>},
                  {id:"fingersemi",label:"Finger Hole (Semi)",desc:"All cut lines (red)",dw:30,dh:15,icon:<svg viewBox="0 0 60 40" className="w-12 h-10 mx-auto"><line x1="5" y1="5" x2="55" y2="5" stroke="#FF0000" strokeWidth="2"/><path d="M5,5 A25,30 0 0,0 55,5" fill="none" stroke="#FF0000" strokeWidth="2"/></svg>},
                  {id:"squarehole",label:"Square Hole",desc:"Full cut (red)",dw:25,dh:25,icon:<svg viewBox="0 0 60 60" className="w-12 h-12 mx-auto"><rect x="8" y="8" width="44" height="44" fill="none" stroke="#FF0000" strokeWidth="2"/></svg>},
                ] as {id:string;label:string;desc:string;dw:number;dh:number;icon:React.ReactNode}[]).map(h => (
                  <button key={h.id} onClick={() => { setHandleType(h.id); setHandleW(h.dw); setHandleH(h.dh); }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${handleType === h.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-red-300 hover:bg-red-50"}`}>
                    {h.icon}
                    <div className="text-[9px] text-gray-600 font-medium">{h.label}</div>
                    <div className="text-[7px] text-gray-400">{h.desc}</div>
                  </button>
                ))}
              </div>
              {handleType && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg space-y-2">
                  <div className="text-[10px] font-semibold text-blue-700">Size (mm)</div>
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <span className="text-[9px] text-gray-500">Width</span>
                      <input type="number" min={5} max={500} value={handleW} onChange={e => setHandleW(Math.max(5,Math.min(500,Number(e.target.value)||5)))}
                        className="w-full border rounded px-2 py-1 text-xs text-center" />
                    </label>
                    <label className="flex-1">
                      <span className="text-[9px] text-gray-500">Height</span>
                      <input type="number" min={5} max={500} value={handleH} onChange={e => setHandleH(Math.max(5,Math.min(500,Number(e.target.value)||5)))}
                        className="w-full border rounded px-2 py-1 text-xs text-center" />
                    </label>
                  </div>
                  <button onClick={() => {
                                     const c = fcRef.current; if (!c) return;
                    const sc = scaleXRef.current || 1;
                    console.log(`[Handle-Debug] scaleXRef:${sc}`);
                    const pw = Math.round(handleW * sc);
                    const ph = Math.round(handleH * sc);

                    const vw = 1000; const vh = Math.round(vw * ph / pw);
                    let svgInner = "";
                                        const sw = 2;
                    if (handleType === "fullcut") svgInner = `<rect x="${sw/2}" y="${sw/2}" width="${vw-sw}" height="${vh-sw}" rx="${(vh-sw)/2}" ry="${(vh-sw)/2}" fill="none" stroke="#FF0000" stroke-width="${sw}"/>`;
                    else if (handleType === "halfcut") svgInner = `<rect x="${sw/2}" y="${sw/2}" width="${vw-sw}" height="${vh-sw}" rx="${(vh-sw)/2}" ry="${(vh-sw)/2}" fill="none" stroke="#FF0000" stroke-width="${sw}"/><line x1="${(vh-sw)/2}" y1="${sw/2}" x2="${vw-(vh-sw)/2}" y2="${sw/2}" stroke="#00AA00" stroke-width="${sw}"/>`;
                    else if (handleType === "fingercircle") svgInner = `<circle cx="${vw/2}" cy="${vh/2}" r="${Math.min(vw,vh)/2-sw/2}" fill="none" stroke="#FF0000" stroke-width="${sw}"/>`;
                    else if (handleType === "fingersemi") svgInner = `<line x1="${sw/2}" y1="${sw/2}" x2="${vw-sw/2}" y2="${sw/2}" stroke="#FF0000" stroke-width="${sw}"/><path d="M${sw/2},${sw/2} A${(vw-sw)/2},${vh-sw} 0 0,0 ${vw-sw/2},${sw/2}" fill="none" stroke="#FF0000" stroke-width="${sw}"/>`;
                    else if (handleType === "squarehole") svgInner = `<rect x="${sw/2}" y="${sw/2}" width="${vw-sw}" height="${vh-sw}" fill="none" stroke="#FF0000" stroke-width="${sw}"/>`;

                    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}">${svgInner}</svg>`;
                    const dataUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
                    import("fabric").then(({ FabricImage }) => {
                      FabricImage.fromURL(dataUrl).then((img) => {
                        if (!img || !c) return;
                        img.scaleToWidth(pw);
                        img.set({ left: c.getWidth()/2, top: c.getHeight()/2, originX: "center", originY: "center" });
                        c.add(img); c.setActiveObject(img); c.requestRenderAll();
                        if (typeof refreshLayers === "function") refreshLayers();
                                                console.log(`[Handle] type:${handleType} input:${handleW}x${handleH}mm scale:${sc}px/mm targetPx:${pw}x${ph} imgNatural:${img.width}x${img.height} imgScale:${img.scaleX?.toFixed(6)}x${img.scaleY?.toFixed(6)} finalPx:${(img.width!*img.scaleX!).toFixed(2)}x${(img.height!*img.scaleY!).toFixed(2)} finalMm:${((img.width!*img.scaleX!)/sc).toFixed(2)}x${((img.height!*img.scaleY!)/sc).toFixed(2)}`);

                      });
                    });
                    setShowHandlePanel(false); setHandleType(null);

                  }} className="w-full py-1.5 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700 transition-colors">
                    Add Handle ({handleW} × {handleH} mm)
                  </button>
                </div>
              )}
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="text-[8px] text-gray-500 space-y-1">
                  <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-red-500 inline-block"></span> Cut line (red)</div>
                  <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 inline-block" style={{backgroundColor:"#00AA00"}}></span> Crease line (green)</div>
                </div>
              </div>
            </div>
          )}
    {showMarkPanel && (
  <div className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-xl border w-72 max-h-[80vh] overflow-hidden flex flex-col" style={{fontFamily:"Inter, system-ui, sans-serif"}}>
    <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
      <span className="text-[11px] font-semibold text-gray-700 tracking-wide">FINISHING MARKS</span>
      <button onClick={() => setShowMarkPanel(false)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 text-xs">✕</button>
    </div>

    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {/* Status */}
      {(() => {
        const c = fcRef.current;
        const obj = c?.getActiveObject();
        const hasMark = obj && (obj as any)._markType;
        return (
          <div className={`p-2 rounded-md text-[10px] ${obj ? (hasMark ? "bg-green-50 text-green-700 border border-green-200" : "bg-blue-50 text-blue-700 border border-blue-200") : "bg-orange-50 text-orange-600 border border-orange-200"}`}>
            {!obj ? "Select an object on canvas first" : hasMark ? `Marked as: ${(obj as any)._markType?.toUpperCase()} — ${(obj as any)._markMemo || ""}` : `Selected: ${obj.type || "object"} — ready to mark`}
          </div>
        );
      })()}

      {/* Swatch Name */}
      <div>
        <label className="text-[10px] text-gray-500 font-medium block mb-1">Swatch Name</label>
        <input type="text" value={customMarkName} onChange={e => setCustomMarkName(e.target.value)}
          placeholder="e.g., Foil Gold, Spot UV, Emboss Logo..."
          className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-[11px] focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all" />
      </div>

      {/* Finishing Type */}
      <div>
        <label className="text-[10px] text-gray-500 font-medium block mb-1">Finishing Type</label>
        <select value={markMode} onChange={e => setMarkMode(e.target.value as any)}
          className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-[11px] bg-white focus:border-blue-400 outline-none">
          <option value="spot">Spot Color</option>
          <option value="foil">Foil Stamping</option>
          <option value="emboss">Embossing</option>
          <option value="silk">Silk Screen</option>
          <option value="uv">UV Coating</option>
          <option value="varnish">Varnish</option>
          <option value="diecut">Die Cut</option>
          <option value="laser">Laser Engrave</option>
          <option value="whiteink">White Ink</option>
          <option value="custom">Other (Custom)</option>
        </select>
      </div>
            {/* Spot Color Picker */}
      <div>
        <label className="text-[10px] text-gray-500 font-medium block mb-1">Color</label>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-md border border-gray-200 shadow-inner flex-shrink-0"
            style={{backgroundColor: cmykToHex(...customMarkCmyk)}} />
          <div className="flex-1">
            <div className="text-[10px] text-gray-700 font-medium">{customMarkName || "Select a color"}</div>
            <div className="text-[8px] text-gray-400 font-mono">C{customMarkCmyk[0]} M{customMarkCmyk[1]} Y{customMarkCmyk[2]} K{customMarkCmyk[3]}</div>
          </div>
        </div>
        {/* Search */}
        <input value={spotSearch} onChange={e => setSpotSearch(e.target.value)}
          placeholder="Search spot color..."
          className="w-full border border-gray-200 rounded-md px-2 py-1 text-[10px] focus:border-blue-400 outline-none mb-1.5" />
        {/* Category chips */}
        <div className="flex gap-1 flex-wrap mb-1.5">
          {["All","Red","Orange","Yellow","Green","Blue","Purple","Pink","Brown","Neutral","Metallic","Pastel"].map(cat => (
            <button key={cat} onClick={() => setSpotCategory(cat)}
              className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium transition-all ${spotCategory === cat ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {cat}
            </button>
          ))}
        </div>
        {/* Color grid */}
        <div className="max-h-48 overflow-y-auto rounded-md border border-gray-100 p-1">
          <div className="grid grid-cols-8 gap-0.5">
            {PACKIVE_SPOT_COLORS.filter((c: any) => {
              const catMatch = spotCategory === "All" || c.category === spotCategory;
              if (!spotSearch) return catMatch;
              const q = spotSearch.toLowerCase();
              return catMatch && (c.name?.toLowerCase().includes(q) || c.hex?.toLowerCase().includes(q) || c.id?.toLowerCase?.().includes(q));
            }).map((c: any) => (
              <button key={c.id || c.name} onClick={() => {
                const cmyk = c.cmyk || hexToCmyk(c.hex || "#000000");
                setCustomMarkCmyk(cmyk as [number,number,number,number]);
                if (!customMarkName.trim()) setCustomMarkName(c.name || "Spot Color");
              }}
                title={`${c.name}\nC${(c.cmyk||[0,0,0,0])[0]} M${(c.cmyk||[0,0,0,0])[1]} Y${(c.cmyk||[0,0,0,0])[2]} K${(c.cmyk||[0,0,0,0])[3]}`}
                className={`w-6 h-6 rounded-sm border transition-all hover:scale-125 hover:z-10 hover:shadow-md ${
                  cmykToHex(...customMarkCmyk) === (c.hex || cmykToHex(...(c.cmyk || [0,0,0,0])))
                  ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-200"
                }`}
                style={{backgroundColor: c.hex || cmykToHex(...(c.cmyk || [0,0,0,0]))}} />
            ))}
          </div>
        </div>
      </div>

     
      {/* Quick Presets */}
      <div>
        <label className="text-[10px] text-gray-500 font-medium block mb-1">Quick Presets</label>
        <div className="flex flex-wrap gap-1">
          {([
            {n:"Gold Foil",t:"foil",c:[0,20,80,15] as [number,number,number,number]},
            {n:"Silver Foil",t:"foil",c:[0,0,0,25] as [number,number,number,number]},
            {n:"Spot UV",t:"uv",c:[80,0,20,0] as [number,number,number,number]},
            {n:"Emboss",t:"emboss",c:[0,0,0,40] as [number,number,number,number]},
            {n:"White Ink",t:"whiteink",c:[0,0,0,0] as [number,number,number,number]},
            {n:"Red Spot",t:"spot",c:[0,100,100,0] as [number,number,number,number]},
          ]).map(p => (
            <button key={p.n} onClick={() => { setCustomMarkName(p.n); setMarkMode(p.t as any); setCustomMarkCmyk(p.c); }}
              className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-[9px] text-gray-600">
              <span className="w-3 h-3 rounded-full border border-gray-300 inline-block flex-shrink-0" style={{backgroundColor: cmykToHex(...p.c)}} />
              {p.n}
            </button>
          ))}
        </div>
      </div>

      {/* Apply Mark to Selected Object */}
      <button onClick={() => {
        const c = fcRef.current; if (!c) return;
        const obj = c.getActiveObject(); if (!obj) { alert("Select an object on canvas first"); return; }
        const name = customMarkName.trim(); if (!name) { alert("Enter a swatch name"); return; }
        const hex = cmykToHex(...customMarkCmyk);
        (obj as any)._markType = markMode;
        (obj as any)._markMemo = name;
        (obj as any)._markCmyk = [...customMarkCmyk];
        (obj as any)._markHex = hex;
        obj.set({ opacity: 0.85 });
        c.requestRenderAll();
        if (typeof refreshLayers === "function") refreshLayers();
        if (typeof pushHistory === "function") pushHistory();
           setSelProps((prev: any) => prev ? { ...prev, _markType: '', _markMemo: '', _markCmyk: null } : prev);
        const updated = [...savedCustomMarks.filter(s => s.name !== name), {name, cmyk: [...customMarkCmyk] as [number,number,number,number]}];
        setSavedCustomMarks(updated);
        try { localStorage.setItem("packive_custom_marks", JSON.stringify(updated)); } catch {}
               setSelProps((prev: any) => prev ? { ...prev, _markType: markMode, _markMemo: name, _markCmyk: [...customMarkCmyk] } : prev);
        setShowMarkPanel(false);
      }} className="w-full py-2 bg-gray-800 text-white rounded-md text-[11px] font-medium hover:bg-gray-900 transition-colors">
        Apply Mark to Selected Object
      </button>

      {/* Remove Mark */}
      <button onClick={() => {
        const c = fcRef.current; if (!c) return;
        const obj = c.getActiveObject(); if (!obj) { alert("Select an object first"); return; }
        delete (obj as any)._markType;
        delete (obj as any)._markMemo;
        delete (obj as any)._markCmyk;
        delete (obj as any)._markHex;
        obj.set({ opacity: 1 });
        c.requestRenderAll();
        if (typeof refreshLayers === "function") refreshLayers();
                if (typeof pushHistory === "function") pushHistory();
        setSelProps((prev: any) => prev ? { ...prev, _markType: '', _markMemo: '', _markCmyk: null } : prev);
      }} className="w-full py-1.5 border
 border-gray-200 text-gray-500 rounded-md text-[10px] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
        Remove Mark from Selected
      </button>
    </div>

    {/* Saved Swatches */}
    {savedCustomMarks.length > 0 && (
      <div className="border-t bg-gray-50 px-3 py-2">
        <div className="text-[9px] text-gray-400 font-medium mb-1.5">SAVED SWATCHES</div>
        <div className="space-y-0.5 max-h-28 overflow-y-auto">
          {savedCustomMarks.map((sm, idx) => {
            const smHex = cmykToHex(...sm.cmyk);
            return (
              <div key={idx} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white transition-colors group">
                <span className="w-4 h-4 rounded-sm border border-gray-200 flex-shrink-0" style={{backgroundColor: smHex}} />
                <span className="flex-1 text-[10px] text-gray-700 truncate">{sm.name}</span>
                <span className="text-[8px] text-gray-400 font-mono">C{sm.cmyk[0]}M{sm.cmyk[1]}Y{sm.cmyk[2]}K{sm.cmyk[3]}</span>
                <button onClick={() => { setCustomMarkName(sm.name); setCustomMarkCmyk([...sm.cmyk]); }}
                  className="text-[8px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Use</button>
                <button onClick={() => {
                  const next = savedCustomMarks.filter((_,j) => j !== idx);
                  setSavedCustomMarks(next);
                  try { localStorage.setItem("packive_custom_marks", JSON.stringify(next)); } catch {}
                }} className="text-[8px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
)}


          {/* Table Popup */}
          {showTablePanel && (
            <div className="absolute left-14 top-8 z-50 bg-white rounded-xl shadow-2xl border p-4 w-60">
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















































              {showDielinePanel && (
                <div className="absolute left-16 top-0 w-[400px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-[90vh] flex flex-col">
                  {/* Header */}
                  <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 tracking-tight">Box Structure</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Choose a box type, then enter dimensions</p>
                      </div>
                      <button onClick={() => setShowDielinePanel(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                    {/* Clean dropdown */}
                    <select
                      value={boxCategoryFilter}
                      onChange={(e) => setBoxCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer appearance-none"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%236B7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                      <option value="all">All Types</option>
                      <optgroup label="FEFCO">
                        {BOX_CATEGORIES.filter(c => c.standard === 'FEFCO').map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name} · {cat.description}</option>
                        ))}
                      </optgroup>
                      <optgroup label="ECMA">
                        {BOX_CATEGORIES.filter(c => c.standard === 'ECMA').map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name} · {cat.description}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Template grid */}
                  <div className="p-4 overflow-y-auto flex-1">
                    {(() => {
                      const templates = getTemplatesByCategory(boxCategoryFilter);
                      if (templates.length === 0) {
                        return (
                          <div className="text-center py-16 text-gray-400">
                            <div className="text-4xl mb-3 opacity-30">📦</div>
                            <p className="text-sm font-medium">No templates yet</p>
                            <p className="text-xs mt-1 text-gray-300">Coming soon</p>
                          </div>
                        );
                      }
                      const fefcoItems = templates.filter(t => { const cat = BOX_CATEGORIES.find(c => c.id === t.category); return cat && cat.standard === 'FEFCO'; });
                      const ecmaItems = templates.filter(t => { const cat = BOX_CATEGORIES.find(c => c.id === t.category); return cat && cat.standard === 'ECMA'; });

                      const groupBySeries = (items: typeof templates, standard: string) => {
                        const groups: Record<string, typeof templates> = {};
                        items.forEach(t => {
                          let series = '';
                          if (standard === 'FEFCO') {
                            const m = t.code.match(/FEFCO\s*(\d{2})/);
                            series = m ? m[1] + '00' : 'Other';
                          } else {
                            const m = t.code.match(/ECMA\s*([A-Z])\d/);
                            series = m ? m[1] : 'Other';
                          }
                          if (!groups[series]) groups[series] = [];
                          groups[series].push(t);
                        });
                        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
                      };

                      const seriesLabel: Record<string, string> = {
                        '0200': 'Slotted-type Boxes',
                        '0300': 'Telescope-style Boxes',
                        '0400': 'Folder & Tray-type',
                        '0500': 'Slide-type Boxes',
                        '0600': 'Rigid Boxes',
                        '0700': 'Ready-glued Boxes',
                        'A': 'Cartons (Rectangular)',
                        'B': 'Trays & Lids',
                      };

                      const renderCard = (t: DielineTemplate) => (
                        <button key={t.id} onClick={() => {
                          setSelectedBoxCode(t.code);
                          setSelectedBoxName(t.name);
                          setIsEcma(t.code.startsWith('ECMA'));
                          if (t.code.startsWith('ECMA')) { setThickness(0.4); } else { setThickness(FLUTE_MAP[fluteType]?.thickness ?? 4.0); }
                          setShowDimModal(true);
                          setShowDielinePanel(false);
                        }}
                        className="group relative flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white hover:bg-gradient-to-b hover:from-blue-50/40 hover:to-white cursor-pointer"
                        title={`${t.name} - ${t.code}`}
                        >
                          {t.supports3d && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-md shadow-sm leading-none">3D</span>
                          )}
                          <div className="absolute top-1.5 left-1.5 flex gap-[2px]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className={`w-[4px] h-[4px] rounded-full ${i < t.popularity ? 'bg-amber-400' : 'bg-gray-200'}`} />
                            ))}
                          </div>
                          {/* 3D + SVG preview */}
                          <div className="w-full aspect-[4/3] flex items-center justify-center mb-3 rounded-lg bg-gray-50/50 group-hover:bg-white transition-colors overflow-hidden">
                            {t.box3dPath ? (
                              <img src={t.box3dPath} alt={t.name} className="w-[92%] h-[92%] object-contain drop-shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; const next = (e.target as HTMLImageElement).nextElementSibling; if(next) (next as HTMLElement).style.display = 'flex'; }} />
                            ) : null}
                            {t.svgPath ? (
                              <img src={t.svgPath} alt={t.name} style={{display: t.box3dPath ? "none" : undefined}} className="w-[90%] h-[90%] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; const sib = (e.target as HTMLImageElement).nextElementSibling; if(sib) (sib as HTMLElement).style.display = 'flex'; }} />
                            ) : null}
                            <div className={`flex items-center justify-center w-full h-full ${(t.svgPath || t.box3dPath) ? 'hidden' : ''}`} dangerouslySetInnerHTML={{ __html: t.iconSvg }} />
                          </div>
                          <div className="w-full text-center space-y-0.5 mt-1">
                            <div className="text-[12px] font-bold text-gray-800 group-hover:text-blue-700 leading-snug line-clamp-2 px-0.5">{t.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{t.code}</div>
                            {t.description && <div className="text-[9px] text-gray-400 leading-snug line-clamp-2 px-0.5 mt-0.5">{t.description}</div>}
                          </div>
                        </button>
                      );

                      const renderGroup = (items: typeof templates, standard: string, color: string) => {
                        const groups = groupBySeries(items, standard);
                        return groups.map(([series, tpls]) => (
                          <div key={series} className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${color === 'blue' ? 'via-blue-200' : 'via-emerald-200'} to-transparent`}></div>
                              <span className={`text-[10px] font-bold ${color === 'blue' ? 'text-blue-500' : 'text-emerald-500'} uppercase tracking-wider`}>{standard} {series}</span>
                              <span className="text-[9px] text-gray-400 font-medium">{seriesLabel[series] || ''}</span>
                              <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${color === 'blue' ? 'via-blue-200' : 'via-emerald-200'} to-transparent`}></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">{tpls.map(renderCard)}</div>
                          </div>
                        ));
                      };

                      return (
                        <div className="space-y-2">
                          {fefcoItems.length > 0 && renderGroup(fefcoItems, 'FEFCO', 'blue')}
                          {ecmaItems.length > 0 && renderGroup(ecmaItems, 'ECMA', 'emerald')}
                          <div className="text-center py-3 text-[9px] text-gray-300">
                            {templates.length} box types available
                          </div>
                        </div>
                      );
                    })()}

                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <p className="text-[10px] text-gray-400 text-center">
                      {DIELINE_TEMPLATES.length} box types available · DXF upload coming in Phase 3
                    </p>
                  </div>
                </div>
              )}

              {/* Dimension Input Modal */}
              {showDimModal && (
                <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center" onClick={() => setShowDimModal(false)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900">{selectedBoxCode}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 font-medium">{(() => { const tpl = getTemplateByCode(selectedBoxCode); return tpl?.name || selectedBoxName; })()}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{selectedBoxName}</p>
                    </div>

                    <div className="px-6 py-4 space-y-5">
                      {/* === Section 1: Dimensions === */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                          </div>
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Dimensions - Internal (mm)</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase">Length</label>
                            <input type="number" value={dimLength} onChange={(e) => setDimLength(Number(e.target.value))}
                              min={10} max={2000} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-center text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase">Width</label>
                            <input type="number" value={dimWidth} onChange={(e) => setDimWidth(Number(e.target.value))}
                              min={10} max={2000} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-center text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase">{isEcma ? 'Depth' : 'Height'}</label>
                            <input type="number" value={dimHeight} onChange={(e) => setDimHeight(Number(e.target.value))}
                              min={10} max={2000} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-center text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
                          </div>
                        </div>
                      </div>

                      {/* === Section 2: Flute / Thickness === */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5"><path d="M4 19h16M4 15h16M4 11h16M4 7h16"/></svg>
                          </div>
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            {isEcma ? 'Board Thickness' : 'Flute Type & Thickness'}
                          </span>
                        </div>

                        {!isEcma ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(FLUTE_MAP).map(([key, val]) => (
                                <button key={key} onClick={() => setFluteType(key)}
                                  className={`text-left px-3 py-2 rounded-lg border transition text-xs ${
                                    fluteType === key
                                      ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                                      : 'border-gray-200 hover:border-gray-300 bg-white'
                                  }`}>
                                  <div className="font-semibold text-gray-800">{val.label}</div>
                                  <div className="text-gray-400 mt-0.5">{val.thickness} mm · {val.desc}</div>
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2 px-1">
                              <span className="text-xs text-gray-500">Thickness:</span>
                              <span className="text-sm font-bold text-amber-700">{thickness} mm</span>
                              <span className="text-[10px] text-gray-400">(auto from flute type)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-1.5">
                              {ECMA_THICKNESS.map((t) => (
                                <button key={t.value} onClick={() => setThickness(t.value)}
                                  className={`text-left px-3 py-2 rounded-lg border transition text-xs ${
                                    thickness === t.value
                                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                      : 'border-gray-200 hover:border-gray-300 bg-white'
                                  }`}>
                                  <span className="font-semibold text-gray-800">{t.label}</span>
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2 px-1">
                              <span className="text-xs text-gray-500">Thickness:</span>
                              <span className="text-sm font-bold text-blue-700">{thickness} mm</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* === Summary Bar === */}
                      <div className="bg-gray-50 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                          <span className="font-mono">{dimLength} × {dimWidth} × {dimHeight} mm</span>
                          <span className="text-gray-300">|</span>
                          <span>{isEcma ? `Board ${thickness}mm` : `${fluteType} flute · ${thickness}mm`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                      <button onClick={() => setShowDimModal(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition">
                        Cancel
                      </button>
                      <button
                              onClick={async () => {
                   
        try {
                   
          // Convert box code to EasyPackMaker model name (use epmModel from template if available)
          const selectedTemplate = getTemplateByCode(selectedBoxCode);
          const modelName = selectedTemplate?.epmModel || selectedBoxCode
            .replace(/^FEFCO\s+/i, 'fefco_')
            .replace(/^ECMA\s+/i, '')
            .replace(/\./g, '_');
                   
          // Show loading state
          const btn = document.activeElement as HTMLButtonElement;
          const origText = btn?.textContent || '';
          if (btn) { btn.textContent = 'Generating...'; btn.disabled = true; }
                   
          // Call EasyPackMaker API via our Next.js route
          const apiRes = await fetch('/api/dieline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              modelName,
              epmModel: selectedTemplate?.epmModel || modelName,
              length: dimLength,
              width: dimWidth,
              depth: dimHeight,
              thickness: thickness,
              units: 'mm',
              ...(selectedTemplate?.needsH ? { height: Math.round(dimHeight * 0.4) } : {}),
              ...(selectedTemplate?.needsLid ? { options: { Lid: true } } : {}),
            }),
          });
          const data = await apiRes.json();
          if (data.sizes) {
            let sz = data.sizes;
            if (sz["1"] && !sz.PageW) {
              const parts = Object.keys(sz).filter(k => /^\d+$/.test(k)).map(k => sz[k]);
              const main = parts.reduce((a:any,b:any) => (b.PageW*b.PageH > a.PageW*a.PageH ? b : a), parts[0]);
              const totalCut = parts.reduce((s:number,p:any) => s + (p.Cut||0), 0);
              const totalCrease = parts.reduce((s:number,p:any) => s + (p.Crease||0), 0);
              const totalLen = parts.reduce((s:number,p:any) => s + (p.Total||0), 0);
              const totalArea = parts.reduce((s:number,p:any) => s + parseFloat(String(p.Area||"0").replace(/ m.*/, "")), 0);
              sz = { Units: main.Units||"mm", PageW: main.PageW, PageH: main.PageH, Cut: totalCut, Crease: totalCrease, Total: totalLen, Area: totalArea.toFixed(5)+" m\u00B2", _parts: parts, _multiPart: true };
            }
            svgMmWRef.current = sz.PageW || 0;
            svgMmHRef.current = sz.PageH || 0;
            setDielineSizes(sz);
            setDielineModelInfo(selectedTemplate?.code || selectedBoxCode || "");
            setDielineDims({ L: dimLength, W: dimWidth, D: dimHeight, Th: thickness });
          }
          if (btn) { btn.textContent = origText; btn.disabled = false; }
                   
          if (!apiRes.ok || !data.success) {
            alert(data.error || 'Failed to generate dieline');
            return;
          }
                   
          // Load SVG into Fabric.js canvas
          const c = fcRef.current; if (!c) return;
                   
          const existing = c.getObjects().filter((o: any) => o._isDieline);
          existing.forEach((o: any) => c.remove(o));
                   
            const { objects: objs } = await fabricModRef.current.loadSVGFromString(data.svg);
            if (!objs || objs.length === 0) { alert('Failed to parse SVG dieline'); return; }



            objs.forEach((obj: any) => {
              const t = obj.type || "";
              const isText = (t === "text" || t === "i-text" || t === "textbox");
              const isThinPath = (t === "path" || t === "line" || t === "polyline") && (obj.strokeWidth || 1) < 1.0;
              const isSmallPoly = (t === "polygon") && ((obj.width || 0) < 12 && (obj.height || 0) < 12);
              if (isText || isThinPath || isSmallPoly) {

              } else {

              }
            });

            const group = fabricModRef.current.util.groupSVGElements(objs);

          (group as any)._isDieline = true;

            // Tag info children inside the group
            if (group._objects) {
              group._objects.forEach((child: any) => {
                const ct = (child.type || "").toLowerCase();
                const isText = (ct === "text" || ct === "i-text" || ct === "textbox");
                const isThinPath = (ct === "path" || ct === "line" || ct === "polyline") && !/(237,\s*28,\s*36|ed1c24|0,\s*166,\s*80|00a650)/i.test(child.stroke || "");
                const isSmallPoly = (ct === "polygon") && ((child.width || 0) < 15 && (child.height || 0) < 15);
                if (isText || isThinPath || isSmallPoly) {
                  child._isDielineInfo = true;
                }
              });
              const infoCount = group._objects.filter((ch: any) => ch._isDielineInfo).length;
              console.log("[Dieline-EPM] Tagged " + infoCount + " info children inside group");
            }
          (group as any)._isDieLine = true;
          group.name = "__dieline_upload__";
                   
          // Inkscape converts PDF (pt) to SVG (px) at 96/72 = 1.3333 ratio
          // PDF 1pt = 1/72 inch = 25.4/72 mm = 0.352778 mm
          // Inkscape SVG 1px = 1/96 inch = 25.4/96 mm = 0.264583 mm
          // So: svgPx * (25.4/96) = mm, OR equivalently svgPx * (72/96) = pt, pt * (25.4/72) = mm
          // The exact conversion: 1 svgPx = 25.4/96 mm = 0.26458333... mm
          //
          // However Inkscape may crop/adjust the viewBox slightly.
          // Best approach: parse the SVG viewBox and use the PDF MediaBox for exact mapping.
          
          const svgPxW = group.width || 500;
          const svgPxH = group.height || 500;
          
          // Extract viewBox from SVG string for precise dimensions
          const vbMatch = data.svg?.match(/viewBox="([^"]+)"/);
          const vbParts = vbMatch ? vbMatch[1].split(/\s+/).map(Number) : [0, 0, svgPxW, svgPxH];
          const viewBoxW = vbParts[2] || svgPxW;
          const viewBoxH = vbParts[3] || svgPxH;
          
          // PDF MediaBox in points (from API response or fallback calculation)
          // Inkscape scales PDF pt -> SVG px at exactly 96/72 = 4/3
          // So: PDF pt = SVG px * (72/96) = SVG px * 0.75
          // And: mm = PDF pt * (25.4/72) = SVG px * 0.75 * (25.4/72) = SVG px * (25.4/96)
          // 
          // Use exact fraction to avoid floating point drift:
          const svgMmW = viewBoxW * 25.4 / 96;
          const svgMmH = viewBoxH * 25.4 / 96;
          
          // scaleXRef = canvas px per mm
          const sX = scaleXRef.current;
          const sY = scaleYRef?.current || sX;
          
          // Exact scale: mm * canvasPxPerMm / svgPx
          const exactScaleX = sX * 25.4 / 96;
          const exactScaleY = sY * 25.4 / 96;
          
          console.log(`[Dieline] viewBox=${viewBoxW.toFixed(1)}x${viewBoxH.toFixed(1)}, svgMm=${svgMmW.toFixed(2)}x${svgMmH.toFixed(2)}mm, scale=${exactScaleX.toFixed(6)}, sX=${sX.toFixed(3)}`);
          svgMmWRef.current = svgMmW;
          svgMmHRef.current = svgMmH;
          

          // Auto-fit: scale down zoom if dieline is larger than canvas
          const neededW = viewBoxW * exactScaleX + 80;
          const neededH = viewBoxH * exactScaleY + 80;
          const cW = c.getWidth();
          const cH = c.getHeight();
          let autoZoom = 100;
          if (neededW > cW || neededH > cH) {
            const fitZw = cW / neededW; const fitZh = cH / neededH;
            autoZoom = Math.floor(Math.min(fitZw, fitZh) * 100);
            autoZoom = Math.max(25, autoZoom);
            console.log('[Dieline] Auto-fit zoom:', autoZoom, '%', 'needed:', neededW.toFixed(0), 'x', neededH.toFixed(0), 'canvas:', cW, 'x', cH);
          }
          
          const finalCW = c.getWidth();
          const finalCH = c.getHeight();
          
          console.log(`[Dieline] Exact mm scale: ${svgMmW.toFixed(1)}x${svgMmH.toFixed(1)}mm, scaleX=${exactScaleX.toFixed(4)}, sX=${sX.toFixed(3)}`);
          
          group.set({ scaleX: exactScaleX, scaleY: exactScaleY, left: finalCW / 2, top: finalCH / 2, selectable: false, evented: false });

                    if (autoZoom < 100) {
            const z = autoZoom / 100;
            const vpt = c.viewportTransform || [1,0,0,1,0,0];
            vpt[0] = z; vpt[3] = z;
            // Center the dieline in viewport
            const objCenterX = finalCW / 2;
            const objCenterY = finalCH / 2;
            vpt[4] = cW / 2 - objCenterX * z;
            vpt[5] = cH / 2 - objCenterY * z;
            c.setViewportTransform(vpt);
            c.requestRenderAll();
          }

                            

            c.add(group);
                        c.requestRenderAll();

                        // -- Panel Map Data after Generate (Phase 5-1) --
                        {
                          let _gBox = selectedBoxCode;
                          if (_gBox) _gBox = _gBox.replace(/^(FEFCO|ECMA)\s+/i, (m: string, p1: string) => p1 + String.fromCharCode(45));
                          if (dimLength > 0 && dimWidth > 0 && dimHeight > 0 && _gBox) {
                            const pm = generatePanelMap(_gBox, dimLength, dimWidth, dimHeight, svgMmWRef.current, svgMmHRef.current);
                            if (pm) { setPanelMapData(pm); console.log("[PanelMap-Gen]", pm.panels.length, "panels"); }
                          }
                        }

                        setShowDimModal(false);
                          } catch(err) { console.error('Generate error:', err); alert('Failed to generate dieline'); }
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-200">
                        Generate Dieline
                      </button>
                    </div>
                  </div>
                </div>
              )}



          {/* ═══ CANVAS AREA ═══ */}
          <div ref={wrapperRef} onScroll={(e) => { const t=e.target as HTMLDivElement; setRulerScroll({left:t.scrollLeft,top:t.scrollTop}); }} onMouseMove={(e) => { setMousePos({x:e.clientX,y:e.clientY}); }} onMouseLeave={() => setMousePos({x:-100,y:-100})} className="flex-1 overflow-auto bg-gray-100 relative pb-1"
            style={{ paddingLeft: showRuler ? RULER_THICK : 0, paddingTop: showRuler ? RULER_THICK : 0, cursor: measureMode ? "crosshair" : drawMode ? "crosshair" : "default" }}>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              {/* Rulers - conditional */}
              {/* Rulers */}
              <div style={{visibility: showRuler ? "visible" : "hidden"}}><RulerCorner unit={rulerUnit} onToggle={() => setRulerUnit(u => u === "mm" ? "inch" : "mm")}  /></div>
              <div style={{visibility: showRuler ? "visible" : "hidden"}}><Ruler direction="horizontal" canvasWidth={fcRef.current?.getWidth() || 800} canvasHeight={fcRef.current?.getHeight() || 600}
                scale={scaleXRef.current} zoom={zoom} scrollLeft={rulerScroll.left} scrollTop={rulerScroll.top}
                pad={0} unit={rulerUnit} onGuideCreate={addGuide}  /></div>
              <div style={{visibility: showRuler ? "visible" : "hidden"}}><Ruler direction="vertical" canvasWidth={fcRef.current?.getWidth() || 800} canvasHeight={fcRef.current?.getHeight() || 600}
                scale={scaleYRef.current} zoom={zoom} scrollLeft={rulerScroll.left} scrollTop={rulerScroll.top}
                pad={0} unit={rulerUnit} onGuideCreate={addGuide}  /></div>



              {/* Measure crosshair overlay - always mounted, visibility toggled */}
              <div
                style={{
                  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                  pointerEvents: "none", zIndex: 9999,
                  visibility: measureMode && mousePos.x >= 0 ? "visible" : "hidden",
                }}
              >
                <div style={{ position: "absolute", left: 0, top: mousePos.y, width: "100%", height: "1px", background: "rgba(0,150,255,0.5)" }} />
                <div style={{ position: "absolute", top: 0, left: mousePos.x, width: "1px", height: "100%", background: "rgba(0,150,255,0.5)" }} />
              </div>
            <div id='canvas-centering-wrapper'>
            <div style={{position:'relative',display:'inline-block'}}>
              <canvas ref={canvasElRef} className="shadow-lg" style={{border:"1px solid #e0e0e0"}} />
              {dielineInfoVisible && dielineVisible && dielineSizes && (
                <div style={{position:"fixed",bottom:40,left:95,background:"rgba(255,255,255,0.95)",border:"1px solid #ddd",borderRadius:6,padding:"10px 14px",fontSize:12,fontFamily:"monospace",lineHeight:"1.6",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",zIndex:50,maxWidth:360}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:8,color:"#333",borderBottom:"1px solid #eee",paddingBottom:6}}>{dielineModelInfo}{(dielineSizes as any)._multiPart ? " (Multi-part)" : ""}</div>
                  {(dielineSizes as any)._multiPart && (dielineSizes as any)._parts ? (
                    <>
                      {(dielineSizes as any)._parts.map((p: any, i: number) => (
                        <div key={i} style={{marginBottom:6,padding:"4px 0",borderBottom:i < (dielineSizes as any)._parts.length-1 ? "1px dashed #eee" : "none"}}>
                          <div style={{fontWeight:600,color:"#444",fontSize:11}}>{p.Text || ("Part "+(i+1))}: {p.PageW} x {p.PageH} mm</div>
                          <div style={{color:"#666",fontSize:10}}>S = {p.Area} | Cut: {p.Cut} | Crease: {p.Crease} | Total: {p.Total}</div>
                        </div>
                      ))}
                      <div style={{color:"#555",marginTop:4,fontWeight:600,fontSize:11}}>Combined: S = {dielineSizes.Area}</div>
                    </>
                  ) : (
                    <>
                      <div style={{color:"#555",marginBottom:2}}>Sizes: {dielineSizes.PageW} x {dielineSizes.PageH} mm</div>
                      <div style={{color:"#555",marginBottom:2}}>S = {dielineSizes.Area}</div>
                      <div style={{color:"#555",marginBottom:8}}>Paper utilization: {dielineSizes.PageW && dielineSizes.PageH && dielineSizes.Area ? ((parseFloat(String(dielineSizes.Area)) / (dielineSizes.PageW * dielineSizes.PageH / 1000000) * 100).toFixed(2) + "%") : "-"}</div>
                    </>
                  )}
                  {dielineDims && (
                    <div style={{color:"#666",marginBottom:2,fontSize:11}}>{dielineModelInfo}, L={dielineDims.L}, W={dielineDims.W}, D={dielineDims.D}, Th={dielineDims.Th}</div>
                  )}
                  {dielineDims && (
                    <div style={{color:"#666",marginBottom:8,fontSize:11}}>Material thickness = {dielineDims.Th?.toFixed(2)} mm</div>
                  )}
                  <div style={{marginTop:4}}>
                    <span style={{color:"#ed1c24",fontWeight:600}}>Cut: {dielineSizes.Cut?.toFixed(0)} mm</span>
                    {" \u00B7 "}
                    <span style={{color:"#00a650",fontWeight:600}}>Crease: {dielineSizes.Crease?.toFixed(0)} mm</span>
                  </div>
                  <div style={{color:"#888"}}>Total: {dielineSizes.Total?.toFixed(0)} mm</div>
                </div>
              )}
              {/* Snap guide lines overlay - canvas-local coords */}
              {snapEnabled && snapLines.length > 0 && fcRef.current && (
                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: fcRef.current.getWidth(),
                    height: fcRef.current.getHeight(),
                    pointerEvents: "none",
                    zIndex: 50,
                  }}
                >
                  {snapLines.map((sl, idx) => {
                    const vpt = fcRef.current!.viewportTransform || [1,0,0,1,0,0];
                    const z = vpt[0] || 1;
                    const px = vpt[4] || 0;
                    const py = vpt[5] || 0;
                    const screenPos = sl.type === "v" ? sl.pos * z + px : sl.pos * z + py;
                    const w = fcRef.current!.getWidth();
                    const h = fcRef.current!.getHeight();
                    return sl.type === "v"
                      ? <line key={idx} x1={screenPos} y1={0} x2={screenPos} y2={h} stroke="#3b82f6" strokeWidth={1} strokeDasharray="6 4" opacity={0.9} />
                      : <line key={idx} x1={0} y1={screenPos} x2={w} y2={screenPos} stroke="#3b82f6" strokeWidth={1} strokeDasharray="6 4" opacity={0.9} />;
                  })}
                </svg>
              )}
            </div>
            </div>
              {/* Status bar */}
              <div className="absolute bottom-0 left-0 right-0 h-7 bg-[#2c2c2c] border-t border-[#1a1a1a] flex items-center px-3 gap-3 text-[10px] text-[#888] font-mono select-none">
                {measureMode && <span className="text-[#4fc3f7] font-medium">{measureResult || "Click first point..."}</span>}
                {measureMode && measurePts.length <= 1 && <span className="text-gray-400 text-[10px] ml-1">(Shift = H/V snap)</span>}
                {measureMode && <span className="border-l border-[#444] h-3" />}
                <span>Net: {(svgMmWRef.current > 0 ? svgMmWRef.current : totalW).toFixed(2)} x {(svgMmHRef.current > 0 ? svgMmHRef.current : totalH).toFixed(2)} mm</span>
                <span>Zoom: {zoom}%</span>
                <span className="mx-1 text-gray-300">|</span>
                <button onClick={() => { setSnapEnabled(p => { if(p) setSnapLines([]); return !p; }); }} className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${snapEnabled ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:text-gray-600"}`}>
                  {snapEnabled ? "Snap ON" : "Snap OFF"}
                </button>
                                <button onClick={() => {
                  const cv = fcRef.current;
                  if (!cv || !dielineDims) { alert('Please load a dieline first.'); return; }
                  const g = cv.getObjects().find((o: any) => o._isDieLine || o._isDieline);
                  if (!g) { alert('No dieline found.'); return; }
                  const origVisible = g.visible;
                  g.visible = false;
                  cv.requestRenderAll();
                  setTimeout(() => {
                    try {
                      const gs = g.scaleX || 1;
                      const gW = g.width * gs;
                      const gH = g.height * gs;
                      const gLeft = g.originX === 'center' ? g.left - gW / 2 : g.left;
                      const gTop = g.originY === 'center' ? g.top - gH / 2 : g.top;
                      const folds = (g._objects || []).filter((p: any) => p.type === 'path' && (p.stroke || '').includes('0,166,80'));
                      const vertFolds: number[] = [];
                      const horzFolds: number[] = [];
                      folds.forEach((p: any) => {
                        const b = p.getBoundingRect();
                        if (b.width < 5 && b.height > 50) vertFolds.push(b.left);
                        if (b.height < 5 && b.width > 50) horzFolds.push(b.top);
                      });
                      vertFolds.sort((a: number, b: number) => a - b);
                      horzFolds.sort((a: number, b: number) => a - b);

                      const topFoldY = horzFolds.length > 0 ? horzFolds[0] : gTop;
                      const botFoldY = horzFolds.length > 1 ? horzFolds[horzFolds.length - 1] : (gTop + gH);
                      const topEdge = gTop;
                      const botEdge = gTop + gH;

                      const faces: {face:string; dataUrl:string|null}[] = [];
                      const srcCanvas = cv.getElement() as HTMLCanvasElement;
                      const vp = cv.viewportTransform || [1,0,0,1,0,0];
                      const dpr = srcCanvas.width / cv.getWidth();

                      const cropFace = (x1: number, y1: number, x2: number, y2: number): string | null => {
                        if (x1 >= x2 || y1 >= y2) return null;
                        const sx = (x1 * vp[0] + vp[4]) * dpr;
                        const sy = (y1 * vp[3] + vp[5]) * dpr;
                        const sw = (x2 - x1) * vp[0] * dpr;
                        const sh = (y2 - y1) * vp[3] * dpr;
                        const tmp = document.createElement('canvas');
                        tmp.width = Math.round(sw);
                        tmp.height = Math.round(sh);
                        const ctx = tmp.getContext('2d');
                        if (!ctx) return null;
                        ctx.drawImage(srcCanvas, Math.round(sx), Math.round(sy), Math.round(sw), Math.round(sh), 0, 0, tmp.width, tmp.height);
                        return tmp.toDataURL('image/png');
                      };

                      if (vertFolds.length >= 3) {
                        // 4 main sides
                        const sideMap = [
                          { face: 'front', x1: vertFolds[0], x2: vertFolds[1] },
                          { face: 'right', x1: vertFolds[1], x2: vertFolds[2] },
                          { face: 'back',  x1: vertFolds[2], x2: vertFolds[3] || (gLeft + gW) },
                          { face: 'left',  x1: vertFolds[3] || vertFolds[2], x2: vertFolds[4] || (gLeft + gW) },
                        ];
                        sideMap.forEach(s => {
                          const url = cropFace(s.x1, topFoldY, s.x2, botFoldY);
                          if (url) faces.push({ face: s.face, dataUrl: url });
                        });

                        // Top face: front top-flap + back top-flap combined
                        const ftX1 = vertFolds[0], ftX2 = vertFolds[1];
                        const btX1 = vertFolds[2], btX2 = vertFolds[3] || (gLeft + gW);
                        const flapH = topFoldY - topEdge;
                        if (flapH > 2) {
                          const fw = Math.round((ftX2 - ftX1) * vp[0] * dpr);
                          const fh = Math.round(flapH * vp[3] * dpr);
                          const bw = Math.round((btX2 - btX1) * vp[0] * dpr);
                          const topCv = document.createElement('canvas');
                          const finalW = Math.max(fw, bw);
                          topCv.width = finalW;
                          topCv.height = fh * 2;
                          const tc = topCv.getContext('2d');
                          if (tc) {
                            // Front flap: draw at top
                            const fsx = (ftX1 * vp[0] + vp[4]) * dpr;
                            const fsy = (topEdge * vp[3] + vp[5]) * dpr;
                            tc.drawImage(srcCanvas, Math.round(fsx), Math.round(fsy), fw, fh, 0, 0, finalW, fh);
                            // Back flap: draw at bottom, rotated 180 degrees
                            const bsx = (btX1 * vp[0] + vp[4]) * dpr;
                            const bsy = (topEdge * vp[3] + vp[5]) * dpr;
                            tc.save();
                            tc.translate(finalW, fh * 2);
                            tc.scale(-1, -1);
                            tc.drawImage(srcCanvas, Math.round(bsx), Math.round(bsy), bw, fh, 0, 0, finalW, fh);
                            tc.restore();
                            faces.push({ face: 'top', dataUrl: topCv.toDataURL('image/png') });
                          }
                        }

                        // Bottom face: front bottom-flap + back bottom-flap combined
                        const bflapH = botEdge - botFoldY;
                        if (bflapH > 2) {
                          const fw = Math.round((ftX2 - ftX1) * vp[0] * dpr);
                          const fh = Math.round(bflapH * vp[3] * dpr);
                          const bw = Math.round((btX2 - btX1) * vp[0] * dpr);
                          const botCv = document.createElement('canvas');
                          const finalW = Math.max(fw, bw);
                          botCv.width = finalW;
                          botCv.height = fh * 2;
                          const bc = botCv.getContext('2d');
                          if (bc) {
                            // Front flap: draw at top
                            const fsx = (ftX1 * vp[0] + vp[4]) * dpr;
                            const fsy = (botFoldY * vp[3] + vp[5]) * dpr;
                            bc.drawImage(srcCanvas, Math.round(fsx), Math.round(fsy), fw, fh, 0, 0, finalW, fh);
                            // Back flap: draw at bottom, rotated 180 degrees
                            const bsx = (btX1 * vp[0] + vp[4]) * dpr;
                            const bsy = (botFoldY * vp[3] + vp[5]) * dpr;
                            bc.save();
                            bc.translate(finalW, fh * 2);
                            bc.scale(-1, -1);
                            bc.drawImage(srcCanvas, Math.round(bsx), Math.round(bsy), bw, fh, 0, 0, finalW, fh);
                            bc.restore();
                            faces.push({ face: 'bottom', dataUrl: botCv.toDataURL('image/png') });
                          }
                        }
                      }
                      setMockupFaces(faces);
                      setShow3DMockup(true);
                    } finally {
                      g.visible = origVisible;
                      cv.requestRenderAll();
                    }
                  }, 100);
                }} className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${dielineDims ? 'text-violet-500 hover:text-violet-700 hover:bg-violet-50' : 'text-gray-300 cursor-not-allowed'}`} disabled={!dielineDims}>
                  3D Mockup
                </button>
                            
                <button onClick={() => {
                  const cv = fcRef.current; if (!cv) return;
                  const result = runPreflight(cv, { scale: scaleRef.current });
                  setPreflightResult(result);
                  setShowPreflight(true);
                }} className="px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                  Pre-flight
                </button>
                <span>Objects: {layersList.length}</span>
                {selectedPanel && <span className="text-[#4fc3f7]">Panel: {selectedPanel}</span>}
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
              <button key={tab.id} onClick={() => { setRightTab(tab.id); }}
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
                    {/* ▶ Finishing Mark Info */}
{selProps._markType && (
  <div className="mb-2 p-2 rounded-lg border" style={{
    borderColor: selProps._markCmyk ? cmykToHex(...(selProps._markCmyk as [number,number,number,number])) + "80" : "#ddd",
    backgroundColor: selProps._markCmyk ? cmykToHex(...(selProps._markCmyk as [number,number,number,number])) + "12" : "#f9f9f9"
  }}>
    <div className="flex items-center gap-2 mb-1">
      <span className="w-4 h-4 rounded-sm border flex-shrink-0" style={{
        backgroundColor: selProps._markCmyk ? cmykToHex(...(selProps._markCmyk as [number,number,number,number])) : "#888"
      }} />
      <span className="text-[11px] font-semibold text-gray-700">{selProps._markMemo || selProps._markType}</span>
        </div>
    <div className="flex items-center gap-2">
      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{selProps._markType.toUpperCase()}</span>
    </div>
  </div>

)}

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

                       {/* Z-Order controls */}
                       <div className='flex gap-1 mt-2'>
                         <button onClick={() => { const c=fcRef.current; const obj=c?.getActiveObject(); if(c&&obj){c.bringObjectToFront(obj); c.requestRenderAll(); refreshLayers();} }} className='flex-1 px-2 py-1 text-[9px] bg-gray-100 hover:bg-blue-100 rounded text-gray-600 font-medium'>Front</button>
                         <button onClick={() => { const c=fcRef.current; const obj=c?.getActiveObject(); if(c&&obj){c.bringObjectForward(obj); c.requestRenderAll(); refreshLayers();} }} className='flex-1 px-2 py-1 text-[9px] bg-gray-100 hover:bg-blue-100 rounded text-gray-600 font-medium'>↑ Up</button>
                         <button onClick={() => { const c=fcRef.current; const obj=c?.getActiveObject(); if(c&&obj){c.sendObjectBackwards(obj); c.requestRenderAll(); refreshLayers();} }} className='flex-1 px-2 py-1 text-[9px] bg-gray-100 hover:bg-blue-100 rounded text-gray-600 font-medium'>↓ Down</button>
                         <button onClick={() => { const c=fcRef.current; const obj=c?.getActiveObject(); if(c&&obj){c.sendObjectToBack(obj); c.requestRenderAll(); refreshLayers();} }} className='flex-1 px-2 py-1 text-[9px] bg-gray-100 hover:bg-blue-100 rounded text-gray-600 font-medium'>Back</button>
                       </div>
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
                                   {(["all","en","ko","ja","calli"] as const).map(cat => (
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
                                      if (fontCategory === "calli") list = calliFonts.length > 0 ? calliFonts : ["Great Vibes","Dancing Script","Pacifico","Caveat","Sacramento","Satisfy","Kaushan Script","Cookie","Courgette","Lobster","Yellowtail","Tangerine","Allura","Alex Brush","Rochester","Pinyon Script","Italianno","Nanum Pen Script","Gaegu","Hi Melody","Stylish","East Sea Dokdo","Cute Font","Gamja Flower","Poor Story","Yeon Sung","Single Day","Song Myung","Do Hyeon"];
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
                          <div className="flex gap-0.5 overflow-x-auto">
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
                                     {(["all","en","ko","ja","calli"] as const).map(cat => (
                                       <button key={cat} onClick={() => setFontCategory(cat)}
                                         className={"px-2 py-1 text-[10px] border-b-2 " + (fontCategory===cat?"border-blue-500 text-blue-600":"border-transparent text-gray-500")}>
                                         {cat==="all"?"All":cat==="en"?"English":cat==="ko"?"Korean":cat==="ja"?"Japanese":"Calli"}
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
                                        else if (fontCategory === "calli") pool = calliFonts.length > 0 ? calliFonts : ["Great Vibes","Dancing Script","Pacifico","Caveat","Sacramento","Satisfy","Kaushan Script","Cookie","Courgette","Lobster","Yellowtail","Tangerine","Allura","Alex Brush","Rochester","Pinyon Script","Italianno","Nanum Pen Script","Gaegu","Hi Melody","Stylish","East Sea Dokdo","Cute Font","Gamja Flower","Poor Story","Yeon Sung","Single Day","Song Myung","Do Hyeon"];
                                       const filtered = pool.filter(f => !fontSearch || f.toLowerCase().includes(fontSearch.toLowerCase()));
                                       return filtered.slice(0, 200).map(f => (
                                         <button key={f} onClick={() => { loadGoogleFont(f).then(() => { updateProp("fontFamily", f); setTimeout(() => updateProp("fontFamily", f), 500); });  setSelectedFont(f); setFontDropOpen(false); setFontSearch(""); }}
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
                            {(["cmyk","spot","gradient"] as ColorMode[]).map(m => (
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
                                                                                                 {colorMode === "gradient" && (
                            <div className="space-y-2 mt-2 p-2 bg-gray-50 rounded-lg">
                              <div className="text-[10px] font-semibold text-gray-500">Direction</div>
                              <div className="grid grid-cols-3 gap-1">
                                {([
                                  {id:"tl",label:"↖"},{id:"t",label:"↑"},{id:"tr",label:"↗"},
                                  {id:"l",label:"←"},{id:"radial",label:"◎"},{id:"r",label:"→"},
                                  {id:"bl",label:"↙"},{id:"b",label:"↓"},{id:"br",label:"↘"},
                                ] as {id:string;label:string}[]).map(d => (
                                  <button key={d.id} onClick={() => setGradDirection(d.id as any)} title={d.id}
                                    className={`py-1.5 rounded text-xs font-bold transition-all ${gradDirection === d.id ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-200 border"}`}>
                                    {d.label}
                                  </button>
                                ))}
                              </div>
                              {/* Color 1 Picker */}
                              <div>
                                <div className="text-[9px] font-medium text-gray-500 mb-1">Color 1</div>
                                <div ref={gradPickRef1} className="relative w-full h-28 rounded cursor-crosshair border border-gray-200 select-none"
                                  style={{background:`linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${gradHue1},100%,50%))`}}
                                  onMouseDown={e=>{e.preventDefault();gradDrag1.current=true;const rect=e.currentTarget.getBoundingClientRect();const s=Math.max(0,Math.min(100,((e.clientX-rect.left)/rect.width)*100));const v=Math.max(0,Math.min(100,(1-(e.clientY-rect.top)/rect.height)*100));setGradPickPos1({s,v});setGradHex1(hsvToHex(gradHue1,s/100,v/100));const onMove=(ev:MouseEvent)=>{if(!gradDrag1.current)return;const r=gradPickRef1.current?.getBoundingClientRect();if(!r)return;const ms=Math.max(0,Math.min(100,((ev.clientX-r.left)/r.width)*100));const mv=Math.max(0,Math.min(100,(1-(ev.clientY-r.top)/r.height)*100));setGradPickPos1({s:ms,v:mv});setGradHex1(hsvToHex(gradHue1,ms/100,mv/100));};const onUp=()=>{gradDrag1.current=false;document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseup",onUp);};document.addEventListener("mousemove",onMove);document.addEventListener("mouseup",onUp);}}>
                                  <div className="absolute w-3 h-3 border-2 border-white rounded-full shadow pointer-events-none" style={{left:`calc(${gradPickPos1.s}% - 6px)`,top:`calc(${100-gradPickPos1.v}% - 6px)`,backgroundColor:gradHex1,boxShadow:"0 0 0 1px rgba(0,0,0,0.3)"}}/>
                                </div>
                                <input type="range" min="0" max="360" value={gradHue1} onChange={e=>{const h=Number(e.target.value);setGradHue1(h);setGradHex1(hsvToHex(h,gradPickPos1.s/100,gradPickPos1.v/100));}} className="w-full h-2 rounded-full cursor-pointer appearance-none mt-1" style={{background:"linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)"}}/>
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="w-5 h-5 rounded border" style={{backgroundColor:gradHex1}}/>
                                  <span className="text-[9px] font-mono text-gray-500">{gradHex1}</span>
                                  {(()=>{const c=hexToCmyk(gradHex1);return <span className="text-[8px] text-gray-400 ml-auto">C{c[0]} M{c[1]} Y{c[2]} K{c[3]}</span>;})()}
                                </div>
                              </div>
                              {/* Color 2 Picker */}
                              <div>
                                <div className="text-[9px] font-medium text-gray-500 mb-1">Color 2</div>
                                <div ref={gradPickRef2} className="relative w-full h-28 rounded cursor-crosshair border border-gray-200 select-none"
                                  style={{background:`linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${gradHue2},100%,50%))`}}
                                  onMouseDown={e=>{e.preventDefault();gradDrag2.current=true;const rect=e.currentTarget.getBoundingClientRect();const s=Math.max(0,Math.min(100,((e.clientX-rect.left)/rect.width)*100));const v=Math.max(0,Math.min(100,(1-(e.clientY-rect.top)/rect.height)*100));setGradPickPos2({s,v});setGradHex2(hsvToHex(gradHue2,s/100,v/100));const onMove=(ev:MouseEvent)=>{if(!gradDrag2.current)return;const r=gradPickRef2.current?.getBoundingClientRect();if(!r)return;const ms=Math.max(0,Math.min(100,((ev.clientX-r.left)/r.width)*100));const mv=Math.max(0,Math.min(100,(1-(ev.clientY-r.top)/r.height)*100));setGradPickPos2({s:ms,v:mv});setGradHex2(hsvToHex(gradHue2,ms/100,mv/100));};const onUp=()=>{gradDrag2.current=false;document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseup",onUp);};document.addEventListener("mousemove",onMove);document.addEventListener("mouseup",onUp);}}>
                                  <div className="absolute w-3 h-3 border-2 border-white rounded-full shadow pointer-events-none" style={{left:`calc(${gradPickPos2.s}% - 6px)`,top:`calc(${100-gradPickPos2.v}% - 6px)`,backgroundColor:gradHex2,boxShadow:"0 0 0 1px rgba(0,0,0,0.3)"}}/>
                                </div>
                                <input type="range" min="0" max="360" value={gradHue2} onChange={e=>{const h=Number(e.target.value);setGradHue2(h);setGradHex2(hsvToHex(h,gradPickPos2.s/100,gradPickPos2.v/100));}} className="w-full h-2 rounded-full cursor-pointer appearance-none mt-1" style={{background:"linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)"}}/>
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="w-5 h-5 rounded border" style={{backgroundColor:gradHex2}}/>
                                  <span className="text-[9px] font-mono text-gray-500">{gradHex2}</span>
                                  {(()=>{const c=hexToCmyk(gradHex2);return <span className="text-[8px] text-gray-400 ml-auto">C{c[0]} M{c[1]} Y{c[2]} K{c[3]}</span>;})()}
                                </div>
                              </div>
                              {/* Preview */}
                              <div className="h-6 rounded border" style={{
                                background: gradDirection === "radial"
                                  ? `radial-gradient(circle, ${gradHex1}, ${gradHex2})`
                                  : `linear-gradient(${{r:"to right",br:"to bottom right",b:"to bottom",bl:"to bottom left",l:"to left",tl:"to top left",t:"to top",tr:"to top right"}[gradDirection] || "to right"}, ${gradHex1}, ${gradHex2})`
                              }} />
                              <button onClick={() => {
                                const c = fcRef.current; const obj = c?.getActiveObject();
                                if (!obj || !c) { alert("Select an object first"); return; }
                                const w = (obj as any).width || 100;
                                const h = (obj as any).height || 100;
                                const fm = fabricModRef.current;
                                if (!fm) return;
                                if (gradDirection === "radial") {
                                  obj.set("fill", new fm.Gradient({ type: "radial",
                                    coords: { x1: w/2, y1: h/2, r1: 0, x2: w/2, y2: h/2, r2: Math.max(w,h)/2 },
                                    colorStops: [{ offset: 0, color: gradHex1 }, { offset: 1, color: gradHex2 }] }));
                                } else {
                                  const cm: Record<string,{x1:number;y1:number;x2:number;y2:number}> = {
                                    r:{x1:0,y1:0,x2:w,y2:0}, br:{x1:0,y1:0,x2:w,y2:h}, b:{x1:0,y1:0,x2:0,y2:h},
                                    bl:{x1:w,y1:0,x2:0,y2:h}, l:{x1:w,y1:0,x2:0,y2:0}, tl:{x1:w,y1:h,x2:0,y2:0},
                                    t:{x1:0,y1:h,x2:0,y2:0}, tr:{x1:0,y1:h,x2:w,y2:0}
                                  };
                                  obj.set("fill", new fm.Gradient({ type: "linear",
                                    coords: cm[gradDirection] || {x1:0,y1:0,x2:w,y2:0},
                                    colorStops: [{ offset: 0, color: gradHex1 }, { offset: 1, color: gradHex2 }] }));
                                }
                                c.requestRenderAll();
                                pushHistory();
                              }} className="w-full py-1.5 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700 transition-colors">
                                Apply Gradient
                              </button>
                            </div>
                          )}


                        </div>
                      )}
                    </div>

                  </>
                ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <span className="text-xl text-gray-300">↖</span>
                </div>
                <p className="text-xs text-gray-400 text-center leading-relaxed">Select an object on canvas<br/>to edit its properties</p>
              </div>
                )}
              </div>
            )}


                        {/* ─── AI Tab (Recraft V4) ─── */}
            {rightTab === "ai" && (
              <div className="p-3 space-y-3 text-xs overflow-y-auto overflow-x-hidden" style={{maxHeight:"calc(100vh - 200px)",contain:"layout"}}>
                {/* Sub-tab navigation */}
                <div className="flex gap-1 bg-neutral-800 rounded p-0.5">
                  {([["generate","Generate"],["vectorize","Vectorize"],["removebg","Remove BG"],["credits","Credits"]] as const).map(([k,l])=>(
                    <button key={k} onClick={()=>{ setAiTab(k as typeof aiTab); if(k==="credits") fetchAiCredits(); }}
                      className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${aiTab===k?"bg-blue-600 text-white":"text-neutral-400 hover:text-white"}`}>
                      {l}
                    </button>
                  ))}
                </div>

                {/* Error display */}
                {aiError && (
                  <div className="bg-red-900/30 border border-red-700 rounded p-2 text-red-300 text-[10px]">
                    {aiError}
                    <button onClick={()=>setAiError("")} className="ml-2 text-red-400 hover:text-red-200">✕</button>
                  </div>
                )}

                {/* ── Generate Tab ── */}
                {aiTab === "generate" && (
                  <div className="space-y-3">
                    {/* Model selector */}
                    <div>
                      <label className="text-neutral-400 text-[10px] mb-1 block">Model</label>
                      <div className="flex gap-1">
                        <button onClick={()=>setAiModel("recraftv4_vector")}
                          className={`flex-1 py-1.5 rounded text-[10px] ${aiModel==="recraftv4_vector"?"bg-blue-600 text-white":"bg-neutral-700 text-neutral-300"}`}>
                          V4 Vector ($0.08)
                        </button>
                        <button onClick={()=>setAiModel("recraftv4_pro_vector")}
                          className={`flex-1 py-1.5 rounded text-[10px] ${aiModel==="recraftv4_pro_vector"?"bg-purple-600 text-white":"bg-neutral-700 text-neutral-300"}`}>
                          V4 Pro ($0.30)
                        </button>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-neutral-400 text-[10px] mb-1 block">Category</label>
                      <div className="flex gap-1">
                        {([["illustration","Illustration"],["pattern","Pattern"],["icon","Icon"]] as const).map(([k,l])=>(
                          <button key={k} onClick={()=>setAiCategory(k)}
                            className={`flex-1 py-1.5 rounded text-[10px] ${aiCategory===k?"bg-emerald-600 text-white":"bg-neutral-700 text-neutral-300"}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <label className="text-neutral-400 text-[10px] mb-1 block">Quick Presets</label>
                      <div className="grid grid-cols-2 gap-1">
                        {PACKAGING_PRESETS.filter(p => aiCategory === "illustration" ? p.category === "illustration" : aiCategory === "icon" ? p.category === "icon" : p.category === "pattern").map(p=>(
                          <button key={p.id} onClick={()=>setAiPrompt(p.prompt)}
                            className="text-left py-1.5 px-2 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-300 text-[10px] truncate">
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prompt */}
                    <div>
                      <label className="text-neutral-400 text-[10px] mb-1 block">Prompt</label>
                      <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)}
                        placeholder="Describe the vector design you want..."
                        className="w-full h-20 bg-neutral-800 border border-neutral-600 rounded p-2 text-white text-[11px] resize-none focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Generate button */}
                    <button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim()}
                      className={`w-full py-2.5 rounded font-medium text-[11px] transition-colors ${
                        aiLoading || !aiPrompt.trim()
                          ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}>
                      {aiLoading ? "Generating SVG..." : `Generate (${(aiModel === "recraftv4_pro_vector" ? 300 : 80)} units)`}
                    </button>

                    {/* Result */}
                    {aiResult && (
                      <div className="space-y-2">
                        <div className="bg-neutral-800 rounded p-2 border border-neutral-600">
                          <div className="bg-white rounded p-2 flex items-center justify-center" style={{minHeight:140,maxHeight:220,overflow:"hidden"}}>
                            <div dangerouslySetInnerHTML={{__html: aiResult.svgContent.replace(/<svg/, '<svg style="width:100%;height:100%;max-width:100%;max-height:200px"')}} style={{width:"100%",maxHeight:150,overflow:"hidden"}} />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={()=>addAiSvgToCanvas(aiResult.svgContent)}
                            className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium">
                            Add to Canvas
                          </button>
                        <button onClick={async()=>{ try { const r=await fetch(aiResult.svgUrl); const b=await r.blob(); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="recraft-vector.svg"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u); } catch(e){ console.error("[Download]",e); } }}
                          className="py-2 px-3 rounded bg-neutral-700 hover:bg-neutral-600 text-white text-[11px] font-medium cursor-pointer">
                          Download
                        </button>
                        </div>
                        <div className="text-neutral-500 text-[10px]">
                          Used: {aiResult.creditsUsed} units (${(aiResult.creditsUsed/1000).toFixed(3)})
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Vectorize Tab ── */}
                {aiTab === "vectorize" && (
                  <div className="space-y-3">
                    <p className="text-neutral-400 text-[10px]">Upload a PNG/JPG image to convert to SVG vector (10 units)</p>
                    <label
                      className={`block w-full py-6 rounded-lg border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
                        aiVecLoading ? "border-neutral-700 text-neutral-600 cursor-wait" : "border-neutral-600 hover:border-blue-500 text-neutral-400 hover:text-blue-400"
                      }`}
                      onDragOver={e=>{ e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add("border-blue-500","bg-blue-500/10","text-blue-400"); }}
                      onDragLeave={e=>{ e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove("border-blue-500","bg-blue-500/10","text-blue-400"); }}
                      onDrop={e=>{ e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove("border-blue-500","bg-blue-500/10","text-blue-400"); const f=e.dataTransfer.files?.[0]; if(f && /^image\/(png|jpeg|webp)$/.test(f.type) && !aiVecLoading) handleAiVectorize(f); }}
                    >
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                        disabled={aiVecLoading}
                        onChange={e=>{ const f=e.target.files?.[0]; if(f) handleAiVectorize(f); e.target.value=""; }} />
                      <div className="flex flex-col items-center gap-1.5">
                        <svg className="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13" /></svg>
                        <span className="text-[11px] font-medium">{aiVecLoading ? "Vectorizing..." : "Drop image here or click to upload"}</span>
                        <span className="text-[9px] opacity-50">PNG, JPG, WebP</span>
                      </div>
                    </label>
                    {aiVecResult && (
                      <div className="space-y-2">
                        <div className="bg-white rounded p-2 flex items-center justify-center" style={{minHeight:140,maxHeight:220,overflow:"hidden"}}>
                          <div dangerouslySetInnerHTML={{__html: aiVecResult.svgContent.replace(/<svg/, '<svg style="width:100%;height:100%;max-width:100%;max-height:200px"')}} style={{width:"100%",maxHeight:150,overflow:"hidden"}} />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={()=>addAiSvgToCanvas(aiVecResult.svgContent)}
                            className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium">
                            Add to Canvas
                          </button>
                        <button onClick={async()=>{ try { const r=await fetch(aiVecResult.svgUrl); const b=await r.blob(); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="vectorized.svg"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u); } catch(e){ console.error("[Download]",e); } }}
                          className="py-2 px-3 rounded bg-neutral-700 hover:bg-neutral-600 text-white text-[11px] font-medium cursor-pointer">
                          Download
                        </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Remove BG Tab ── */}
                {aiTab === "removebg" && (
                  <div className="space-y-3">
                    <p className="text-neutral-400 text-[10px]">Upload a PNG/JPG to remove background (10 units)</p>
                    <label
                      className={`block w-full py-6 rounded-lg border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
                        aiBgLoading ? "border-neutral-700 text-neutral-600 cursor-wait" : "border-neutral-600 hover:border-blue-500 text-neutral-400 hover:text-blue-400"
                      }`}
                      onDragOver={e=>{ e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add("border-blue-500","bg-blue-500/10","text-blue-400"); }}
                      onDragLeave={e=>{ e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove("border-blue-500","bg-blue-500/10","text-blue-400"); }}
                      onDrop={e=>{ e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove("border-blue-500","bg-blue-500/10","text-blue-400"); const f=e.dataTransfer.files?.[0]; if(f && /^image\/(png|jpeg|webp)$/.test(f.type) && !aiBgLoading) handleAiRemoveBg(f); }}
                    >
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                        disabled={aiBgLoading}
                        onChange={e=>{ const f=e.target.files?.[0]; if(f) handleAiRemoveBg(f); e.target.value=""; }} />
                      <div className="flex flex-col items-center gap-1.5">
                        <svg className="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13" /></svg>
                        <span className="text-[11px] font-medium">{aiBgLoading ? "Removing background..." : "Drop image here or click to upload"}</span>
                        <span className="text-[9px] opacity-50">PNG, JPG, WebP</span>
                      </div>
                    </label>
                    {aiBgResult && (
                      <div className="space-y-2">
                        <div className="bg-neutral-800 rounded p-2 border border-neutral-600">
                          <div className="rounded p-2 flex items-center justify-center" style={{minHeight:120,backgroundImage:"repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%)",backgroundSize:"12px 12px"}}>
                            <img src={aiBgResult} alt="Background removed" style={{maxWidth:"100%",maxHeight:150}} />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={()=>{
                            const c=fcRef.current; const F=fabricModRef.current; if(!c||!F||!aiBgResult) return;
                            F.Image.fromURL(aiBgResult, {crossOrigin:"anonymous"}).then((img: fabric.Image)=>{
                              img.scaleToWidth(Math.min(300, c.getWidth()/2));
                              img.set({left:c.getWidth()/2-(img.getScaledWidth()/2), top:c.getHeight()/2-(img.getScaledHeight()/2)});
                              c.add(img); c.setActiveObject(img); c.renderAll();
                              pushHistory();
                            }).catch((e: unknown)=>{console.error("[AI BG Load]",e);});
                          }} className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium">
                            Add to Canvas
                          </button>
                        <button onClick={async()=>{ try { const r=await fetch(aiBgResult); const b=await r.blob(); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="bg-removed.png"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u); } catch(e){ console.error("[Download]",e); } }}
                          className="py-2 px-3 rounded bg-neutral-700 hover:bg-neutral-600 text-white text-[11px] font-medium cursor-pointer">
                          Download
                        </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Credits Tab ── */}
                {aiTab === "credits" && (
                  <div className="space-y-3">
                    <div className="bg-neutral-800 rounded p-4 text-center border border-neutral-600">
                      <div className="text-3xl font-bold text-white mb-1">
                        {aiCredits !== null ? aiCredits.toLocaleString() : "—"}
                      </div>
                      <div className="text-neutral-400 text-[10px]">API Units Remaining</div>
                      {aiCredits !== null && (
                        <div className="text-neutral-500 text-[10px] mt-1">${(aiCredits/1000).toFixed(2)} USD</div>
                      )}
                    </div>
                    <button onClick={fetchAiCredits}
                      className="w-full py-2 rounded bg-neutral-700 hover:bg-neutral-600 text-white text-[11px]">
                      Refresh
                    </button>
                    <div className="space-y-1">
                      <div className="text-neutral-400 text-[10px] font-medium">Cost per request:</div>
                      <div className="flex justify-between text-[10px]"><span className="text-neutral-400">V4 Vector</span><span className="text-white">80 units ($0.08)</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-neutral-400">V4 Pro Vector</span><span className="text-white">300 units ($0.30)</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-neutral-400">Vectorize</span><span className="text-white">10 units ($0.01)</span></div>
                      <div className="flex justify-between text-[10px]"><span className="text-neutral-400">Remove BG</span><span className="text-white">10 units ($0.01)</span></div>
                    </div>
                    <a href="https://app.recraft.ai/profile/api" target="_blank" rel="noreferrer"
                      className="block w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] text-center">
                      Buy More Units
                    </a>
                  </div>
                )}
              </div>
            )}{/* ─── Align & Distribute ─── */}
            {rightTab === "properties" && selProps && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-[10px] font-semibold text-gray-500 mb-2">ALIGN</div>
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {(["left","centerH","right","top","centerV","bottom"] as const).map(t => (
                    <button key={t} onClick={() => { const c = fcRef.current; if(c) { alignObjects(c, t); pushHistory(); } }}
                      className="h-7 rounded bg-gray-50 hover:bg-blue-50 text-[9px] text-gray-600 hover:text-blue-700 transition-colors"
                      title={t}>
                      {t === "left" ? "⫷" : t === "centerH" ? "⫿" : t === "right" ? "⫸" : t === "top" ? "⤒" : t === "centerV" ? "⬌" : "⤓"}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] font-semibold text-gray-500 mb-2">DISTRIBUTE</div>
                <div className="grid grid-cols-2 gap-1">
                  <button onClick={() => { const c = fcRef.current; if(c) { distributeObjects(c, "horizontal"); pushHistory(); } }}
                    className="h-7 rounded bg-gray-50 hover:bg-green-50 text-[9px] text-gray-600 hover:text-green-700 transition-colors">
                    ↔ Horizontal
                  </button>
                  <button onClick={() => { const c = fcRef.current; if(c) { distributeObjects(c, "vertical"); pushHistory(); } }}
                    className="h-7 rounded bg-gray-50 hover:bg-green-50 text-[9px] text-gray-600 hover:text-green-700 transition-colors">
                    ↕ Vertical
                  </button>
                </div>
              </div>
            )}
            {/* --- Panels Tab (Phase 5-1b) --- */}






















































            {/* ─── Layers Tab ─── */}
            {rightTab === "layers" && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-700 mb-2">Layers</div>

{/* ── Dieline Fixed Layer (Adobe Illustrator style) ── */}
{(() => {
  const cv = fcRef.current;
  const hasDie = cv ? cv.getObjects().some((o: any) => o._isDieLine || o._isDieline || o._isFoldLine) : false;
  if (!hasDie) return null;
  return (
    <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-red-50 border border-red-200 mb-2 text-xs">
      <button onClick={() => {
        const cv2 = fcRef.current; if (!cv2) return;
        const nv = !dielineVisible;
        setDielineVisible(nv);
        cv2.getObjects().forEach((o: any) => {
          if (o._isDieLine || o._isDieline || o._isFoldLine || o._isGuideLayer || o._isPanelLabel) {
            o.visible = nv;
          }
        });
        cv2.requestRenderAll();
      }} className="text-gray-500 hover:text-gray-800 text-sm" title={dielineVisible ? "Hide Dieline" : "Show Dieline"}>
        {dielineVisible ? "\uD83D\uDC41" : "\uD83D\uDC41\u200D\uD83D\uDDE8"}
      </button>
      <div className="flex-1 flex items-center gap-1.5 min-w-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
        <span className="truncate text-red-700 font-bold">Dieline</span>
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-bold shrink-0">CUT</span>
      <button onClick={() => {
        const cv2 = fcRef.current; if (!cv2) return;
        const nl = !dielineLocked;
        setDielineLocked(nl);
        cv2.getObjects().forEach((o: any) => {
          if (o._isDieLine || o._isDieline || o._isFoldLine) {
            o.set({ selectable: !nl, evented: !nl, lockMovementX: nl, lockMovementY: nl, lockScalingX: nl, lockScalingY: nl, lockRotation: nl, hasControls: !nl, hasBorders: !nl });
          }
        });
        cv2.requestRenderAll();
      }} className={`text-sm ${dielineLocked ? 'text-red-500' : 'text-green-500'} hover:text-red-700`} title={dielineLocked ? "Unlock Dieline" : "Lock Dieline"}>
        {dielineLocked ? "\uD83D\uDD12" : "\uD83D\uDD13"}
      </button>
    </div>
  );
})()}

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
                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      {layer.thumb && <img src={layer.thumb} className="w-6 h-6 rounded object-cover border border-gray-200 flex-shrink-0" />}
                      <span className="truncate text-gray-700">{layer.name}</span>
{layer.markType && (
  <span className="text-[7px] px-1 py-0.5 rounded-full font-semibold flex-shrink-0 border"
    style={{
      backgroundColor: layer.markCmyk ? cmykToHex(...(layer.markCmyk as [number,number,number,number])) + "20" : "#f3f3f3",
      color: layer.markCmyk ? cmykToHex(...(layer.markCmyk as [number,number,number,number])) : "#888",
      borderColor: layer.markCmyk ? cmykToHex(...(layer.markCmyk as [number,number,number,number])) + "50" : "#ddd"
    }}>
    {layer.markType.toUpperCase()}
  </span>
)}

                    </div>
                    <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0">{
                      layer.type === "image" ? "IMG" :
                      layer.type === "i-text" || layer.type === "text" || layer.type === "textbox" ? "TXT" :
                      layer.type === "path" ? "PATH" :
                      layer.type === "polygon" ? "POLY" :
                      layer.type === "rect" ? "RECT" :
                      layer.type === "circle" ? "CIR" :
                      layer.type === "triangle" ? "TRI" :
                      layer.type === "ellipse" ? "ELL" :
                      layer.type === "group" ? "GRP" :
                      layer.type === "line" ? "LINE" :
                      layer.type?.toUpperCase()?.substring(0, 4) || "OBJ"
                    }</span>
                    <div className='flex gap-0.5 ml-1'>
                      <button onClick={(e) => { e.stopPropagation(); const c=fcRef.current; if(!c)return; const objs=c.getObjects().filter((o:any)=>o.selectable!==false&&!o._isGuideLayer); const idx=objs.length-1-i; if(idx<objs.length-1){const obj=objs[idx]; c.bringObjectForward(obj); c.requestRenderAll(); refreshLayers();} }} className='text-[10px] text-gray-400 hover:text-blue-600 px-0.5' title='Move up'>▲</button>
                      <button onClick={(e) => { e.stopPropagation(); const c=fcRef.current; if(!c)return; const objs=c.getObjects().filter((o:any)=>o.selectable!==false&&!o._isGuideLayer); const idx=objs.length-1-i; if(idx>0){const obj=objs[idx]; c.sendObjectBackwards(obj); c.requestRenderAll(); refreshLayers();} }} className='text-[10px] text-gray-400 hover:text-blue-600 px-0.5' title='Move down'>▼</button>
                      <button onClick={(e) => { e.stopPropagation(); const c=fcRef.current; if(!c)return; const objs=c.getObjects().filter((o:any)=>o.selectable!==false&&!o._isGuideLayer); const idx=objs.length-1-i; const obj=objs[idx]; if(obj){c.remove(obj); c.requestRenderAll(); pushHistory(); refreshLayers();} }} className='text-[10px] text-gray-400 hover:text-red-500 px-0.5' title='Delete'>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Export Modal ═══ */}
      {showSizeConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setShowSizeConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Dieline Size</h3>
            <p className="text-xs text-gray-500 mb-4">Verify the actual flat dimensions of the uploaded dieline (mm).</p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 mb-1 block">Width (mm)</label>
                <input type="number" step="0.01" value={uploadSizeW} onChange={e => setUploadSizeW(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 mb-1 block">Height (mm)</label>
                <input type="number" step="0.01" value={uploadSizeH} onChange={e => setUploadSizeH(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowSizeConfirm(false); pendingDielineRef.current = null; }}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDielineSize}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-md">Confirm</button>
            </div>
          </div>
        </div>
      )}
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

   {/* ═══ Pre-flight Modal ═══ */}
   {showPreflight && preflightResult && (
   <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200" onClick={() => setShowPreflight(false)}>
     <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
       
       {/* Header */}
       <div className="px-6 pt-6 pb-4">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${preflightResult.summary.errors > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
               <span className="text-lg">{preflightResult.summary.errors > 0 ? '⚠' : '✓'}</span>
             </div>
             <div>
               <h3 className="text-[15px] font-semibold text-gray-900">Pre-flight Check</h3>
               <p className="text-xs text-gray-400 mt-0.5">{preflightResult.issues.length === 0 ? 'Ready to print' : `${preflightResult.issues.length} item${preflightResult.issues.length > 1 ? 's' : ''} found`}</p>
             </div>
           </div>
           <button onClick={() => setShowPreflight(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
             <span className="text-gray-400 text-sm">✕</span>
           </button>
         </div>

         {/* Status pills */}
         <div className="flex gap-2 mt-4">
           <div className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${preflightResult.summary.errors > 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
             {preflightResult.summary.errors > 0 ? `${preflightResult.summary.errors} Error${preflightResult.summary.errors > 1 ? 's' : ''}` : 'Passed'}
           </div>
           {preflightResult.summary.warnings > 0 && (
             <div className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-500">
               {preflightResult.summary.warnings} Warning{preflightResult.summary.warnings > 1 ? 's' : ''}
             </div>
           )}
           {preflightResult.summary.info > 0 && (
             <div className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-500">
               {preflightResult.summary.info} Note{preflightResult.summary.info > 1 ? 's' : ''}
             </div>
           )}
         </div>
       </div>

       {/* Divider */}
       <div className="h-px bg-gray-100 mx-6" />

       {/* Issues list */}
       <div className="px-6 py-4 max-h-[360px] overflow-y-auto">
         {preflightResult.issues.length === 0 ? (
           <div className="text-center py-8">
             <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
               <span className="text-2xl">✓</span>
             </div>
             <p className="text-sm font-medium text-gray-800">All checks passed</p>
             <p className="text-xs text-gray-400 mt-1">Your design is ready for print</p>
           </div>
         ) : (
           <div className="space-y-2.5">
             {preflightResult.issues.map((issue: any, idx: number) => (
               <div key={idx} onClick={() => { if (issue.objectRef) { const cv = fcRef.current; if (cv) { cv.setActiveObject(issue.objectRef); cv.requestRenderAll(); } } }} className="rounded-xl px-4 py-3 bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                 <div className="flex items-start gap-3">
                   <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                     issue.severity === 'error' ? 'bg-red-400' :
                     issue.severity === 'warning' ? 'bg-amber-400' :
                     'bg-blue-400'
                   }`} />
                   <div className="flex-1 min-w-0">
                     <p className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">{issue.code.replace(/_/g, ' ')}</p>
                     <p className="text-[13px] text-gray-700 mt-0.5 leading-snug">{issue.message}</p>
                     {issue.details && <p className="text-xs text-gray-400 mt-1">{issue.details}</p>}
                      {issue.objectRef && <p className="text-[10px] text-blue-400 mt-1.5 font-medium">Click to select object on canvas</p>}
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>

       {/* Footer */}
       <div className="px-6 py-4 border-t border-gray-100">
         <button onClick={() => setShowPreflight(false)} className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
           Done
         </button>
       </div>

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
 
     {show3DMockup && (
        <Box3DMockupModal
          open={show3DMockup}
          onClose={() => { setShow3DMockup(false); setMockupFaces([]); }}
          faceTextures={mockupFaces}
          L={dielineDims?.L || 300}
          W={dielineDims?.W || 200}
          D={dielineDims?.D || 100}
        />
      )}
    </div>
          
  );
}




