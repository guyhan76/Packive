import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

const oldClear = "const objs = c.getObjects().filter((o:any) => o.selectable !== false || (o as any)._isBgRect);\n            objs.forEach((o:any) => { if (!(o as any)._isSafeZone) c.remove(o); });\n            c.set('backgroundColor', '#FFFFFF');";

const newClear = "const all = c.getObjects().slice();\n            all.forEach((o:any) => c.remove(o));\n            c.set('backgroundColor', '#FFFFFF');\n            // Re-add safe zone and guide text\n            const { Rect, FabricText } = await import('fabric');\n            const cw = c.getWidth(); const ch = c.getHeight();\n            const sc = scaleRef.current; const mg = Math.round(5 * sc);\n            const sz = new Rect({ left: mg, top: mg, originX: 'left', originY: 'top', width: cw - mg*2, height: ch - mg*2, fill: 'transparent', stroke: '#93B5F7', strokeWidth: 1.5, strokeDashArray: [8,5], selectable: false, evented: false });\n            (sz as any)._isSafeZone = true;\n            c.add(sz);\n            const gt = new FabricText(guideText, { left: cw/2, top: ch/2 - 10, originX: 'center', originY: 'center', fontSize: 13, fill: '#C0C0C0', fontFamily: 'Arial, sans-serif', selectable: false, evented: false });\n            c.add(gt);";

if (code.includes("const objs = c.getObjects().filter((o:any) => o.selectable !== false || (o as any)._isBgRect);")) {
  code = code.replace(oldClear, newClear);
  // Also fix the onClick to be async
  code = code.replace('<button onClick={() => {\n            const c = fcRef.current; if (!c) return;\n            if (!confirm("Clear canvas? This cannot be undone.")) return;', '<button onClick={async () => {\n            const c = fcRef.current; if (!c) return;\n            if (!confirm("Clear canvas? This cannot be undone.")) return;');
  console.log('Fixed Clear Canvas to reset fully.');
} else {
  console.log('Pattern not found, trying line-based fix...');
}

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done!');
