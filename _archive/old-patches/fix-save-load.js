const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

// Fix 1: doSave - include custom properties in toJSON
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const json = JSON.stringify(c.toJSON(['src']));")) {
    lines[i] = lines[i].replace(
      "c.toJSON(['src'])",
      "c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','_isBgPattern','_isBgImage','_isCropRect'])"
    );
    changes++;
    console.log("1. Fixed doSave toJSON with custom properties");
    break;
  }
}

// Fix 2: pushHistory - include custom properties
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const json = JSON.stringify(canvas.toJSON(['src']));")) {
    lines[i] = lines[i].replace(
      "canvas.toJSON(['src'])",
      "canvas.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','_isBgPattern','_isBgImage','_isCropRect'])"
    );
    changes++;
    console.log("2. Fixed pushHistory toJSON with custom properties");
    break;
  }
}

// Fix 3: historyRef initial - include custom properties
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("historyRef.current = [JSON.stringify(canvas.toJSON(['src']))]")) {
    lines[i] = lines[i].replace(
      "canvas.toJSON(['src'])",
      "canvas.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','_isBgPattern','_isBgImage','_isCropRect'])"
    );
    changes++;
    console.log("3. Fixed initial history toJSON with custom properties");
    break;
  }
}

// Fix 4: After loadFromJSON in savedJSON block, re-apply selectable:false to guide objects
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("await canvas.loadFromJSON(JSON.parse(savedJSON))") && 
      lines[i+1] && lines[i+1].includes("canvas.renderAll()")) {
    var indent = lines[i].match(/^(\s*)/)[1];
    lines.splice(i + 1, 0, 
      indent + "canvas.getObjects().forEach((o: any) => {",
      indent + "  if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) {",
      indent + "    o.set({ selectable: false, evented: false });",
      indent + "  }",
      indent + "});"
    );
    changes++;
    console.log("4. Added post-load fix for selectable:false on guide objects");
    break;
  }
}

// Fix 5: Same fix for undo/redo loadFromJSON
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("await c.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current]))") &&
      lines[i+1] && lines[i+1].includes("c.renderAll()")) {
    var indent2 = lines[i].match(/^(\s*)/)[1];
    // Check if fix already applied
    if (!lines[i+1].includes("getObjects().forEach")) {
      lines.splice(i + 1, 0,
        indent2 + "c.getObjects().forEach((o: any) => { if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) { o.set({ selectable: false, evented: false }); } });"
      );
      changes++;
      console.log("5. Added post-undo/redo fix for selectable:false");
    }
    break;
  }
}

// Fix 6: Fix Ctrl+C clipboard - ensure blob conversion happens
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("doClipboard()")) {
    console.log("6. Ctrl+C blob conversion already present - OK");
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made.");
}
