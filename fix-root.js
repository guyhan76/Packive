const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let lines = code.split("\n");
console.log("Start:", lines.length);

// ═══════════════════════════════════════════
// FIX A: addSafeZone — strokeUniform: true 추가 + 정확한 사각형
// ═══════════════════════════════════════════
const szStart = lines.findIndex(l => l.includes("const addSafeZone = useCallback"));
if (szStart === -1) { console.log("ERROR: addSafeZone not found"); process.exit(1); }
const szEnd = lines.findIndex((l, i) => i > szStart && /^\s*\}, \[/.test(l));
if (szEnd === -1) { console.log("ERROR: addSafeZone end not found"); process.exit(1); }
console.log("FIX A: addSafeZone lines", szStart+1, "-", szEnd+1);

const newSafeZone = `    const addSafeZone = useCallback(() => {
      const canvas = fcRef.current; if (!canvas) return;
      const fab = fabricModRef.current;
      if (!fab?.FabricText || !fab?.Rect) return;
      const { FabricText, Rect } = fab;
      // Remove existing safe zone objects
      canvas.getObjects().slice().forEach((o: any) => {
        if (o._isSafeZone || o._isGuideText || o._isSizeLabel) canvas.remove(o);
      });
      const cw = canvas.getWidth();
      const ch = canvas.getHeight();
      // Calculate 5mm margins based on physical dimensions
      const pxPerMmW = cw / widthMM;
      const pxPerMmH = ch / heightMM;
      const mgX = Math.round(5 * pxPerMmW);
      const mgY = Math.round(5 * pxPerMmH);
      console.log("[SafeZone] cw:", cw, "ch:", ch, "mgX:", mgX, "mgY:", mgY, "pxPerMmW:", pxPerMmW.toFixed(2), "pxPerMmH:", pxPerMmH.toFixed(2));
      // Safe zone rectangle — use strokeUniform to prevent stroke from eating into dimensions
      const sr = new Rect({
        left: mgX,
        top: mgY,
        width: cw - mgX * 2,
        height: ch - mgY * 2,
        fill: "transparent",
        stroke: "#3B82F6",
        strokeWidth: 1.5,
        strokeDashArray: [8, 5],
        strokeUniform: true,
        selectable: false,
        evented: false,
        originX: "left",
        originY: "top",
      });
      (sr as any)._isSafeZone = true;
      canvas.add(sr);
      // Guide text
      const gt = new FabricText(guideText || "Design Area", {
        left: cw / 2, top: ch / 2, originX: "center", originY: "center",
        fontSize: 12, fill: "#D0D0D0",
        fontFamily: "Arial, sans-serif", selectable: false, evented: false,
      });
      (gt as any)._isGuideText = true;
      canvas.add(gt);
      // Size label
      const sl = new FabricText(widthMM + " x " + heightMM + " mm", {
        left: cw - mgX - 4, top: ch - mgY - 4,
        originX: "right", originY: "bottom",
        fontSize: 9, fill: "#C0C0C0",
        fontFamily: "Arial, sans-serif", selectable: false, evented: false,
      });
      (sl as any)._isSizeLabel = true;
      canvas.add(sl);
      canvas.bringObjectToFront(sr);
      canvas.bringObjectToFront(gt);
      canvas.bringObjectToFront(sl);
      canvas.requestRenderAll();
    }, [widthMM, heightMM, guideText]);`;

lines.splice(szStart, szEnd - szStart + 1, ...newSafeZone.split("\n"));
console.log("FIX A: addSafeZone replaced");

// Re-read after splice
code = lines.join("\n");
lines = code.split("\n");

// ═══════════════════════════════════════════
// FIX B: Eraser — eraserSizeRef 사용으로 클로저 문제 해결
// ═══════════════════════════════════════════

// B-1: eraserSizeRef 선언 추가 (eraserSize state 선언 근처)
const eraserStateLine = lines.findIndex(l => l.includes("eraserSize") && l.includes("useState"));
if (eraserStateLine !== -1) {
  // Check if eraserSizeRef already exists
  const hasRef = lines.some(l => l.includes("eraserSizeRef"));
  if (!hasRef) {
    lines.splice(eraserStateLine + 1, 0, "  const eraserSizeRef = useRef(eraserSize);");
    console.log("FIX B-1: eraserSizeRef added after line", eraserStateLine + 2);
  } else {
    console.log("FIX B-1: eraserSizeRef already exists");
  }
}

code = lines.join("\n");
lines = code.split("\n");

// B-2: eraserSizeRef sync useEffect 추가 (addSafeZone 직전)
const szStartNew = lines.findIndex(l => l.includes("const addSafeZone = useCallback"));
const hasSyncEffect = lines.some(l => l.includes("eraserSizeRef.current = eraserSize"));
if (!hasSyncEffect && szStartNew !== -1) {
  const syncEffect = `    // Sync eraserSizeRef with state
    useEffect(() => {
      eraserSizeRef.current = eraserSize;
      const cur = document.getElementById("eraser-cursor");
      if (cur) { cur.style.width = eraserSize + "px"; cur.style.height = eraserSize + "px"; }
    }, [eraserSize]);
`;
  lines.splice(szStartNew, 0, ...syncEffect.split("\n"));
  console.log("FIX B-2: eraserSize sync effect added before line", szStartNew + 1);
}

code = lines.join("\n");
lines = code.split("\n");

// B-3: toggleEraser 교체 — eraserSizeRef.current 사용
const erStart = lines.findIndex(l => l.includes("const toggleEraser = useCallback"));
if (erStart === -1) { console.log("ERROR: toggleEraser not found"); process.exit(1); }
let erEnd = -1;
let braceCount = 0;
let started = false;
for (let i = erStart; i < lines.length; i++) {
  for (const ch of lines[i]) {
    if (ch === "{") { braceCount++; started = true; }
    if (ch === "}") braceCount--;
  }
  if (started && braceCount === 0) { erEnd = i; break; }
}
if (erEnd === -1) { console.log("ERROR: toggleEraser end not found"); process.exit(1); }
console.log("FIX B-3: toggleEraser lines", erStart+1, "-", erEnd+1);

const newToggleEraser = `    const toggleEraser = useCallback(() => {
      const c = fcRef.current; if (!c) return;
      if (eraserMode) {
        // Turn OFF eraser
        c.selection = true;
        c.defaultCursor = "default";
        c.hoverCursor = "move";
        c.forEachObject((o: any) => {
          if (o._prevSelectable !== undefined) { o.selectable = o._prevSelectable; o.evented = o._prevEvented; delete o._prevSelectable; delete o._prevEvented; }
        });
        if ((c as any)._eraserDown) c.off("mouse:down", (c as any)._eraserDown);
        if ((c as any)._eraserMove) c.off("mouse:move", (c as any)._eraserMove);
        if ((c as any)._eraserUp) c.off("mouse:up", (c as any)._eraserUp);
        const cur = document.getElementById("eraser-cursor"); if (cur) cur.remove();
        const canvasEl = c.upperCanvasEl || c.getElement();
        if (canvasEl) canvasEl.style.cursor = "";
        c.renderAll();
        setEraserMode(false);
      } else {
        // Turn ON eraser
        c.isDrawingMode = false;
        c.selection = false;
        c.discardActiveObject();
        c.forEachObject((o: any) => { o._prevSelectable = o.selectable; o._prevEvented = o.evented; o.selectable = false; o.evented = false; });
        c.renderAll();
        setDrawMode(false);
        // Create cursor element
        let cursorEl = document.getElementById("eraser-cursor");
        if (!cursorEl) {
          cursorEl = document.createElement("div");
          cursorEl.id = "eraser-cursor";
          cursorEl.style.cssText = "position:fixed;pointer-events:none;border:2px solid #ff4444;border-radius:50%;z-index:9999;display:none;transform:translate(-50%,-50%);background:rgba(255,68,68,0.1);";
          document.body.appendChild(cursorEl);
        }
        const initSize = eraserSizeRef.current;
        cursorEl.style.width = initSize + "px";
        cursorEl.style.height = initSize + "px";
        // Hide system cursor
        c.defaultCursor = "none";
        c.hoverCursor = "none";
        const canvasEl = c.upperCanvasEl || c.getElement();
        if (canvasEl) canvasEl.style.cursor = "none";
        let isErasing = false;
        // Canvas point from native mouse event
        const getCanvasPoint = (e: MouseEvent) => {
          const el = canvasEl || c.getElement();
          const rect = el.getBoundingClientRect();
          return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        // Erase objects at mouse position — reads eraserSizeRef.current live
        const eraseAt = (e: MouseEvent) => {
          const point = getCanvasPoint(e);
          const r = eraserSizeRef.current / 2;
          const allObjs = c.getObjects().slice();
          let removed = false;
          for (const obj of allObjs) {
            if ((obj as any)._isSafeZone || (obj as any)._isGuideText || (obj as any)._isSizeLabel || (obj as any)._isBgImage) continue;
            if (obj.selectable === false && obj.evented === false && !(obj as any)._prevSelectable) continue;
            const bound = obj.getBoundingRect();
            const cx = bound.left + bound.width / 2;
            const cy = bound.top + bound.height / 2;
            const dist = Math.sqrt((point.x - cx) ** 2 + (point.y - cy) ** 2);
            if (dist < r + Math.max(bound.width, bound.height) / 2) {
              c.remove(obj);
              removed = true;
            }
          }
          if (removed) { c.requestRenderAll(); refreshLayers(); }
        };
        // Native event handlers on canvas element for reliable drag
        const nativeDown = (e: MouseEvent) => {
          isErasing = true;
          eraseAt(e);
        };
        const nativeMove = (e: MouseEvent) => {
          // Always update cursor position
          const cur = document.getElementById("eraser-cursor");
          if (cur) {
            cur.style.display = "block";
            cur.style.left = e.clientX + "px";
            cur.style.top = e.clientY + "px";
            // Live size from ref
            const sz = eraserSizeRef.current;
            cur.style.width = sz + "px";
            cur.style.height = sz + "px";
          }
          if (isErasing) eraseAt(e);
        };
        const nativeUp = () => {
          if (isErasing) {
            isErasing = false;
            pushHistory();
          }
        };
        // Use native event listeners for reliable drag tracking
        if (canvasEl) {
          canvasEl.addEventListener("mousedown", nativeDown);
          canvasEl.addEventListener("mousemove", nativeMove);
          canvasEl.addEventListener("mouseup", nativeUp);
          document.addEventListener("mouseup", nativeUp);
        }
        // Store refs for cleanup
        (c as any)._eraserNativeDown = nativeDown;
        (c as any)._eraserNativeMove = nativeMove;
        (c as any)._eraserNativeUp = nativeUp;
        (c as any)._eraserCanvasEl = canvasEl;
        setEraserMode(true);
      }
    }, [eraserMode, refreshLayers, pushHistory]);`;

lines.splice(erStart, erEnd - erStart + 1, ...newToggleEraser.split("\n"));
console.log("FIX B-3: toggleEraser replaced");

// Re-read
code = lines.join("\n");
lines = code.split("\n");

// B-4: Eraser cleanup 수정 — native listeners 제거
const erCleanupIdx = lines.findIndex(l => l.includes("_eraserDown") && l.includes("c.off"));
if (erCleanupIdx !== -1) {
  // Find all consecutive eraser cleanup lines
  let cleanEnd = erCleanupIdx;
  while (cleanEnd < lines.length && (lines[cleanEnd].includes("_eraser") && (lines[cleanEnd].includes("c.off") || lines[cleanEnd].includes("remove")))) {
    cleanEnd++;
  }
}

// Update the eraser OFF branch to also remove native listeners
// Find the eraser OFF section inside toggleEraser
const newErStart = lines.findIndex(l => l.includes("const toggleEraser = useCallback"));
if (newErStart !== -1) {
  for (let i = newErStart; i < newErStart + 20; i++) {
    if (lines[i] && lines[i].includes("_eraserDown") && lines[i].includes("c.off")) {
      // Replace the old Fabric event cleanup with native cleanup
      const nativeCleanup = `        // Remove native event listeners
        const _el = (c as any)._eraserCanvasEl;
        if (_el) {
          if ((c as any)._eraserNativeDown) _el.removeEventListener("mousedown", (c as any)._eraserNativeDown);
          if ((c as any)._eraserNativeMove) _el.removeEventListener("mousemove", (c as any)._eraserNativeMove);
          if ((c as any)._eraserNativeUp) { _el.removeEventListener("mouseup", (c as any)._eraserNativeUp); document.removeEventListener("mouseup", (c as any)._eraserNativeUp); }
        }`;
      // Count how many old cleanup lines to replace
      let oldEnd = i;
      while (oldEnd < lines.length && lines[oldEnd].includes("_eraser") && (lines[oldEnd].includes("c.off") || lines[oldEnd].includes("remove"))) {
        oldEnd++;
      }
      lines.splice(i, oldEnd - i, ...nativeCleanup.split("\n"));
      console.log("FIX B-4: Eraser cleanup updated at line", i + 1);
      break;
    }
  }
}

// Final write
code = lines.join("\n");
lines = code.split("\n");
const ob = (code.match(/\{/g) || []).length;
const cb = (code.match(/\}/g) || []).length;
console.log("Done! Lines:", lines.length, "| { :", ob, "| } :", cb, "| diff:", ob - cb);
fs.writeFileSync(file, code, "utf8");
