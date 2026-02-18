const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── Fix 1: applyZoom should ONLY update state, not modify canvas ──
// Find current applyZoom
const applyZoomStart = code.indexOf("const applyZoom = useCallback((newZoom: number) => {");
const applyZoomEnd = code.indexOf("}, []);", applyZoomStart);

if (applyZoomStart > -1 && applyZoomEnd > -1) {
  const oldApplyZoom = code.slice(applyZoomStart, applyZoomEnd + "}, []);".length);
  console.log("[Debug] Old applyZoom length:", oldApplyZoom.length);
  
  const newApplyZoom = `const applyZoom = useCallback((newZoom: number) => {
    const z = Math.max(25, Math.min(400, newZoom));
    setZoom(z);
    zoomRef.current = z;
    // Auto show minimap at 150%+
    if (z >= 150) setShowMinimap(true);
  }, []);`;
  
  code = code.slice(0, applyZoomStart) + newApplyZoom + code.slice(applyZoomStart + oldApplyZoom.length);
  changes++;
  console.log("[1] Simplified applyZoom to CSS-only zoom (no canvas resize)");
}

// ── Fix 2: Ensure spacebar panning exists ──
if (!code.includes("Space bar panning")) {
  const keyHandlerEffect = "document.addEventListener('keydown', keyHandler)";
  const keyIdx = code.indexOf(keyHandlerEffect);
  if (keyIdx > -1) {
    let effectStart = code.lastIndexOf("useEffect(() => {", keyIdx);
    if (effectStart > -1) {
      const spaceEffect = `// Space bar panning
  useEffect(() => {
    const handleSpaceDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && 
          document.activeElement?.tagName !== "INPUT" && 
          document.activeElement?.tagName !== "TEXTAREA" &&
          document.activeElement?.tagName !== "SELECT") {
        e.preventDefault();
        setIsPanning(true);
      }
    };
    const handleSpaceUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPanning(false);
        panActiveRef.current = false;
      }
    };
    document.addEventListener("keydown", handleSpaceDown);
    document.addEventListener("keyup", handleSpaceUp);
    return () => {
      document.removeEventListener("keydown", handleSpaceDown);
      document.removeEventListener("keyup", handleSpaceUp);
    };
  }, []);

  `;
      code = code.slice(0, effectStart) + spaceEffect + code.slice(effectStart);
      changes++;
      console.log("[2] Added spacebar panning useEffect");
    }
  }
} else {
  console.log("[OK] Spacebar panning already exists");
}

// ── Fix 3: Verify panning mouse handlers detect isPanning correctly ──
// The issue might be that isPanning in onMouseDown is stale due to closure
// Let's use a ref for isPanning too
if (!code.includes("isPanningRef")) {
  const isPanningState = "const [isPanning, setIsPanning] = useState(false);";
  if (code.includes(isPanningState)) {
    code = code.replace(isPanningState, isPanningState + `
  const isPanningRef = useRef(false);`);
    changes++;
    console.log("[3a] Added isPanningRef");
  }
  
  // Update setIsPanning calls to also update ref
  code = code.replace(
    "setIsPanning(true);",
    "setIsPanning(true); isPanningRef.current = true;"
  );
  // Handle the second occurrence
  code = code.replace(
    "setIsPanning(true); isPanningRef.current = true;",
    "setIsPanning(true); isPanningRef.current = true;"
  );
  
  // For false - be careful with multiple occurrences
  const falsePattern = "setIsPanning(false);";
  let idx = 0;
  while ((idx = code.indexOf(falsePattern, idx)) !== -1) {
    if (!code.slice(idx, idx + 60).includes("isPanningRef.current = false")) {
      code = code.slice(0, idx) + "setIsPanning(false); isPanningRef.current = false;" + code.slice(idx + falsePattern.length);
    }
    idx += 60;
  }
  changes++;
  console.log("[3b] Updated setIsPanning to also update ref");
  
  // Update mouse handler to check ref instead of state
  const oldPanCheck = "(e.button === 0 && isPanning)";
  if (code.includes(oldPanCheck)) {
    code = code.replace(oldPanCheck, "(e.button === 0 && isPanningRef.current)");
    changes++;
    console.log("[3c] Mouse handler uses isPanningRef");
  }
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
