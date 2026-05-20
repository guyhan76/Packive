const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── Fix 1: Replace transform-based zoom with a proper scroll wrapper ──
// Find the current transform div
const oldDiv = code.match(/          <div \s*\n?\s*data-scroll-container="true"\s*\n?\s*style=\{\{[\s\S]*?transformOrigin: "top left"[\s\S]*?\}\}>/);

if (oldDiv) {
  console.log("[Debug] Found data-scroll-container div");
} else {
  console.log("[Debug] No data-scroll-container, looking for transform div...");
}

// Let's find the exact line
const transformLine = code.indexOf('transformOrigin: "top left"');
const transformLine2 = code.indexOf('transformOrigin: "center center"');
const whichLine = transformLine > -1 ? transformLine : transformLine2;

if (whichLine > -1) {
  // Find the <div that contains this
  let divStart = code.lastIndexOf('<div', whichLine);
  // Find the closing > 
  let divEnd = code.indexOf('>', whichLine);
  
  if (divStart > -1 && divEnd > -1) {
    const oldFullDiv = code.slice(divStart, divEnd + 1);
    console.log("[Debug] Old div:", oldFullDiv.substring(0, 100));
    
    // Replace with simple transform div - scroll is handled by parent
    const newDiv = `<div style={{ 
              transform: \`scale(\${zoom / 100})\`, 
              transformOrigin: "top left", 
              transition: "transform 0.15s ease-out",
            }}>`;
    
    code = code.slice(0, divStart) + newDiv + code.slice(divEnd + 1);
    changes++;
    console.log("[1] Simplified transform div");
  }
}

// ── Fix 2: Fix parent container - make it a proper scroll host ──
// The parent needs to: 
// 1) Have overflow:auto 
// 2) Contain a spacer div that represents the actual zoomed size
// 3) Center content when zoom <= 100%

const oldParentPattern = /className=\{`flex-1 flex bg-gray-100[^`]*`\}/;
const oldParentMatch = code.match(oldParentPattern);

if (oldParentMatch) {
  console.log("[Debug] Found dynamic parent class");
}

// Let's find and replace the entire parent div opening
// Look for the parent by its unique characteristics
const parentSearch1 = 'className={`flex-1 flex bg-gray-100';
const parentSearch2 = 'className="flex-1 flex items-center justify-center bg-gray-100';
let parentIdx = code.indexOf(parentSearch1);
if (parentIdx === -1) parentIdx = code.indexOf(parentSearch2);

if (parentIdx > -1) {
  // Find the opening <div before this
  let pDivStart = code.lastIndexOf('<div', parentIdx);
  // Find the end of this element's opening tag
  // It could span multiple lines with event handlers
  // Find the matching >
  let depth = 0;
  let pDivEnd = -1;
  for (let i = parentIdx; i < code.length; i++) {
    if (code[i] === '{' && code[i-1] !== '\\') depth++;
    if (code[i] === '}' && code[i-1] !== '\\') depth--;
    if (code[i] === '>' && depth === 0) {
      pDivEnd = i;
      break;
    }
  }
  
  if (pDivStart > -1 && pDivEnd > -1) {
    const oldParentFull = code.slice(pDivStart, pDivEnd + 1);
    console.log("[Debug] Old parent length:", oldParentFull.length);
    
    const newParent = `<div
          ref={(el) => { 
            if (el) {
              (el as any).__scrollHost = true;
              // Disable passive for wheel to allow preventDefault
              if (!(el as any).__wheelBound) {
                el.addEventListener("wheel", (ev: WheelEvent) => {
                  if (ev.ctrlKey || ev.metaKey) {
                    ev.preventDefault();
                    const delta = ev.deltaY > 0 ? -10 : 10;
                    applyZoom(zoom + delta);
                  }
                }, { passive: false });
                (el as any).__wheelBound = true;
              }
            }
          }}
          className={\`flex-1 flex bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative \${zoom <= 100 ? "items-center justify-center" : ""}\`}
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
          onMouseUp={(e) => { panActiveRef.current = false; panStartRef.current = null; e.currentTarget.style.cursor = isPanning ? "grab" : ""; }}
          onMouseLeave={(e) => { panActiveRef.current = false; panStartRef.current = null; e.currentTarget.style.cursor = isPanning ? "grab" : ""; }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {`;

    // We need to keep everything after onDrop handler starts
    // Find where the old onDrop was
    const dropIdx = oldParentFull.indexOf('onDrop={');
    if (dropIdx > -1) {
      // Get the onDrop and everything after in the old div
      // Actually we should keep all the original drop logic
      // Let's find just up to onDrop in the old, and replace
      const beforeDrop = oldParentFull.slice(0, dropIdx);
      const afterDrop = oldParentFull.slice(dropIdx);
      // afterDrop starts with onDrop={async (e) => {... and ends with >
      
      // Actually simpler: find the drop handler and className in the replacement
      // and append the rest of the original drop handler
      
      // Get from onDrop to the end of old parent
      const dropContent = afterDrop; // onDrop={async (e) => {... }}>
      
      code = code.slice(0, pDivStart) + newParent + dropContent.slice('onDrop={async (e) => {'.length) + code.slice(pDivEnd + 1);
      changes++;
      console.log("[2] Replaced parent container with scroll + panning support");
    } else {
      console.log("[MISS] Could not find onDrop in parent");
    }
  }
}

// ── Fix 3: Remove old onWheel from parent (it's now in ref) ──
const oldWheel = /\s*onWheel=\{[\s\S]*?applyZoom\(zoom \+ delta\);[\s\S]*?\}\}>/;
// Actually let's just remove inline onWheel if exists
const wheelPattern = `          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -10 : 10;
              applyZoom(zoom + delta);
            }
          }}>`;
if (code.includes(wheelPattern)) {
  code = code.replace(wheelPattern, '>');
  changes++;
  console.log("[3] Removed inline onWheel (moved to ref with passive:false)");
}

// ── Fix 4: Add spacer div after transform div to create scroll area ──
// After the transform div closes, before Grid Overlay, we need scroll space
const gridOverlay = '{/* Grid Overlay */}';
const gridIdx = code.indexOf(gridOverlay);

// Find the closing </div> of the transform div (should be right before grid overlay)
if (gridIdx > -1) {
  // Check if spacer already exists
  if (!code.includes("zoom-spacer")) {
    // The transform div closes, then we need a spacer
    // Actually the better approach: wrap the transform div content in a div with explicit size
    // Let's add an invisible spacer that forces the parent scroll area to be big enough
    
    // Insert spacer before the transform div
    const transformDivSearch = `<div style={{ 
              transform: \`scale(\${zoom / 100})\`, 
              transformOrigin: "top left"`;
    const tIdx = code.indexOf(transformDivSearch);
    if (tIdx > -1) {
      const spacer = `{/* Zoom spacer - creates scroll area for zoomed content */}
          {zoom > 100 && (
            <div className="zoom-spacer" style={{ 
              width: ((canvasElRef.current?.width || 400) + 40) * (zoom / 100), 
              height: ((canvasElRef.current?.height || 300) + 40) * (zoom / 100),
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none"
            }} />
          )}
          `;
      code = code.slice(0, tIdx) + spacer + code.slice(tIdx);
      changes++;
      console.log("[4] Added zoom spacer for scroll area");
    }
  }
}

// ── Fix 5: Remove data-scroll-container from transform div if present ──
if (code.includes('data-scroll-container="true"')) {
  code = code.replace(/\s*data-scroll-container="true"\s*/g, ' ');
  changes++;
  console.log("[5] Cleaned up data-scroll-container attribute");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
