const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// 1) Fix Space DOWN handler - add direct DOM cursor change + Fabric cursor
const oldDown = `if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(true);
        isPanningRef.current = true;
        console.log("[Panning] Space DOWN - isPanning = true");
      }`;
const newDown = `if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(true);
        isPanningRef.current = true;
        // Direct DOM cursor change for immediate feedback
        const host = document.querySelector("[class*='overflow-auto']") as HTMLElement;
        if (host) host.style.cursor = "grab";
        const canvasWrapper = host?.querySelector("canvas")?.parentElement;
        if (canvasWrapper) canvasWrapper.style.cursor = "grab";
        const fc = fcRef.current;
        if (fc) { fc.defaultCursor = "grab"; fc.hoverCursor = "grab"; fc.setCursor("grab"); }
      }`;
if (code.includes(oldDown)) {
  code = code.replace(oldDown, newDown);
  changes++;
  console.log("[Fix] Space DOWN: added grab cursor");
}

// 2) Fix Space UP handler - reset cursors
const oldUp = `if (e.code === "Space") {
        setIsPanning(false);
        isPanningRef.current = false;
        panActiveRef.current = false;
        console.log("[Panning] Space UP - isPanning = false");
      }`;
const newUp = `if (e.code === "Space") {
        e.preventDefault();
        setIsPanning(false);
        isPanningRef.current = false;
        panActiveRef.current = false;
        // Reset cursors
        const host = document.querySelector("[class*='overflow-auto']") as HTMLElement;
        if (host) host.style.cursor = "";
        const canvasWrapper = host?.querySelector("canvas")?.parentElement;
        if (canvasWrapper) canvasWrapper.style.cursor = "";
        const fc = fcRef.current;
        if (fc) { fc.defaultCursor = "default"; fc.hoverCursor = "move"; fc.setCursor("default"); }
      }`;
if (code.includes(oldUp)) {
  code = code.replace(oldUp, newUp);
  changes++;
  console.log("[Fix] Space UP: reset cursors");
}

// 3) Also fix onMouseDown to show "grabbing" on canvas too
const oldGrabbing = `panActiveRef.current = true;
              el.style.cursor = "grabbing";`;
const newGrabbing = `panActiveRef.current = true;
              el.style.cursor = "grabbing";
              const fc4 = fcRef.current;
              if (fc4) { fc4.defaultCursor = "grabbing"; fc4.hoverCursor = "grabbing"; fc4.setCursor("grabbing"); }`;
let grabCount = 0;
while (code.includes(oldGrabbing)) {
  code = code.replace(oldGrabbing, newGrabbing);
  grabCount++;
}
if (grabCount > 0) {
  changes += grabCount;
  console.log(`[Fix] Added grabbing cursor in ${grabCount} mouseDown handler(s)`);
}

// 4) Fix onMouseUp/onMouseLeave to restore after drag
const oldMouseUp = `panActiveRef.current = false;
            panStartRef.current = null;
            e.currentTarget.style.cursor = isPanning ? "grab" : "";`;
const newMouseUp = `panActiveRef.current = false;
            panStartRef.current = null;
            e.currentTarget.style.cursor = isPanningRef.current ? "grab" : "";
            const fc5 = fcRef.current;
            if (fc5) {
              if (isPanningRef.current) { fc5.defaultCursor = "grab"; fc5.hoverCursor = "grab"; fc5.setCursor("grab"); }
              else { fc5.defaultCursor = "default"; fc5.hoverCursor = "move"; fc5.setCursor("default"); }
            }`;
let upCount = 0;
while (code.includes(oldMouseUp)) {
  code = code.replace(oldMouseUp, newMouseUp);
  upCount++;
}
if (upCount > 0) {
  changes += upCount;
  console.log(`[Fix] Fixed ${upCount} mouseUp/Leave handler(s)`);
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
if (changes > 0) console.log("✅ Cursor will now change to grab/grabbing during Space+drag!");
else console.log("⚠️ No matches found - check code manually");
