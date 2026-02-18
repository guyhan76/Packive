const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── Fix 1: Add spacebar panning useEffect ──
if (!code.includes("Space bar panning")) {
  // Insert before the keyboard handler useEffect
  const keyHandlerEffect = "document.addEventListener('keydown', keyHandler)";
  const keyIdx = code.indexOf(keyHandlerEffect);
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
      console.log("[1] Added spacebar panning useEffect");
    }
  }
}

// ── Fix 2: Fix Ctrl+wheel zoom - use ref instead of closure ──
// Problem: ref callback binds once with zoom=100, never updates
// Solution: Use a ref to track zoom, and read from it in the wheel handler

// Add zoomRef
const zoomState = "const [zoom, setZoom] = useState(100);";
if (code.includes(zoomState) && !code.includes("zoomRef")) {
  code = code.replace(zoomState, zoomState + `
  const zoomRef = useRef(100);`);
  changes++;
  console.log("[2] Added zoomRef");
}

// Update zoomRef whenever zoom changes - add to applyZoom
const applyZoomSetZoom = "    setZoom(z);";
if (code.includes(applyZoomSetZoom) && !code.includes("zoomRef.current = z")) {
  code = code.replace(applyZoomSetZoom, applyZoomSetZoom + "\n    zoomRef.current = z;");
  changes++;
  console.log("[3] Update zoomRef in applyZoom");
}

// Replace the wheel handler to use zoomRef
const oldWheel = `el.addEventListener("wheel", (ev: WheelEvent) => {
                  if (ev.ctrlKey || ev.metaKey) {
                    ev.preventDefault();
                    const delta = ev.deltaY > 0 ? -10 : 10;
                    applyZoom(zoom + delta);
                  }
                }, { passive: false });
                (el as any).__wheelBound = true;`;

const newWheel = `el.addEventListener("wheel", (ev: WheelEvent) => {
                  if (ev.ctrlKey || ev.metaKey) {
                    ev.preventDefault();
                    const delta = ev.deltaY > 0 ? -10 : 10;
                    applyZoom(zoomRef.current + delta);
                  }
                }, { passive: false });
                (el as any).__wheelBound = true;`;

if (code.includes(oldWheel)) {
  code = code.replace(oldWheel, newWheel);
  changes++;
  console.log("[4] Fixed wheel handler to use zoomRef");
} else {
  console.log("[MISS] Old wheel handler not found, trying partial...");
  if (code.includes("applyZoom(zoom + delta)")) {
    code = code.replace("applyZoom(zoom + delta)", "applyZoom(zoomRef.current + delta)");
    changes++;
    console.log("[4b] Fixed wheel zoom via partial match");
  }
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
