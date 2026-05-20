const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

// Replace Ctrl+C handler
const oldCopy = "if (obj) { obj.clone().then((cl: any) => { (window as any).__clipboard = cl; }); }";
const newCopy = "if (obj) { obj.clone().then((cl: any) => { (window as any).__clipboard = cl; try { localStorage.setItem('__packive_clipboard', JSON.stringify(obj.toJSON())); } catch {} }); }";

if (code.includes(oldCopy)) {
  code = code.replace(oldCopy, newCopy);
  changes++;
  console.log("1. Updated Ctrl+C to save to localStorage");
}

// Replace Ctrl+V handler
const oldPaste = "const cl = (window as any).__clipboard;\n          if (cl) { cl.clone().then((pasted: any) => { pasted.set({ left: (pasted.left||0)+15, top: (pasted.top||0)+15 }); canvas.add(pasted); canvas.setActiveObject(pasted); canvas.renderAll(); }); }";
const newPaste = "const cl = (window as any).__clipboard;\n          if (cl) { cl.clone().then((pasted: any) => { pasted.set({ left: (pasted.left||0)+15, top: (pasted.top||0)+15 }); canvas.add(pasted); canvas.setActiveObject(pasted); canvas.renderAll(); refreshLayers(); }); }\n          else { try { const saved = localStorage.getItem('__packive_clipboard'); if (saved) { import('fabric').then(F => { (F.util as any).enlivenObjects([JSON.parse(saved)]).then((objs: any[]) => { if (objs[0]) { const o = objs[0]; o.set({ left: (o.left||0)+15, top: (o.top||0)+15 }); canvas.add(o); canvas.setActiveObject(o); canvas.renderAll(); refreshLayers(); } }); }); } } catch {} }";

if (code.includes(oldPaste)) {
  code = code.replace(oldPaste, newPaste);
  changes++;
  console.log("2. Updated Ctrl+V to read from localStorage (cross-panel)");
}

// Replace Ctrl+X handler
const oldCut = "if (obj) { obj.clone().then((cl: any) => { (window as any).__clipboard = cl; }); canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll(); }";
const newCut = "if (obj) { obj.clone().then((cl: any) => { (window as any).__clipboard = cl; try { localStorage.setItem('__packive_clipboard', JSON.stringify(obj.toJSON())); } catch {} }); canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll(); refreshLayers(); }";

if (code.includes(oldCut)) {
  code = code.replace(oldCut, newCut);
  changes++;
  console.log("3. Updated Ctrl+X to save to localStorage");
}

if (changes > 0) {
  fs.writeFileSync(file, code, "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made.");
}
