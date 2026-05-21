const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── Fix 1: Replace setWidth/setHeight with direct property assignment ──
const oldSetWidth = "c.setWidth(c.getWidth() / (c.getZoom() || 1) * scale);";
const oldSetHeight = "c.setHeight(c.getHeight() / (c.getZoom() || 1) * scale);";

if (code.includes(oldSetWidth)) {
  code = code.replace(oldSetWidth, 
    "// Fabric v6: use property assignment instead of setWidth/setHeight\n" +
    "    const prevZoom = c.getZoom() || 1;\n" +
    "    const baseW = c.width / prevZoom;\n" +
    "    const baseH = c.height / prevZoom;\n" +
    "    c.setZoom(scale);\n" +
    "    c.setDimensions({ width: baseW * scale, height: baseH * scale });");
  // Remove the duplicate setZoom and old setHeight
  code = code.replace("    c.setZoom(scale);\n    // Fabric v6", "    // Fabric v6");
  changes++;
  console.log("[1] Fixed setWidth → setDimensions");
}

// Remove the now-orphaned setHeight line
if (code.includes(oldSetHeight)) {
  code = code.replace(oldSetHeight, "// (height set above via setDimensions)");
  changes++;
  console.log("[2] Removed old setHeight");
}

// Also remove the duplicate c.setZoom(scale) that was before setWidth
const dupSetZoom = "    c.setZoom(scale);\n    // Fabric v6: use property";
if (code.includes(dupSetZoom)) {
  code = code.replace(dupSetZoom, "    // Fabric v6: use property");
  changes++;
  console.log("[3] Removed duplicate setZoom");
}

// ── Fix 2: Replace minimap canvas drawing with toDataURL snapshot ──
const oldMinimapFn = `  const updateMinimap = useCallback(() => {
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
  }, [zoom]);`;

const newMinimapFn = `  const updateMinimap = useCallback(() => {
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
      img.onload = () => {
        const cw = img.width;
        const ch = img.height;
        const s = Math.min((MW - 8) / cw, (MH - 8) / ch);
        const ox = (MW - cw * s) / 2;
        const oy = (MH - ch * s) / 2;
        ctx.clearRect(0, 0, MW, MH);
        ctx.fillStyle = "#f8f9fa";
        ctx.fillRect(0, 0, MW, MH);
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = 1;
        ctx.strokeRect(ox - 1, oy - 1, cw * s + 2, ch * s + 2);
        ctx.drawImage(img, ox, oy, cw * s, ch * s);
        // Draw viewport rectangle when zoomed
        if (zoom > 100) {
          const wrapper = wrapperRef.current;
          const scrollEl = wrapper?.closest(".overflow-auto") || wrapper?.parentElement;
          if (scrollEl) {
            const canvasW = canvasElRef.current?.width || 400;
            const canvasH = canvasElRef.current?.height || 300;
            const s2 = Math.min((MW - 8) / canvasW, (MH - 8) / canvasH);
            const ox2 = (MW - canvasW * s2) / 2;
            const oy2 = (MH - canvasH * s2) / 2;
            const vx = ox2 + (scrollEl.scrollLeft / (zoom / 100)) * s2;
            const vy = oy2 + (scrollEl.scrollTop / (zoom / 100)) * s2;
            const vw = (scrollEl.clientWidth / (zoom / 100)) * s2;
            const vh = (scrollEl.clientHeight / (zoom / 100)) * s2;
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2;
            ctx.strokeRect(vx, vy, vw, vh);
            ctx.fillStyle = "rgba(59,130,246,0.08)";
            ctx.fillRect(vx, vy, vw, vh);
          }
        }
      };
      img.src = dataUrl;
    } catch (e) { console.warn("Minimap render error:", e); }
  }, [zoom]);`;

if (code.includes(oldMinimapFn)) {
  code = code.replace(oldMinimapFn, newMinimapFn);
  changes++;
  console.log("[4] Replaced minimap with toDataURL high-quality rendering");
} else {
  console.log("[MISS] Could not find old minimap function - checking partial match...");
  // Try partial match
  const partialOld = "const updateMinimap = useCallback(() => {";
  const idx = code.indexOf(partialOld);
  if (idx > -1) {
    // Find the closing of this useCallback
    const endPattern = "}, [zoom]);";
    let searchFrom = idx;
    let endIdx = code.indexOf(endPattern, searchFrom);
    if (endIdx > -1) {
      const fullEnd = endIdx + endPattern.length;
      code = code.slice(0, idx) + newMinimapFn.trimStart() + code.slice(fullEnd);
      changes++;
      console.log("[4b] Replaced minimap via partial match");
    }
  }
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
