const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── Fix 1: Replace CSS transform zoom with actual wrapper sizing ──
// The problem: CSS transform doesn't affect layout, so scrollbars don't appear
// Solution: Use a wrapper div with actual enlarged dimensions

const oldTransformDiv = '          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center", transition: "transform 0.2s" }}>';

const newTransformDiv = `          <div 
            data-scroll-container="true"
            style={{ 
              transform: \`scale(\${zoom / 100})\`, 
              transformOrigin: "top left", 
              transition: "transform 0.15s ease-out",
              marginBottom: zoom > 100 ? \`\${((zoom / 100) - 1) * (canvasElRef.current?.height || 300)}px\` : undefined,
              marginRight: zoom > 100 ? \`\${((zoom / 100) - 1) * (canvasElRef.current?.width || 400)}px\` : undefined,
            }}>`;

if (code.includes(oldTransformDiv)) {
  code = code.replace(oldTransformDiv, newTransformDiv);
  changes++;
  console.log("[1] Replaced transform div with margin-based scroll support");
} else {
  console.log("[MISS] Old transform div not found");
  // Debug
  const idx = code.indexOf('transformOrigin: "center center"');
  if (idx > -1) {
    console.log("[Debug] Found at index", idx, "context:", code.slice(idx - 80, idx + 80).replace(/\n/g, "\\n"));
  }
}

// ── Fix 2: Update parent container for proper scrolling ──
// Change parent from "items-center justify-center" to conditional
const oldParent = 'className="flex-1 flex items-center justify-center bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative">';
const newParent = `className={\`flex-1 flex bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative \${zoom <= 100 ? "items-center justify-center" : "items-start justify-start"}\`}>`;

if (code.includes(oldParent)) {
  code = code.replace(oldParent, newParent);
  changes++;
  console.log("[2] Updated parent container to support scrolling at zoom > 100%");
} else {
  console.log("[MISS] Parent container not found");
}

// ── Fix 3: Add spacebar + mouse drag panning ──
// Add to the parent container element
// We need to add mouse event handlers to the parent
// First find the parent div opening
const parentDivPattern = `className={\`flex-1 flex bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative \${zoom <= 100 ? "items-center justify-center" : "items-start justify-start"}\`}>`;

if (code.includes(parentDivPattern)) {
  const parentWithPanning = `className={\`flex-1 flex bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative \${zoom <= 100 ? "items-center justify-center" : "items-start justify-start"}\`}
          style={{ cursor: isPanning ? "grab" : undefined }}
          onMouseDown={(e) => {
            const el = e.currentTarget;
            if (e.button === 1 || (e.button === 0 && isPanning)) {
              e.preventDefault();
              panStartRef.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
              panActiveRef.current = true;
              el.style.cursor = "grabbing";
            }
          }}
          onMouseMove={(e) => {
            if (!panActiveRef.current || !panStartRef.current) return;
            e.preventDefault();
            const el = e.currentTarget;
            el.scrollLeft = panStartRef.current.scrollLeft - (e.clientX - panStartRef.current.x);
            el.scrollTop = panStartRef.current.scrollTop - (e.clientY - panStartRef.current.y);
          }}
          onMouseUp={(e) => {
            panActiveRef.current = false;
            panStartRef.current = null;
            e.currentTarget.style.cursor = isPanning ? "grab" : "";
          }}
          onMouseLeave={(e) => {
            panActiveRef.current = false;
            panStartRef.current = null;
            e.currentTarget.style.cursor = isPanning ? "grab" : "";
          }}>`;
  
  code = code.replace(parentDivPattern, parentWithPanning);
  changes++;
  console.log("[3] Added panning handlers to parent container");
}

// ── Fix 4: Add spacebar listener for panning mode ──
if (!code.includes("Space bar panning")) {
  // Find the useEffect with keyHandler registration
  const keyEffectSearch = "document.addEventListener('keydown', keyHandler)";
  const keyIdx = code.indexOf(keyEffectSearch);
  if (keyIdx > -1) {
    let effectStart = code.lastIndexOf("useEffect(() => {", keyIdx);
    if (effectStart > -1) {
      const spaceEffect = `// Space bar panning
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && 
          document.activeElement?.tagName !== "INPUT" && 
          document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsPanning(true);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPanning(false);
        panActiveRef.current = false;
      }
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  `;
      code = code.slice(0, effectStart) + spaceEffect + code.slice(effectStart);
      changes++;
      console.log("[4] Added spacebar panning listener");
    }
  }
}

// ── Fix 5: Update minimap scroll detection ──
const oldScrollSel = 'wrapper?.closest(".overflow-auto") || wrapper?.parentElement';
while (code.includes(oldScrollSel)) {
  code = code.replace(oldScrollSel, 'document.querySelector("[data-scroll-container]")?.parentElement || wrapper?.closest(".overflow-auto")');
  changes++;
}
console.log("[5] Updated minimap scroll detection");

// ── Fix 6: Add mouse wheel zoom ──
if (!code.includes("wheel zoom")) {
  const parentPanningEnd = `onMouseLeave={(e) => {
            panActiveRef.current = false;
            panStartRef.current = null;
            e.currentTarget.style.cursor = isPanning ? "grab" : "";
          }}>`;
  
  if (code.includes(parentPanningEnd)) {
    const withWheel = parentPanningEnd.replace("}}>", `}}
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -10 : 10;
              applyZoom(zoom + delta);
            }
          }}>`)
    code = code.replace(parentPanningEnd, withWheel);
    changes++;
    console.log("[6] Added Ctrl+wheel zoom");
  }
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
