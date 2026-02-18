const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// FIX: Replace entire doSave body - the guideObjs remove/add is the root cause
const oldDoSave = `const guideObjs = c.getObjects().filter((o: any) => o.selectable === false && o.evented === false);
    guideObjs.forEach((o: any) => c.remove(o));
    c.renderAll();
    const _ej = c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel']);
    _ej.objects = (_ej.objects || []).filter((o) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);
    const json = JSON.stringify(_ej);
    guideObjs.forEach((o: any) => c.add(o));
    guideObjs.forEach((o: any) => c.sendObjectToBack(o));
    c.renderAll();`;

const newDoSave = `// Export JSON without modifying canvas objects
    const _ej = c.toJSON(['src','_isSafeZone','_isGuideLine','_isGuideText','_isSizeLabel','_isBgImage','_isBgPattern']);
    _ej.objects = (_ej.objects || []).filter((o: any) => !o._isSafeZone && !o._isGuideLine && !o._isGuideText && !o._isSizeLabel);
    if (c.backgroundColor) _ej.backgroundColor = c.backgroundColor;
    const json = JSON.stringify(_ej);`;

if (code.includes(oldDoSave)) {
  code = code.replace(oldDoSave, newDoSave);
  changes++;
  console.log("[Fix 1] doSave: removed guideObjs remove/add, added backgroundColor");
} else {
  console.log("[Skip 1] exact doSave not found, trying line-by-line...");
  // Try finding just the key lines
  if (code.includes("guideObjs.forEach((o: any) => c.remove(o));")) {
    console.log("  Found guideObjs.remove line");
  }
}

// FIX 2: Also add localStorage.removeItem after onSave
if (!code.includes("localStorage.removeItem('panelEditor_autoSave_'")) {
  const oldOnSave = "onSave(panelId, json, thumb);\n  }, [panelId, onSave]);";
  const newOnSave = "onSave(panelId, json, thumb);\n    try { localStorage.removeItem('panelEditor_autoSave_' + panelId); } catch {}\n  }, [panelId, onSave]);";
  if (code.includes(oldOnSave)) {
    code = code.replace(oldOnSave, newOnSave);
    changes++;
    console.log("[Fix 2] doSave: clear auto-save after save");
  }
}

fs.writeFileSync(file, code, "utf8");
console.log(`\nTotal changes: ${changes}`);
