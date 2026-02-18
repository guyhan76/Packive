const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── 1. Add minimap state (after zoom state) ──
const zoomState = "const [zoom, setZoom] = useState(100);";
if (code.includes(zoomState) && !code.includes("showMinimap")) {
  code = code.replace(zoomState, zoomState + `
  const [showMinimap, setShowMinimap] = useState(false);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const minimapDragging = useRef(false);`);
  changes++;
  console.log("[1] Added minimap state");
}

// ── 2. Add minimap update function (after applyZoom) ──
const applyZoomEnd = "c.setHeight(c.getHeight() / (c.getZoom() || 1) * scale);";
if (code.includes(applyZoomEnd) && !code.includes("updateMinimap")) {
  code = code.replace(applyZoomEnd, applyZoomEnd + `
    // Auto show/hide minimap
    if (z >= 150) setShowMinimap(true);
    else setShowMinimap(false);`);
  changes++;
  console.log("[2] Added auto show/hide minimap on zoom");
}

// ── 3. Add minimap render function ──
// Insert after the applyZoom useCallback block - find a good anchor
const minimapFn = `
  // ── Minimap render ──
  const updateMinimap = useCallback(() => {
    const mc = minimapRef.current;
    const fc = fcRef.current;
    if (!mc || !fc) return;
    const ctx = mc.getContext("2d");
    if (!ctx) return;
    const MW = 160, MH = 110;
    mc.width = MW; mc.height = MH;
    ctx.clearRect(0, 0, MW, MH);
    // Draw background
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, MW, MH);
    // Get canvas dimensions
    const cw = canvasElRef.current?.width || 400;
    const ch = canvasElRef.current?.height || 300;
    // Scale to fit minimap
    const s = Math.min((MW - 8) / cw, (MH - 8) / ch);
    const ox = (MW - cw * s) / 2;
    const oy = (MH - ch * s) / 2;
    // Draw canvas area
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    ctx.fillRect(ox, oy, cw * s, ch * s);
    ctx.strokeRect(ox, oy, cw * s, ch * s);
    // Draw objects as simplified shapes
    fc.getObjects().forEach((obj: any) => {
      if (obj._isSafeZone || obj._isGuideText || obj._isSizeLabel || obj._isGuideLine || obj._isMeasureLine) return;
      const b = obj.getBoundingRect();
      const rx = ox + (b.left / (zoom / 100)) * s;
      const ry = oy + (b.top / (zoom / 100)) * s;
      const rw = (b.width / (zoom / 100)) * s;
      const rh = (b.height / (zoom / 100)) * s;
      ctx.fillStyle = obj.fill && typeof obj.fill === "string" ? obj.fill + "88" : "#6366f188";
      ctx.fillRect(rx, ry, Math.max(rw, 2), Math.max(rh, 2));
    });
    // Draw viewport rectangle
    const wrapper = wrapperRef.current;
    if (wrapper && zoom > 100) {
      const scrollEl = wrapper.closest(".overflow-auto") || wrapper.parentElement;
      if (scrollEl) {
        const vx = ox + ((scrollEl.scrollLeft || 0) / (zoom / 100)) * s / 1;
        const vy = oy + ((scrollEl.scrollTop || 0) / (zoom / 100)) * s / 1;
        const vw = (scrollEl.clientWidth / (zoom / 100)) * s;
        const vh = (scrollEl.clientHeight / (zoom / 100)) * s;
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.strokeRect(vx, vy, vw, vh);
        ctx.fillStyle = "#3b82f622";
        ctx.fillRect(vx, vy, vw, vh);
      }
    }
  }, [zoom]);
`;

// Find a place after applyZoom - look for the line after setZoom in applyZoom
const applyZoomPattern = "}, []);"; // First useCallback close after applyZoom
// Better anchor: find the closing of applyZoom
const applyZoomStart = "const applyZoom = useCallback";
const applyZoomIdx = code.indexOf(applyZoomStart);
if (applyZoomIdx > -1 && !code.includes("updateMinimap")) {
  // Find the next "}, [" after applyZoom
  let searchFrom = applyZoomIdx;
  let closingIdx = code.indexOf("}, [", searchFrom);
  if (closingIdx > -1) {
    // Find end of this line
    let lineEnd = code.indexOf(";", closingIdx);
    if (lineEnd > -1) {
      code = code.slice(0, lineEnd + 1) + minimapFn + code.slice(lineEnd + 1);
      changes++;
      console.log("[3] Added updateMinimap function");
    }
  }
}

// ── 4. Add minimap update effect (trigger on zoom change) ──
// Find a useEffect that we can place near
const minimapEffect = `
  // Minimap auto-update
  useEffect(() => {
    if (!showMinimap) return;
    updateMinimap();
    const interval = setInterval(updateMinimap, 500);
    return () => clearInterval(interval);
  }, [showMinimap, zoom, updateMinimap]);
`;

// Insert before the return statement or after the last useEffect
if (!code.includes("Minimap auto-update")) {
  // Find the minimap function we just added and insert effect after it
  const effectAnchor = "// ── Minimap render ──";
  const effectIdx = code.indexOf(effectAnchor);
  if (effectIdx > -1) {
    // Find end of the updateMinimap block
    const umEnd = code.indexOf("}, [zoom]);", effectIdx);
    if (umEnd > -1) {
      const insertAt = umEnd + "}, [zoom]);".length;
      code = code.slice(0, insertAt) + minimapEffect + code.slice(insertAt);
      changes++;
      console.log("[4] Added minimap useEffect");
    }
  }
}

// ── 5. Add minimap UI component (before Zoom + Grid Controls) ──
const zoomControlsAnchor = '{/* Zoom + Grid Controls */}';
if (code.includes(zoomControlsAnchor) && !code.includes("minimap-container")) {
  const minimapUI = `{/* Minimap */}
          {showMinimap && zoom >= 150 && (
            <div className="absolute bottom-14 right-3 z-20 minimap-container" style={{
              width: 160, height: 130, background: "white", borderRadius: 8,
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)", border: "1px solid #e5e7eb",
              overflow: "hidden"
            }}>
              <div className="flex items-center justify-between px-2 py-0.5 bg-gray-50 border-b border-gray-200">
                <span className="text-[9px] font-medium text-gray-500">Navigator</span>
                <span className="text-[9px] text-blue-600 font-bold">{zoom}%</span>
              </div>
              <canvas
                ref={minimapRef}
                width={160} height={110}
                className="cursor-crosshair"
                style={{ width: 160, height: 110 }}
                onMouseDown={(e) => {
                  minimapDragging.current = true;
                  // Calculate click position and scroll
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mx = e.clientX - rect.left;
                  const my = e.clientY - rect.top;
                  const cw = canvasElRef.current?.width || 400;
                  const ch = canvasElRef.current?.height || 300;
                  const MW = 160, MH = 110;
                  const s = Math.min((MW - 8) / cw, (MH - 8) / ch);
                  const ox = (MW - cw * s) / 2;
                  const oy = (MH - ch * s) / 2;
                  const wrapper = wrapperRef.current;
                  const scrollEl = wrapper?.closest(".overflow-auto") || wrapper?.parentElement;
                  if (scrollEl) {
                    const targetX = ((mx - ox) / s) * (zoom / 100) - scrollEl.clientWidth / 2;
                    const targetY = ((my - oy) / s) * (zoom / 100) - scrollEl.clientHeight / 2;
                    scrollEl.scrollTo({ left: Math.max(0, targetX), top: Math.max(0, targetY), behavior: "smooth" });
                  }
                  setTimeout(updateMinimap, 100);
                }}
                onMouseMove={(e) => {
                  if (!minimapDragging.current) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const mx = e.clientX - rect.left;
                  const my = e.clientY - rect.top;
                  const cw = canvasElRef.current?.width || 400;
                  const ch = canvasElRef.current?.height || 300;
                  const MW = 160, MH = 110;
                  const s = Math.min((MW - 8) / cw, (MH - 8) / ch);
                  const ox = (MW - cw * s) / 2;
                  const oy = (MH - ch * s) / 2;
                  const wrapper = wrapperRef.current;
                  const scrollEl = wrapper?.closest(".overflow-auto") || wrapper?.parentElement;
                  if (scrollEl) {
                    const targetX = ((mx - ox) / s) * (zoom / 100) - scrollEl.clientWidth / 2;
                    const targetY = ((my - oy) / s) * (zoom / 100) - scrollEl.clientHeight / 2;
                    scrollEl.scrollTo({ left: Math.max(0, targetX), top: Math.max(0, targetY) });
                  }
                }}
                onMouseUp={() => { minimapDragging.current = false; setTimeout(updateMinimap, 100); }}
                onMouseLeave={() => { minimapDragging.current = false; }}
              />
            </div>
          )}
          `;
  code = code.replace(zoomControlsAnchor, minimapUI + zoomControlsAnchor);
  changes++;
  console.log("[5] Added minimap UI component");
}

// ── 6. Add minimap toggle button in zoom controls ──
const gridToggle = 'title="Toggle Grid">⊞</button>';
if (code.includes(gridToggle) && !code.includes("Toggle Minimap")) {
  code = code.replace(gridToggle, gridToggle + `
            <button onClick={() => setShowMinimap(v => !v)} className={\`px-1.5 h-7 text-xs rounded \${showMinimap ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}\`} title="Toggle Minimap">🗺</button>`);
  changes++;
  console.log("[6] Added minimap toggle button");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
