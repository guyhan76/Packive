const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// Fix Ctrl+C: clone was async and __clipboard might not update before paste
// Also include image src in toJSON
const oldCopy = "if (obj) { obj.clone().then((cl: any) => { (window as any).__clipboard = cl; try { localStorage.setItem('__packive_clipboard', JSON.stringify(obj.toJSON())); } catch {} }); }";
const newCopy = "if (obj) { const jsonData = obj.toJSON(['src']); (window as any).__clipboardJSON = jsonData; try { localStorage.setItem('__packive_clipboard', JSON.stringify(jsonData)); } catch {} obj.clone().then((cl: any) => { (window as any).__clipboard = cl; }); }";

if (code.includes(oldCopy)) {
  code = code.replace(oldCopy, newCopy);
  changes++;
  console.log("1. Fixed Ctrl+C with toJSON(['src']) and sync JSON save");
}

// Fix Ctrl+V: use clone for same-panel, localStorage for cross-panel
const oldPaste = "const cl = (window as any).__clipboard;\n          if (cl) { cl.clone().then((pasted: any) => { pasted.set({ left: (pasted.left||0)+15, top: (pasted.top||0)+15 }); canvas.add(pasted); canvas.setActiveObject(pasted); canvas.renderAll(); }); }";
const newPaste = "const clipJSON = (window as any).__clipboardJSON || null;\n          const lsJSON = (() => { try { const s = localStorage.getItem('__packive_clipboard'); return s ? JSON.parse(s) : null; } catch { return null; } })();\n          const jsonData = clipJSON || lsJSON;\n          if (jsonData) { import('fabric').then(F => { (F.util as any).enlivenObjects([jsonData]).then((objs: any[]) => { if (objs[0]) { const o = objs[0]; o.set({ left: (o.left||0)+15, top: (o.top||0)+15 }); canvas.add(o); canvas.setActiveObject(o); canvas.renderAll(); refreshLayers(); } }); }); }";

if (code.includes(oldPaste)) {
  code = code.replace(oldPaste, newPaste);
  changes++;
  console.log("2. Fixed Ctrl+V to use JSON-based paste (supports images + cross-panel)");
}

// Fix Ctrl+X
const oldCut = "if (obj) { obj.clone().then((cl: any) => { (window as any).__clipboard = cl; try { localStorage.setItem('__packive_clipboard', JSON.stringify(obj.toJSON())); } catch {} }); canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll(); refreshLayers(); }";
const newCut = "if (obj) { const jsonData = obj.toJSON(['src']); (window as any).__clipboardJSON = jsonData; try { localStorage.setItem('__packive_clipboard', JSON.stringify(jsonData)); } catch {} canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll(); refreshLayers(); }";

if (code.includes(oldCut)) {
  code = code.replace(oldCut, newCut);
  changes++;
  console.log("3. Fixed Ctrl+X with toJSON(['src'])");
}

if (changes > 0) {
  fs.writeFileSync(file, code, "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made.");
}
