const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── Fix 1: Replace minimap flicker - use cached image approach ──
const oldMinimap = `  const updateMinimap = useCallback(() => {
    const mc = minimapRef.current;
    const fc = fcRef.current;
    if (!mc || !fc) return;
    const ctx = mc.getContext("2d");
    if (!ctx) return;
    const MW = 160, MH = 110;
    mc.width = MW; mc.height = MH;
    ctx.clearRect(0, 0, MW, MH);
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, MW, MH);
    // Use toDataURL for high-quality preview
    try {
      const dataUrl = fc.toDataURL({ format: "png", quality: 0.6, multiplier: 0.3 });
      const img = new Image();
      img.onload = () => {`;

// Find the full updateMinimap function
const umStart = code.indexOf("const updateMinimap = useCallback(() => {");
const umEnd = code.indexOf("}, [zoom]);", umStart);
if (umStart > -1 && umEnd > -1) {
  const oldFull = code.slice(umStart, umEnd + "}, [zoom]);".length);
  
  const newMinimap = `const updateMinimap = useCallback(() => {
    const mc = minimapRef.current;
    const fc = fcRef.current;
    if (!mc || !fc) return;
    const ctx = mc.getContext("2d");
    if (!ctx) return;
    const MW = 160, MH = 110;
    // Don't reset canvas size (causes flicker)
    if (mc.width !== MW) mc.width = MW;
    if (mc.height !== MH) mc.height = MH;
    // Render to offscreen canvas first to avoid flicker
    const offscreen = document.createElement("canvas");
    offscreen.width = MW;
    offscreen.height = MH;
    const octx = offscreen.getContext("2d");
    if (!octx) return;
    octx.fillStyle = "#f8f9fa";
    octx.fillRect(0, 0, MW, MH);
    try {
      const cw = canvasElRef.current?.width || 400;
      const ch = canvasElRef.current?.height || 300;
      const s = Math.min((MW - 8) / cw, (MH - 8) / ch);
      const ox = (MW - cw * s) / 2;
      const oy = (MH - ch * s) / 2;
      // Draw border
      octx.strokeStyle = "#d1d5db";
      octx.lineWidth = 1;
      octx.strokeRect(ox - 1, oy - 1, cw * s + 2, ch * s + 2);
      // Draw canvas snapshot directly from the canvas element
      const srcCanvas = canvasElRef.current;
      if (srcCanvas) {
        octx.drawImage(srcCanvas, ox, oy, cw * s, ch * s);
      }
      // Draw viewport rectangle when zoomed
      if (zoom > 100) {
        const scrollEl = document.querySelector("[data-scroll-container]");
        if (scrollEl) {
          const vx = ox + (scrollEl.scrollLeft / (zoom / 100)) * s;
          const vy = oy + (scrollEl.scrollTop / (zoom / 100)) * s;
          const vw = (scrollEl.clientWidth / (zoom / 100)) * s;
          const vh = (scrollEl.clientHeight / (zoom / 100)) * s;
          octx.strokeStyle = "#3b82f6";
          octx.lineWidth = 2;
          octx.strokeRect(vx, vy, vw, vh);
          octx.fillStyle = "rgba(59,130,246,0.1)";
          octx.fillRect(vx, vy, vw, vh);
        }
      }
      // Single draw to visible canvas (no flicker)
      ctx.clearRect(0, 0, MW, MH);
      ctx.drawImage(offscreen, 0, 0);
    } catch (e) { /* silent */ }
  }, [zoom]);`;

  code = code.slice(0, umStart) + newMinimap + code.slice(umStart + oldFull.length);
  changes++;
  console.log("[1] Replaced minimap with offscreen canvas (no flicker)");
}

// ── Fix 2: Add scroll wrapper + panning support ──
// Find the transform div and wrap it
const oldTransform = `          <div style={{ transform: \`scale(\${zoom / 100})\`, transformOrigin: "center center", transition: "transform 0.2s" }}>
            {/* Ruler + Canvas wrapper */}`;

const newTransform = `          <div 
            data-scroll-container="true"
            className="overflow-auto"
            style={{ 
              width: "100%", 
              height: "100%",
              cursor: isPanning ? "grabbing" : undefined
            }}
            onMouseDown={(e) => {
              // Middle mouse button or Space+click for panning
              if (e.button === 1 || (e.button === 0 && isPanning)) {
                e.preventDefault();
                panStartRef.current = { x: e.clientX, y: e.clientY, scrollLeft: e.currentTarget.scrollLeft, scrollTop: e.currentTarget.scrollTop };
                panActiveRef.current = true;
              }
            }}
            onMouseMove={(e) => {
              if (!panActiveRef.current || !panStartRef.current) return;
              const dx = e.clientX - panStartRef.current.x;
              const dy = e.clientY - panStartRef.current.y;
              e.currentTarget.scrollLeft = panStartRef.current.scrollLeft - dx;
              e.currentTarget.scrollTop = panStartRef.current.scrollTop - dy;
            }}
            onMouseUp={() => { panActiveRef.current = false; panStartRef.current = null; }}
            onMouseLeave={() => { panActiveRef.current = false; panStartRef.current = null; }}
            onScroll={() => { if (showMinimap) debouncedMinimap(); }}
          >
          <div style={{ 
            transform: \`scale(\${zoom / 100})\`, 
            transformOrigin: "top left", 
            transition: "transform 0.15s ease-out",
            width: zoom > 100 ? \`\${zoom}%\` : "100%",
            minHeight: zoom > 100 ? \`\${zoom}%\` : "100%",
            display: "flex",
            justifyContent: zoom <= 100 ? "center" : "flex-start",
            alignItems: zoom <= 100 ? "center" : "flex-start",
            padding: zoom > 100 ? "20px" : undefined
          }}>
            {/* Ruler + Canvas wrapper */}`;

if (code.includes(oldTransform)) {
  code = code.replace(oldTransform, newTransform);
  changes++;
  console.log("[2] Added scroll wrapper with panning");
} else {
  console.log("[MISS] Could not find old transform pattern");
  // Debug
  const idx = code.indexOf('transformOrigin: "center center"');
  if (idx > -1) {
    console.log("[Debug] Found transformOrigin at:", idx);
    console.log(code.slice(idx - 100, idx + 100));
  }
}

// Add closing </div> for scroll wrapper before Grid Overlay
const gridOverlay = "          {/* Grid Overlay */}";
if (code.includes(gridOverlay) && changes >= 2) {
  code = code.replace(gridOverlay, "          </div>\n          {/* Grid Overlay */}");
  changes++;
  console.log("[3] Added closing div for scroll container");
}

// ── Fix 3: Add panning state variables ──
const minimapState = "const [showMinimap, setShowMinimap] = useState(false);";
if (code.includes(minimapState) && !code.includes("isPanning")) {
  code = code.replace(minimapState, minimapState + `
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{x:number;y:number;scrollLeft:number;scrollTop:number}|null>(null);
  const panActiveRef = useRef(false);`);
  changes++;
  console.log("[4] Added panning state variables");
}

// ── Fix 4: Add spacebar panning support ──
// Find the keyHandler to add space bar detection
const keyHandlerPattern = "const keyHandler = (e: KeyboardEvent) => {";
const keyIdx = code.indexOf(keyHandlerPattern);
if (keyIdx > -1 && !code.includes("setIsPanning")) {
  // Add space bar handler before the keyHandler
  const spaceHandler = `
  // Space bar panning
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsPanning(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPanning(false);
        panActiveRef.current = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

`;
  // Insert before the keyHandler registration useEffect
  const keyEffectPattern = "useEffect(() => {";
  // Find the useEffect that contains keyHandler
  const registerIdx = code.indexOf("document.addEventListener('keydown', keyHandler)");
  if (registerIdx > -1) {
    // Go back to find the useEffect start
    let effectStart = code.lastIndexOf("useEffect(() => {", registerIdx);
    if (effectStart > -1) {
      code = code.slice(0, effectStart) + spaceHandler + code.slice(effectStart);
      changes++;
      console.log("[5] Added spacebar panning support");
    }
  }
}

// ── Fix 5: Update minimap click to use new scroll container ──
const oldScrollEl1 = "wrapper?.closest(\"[data-scroll-container]\") || wrapper?.closest(\".overflow-auto\") || wrapper?.parentElement";
const newScrollEl1 = "document.querySelector(\"[data-scroll-container]\")";
while (code.includes(oldScrollEl1)) {
  code = code.replace(oldScrollEl1, newScrollEl1);
  changes++;
}
const oldScrollEl2 = "wrapper.closest(\"[data-scroll-container]\") || wrapper.closest(\".overflow-auto\") || wrapper.parentElement";
while (code.includes(oldScrollEl2)) {
  code = code.replace(oldScrollEl2, newScrollEl1);
  changes++;
}
console.log("[6] Updated scroll element detection");

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
