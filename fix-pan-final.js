const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// KEY INSIGHT: setIsPanning() triggers re-render which resets scroll position
// Solution: Remove setIsPanning state entirely, use ONLY isPanningRef
// and use a CSS class toggle via direct DOM manipulation

// 1) Remove useState for isPanning - keep only ref
const oldState = `const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);`;
const newState = `const isPanningRef = useRef(false);`;
if (code.includes(oldState)) {
  code = code.replace(oldState, newState);
  changes++;
  console.log("[Fix] Removed isPanning useState (using ref only)");
}

// 2) Replace all setIsPanning(true) with just isPanningRef.current = true
let setTrueCount = 0;
while (code.includes("setIsPanning(true);")) {
  code = code.replace("setIsPanning(true);", "isPanningRef.current = true;");
  setTrueCount++;
}
if (setTrueCount > 0) { changes++; console.log(`[Fix] Replaced ${setTrueCount} setIsPanning(true)`); }

// 3) Replace all setIsPanning(false) with just isPanningRef.current = false
let setFalseCount = 0;
while (code.includes("setIsPanning(false);")) {
  code = code.replace("setIsPanning(false);", "isPanningRef.current = false;");
  setFalseCount++;
}
if (setFalseCount > 0) { changes++; console.log(`[Fix] Replaced ${setFalseCount} setIsPanning(false)`); }

// 4) Replace CSS that depends on isPanning state with direct DOM
// style={{ cursor: isPanning ? "grab" : undefined }} -> managed by JS
const oldCursorStyle = `style={{ cursor: isPanning ? "grab" : undefined }}`;
if (code.includes(oldCursorStyle)) {
  code = code.replace(oldCursorStyle, `style={{ cursor: undefined }}`);
  changes++;
  console.log("[Fix] Removed isPanning cursor from style (handled by JS now)");
}

// 5) Fix onMouseUp/onMouseLeave that reference isPanning
const oldMouseUpCursor = `e.currentTarget.style.cursor = isPanning ? "grab" : "";`;
while (code.includes(oldMouseUpCursor)) {
  code = code.replace(oldMouseUpCursor, `e.currentTarget.style.cursor = isPanningRef.current ? "grab" : "";`);
  changes++;
}
console.log("[Fix] Updated mouseUp/Leave to use isPanningRef");

// 6) Fix onKeyDown that references isPanning  
const oldKeyDown = `onKeyDown={(e) => { if (e.code === "Space") { e.preventDefault(); } }}`;
const newKeyDown = `onKeyDown={(e) => { if (e.code === "Space") { e.preventDefault(); e.stopPropagation(); } }}`;
if (code.includes(oldKeyDown)) {
  code = code.replace(oldKeyDown, newKeyDown);
  changes++;
  console.log("[Fix] Updated onKeyDown to stopPropagation");
}

// 7) Prevent scroll jump: save and restore scroll position around Space key
const oldSpaceDownHandler = `e.preventDefault();
      e.stopImmediatePropagation();
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      isPanningRef.current = true;
      isPanningRef.current = true;`;
const newSpaceDownHandler = `e.preventDefault();
      e.stopImmediatePropagation();
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      // Save scroll position before any changes
      const scrollEl0 = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      const savedScrollLeft = scrollEl0?.scrollLeft || 0;
      const savedScrollTop = scrollEl0?.scrollTop || 0;
      isPanningRef.current = true;`;
if (code.includes(oldSpaceDownHandler)) {
  code = code.replace(oldSpaceDownHandler, newSpaceDownHandler);
  changes++;
  console.log("[Fix] Save scroll position on Space DOWN");
}

// Also handle the double isPanningRef line (from earlier setIsPanning replacement)
while (code.includes("isPanningRef.current = true;\n      isPanningRef.current = true;")) {
  code = code.replace("isPanningRef.current = true;\n      isPanningRef.current = true;", "isPanningRef.current = true;");
  changes++;
}
while (code.includes("isPanningRef.current = false;\n      isPanningRef.current = false;")) {
  code = code.replace("isPanningRef.current = false;\n      isPanningRef.current = false;", "isPanningRef.current = false;");
  changes++;
}

// 8) After cursor changes in Space DOWN, restore scroll position
const oldScrollElGrab = `const scrollEl = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      if (scrollEl) scrollEl.style.cursor = "grab";`;
const newScrollElGrab = `const scrollEl = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      if (scrollEl) {
        scrollEl.style.cursor = "grab";
        // Restore scroll position that may have shifted
        requestAnimationFrame(() => {
          if (scrollEl0) {
            scrollEl0.scrollLeft = savedScrollLeft;
            scrollEl0.scrollTop = savedScrollTop;
          }
        });
      }`;
if (code.includes(oldScrollElGrab)) {
  code = code.replace(oldScrollElGrab, newScrollElGrab);
  changes++;
  console.log("[Fix] Restore scroll position after cursor change");
}

// 9) Same for Space UP - save/restore scroll
const oldSpaceUpStart = `e.preventDefault();
      e.stopImmediatePropagation();
      isPanningRef.current = false;
      panActiveRef.current = false;`;
const newSpaceUpStart = `e.preventDefault();
      e.stopImmediatePropagation();
      // Save scroll position
      const scrollElUp = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      const savedSL = scrollElUp?.scrollLeft || 0;
      const savedST = scrollElUp?.scrollTop || 0;
      isPanningRef.current = false;
      panActiveRef.current = false;`;
if (code.includes(oldSpaceUpStart)) {
  code = code.replace(oldSpaceUpStart, newSpaceUpStart);
  changes++;
  console.log("[Fix] Save scroll on Space UP");
}

// After cursor reset in Space UP, restore scroll
const oldResetCursor = `const scrollEl = canvasElRef.current?.closest('[class*="overflow-auto"]') as HTMLElement;
      if (scrollEl) scrollEl.style.cursor = "";`;
// Find the one in Space UP (after panActiveRef)
const spaceUpSection = code.indexOf("panActiveRef.current = false;");
if (spaceUpSection > 0) {
  const afterPan = code.indexOf(`if (scrollEl) scrollEl.style.cursor = "";`, spaceUpSection);
  if (afterPan > 0 && afterPan < spaceUpSection + 800) {
    const oldLine = `if (scrollEl) scrollEl.style.cursor = "";`;
    const newLine = `if (scrollEl) {
        scrollEl.style.cursor = "";
        requestAnimationFrame(() => {
          if (scrollElUp) { scrollElUp.scrollLeft = savedSL; scrollElUp.scrollTop = savedST; }
        });
      }`;
    // Replace only in the Space UP context
    const before = code.substring(0, afterPan);
    const after = code.substring(afterPan + oldLine.length);
    code = before + newLine + after;
    changes++;
    console.log("[Fix] Restore scroll on Space UP");
  }
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);

// Verify no isPanning state references remain (except isPanningRef)
const finalCode = fs.readFileSync(file, "utf8");
const stateRefs = (finalCode.match(/\bisPanning\b(?!Ref)/g) || []).length;
console.log(`\nVerification: isPanning (non-ref) references: ${stateRefs} (should be 0)`);
if (stateRefs === 0) console.log("✅ All isPanning converted to ref!");
else console.log("⚠️ Some isPanning state references remain");
