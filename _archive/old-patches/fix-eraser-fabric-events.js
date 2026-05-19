const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let lines = code.split("\n");
console.log("Start:", lines.length);

// Find eraser useEffect and replace event handling
let eStart = -1, eEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("Eraser Mode Effect")) { eStart = i; break; }
}
for (let i = eStart; i < lines.length; i++) {
  if (lines[i].includes("eraserMode, eraserSize, refreshLayers, pushHistory")) { eEnd = i; break; }
}
console.log("Old eraser effect:", eStart + 1, "-", eEnd + 1);

const newEffect = `  // ═══ Eraser Mode Effect ═══
  useEffect(() => {
    const canvas = fcRef.current;
    if (!canvas) return;
    const el = canvas.upperCanvasEl || canvas.getElement();

    if (!eraserMode) {
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
    canvas.isDrawingMode = false;
    canvas.defaultCursor = "none";
    canvas.hoverCursor = "none";
    if (el) el.style.cursor = "none";

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

    const doErase = (opt: any) => {
      if (!opt.e) return;
      const e = opt.e as MouseEvent;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const r = eraserSize / 2;
      let didRemove = false;
      canvas.getObjects().slice().forEach((obj: any) => {
        if (obj._isSafeZone || obj._isGuideText || obj._isSizeLabel || obj._isBgImage) return;
        if (obj.selectable === false) return;
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

    const onDown = (opt: any) => { erasing = true; doErase(opt); };
    const onMove = (opt: any) => {
      if (!opt.e) return;
      const e = opt.e as MouseEvent;
      const cur2 = document.getElementById("eraser-cursor");
      if (cur2) {
        cur2.style.display = "block";
        cur2.style.left = e.clientX + "px";
        cur2.style.top = e.clientY + "px";
        cur2.style.width = eraserSize + "px";
        cur2.style.height = eraserSize + "px";
      }
      if (erasing) doErase(opt);
    };
    const onUp = () => { if (erasing) { erasing = false; pushHistory(); } };

    canvas.on("mouse:down", onDown);
    canvas.on("mouse:move", onMove);
    canvas.on("mouse:up", onUp);

    return () => {
      canvas.off("mouse:down", onDown);
      canvas.off("mouse:move", onMove);
      canvas.off("mouse:up", onUp);
    };
  }, [eraserMode, eraserSize, refreshLayers, pushHistory]);`;

lines.splice(eStart, eEnd - eStart + 1, ...newEffect.split("\n"));
console.log("New eraser effect inserted");

// Also fix toggleDraw — add setEraserMode(false) in the else branch
code = lines.join("\n"); lines = code.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const toggleDraw = useCallback")) {
    for (let j = i; j < i + 25; j++) {
      if (lines[j] && lines[j].includes("setDrawMode(true)")) {
        if (!lines[j + 1] || !lines[j + 1].includes("setEraserMode(false)")) {
          lines.splice(j + 1, 0, "        setEraserMode(false);");
          console.log("toggleDraw: added setEraserMode(false) at line", j + 2);
        }
        break;
      }
    }
    break;
  }
}

code = lines.join("\n");
lines = code.split("\n");
const ob = (code.match(/\{/g) || []).length;
const cb = (code.match(/\}/g) || []).length;
console.log("Done! Lines:", lines.length, "| { :", ob, "| } :", cb, "| diff:", ob - cb);
fs.writeFileSync(file, code, "utf8");
