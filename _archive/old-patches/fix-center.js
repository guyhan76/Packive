const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// ── Fix: Restore center alignment at 100%, proper scroll at zoom > 100% ──
// The issue: transformOrigin "top left" breaks centering at 100%
// Solution: Use "center center" at 100%, switch to "top left" when zoomed

const oldStyle = `<div style={{ 
              transform: \`scale(\${zoom / 100})\`,
              transformOrigin: "top left",
              transition: "transform 0.15s ease-out",
              marginBottom: zoom > 100 ? \`\${((zoom / 100) - 1) * (canvasElRef.current?.height || 300)}px\` : undefined,
              marginRight: zoom > 100 ? \`\${((zoom / 100) - 1) * (canvasElRef.current?.width || 400)}px\` : undefined,
            }}>`;

const newStyle = `<div style={{ 
              transform: \`scale(\${zoom / 100})\`,
              transformOrigin: zoom > 100 ? "top left" : "center center",
              transition: "transform 0.15s ease-out",
              marginBottom: zoom > 100 ? \`\${((zoom / 100) - 1) * (canvasElRef.current?.height || 300) + 40}px\` : undefined,
              marginRight: zoom > 100 ? \`\${((zoom / 100) - 1) * (canvasElRef.current?.width || 400) + 40}px\` : undefined,
            }}>`;

if (code.includes(oldStyle)) {
  code = code.replace(oldStyle, newStyle);
  changes++;
  console.log("[1] Fixed: center at 100%, top-left with margins at zoom > 100%");
} else {
  console.log("[MISS] Could not find old style block, trying line-by-line...");
  
  // Try to find and fix individual lines
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('transformOrigin: "top left"') && 
        lines[i-1] && lines[i-1].includes('scale(${zoom / 100})')) {
      lines[i] = '              transformOrigin: zoom > 100 ? "top left" : "center center",';
      changes++;
      console.log(`[1] Fixed transformOrigin at line ${i + 1}`);
    }
    // Also fix margin values to add padding
    if (lines[i].includes('marginBottom: zoom > 100') && lines[i].includes('canvasElRef.current?.height')) {
      lines[i] = '              marginBottom: zoom > 100 ? `${((zoom / 100) - 1) * (canvasElRef.current?.height || 300) + 40}px` : undefined,';
      changes++;
      console.log(`[2] Fixed marginBottom at line ${i + 1}`);
    }
    if (lines[i].includes('marginRight: zoom > 100') && lines[i].includes('canvasElRef.current?.width')) {
      lines[i] = '              marginRight: zoom > 100 ? `${((zoom / 100) - 1) * (canvasElRef.current?.width || 400) + 40}px` : undefined,';
      changes++;
      console.log(`[3] Fixed marginRight at line ${i + 1}`);
    }
  }
  code = lines.join("\n");
}

// ── Also check if zoom-spacer exists and remove it (not needed with margin approach) ──
if (code.includes('className="zoom-spacer"')) {
  // Remove the spacer block
  const spacerStart = code.indexOf('{/* Zoom spacer');
  const spacerEnd = code.indexOf('/>',  spacerStart);
  if (spacerStart > -1 && spacerEnd > -1) {
    // Find the closing of the conditional
    const closeParen = code.indexOf(')}\n', spacerEnd);
    if (closeParen > -1) {
      code = code.slice(0, spacerStart) + code.slice(closeParen + 3);
      changes++;
      console.log("[4] Removed zoom-spacer (using margin approach instead)");
    }
  }
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
