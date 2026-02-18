const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── Fix 1: Replace interval-based minimap with event-driven ──
const oldEffect = `  // Minimap auto-update
  useEffect(() => {
    if (!showMinimap) return;
    updateMinimap();
    const interval = setInterval(updateMinimap, 500);
    return () => clearInterval(interval);
  }, [showMinimap, zoom, updateMinimap]);`;

const newEffect = `  // Minimap update on canvas changes (no flickering interval)
  const minimapTimerRef = useRef<any>(null);
  const debouncedMinimap = useCallback(() => {
    if (minimapTimerRef.current) clearTimeout(minimapTimerRef.current);
    minimapTimerRef.current = setTimeout(() => {
      if (showMinimap) updateMinimap();
    }, 200);
  }, [showMinimap, updateMinimap]);

  useEffect(() => {
    if (!showMinimap) return;
    updateMinimap();
    const fc = fcRef.current;
    if (!fc) return;
    // Listen to canvas events for smart updates
    const events = ["object:modified", "object:added", "object:removed", "object:moving", "selection:created", "selection:cleared"];
    events.forEach(ev => fc.on(ev, debouncedMinimap));
    // Also update on scroll
    const wrapper = wrapperRef.current;
    const scrollEl = wrapper?.closest(".overflow-auto") || wrapper?.parentElement;
    const onScroll = () => debouncedMinimap();
    if (scrollEl) scrollEl.addEventListener("scroll", onScroll);
    return () => {
      events.forEach(ev => fc.off(ev, debouncedMinimap));
      if (scrollEl) scrollEl.removeEventListener("scroll", onScroll);
      if (minimapTimerRef.current) clearTimeout(minimapTimerRef.current);
    };
  }, [showMinimap, zoom, updateMinimap, debouncedMinimap]);`;

if (code.includes(oldEffect)) {
  code = code.replace(oldEffect, newEffect);
  changes++;
  console.log("[1] Replaced interval minimap with event-driven (no flicker)");
} else {
  console.log("[MISS] Could not find old minimap effect");
}

// ── Fix 2: Add overflow-auto scroll container around canvas ──
// Find the canvas area wrapper div
const oldCanvasWrapper = `<div style={{ transform: \`scale(\${zoom / 100})\`, transformOrigin: "center center", transition: "transform 0.2s" }}>`;

// We need to wrap this in a scrollable container
// First, find the parent that contains this
// The canvas area is inside the main content div. We need to find the overflow container.
// Let's look for the parent element pattern
const oldScrollArea = `          <div style={{ transform: \`scale(\${zoom / 100})\`, transformOrigin: "center center", transition: "transform 0.2s" }>`;

// Better approach: change transformOrigin and add a scroll wrapper
// Replace the transform approach with actual size scaling + scroll
const newCanvasWrapper = `<div 
            ref={(el) => { if (el) el.dataset.scrollContainer = "true"; }}
            className="overflow-auto"
            style={{ 
              maxWidth: "100%", 
              maxHeight: "100%", 
              width: "100%", 
              height: "100%",
              position: "relative"
            }}
            onScroll={() => { if (showMinimap) debouncedMinimap(); }}
          >
          <div style={{ 
            transform: \`scale(\${zoom / 100})\`, 
            transformOrigin: "top left", 
            transition: "transform 0.2s",
            width: "fit-content",
            margin: zoom <= 100 ? "auto" : undefined
          }}>`;

if (code.includes(oldCanvasWrapper)) {
  code = code.replace(oldCanvasWrapper, newCanvasWrapper);
  changes++;
  console.log("[2] Added scroll container around canvas with overflow-auto");
} else {
  // Try alternate pattern (might have backtick differences)
  const altPattern = 'style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center", transition: "transform 0.2s" }}>';
  const altIdx = code.indexOf(altPattern);
  if (altIdx > -1) {
    // Find the opening <div 
    let divStart = code.lastIndexOf('<div', altIdx);
    let fullOld = code.slice(divStart, altIdx + altPattern.length);
    
    const fullNew = `<div 
            ref={(el) => { if (el) el.dataset.scrollContainer = "true"; }}
            className="overflow-auto"
            style={{ 
              maxWidth: "100%", 
              maxHeight: "100%", 
              width: "100%", 
              height: "100%",
              position: "relative"
            }}
            onScroll={() => { if (showMinimap) debouncedMinimap(); }}
          >
          <div style={{ 
            transform: \`scale(\${zoom / 100})\`, 
            transformOrigin: "top left", 
            transition: "transform 0.2s",
            width: "fit-content",
            margin: zoom <= 100 ? "auto" : undefined
          }}>`;
    
    code = code.replace(fullOld, fullNew);
    changes++;
    console.log("[2b] Added scroll container (alt pattern match)");
  } else {
    console.log("[MISS] Could not find canvas wrapper div");
    // Show what's around the transform scale line
    const scaleIdx = code.indexOf('transform: `scale(${zoom / 100})`');
    if (scaleIdx > -1) {
      console.log("[Debug] Context around scale transform:");
      console.log(code.slice(Math.max(0, scaleIdx - 100), scaleIdx + 150));
    }
  }
}

// ── Fix 3: Close the extra scroll wrapper div ──
// We need to add a closing </div> for the scroll container
// Find the closing </div> that matches our canvas transform div
// Look for the Grid Overlay comment which comes after the canvas area closes
const gridOverlayMarker = '{/* Grid Overlay */}';
const gridIdx = code.indexOf(gridOverlayMarker);
if (gridIdx > -1 && changes >= 2) {
  // Find the </div> just before Grid Overlay - that's the end of the transform div
  // We need another </div> after it for the scroll container
  // The structure should be: </div> (ruler+canvas) </div> (transform) </div> (scroll) 
  // Look for the closing </div> pattern before grid overlay
  const beforeGrid = code.slice(gridIdx - 80, gridIdx);
  console.log("[Debug] Before grid overlay:", beforeGrid.trim());
  
  // Find the </div> right before {/* Grid Overlay */}
  // Insert closing </div> for scroll container after transform div closes
  // Actually we should close it AFTER all the absolute positioned elements
  // Let's close it right before {/* Zoom + Grid Controls */}
  const zoomControlMark = '{/* Zoom + Grid Controls */}';
  const zoomIdx = code.indexOf(zoomControlMark);
  if (zoomIdx > -1) {
    // The scroll container should wrap only the canvas, not the controls
    // So close it after Grid Overlay but before Zoom controls
    // Find the closing </div> of Grid Overlay section
    // Actually simpler: close it right after the transform div closes
    // which is right before Grid Overlay
    code = code.slice(0, gridIdx) + '</div>\n          ' + code.slice(gridIdx);
    changes++;
    console.log("[3] Added closing </div> for scroll container");
  }
}

// ── Fix 4: Update minimap scroll detection to use new scroll container ──
// Replace the scroll element detection in updateMinimap
const oldScrollDetect = 'wrapper?.closest(".overflow-auto") || wrapper?.parentElement';
const newScrollDetect = 'wrapper?.closest("[data-scroll-container]") || wrapper?.closest(".overflow-auto") || wrapper?.parentElement';
while (code.includes(oldScrollDetect)) {
  code = code.replace(oldScrollDetect, newScrollDetect);
  changes++;
}
console.log("[4] Updated scroll container detection in minimap");

// Also update in minimap click handlers
const oldScrollDetect2 = 'wrapper.closest(".overflow-auto") || wrapper.parentElement';
const newScrollDetect2 = 'wrapper.closest("[data-scroll-container]") || wrapper.closest(".overflow-auto") || wrapper.parentElement';
while (code.includes(oldScrollDetect2)) {
  code = code.replace(oldScrollDetect2, newScrollDetect2);
  changes++;
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
