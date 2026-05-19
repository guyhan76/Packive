const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let lines = code.split("\n");
console.log("Start:", lines.length);

// ═══════════════════════════════════════════
// STEP 1: Remove all inline eraser cleanup from addText, addShape, addImage, toggleDraw
// ═══════════════════════════════════════════
let removed = 0;
for (let i = lines.length - 1; i >= 0; i--) {
  // Remove the massive inline cleanup lines
  if (lines[i].includes("if (eraserMode) { const c2=fcRef.current;")) {
    lines.splice(i, 1);
    removed++;
  }
}
console.log("STEP 1: Removed", removed, "inline eraser cleanup lines");

// Remove eraserMode from deps of addText, addShape, addImage
code = lines.join("\n");
code = code.replace(/, eraserMode\]/g, "]");
code = code.replace(/, eraserMode,/g, ",");
lines = code.split("\n");
console.log("STEP 1b: Cleaned eraserMode from deps");

// ═══════════════════════════════════════════
// STEP 2: Remove eraserSizeRef and sync effect
// ═══════════════════════════════════════════
// Remove eraserSizeRef declaration
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes("eraserSizeRef") && lines[i].includes("useRef")) {
    lines.splice(i, 1);
    console.log("STEP 2a: Removed eraserSizeRef at line", i + 1);
    break;
  }
}
// Remove sync useEffect block
code = lines.join("\n"); lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Sync eraserSizeRef with state")) {
    // Find the end of this useEffect
    let end = i;
    for (let j = i; j < i + 10; j++) {
      if (lines[j] && lines[j].includes("], [eraserSize]);")) { end = j; break; }
    }
    lines.splice(i, end - i + 1);
    console.log("STEP 2b: Removed eraserSize sync effect at lines", i + 1, "-", end + 1);
    break;
  }
}

// Remove eraserCursorRef
code = lines.join("\n"); lines = code.split("\n");
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes("eraserCursorRef") && lines[i].includes("useRef")) {
    lines.splice(i, 1);
    console.log("STEP 2c: Removed eraserCursorRef at line", i + 1);
    break;
  }
}

// ═══════════════════════════════════════════
// STEP 3: Remove old path:created eraser handler (keep simple version)
// ═══════════════════════════════════════════
code = lines.join("\n"); lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Mark eraser-drawn paths")) {
    lines.splice(i, 1); // Remove comment line
    console.log("STEP 3: Removed eraser comment at line", i + 1);
    break;
  }
}

// ═══════════════════════════════════════════
// STEP 4: Replace toggleEraser completely — simple approach
// ═══════════════════════════════════════════
code = lines.join("\n"); lines = code.split("\n");
const teStart = lines.findIndex(l => l.includes("const toggleEraser = useCallback"));
if (teStart === -1) { console.log("ERROR: toggleEraser not found"); process.exit(1); }
let teEnd = -1;
let bd = 0; let bs = false;
for (let i = teStart; i < lines.length; i++) {
  for (const ch of lines[i]) {
    if (ch === "{") { bd++; bs = true; }
    if (ch === "}") bd--;
  }
  if (bs && bd === 0) { teEnd = i; break; }
}
console.log("STEP 4: toggleEraser at lines", teStart + 1, "-", teEnd + 1);

const newEraser = `    const toggleEraser = useCallback(() => {
      const c = fcRef.current; if (!c) return;
      if (eraserMode) {
        // Turn OFF — restore normal selection mode
        c.isDrawingMode = false;
        c.selection = true;
        c.defaultCursor = "default";
        c.hoverCursor = "move";
        c.getObjects().forEach((o: any) => {
          if (o._isSafeZone || o._isGuideText || o._isSizeLabel || o._isBgImage) return;
          if (o._savedSelectable !== undefined) {
            o.selectable = o._savedSelectable;
            o.evented = o._savedEvented;
            delete o._savedSelectable;
            delete o._savedEvented;
          }
        });
        // Remove cursor overlay
        const cur = document.getElementById("eraser-cursor");
        if (cur) cur.remove();
        const el = c.upperCanvasEl || c.getElement();
        if (el) el.style.cursor = "";
        c.renderAll();
        setEraserMode(false);
      } else {
        // Turn ON — enter eraser mode
        c.isDrawingMode = false;
        setDrawMode(false);
        c.selection = false;
        c.discardActiveObject();
        c.defaultCursor = "none";
        c.hoverCursor = "none";
        const el = c.upperCanvasEl || c.getElement();
        if (el) el.style.cursor = "none";
        // Create visual cursor
        let cursorEl = document.getElementById("eraser-cursor");
        if (!cursorEl) {
          cursorEl = document.createElement("div");
          cursorEl.id = "eraser-cursor";
          cursorEl.style.cssText = "position:fixed;pointer-events:none;border:2px solid #ff4444;border-radius:50%;z-index:9999;display:none;transform:translate(-50%,-50%);background:rgba(255,68,68,0.08);";
          document.body.appendChild(cursorEl);
        }
        cursorEl.style.width = eraserSize + "px";
        cursorEl.style.height = eraserSize + "px";
        // Track mouse and erase on drag
        let erasing = false;
        const doErase = (ex: number, ey: number) => {
          const rect = el.getBoundingClientRect();
          const px = ex - rect.left;
          const py = ey - rect.top;
          const r = eraserSize / 2;
          let didRemove = false;
          c.getObjects().slice().forEach((obj: any) => {
            if (obj._isSafeZone || obj._isGuideText || obj._isSizeLabel || obj._isBgImage) return;
            if (obj.selectable === false && !obj._savedSelectable) return;
            const b = obj.getBoundingRect();
            const ocx = b.left + b.width / 2;
            const ocy = b.top + b.height / 2;
            const dist = Math.sqrt((px - ocx) ** 2 + (py - ocy) ** 2);
            if (dist < r + Math.max(b.width, b.height) / 2) {
              c.remove(obj);
              didRemove = true;
            }
          });
          if (didRemove) { c.requestRenderAll(); refreshLayers(); }
        };
        const onMouseDown = (e: MouseEvent) => {
          erasing = true;
          doErase(e.clientX, e.clientY);
        };
        const onMouseMove = (e: MouseEvent) => {
          const cur2 = document.getElementById("eraser-cursor");
          if (cur2) {
            cur2.style.display = "block";
            cur2.style.left = e.clientX + "px";
            cur2.style.top = e.clientY + "px";
            cur2.style.width = eraserSize + "px";
            cur2.style.height = eraserSize + "px";
          }
          if (erasing) doErase(e.clientX, e.clientY);
        };
        const onMouseUp = () => {
          if (erasing) { erasing = false; pushHistory(); }
        };
        el.addEventListener("mousedown", onMouseDown);
        el.addEventListener("mousemove", onMouseMove);
        el.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mouseup", onMouseUp);
        // Store for cleanup
        (c as any)._eraserCleanup = () => {
          el.removeEventListener("mousedown", onMouseDown);
          el.removeEventListener("mousemove", onMouseMove);
          el.removeEventListener("mouseup", onMouseUp);
          document.removeEventListener("mouseup", onMouseUp);
        };
        setEraserMode(true);
      }
    }, [eraserMode, eraserSize, refreshLayers, pushHistory]);`;

lines.splice(teStart, teEnd - teStart + 1, ...newEraser.split("\n"));
console.log("STEP 4: toggleEraser replaced");

// ═══════════════════════════════════════════
// STEP 5: Update eraser OFF to use _eraserCleanup
// ═══════════════════════════════════════════
code = lines.join("\n"); lines = code.split("\n");
// The new toggleEraser OFF branch already handles cleanup via cursor removal
// But we need to also call _eraserCleanup
const newTeStart = lines.findIndex(l => l.includes("const toggleEraser = useCallback"));
for (let i = newTeStart; i < newTeStart + 20; i++) {
  if (lines[i] && lines[i].includes("setEraserMode(false)") && !lines[i].includes("_eraserCleanup")) {
    lines.splice(i, 0, "        if ((c as any)._eraserCleanup) { (c as any)._eraserCleanup(); delete (c as any)._eraserCleanup; }");
    console.log("STEP 5: Added _eraserCleanup call at line", i + 1);
    break;
  }
}

// ═══════════════════════════════════════════
// STEP 6: Update eraser slider to be simpler
// ═══════════════════════════════════════════
code = lines.join("\n"); lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("eraserMode && (")) {
    // Find the end of this block
    let depth2 = 0; let s2 = false;
    let blockEnd = i;
    for (let j = i; j < i + 15; j++) {
      if (!lines[j]) continue;
      for (const ch of lines[j]) {
        if (ch === "(") { depth2++; s2 = true; }
        if (ch === ")") depth2--;
      }
      if (s2 && depth2 <= 0) { blockEnd = j; break; }
    }
    // Replace with simple slider
    const newSlider = `            {eraserMode && (
              <div className="mt-2 px-2">
                <label className="text-[10px] text-gray-400 mb-1 block">Size: {eraserSize}px</label>
                <input type="range" min="5" max="80" value={eraserSize} onChange={e => setEraserSize(Number(e.target.value))} className="w-full" />
              </div>
            )}`;
    lines.splice(i, blockEnd - i + 1, ...newSlider.split("\n"));
    console.log("STEP 6: Eraser slider replaced at line", i + 1);
    break;
  }
}

// ═══════════════════════════════════════════
// STEP 7: Select tool should also turn off eraser
// ═══════════════════════════════════════════
code = lines.join("\n"); lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Select (V)") && lines[i].includes("setDrawMode(false)")) {
    if (!lines[i].includes("setEraserMode")) {
      lines[i] = lines[i].replace("setDrawMode(false)", "setDrawMode(false);setEraserMode(false);if((c as any)._eraserCleanup){(c as any)._eraserCleanup();delete (c as any)._eraserCleanup;}const _ec=document.getElementById('eraser-cursor');if(_ec)_ec.remove();c.defaultCursor='default';c.hoverCursor='move';const _uel=c.upperCanvasEl||c.getElement();if(_uel)_uel.style.cursor=''");
      console.log("STEP 7: Select tool eraser cleanup at line", i + 1);
    }
    break;
  }
}

// Final write
code = lines.join("\n");
lines = code.split("\n");
const ob = (code.match(/\{/g) || []).length;
const cb = (code.match(/\}/g) || []).length;
console.log("Done! Lines:", lines.length, "| { :", ob, "| } :", cb, "| diff:", ob - cb);
fs.writeFileSync(file, code, "utf8");
