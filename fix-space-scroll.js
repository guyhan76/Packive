const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// 1) Space DOWN - add capturing event listener instead of regular
// The issue is that Space scrolls the page BEFORE our handler runs
// Replace the entire useEffect with a capturing version

const oldUseEffect = `// ── Space bar panning handler ──
  useEffect(() => {
    const handleSpaceDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        // Blur focused button to prevent space triggering zoom
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        setIsPanning(true);
        isPanningRef.current = true;
        // Change cursors everywhere
        const scrollEl = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
        if (scrollEl) scrollEl.style.cursor = "grab";
        document.body.style.cursor = "grab";
        const fc = fcRef.current;
        if (fc) {
          fc.defaultCursor = "grab";
          fc.hoverCursor = "grab";
          fc.getObjects().forEach((o: any) => { o.hoverCursor = "grab"; });
          fc.requestRenderAll();
        }
      }
    };
    const handleSpaceUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPanning(false);
        isPanningRef.current = false;
        panActiveRef.current = false;
        // Reset cursors everywhere
        const scrollEl2 = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
        if (scrollEl2) scrollEl2.style.cursor = "";
        document.body.style.cursor = "";
        const fc2 = fcRef.current;
        if (fc2) {
          fc2.defaultCursor = "default";
          fc2.hoverCursor = "move";
          fc2.getObjects().forEach((o: any) => { o.hoverCursor = "move"; });
          fc2.requestRenderAll();
        }
      }
    };
    document.addEventListener("keydown", handleSpaceDown);
    document.addEventListener("keyup", handleSpaceUp);
    return () => {
      document.removeEventListener("keydown", handleSpaceDown);
      document.removeEventListener("keyup", handleSpaceUp);
    };
  }, []);`;

const newUseEffect = `// ── Space bar panning handler (capture phase to prevent scroll) ──
  useEffect(() => {
    const handleSpaceDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      setIsPanning(true);
      isPanningRef.current = true;
      // Immediate cursor change
      document.body.style.cursor = "grab";
      const scrollEl = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      if (scrollEl) scrollEl.style.cursor = "grab";
      const fc = fcRef.current;
      if (fc) {
        fc.defaultCursor = "grab";
        fc.hoverCursor = "grab";
        fc.getObjects().forEach((o: any) => { o.hoverCursor = "grab"; });
        fc.requestRenderAll();
      }
    };
    const handleSpaceUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setIsPanning(false);
      isPanningRef.current = false;
      panActiveRef.current = false;
      // Reset cursor
      document.body.style.cursor = "";
      const scrollEl = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      if (scrollEl) scrollEl.style.cursor = "";
      const fc = fcRef.current;
      if (fc) {
        fc.defaultCursor = "default";
        fc.hoverCursor = "move";
        fc.getObjects().forEach((o: any) => { o.hoverCursor = "move"; });
        fc.selection = true;
        fc.requestRenderAll();
      }
    };
    // Use CAPTURE phase to intercept before browser scrolls
    document.addEventListener("keydown", handleSpaceDown, true);
    document.addEventListener("keyup", handleSpaceUp, true);
    return () => {
      document.removeEventListener("keydown", handleSpaceDown, true);
      document.removeEventListener("keyup", handleSpaceUp, true);
    };
  }, []);`;

if (code.includes(oldUseEffect)) {
  code = code.replace(oldUseEffect, newUseEffect);
  changes++;
  console.log("[Fix] Replaced Space handler with capture-phase version");
} else {
  console.log("[Warning] Could not find old useEffect - checking partial match...");
  // Try partial match
  if (code.includes("// ── Space bar panning handler ──")) {
    console.log("  Found marker but full block didn't match");
    // Show what's around it for debugging
    const idx = code.indexOf("// ── Space bar panning handler ──");
    console.log("  Code around marker:", code.substring(idx, idx + 200));
  }
}

// 2) Also prevent space from scrolling in the scroll container
const scrollContainerStyle = `style={{ cursor: isPanning ? "grab" : undefined }}`;
const scrollContainerStyleNew = `style={{ cursor: isPanning ? "grab" : undefined }}
          onKeyDown={(e) => { if (e.code === "Space") { e.preventDefault(); } }}`;
if (code.includes(scrollContainerStyle) && !code.includes('onKeyDown={(e) => { if (e.code === "Space")')) {
  code = code.replace(scrollContainerStyle, scrollContainerStyleNew);
  changes++;
  console.log("[Fix] Added onKeyDown Space prevention on scroll container");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
if (changes >= 1) console.log("✅ Space bar scroll prevention applied!");
else console.log("⚠️ No changes made - manual fix needed");
