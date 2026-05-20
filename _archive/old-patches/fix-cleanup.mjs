import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// Remove BG3 console.log
const bg3 = `console.log("BG3 done canvas:", canvasW, canvasH, "img:", img.width, img.height);`;
if (code.includes(bg3)) { code = code.replace(bg3, ""); changes++; }

// Remove __fcDebug
const dbg = `(window as any).__fcDebug = canvas;`;
if (code.includes(dbg)) { code = code.replace(dbg, ""); changes++; }

writeFileSync(f, code, "utf8");
console.log("Done! Removed " + changes + " debug lines");
