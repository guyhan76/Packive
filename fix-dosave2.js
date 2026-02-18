const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
const lines = fs.readFileSync(file, "utf8").split("\n");

// Lines 2234-2242 (0-indexed: 2233-2241) are the problematic block
// Replace: guideObjs filter, remove, toJSON, filter, stringify, add back, sendToBack
// With: clean toJSON without removing objects

const oldLines = [
  '    const guideObjs = c.getObjects().filter((o: any) => o.selectable === false && o.evented === false);',
  '    guideObjs.forEach((o: any) => c.remove(o));',
  '    c.renderAll();',
  "    const _ej = c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel']);",
  '    _ej.objects = (_ej.objects || []).filter((o) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);',
  '    const json = JSON.stringify(_ej);',
  '    guideObjs.forEach((o: any) => c.add(o));',
  '    guideObjs.forEach((o: any) => c.sendObjectToBack(o));',
  '    c.renderAll();',
];

const newLines = [
  "    // Export JSON without removing objects from canvas",
  "    const _ej = c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','_isBgImage','_isBgPattern']);",
  "    _ej.objects = (_ej.objects || []).filter((o: any) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);",
  "    if (c.backgroundColor) _ej.backgroundColor = c.backgroundColor;",
  "    const json = JSON.stringify(_ej);",
];

// Find the start line
let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === oldLines[0].trim()) {
    // Verify next lines match
    let match = true;
    for (let j = 1; j < oldLines.length; j++) {
      if (i + j >= lines.length || lines[i + j].trim() !== oldLines[j].trim()) {
        match = false;
        break;
      }
    }
    if (match) {
      startIdx = i;
      break;
    }
  }
}

if (startIdx >= 0) {
  lines.splice(startIdx, oldLines.length, ...newLines);
  console.log(`[Fix] Replaced lines ${startIdx + 1}-${startIdx + oldLines.length} with clean doSave`);
} else {
  console.log("[Error] Could not find exact line match");
  // Debug: find guideObjs line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("guideObjs") && lines[i].includes("c.remove")) {
      console.log(`  Found guideObjs.remove at line ${i + 1}: ${lines[i].trim()}`);
    }
  }
}

// Also add localStorage.removeItem after onSave
const code2 = lines.join("\n");
if (!code2.includes("localStorage.removeItem('panelEditor_autoSave_'")) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("onSave(panelId, json, thumb);")) {
      lines.splice(i + 1, 0, "    try { localStorage.removeItem('panelEditor_autoSave_' + panelId); } catch {}");
      console.log(`[Fix] Added localStorage.removeItem after line ${i + 1}`);
      break;
    }
  }
}

fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("Done!");
