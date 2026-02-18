const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// Problem: There are TWO className= and TWO style= on the same <div>
// The second className overwrites the first, causing layout issues
// We need to remove the duplicate set (the second className + style block after onDrop)

// Find the duplicate block: it starts after the onDrop closing }}
// Pattern: after onDrop handler's closing, there's a duplicate className= line
const dupPattern = /\n\s*className=\{`flex-1 flex bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative \$\{zoom <= 100 \? "items-center justify-center" : "items-start justify-start"\}`\}/;

const matches = [...code.matchAll(new RegExp(dupPattern.source, 'g'))];
console.log(`Found ${matches.length} duplicate className patterns`);

if (matches.length > 0) {
  // Remove only the SECOND occurrence (the duplicate)
  // Find the first className with just "items-center justify-center"
  const first = 'className={`flex-1 flex bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative ${zoom <= 100 ? "items-center justify-center" : ""}`}';
  const second = 'className={`flex-1 flex bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative ${zoom <= 100 ? "items-center justify-center" : "items-start justify-start"}`}';
  
  // Replace the FIRST (incomplete) className with the CORRECT one
  if (code.includes(first)) {
    code = code.replace(first, 
      'className={`flex-1 flex bg-gray-100 min-h-0 min-w-0 overflow-auto p-5 relative ${zoom <= 100 ? "items-center justify-center" : "items-start justify-start"}`}');
    changes++;
    console.log("[Fix] Updated first className with correct zoom condition");
  }
  
  // Remove the second duplicate className line
  if (code.includes(second)) {
    // Find it after onDrop
    const dropIdx = code.indexOf("URL.revokeObjectURL(url);");
    if (dropIdx > 0) {
      const afterDrop = code.indexOf(second, dropIdx);
      if (afterDrop > 0) {
        // Remove this line
        code = code.substring(0, afterDrop) + code.substring(afterDrop + second.length);
        changes++;
        console.log("[Fix] Removed duplicate className after onDrop");
      }
    }
  }
}

// Also fix the style cursor - remove duplicate style if any
// Check for duplicate style={{ cursor: isPanning
const stylePattern = 'style={{ cursor: isPanning ? "grab" : undefined }}';
const styleMatches = code.split(stylePattern).length - 1;
console.log(`Found ${styleMatches} cursor style attributes`);

if (styleMatches > 1) {
  // Remove the second occurrence (after onDrop)
  const firstIdx = code.indexOf(stylePattern);
  const secondIdx = code.indexOf(stylePattern, firstIdx + stylePattern.length);
  if (secondIdx > 0) {
    // Find the full line and remove it
    const lineStart = code.lastIndexOf('\n', secondIdx);
    const lineEnd = code.indexOf('\n', secondIdx + stylePattern.length);
    code = code.substring(0, lineStart) + code.substring(lineEnd);
    changes++;
    console.log("[Fix] Removed duplicate style attribute");
  }
}

// Also remove duplicate onMouseDown block if present
const mouseDownPattern = 'onMouseDown={(e) => {';
const mdMatches = code.split(mouseDownPattern).length - 1;
console.log(`Found ${mdMatches} onMouseDown handlers`);

if (mdMatches > 1) {
  // Find the second full block after onDrop and remove it
  const dropEnd = code.indexOf("URL.revokeObjectURL(url);");
  if (dropEnd > 0) {
    const secondMD = code.indexOf(mouseDownPattern, dropEnd);
    if (secondMD > 0) {
      // Find the matching closing > of this div (before {/* Eraser cursor */})
      const eraserComment = code.indexOf("{/* Eraser cursor */}", secondMD);
      if (eraserComment > 0) {
        // Find the > just before Eraser cursor
        const closingBracket = code.lastIndexOf(">\n", eraserComment);
        if (closingBracket > secondMD) {
          code = code.substring(0, secondMD) + code.substring(closingBracket + 2);
          changes++;
          console.log("[Fix] Removed duplicate mouse handlers block");
        }
      }
    }
  }
}

// Now ensure cursor changes work: update Space handler to use direct DOM
// Check if blur is already added
if (!code.includes("document.activeElement.blur()")) {
  const spaceOld = `if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(true);
        isPanningRef.current = true;`;
  const spaceNew = `if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        setIsPanning(true);
        isPanningRef.current = true;
        // Immediate cursor change
        const scrollEl = document.querySelector("[class*='overflow-auto']") as HTMLElement;
        if (scrollEl) scrollEl.style.cursor = "grab";`;
  if (code.includes(spaceOld)) {
    code = code.replace(spaceOld, spaceNew);
    changes++;
    console.log("[Fix] Space DOWN: added blur + grab cursor");
  }
}

// Space UP: reset cursor
if (!code.includes('scrollEl) scrollEl.style.cursor = ""')) {
  const upOld = `if (e.code === "Space") {
        e.preventDefault();
        setIsPanning(false);
        isPanningRef.current = false;
        panActiveRef.current = false;`;
  const upNew = `if (e.code === "Space") {
        e.preventDefault();
        setIsPanning(false);
        isPanningRef.current = false;
        panActiveRef.current = false;
        // Reset cursor
        const scrollEl = document.querySelector("[class*='overflow-auto']") as HTMLElement;
        if (scrollEl) scrollEl.style.cursor = "";`;
  if (code.includes(upOld)) {
    code = code.replace(upOld, upNew);
    changes++;
    console.log("[Fix] Space UP: added cursor reset");
  }
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);

// Verify no duplicates remain
const finalCode = fs.readFileSync(file, "utf8");
const finalClassCount = (finalCode.match(/flex-1 flex bg-gray-100/g) || []).length;
const finalMouseDown = (finalCode.match(/onMouseDown=\{\(e\) =>/g) || []).length;
console.log(`\nVerification:`);
console.log(`  className "flex-1 flex bg-gray-100": ${finalClassCount} (should be 1)`);
console.log(`  onMouseDown handlers: ${finalMouseDown} (should be 1)`);
if (finalClassCount === 1 && finalMouseDown === 1) {
  console.log("✅ Duplicates removed successfully!");
} else {
  console.log("⚠️ Still has duplicates, manual check needed");
}
