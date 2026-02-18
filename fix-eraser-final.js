const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let lines = code.split("\n");
console.log("Start:", lines.length);

// ═══════════════════════════════════════════
// STEP 1: Replace toggleEraser with simple state toggle
// ═══════════════════════════════════════════
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
console.log("STEP 1: Old toggleEraser at lines", teStart + 1, "-", teEnd + 1);

const simpleToggle = `    const toggleEraser = useCallback(() => {
      if (eraserMode) {
        setEraserMode(false);
      } else {
        setDrawMode(false);
        const c = fcRef.current;
        if (c) { c.isDrawingMode = false; c.discardActiveObject(); c.renderAll(); }
        setEraserMode(true);
      }
    }, [eraserMode]);`;

lines.splice(teStart, teEnd - teStart + 1, ...simpleToggle.split("\n"));
console.log("STEP 1: toggleEraser replaced with simple toggle");

code = lines.join("\n"); lines = code.split("\n");

// ═══════════════════════════════════════════
// STEP 2: Add useEffect that manages eraser behavior
// Insert right after addSafeZone useCallback (before the main useEffect)
// ═══════════════════════════════════════════
const mainEffectIdx = lines.findIndex(l => l.includes("Fabric.js v7"));
if (mainEffectIdx === -1) { console.log("ERROR: main useEffect not found"); process.exit(1); }

const eraserEffect = `
  // ═══ Eraser Mode Effect ═══
  useEffect(() => {
    const canvas = fcRef.current;
    if (!canvas) return;
    const el = canvas.upperCanvasEl || canvas.getElement();
    if (!el) return;

    if (!eraserMode) {
      // CLEANUP: restore normal mode
      canvas.selection = true;
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      if (el) el.style.cursor = "";
      const cur = document.getElementById("eraser-cursor");
      if (cur) cur.style.display = "none";
      return;
    }

    // ERASER ON
    canvas.selection = false;
    canvas.defaultCursor = "none";
    canvas.hoverCursor = "none";
    if (el) el.style.cursor = "none";

    // Create or get cursor element
    let cursorEl = document.getElementById("eraser-cursor");
    if (!cursorEl) {
      cursorEl = document.createElement("div");
      cursorEl.id = "eraser-cursor";
      cursorEl.style.cssText = "position:fixed;pointer-events:none;border:2px solid #ff4444;border-radius:50%;z-index:9999;display:none;transform:translate(-50%,-50%);background:rgba(255,68,68,0.08);";
      document.body.appendChild(cursorEl);
    }
    cursorEl.style.width = eraserSize + "px";
    cursorEl.style.height = eraserSize + "px";
    cursorEl.style.display = "block";

    let erasing = false;

    const doErase = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const r = eraserSize / 2;
      let didRemove = false;
      canvas.getObjects().slice().forEach((obj: any) => {
        if (obj._isSafeZone || obj._isGuideText || obj._isSizeLabel || obj._isBgImage) return;
        if (obj.selectable === false && !obj._savedSelectable) return;
        const b = obj.getBoundingRect();
        const ocx = b.left + b.width / 2;
        const ocy = b.top + b.height / 2;
        const dist = Math.sqrt((px - ocx) ** 2 + (py - ocy) ** 2);
        if (dist < r + Math.max(b.width, b.height) / 2) {
          canvas.remove(obj);
          didRemove = true;
        }
      });
      if (didRemove) { canvas.requestRenderAll(); refreshLayers(); }
    };

    const onDown = (e: MouseEvent) => { erasing = true; doErase(e.clientX, e.clientY); };
    const onMove = (e: MouseEvent) => {
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
    const onUp = () => { if (erasing) { erasing = false; pushHistory(); } };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseup", onUp);
    document.addEventListener("mouseup", onUp);

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseup", onUp);
    };
  }, [eraserMode, eraserSize, refreshLayers, pushHistory]);
`;

lines.splice(mainEffectIdx, 0, ...eraserEffect.split("\n"));
console.log("STEP 2: Eraser useEffect inserted before line", mainEffectIdx + 1);

code = lines.join("\n"); lines = code.split("\n");

// ═══════════════════════════════════════════
// STEP 3: Simplify Select button — just setEraserMode(false)
// ═══════════════════════════════════════════
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Select (V)") && lines[i].includes("_eraserCleanup")) {
    // Simplify back to just state changes
    lines[i] = lines[i].replace(
      /setEraserMode\(false\);if\(\(c as any\)\._eraserCleanup\).*?style\.cursor=''/,
      "setEraserMode(false)"
    );
    console.log("STEP 3: Select button simplified at line", i + 1);
    break;
  }
}

// ═══════════════════════════════════════════
// STEP 4: Clean any remaining _eraserCleanup references
// ═══════════════════════════════════════════
code = lines.join("\n"); lines = code.split("\n");
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes("_eraserCleanup") && !lines[i].includes("useEffect") && !lines[i].includes("STEP")) {
    console.log("STEP 4: Removing _eraserCleanup ref at line", i + 1, ":", lines[i].substring(0, 80));
    lines.splice(i, 1);
  }
}

// Final write
code = lines.join("\n");
lines = code.split("\n");
const ob = (code.match(/\{/g) || []).length;
const cb = (code.match(/\}/g) || []).length;
console.log("Done! Lines:", lines.length, "| { :", ob, "| } :", cb, "| diff:", ob - cb);
fs.writeFileSync(file, code, "utf8");
