import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const old2 = `canvas.on('object:modified', () => {
        if (vLine) { canvas.remove(vLine); vLine = null; }
        if (hLine) { canvas.remove(hLine); hLine = null; }
        canvas.renderAll();`;

const fix2 = `canvas.on('object:modified', () => {
        guideLines.forEach(l => { try { canvas.remove(l); } catch {} });
        guideLines = [];
        canvas.renderAll();`;

if (code.includes(old2)) {
  code = code.replace(old2, fix2);
  writeFileSync(f, code, "utf8");
  console.log("Done! Updated object:modified cleanup");
} else {
  console.log("Pattern not found for modified handler");
}
