const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// 1) Remove debug console.log lines
const debugLines = [
  'console.log("[Panning] Space DOWN - isPanning = true");',
  'console.log("[Panning] Space UP - isPanning = false");'
];
debugLines.forEach(line => {
  if (code.includes(line)) {
    code = code.replace(line, "");
    changes++;
    console.log("[Fix] Removed debug log");
  }
});

// 2) In Space DOWN handler, add cursor change to scroll container
const spaceDownOld = `setIsPanning(true);
        isPanningRef.current = true;`;
const spaceDownNew = `setIsPanning(true);
        isPanningRef.current = true;
        // Change cursor to grab hand on scroll container
        const scrollHost = document.querySelector("[class*='overflow-auto']") as HTMLElement;
        if (scrollHost) scrollHost.style.cursor = "grab";`;
if (code.includes(spaceDownOld)) {
  code = code.replace(spaceDownOld, spaceDownNew);
  changes++;
  console.log("[Fix] Added grab cursor on Space DOWN");
}

// 3) In Space UP handler, reset cursor
const spaceUpOld = `setIsPanning(false);
        isPanningRef.current = false;`;
const spaceUpNew = `setIsPanning(false);
        isPanningRef.current = false;
        // Reset cursor on scroll container
        const scrollHost2 = document.querySelector("[class*='overflow-auto']") as HTMLElement;
        if (scrollHost2) scrollHost2.style.cursor = "";`;
if (code.includes(spaceUpOld)) {
  code = code.replace(spaceUpOld, spaceUpNew);
  changes++;
  console.log("[Fix] Added cursor reset on Space UP");
}

// 4) Remove first duplicate className + style + onMouseDown block (lines ~3607-3618)
// Find the duplicate block: starts with className= after onDrop handler, ends before second onMouseDown
const dupPattern = /\n\s*className=\{`flex-1 flex bg-gray-100[^}]*\}\`\}\n\s*style=\{\{ cursor: isPanning \? "grab" : undefined \}\}\n\s*onMouseDown=\{\(e\) => \{/;
const dupMatches = code.match(dupPattern);
if (dupMatches && dupMatches.length > 0) {
  // Find second occurrence and remove it along with its handlers up to the >
  const firstIdx = code.indexOf(dupMatches[0]);
  const secondIdx = code.indexOf(dupMatches[0], firstIdx + 1);
  if (secondIdx > firstIdx) {
    // Find the closing > of this div after secondIdx
    const afterSecond = code.substring(secondIdx);
    const closingBracket = afterSecond.indexOf("\n>");
    if (closingBracket > 0) {
      code = code.substring(0, secondIdx) + code.substring(secondIdx + closingBracket + 2);
      changes++;
      console.log("[Fix] Removed duplicate scroll container attributes");
    }
  }
}

// 5) In onMouseDown grabbing, also change to "grabbing" hand
// Already has el.style.cursor = "grabbing" - good

// 6) Make sure Fabric canvas doesn't steal cursor during panning
// Add to Space DOWN: disable fabric selection temporarily
const fabricDisableOld = `// Change cursor to grab hand on scroll container
        const scrollHost = document.querySelector("[class*='overflow-auto']") as HTMLElement;
        if (scrollHost) scrollHost.style.cursor = "grab";`;
const fabricDisableNew = `// Change cursor to grab hand on scroll container
        const scrollHost = document.querySelector("[class*='overflow-auto']") as HTMLElement;
        if (scrollHost) scrollHost.style.cursor = "grab";
        // Disable Fabric interaction during panning
        const fc = fcRef.current;
        if (fc) { fc.defaultCursor = "grab"; fc.hoverCursor = "grab"; }`;
if (code.includes(fabricDisableOld)) {
  code = code.replace(fabricDisableOld, fabricDisableNew);
  changes++;
  console.log("[Fix] Disabled Fabric cursor during panning");
}

// 7) Restore Fabric cursors on Space UP
const fabricRestoreOld = `// Reset cursor on scroll container
        const scrollHost2 = document.querySelector("[class*='overflow-auto']") as HTMLElement;
        if (scrollHost2) scrollHost2.style.cursor = "";`;
const fabricRestoreNew = `// Reset cursor on scroll container
        const scrollHost2 = document.querySelector("[class*='overflow-auto']") as HTMLElement;
        if (scrollHost2) scrollHost2.style.cursor = "";
        // Restore Fabric cursors
        const fc2 = fcRef.current;
        if (fc2) { fc2.defaultCursor = "default"; fc2.hoverCursor = "move"; }`;
if (code.includes(fabricRestoreOld)) {
  code = code.replace(fabricRestoreOld, fabricRestoreNew);
  changes++;
  console.log("[Fix] Restored Fabric cursor on Space UP");
}

// 8) Change grabbing cursor during active drag
const grabbingOld = `panActiveRef.current = true;
              el.style.cursor = "grabbing";`;
const grabbingNew = `panActiveRef.current = true;
              el.style.cursor = "grabbing";
              // Also set Fabric canvas cursor
              const fc3 = fcRef.current;
              if (fc3) { fc3.defaultCursor = "grabbing"; fc3.hoverCursor = "grabbing"; }`;

// Replace both occurrences
let grabbingCount = 0;
while (code.includes(grabbingOld)) {
  code = code.replace(grabbingOld, grabbingNew);
  grabbingCount++;
}
if (grabbingCount > 0) {
  changes += grabbingCount;
  console.log(`[Fix] Added grabbing cursor to ${grabbingCount} onMouseDown handler(s)`);
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
console.log("✅ Space+drag will now show grab/grabbing cursor!");
