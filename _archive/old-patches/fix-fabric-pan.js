const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// 1) Add panning logic to Fabric canvas mouse events
// Insert BEFORE "// Measure tool mouse handlers"
const measureMarker = `// Measure tool mouse handlers`;
const panningCode = `// ── Fabric canvas panning (Space + drag) ──
      canvas.on('mouse:down', (opt: any) => {
        if (isPanningRef.current) {
          const scrollEl = (canvasElRef.current?.closest('[class*="overflow-auto"]')) as HTMLElement;
          if (scrollEl) {
            (canvas as any)._panData = {
              x: opt.e.clientX,
              y: opt.e.clientY,
              scrollLeft: scrollEl.scrollLeft,
              scrollTop: scrollEl.scrollTop,
            };
            (canvas as any)._isPanDragging = true;
            opt.e.preventDefault();
            opt.e.stopPropagation();
          }
        }
      });
      canvas.on('mouse:move', (opt: any) => {
        if ((canvas as any)._isPanDragging && isPanningRef.current) {
          const pd = (canvas as any)._panData;
          if (!pd) return;
          const scrollEl = (canvasElRef.current?.closest('[class*="overflow-auto"]')) as HTMLElement;
          if (scrollEl) {
            scrollEl.scrollLeft = pd.scrollLeft - (opt.e.clientX - pd.x);
            scrollEl.scrollTop = pd.scrollTop - (opt.e.clientY - pd.y);
          }
          opt.e.preventDefault();
        }
      });
      canvas.on('mouse:up', () => {
        if ((canvas as any)._isPanDragging) {
          (canvas as any)._isPanDragging = false;
          (canvas as any)._panData = null;
        }
      });

      `;

if (code.includes(measureMarker)) {
  code = code.replace(measureMarker, panningCode + measureMarker);
  changes++;
  console.log("[Fix] Added Fabric panning mouse handlers");
}

// 2) Update Space DOWN to change cursor on both container AND Fabric canvas
const oldSpaceDown = `if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        setIsPanning(true);
        isPanningRef.current = true;
        console.log("[Panning] Space DOWN - isPanning = true");`;
const newSpaceDown = `if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
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
        }`;
if (code.includes(oldSpaceDown)) {
  code = code.replace(oldSpaceDown, newSpaceDown);
  changes++;
  console.log("[Fix] Space DOWN: cursor grab everywhere");
}

// 3) Update Space UP to reset cursors
const oldSpaceUp = `setIsPanning(false);
        isPanningRef.current = false;
        panActiveRef.current = false;
        console.log("[Panning] Space UP - isPanning = false");`;
const newSpaceUp = `setIsPanning(false);
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
        }`;
if (code.includes(oldSpaceUp)) {
  code = code.replace(oldSpaceUp, newSpaceUp);
  changes++;
  console.log("[Fix] Space UP: cursor reset everywhere");
}

// 4) Also disable Fabric selection during panning to prevent object manipulation
const panDataBlock = `(canvas as any)._isPanDragging = true;
            opt.e.preventDefault();
            opt.e.stopPropagation();`;
const panDataBlockNew = `(canvas as any)._isPanDragging = true;
            canvas.selection = false;
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            opt.e.preventDefault();
            opt.e.stopPropagation();`;
if (code.includes(panDataBlock)) {
  code = code.replace(panDataBlock, panDataBlockNew);
  changes++;
  console.log("[Fix] Disable selection during pan drag");
}

// 5) Restore selection on mouse:up after panning
const panUpBlock = `if ((canvas as any)._isPanDragging) {
          (canvas as any)._isPanDragging = false;
          (canvas as any)._panData = null;
        }`;
const panUpBlockNew = `if ((canvas as any)._isPanDragging) {
          (canvas as any)._isPanDragging = false;
          (canvas as any)._panData = null;
          if (!isPanningRef.current) {
            canvas.selection = true;
          }
        }`;
if (code.includes(panUpBlock)) {
  code = code.replace(panUpBlock, panUpBlockNew);
  changes++;
  console.log("[Fix] Restore selection after pan");
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
if (changes >= 3) console.log("✅ Panning now works directly on Fabric canvas!");
else console.log("⚠️ Some patterns not matched");
