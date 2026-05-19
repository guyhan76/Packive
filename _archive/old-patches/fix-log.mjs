import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const old = `console.log("BG3 done canvas:", canvasW, canvasH, "img:", img.width, img.height, "scale:", scX, scY);`;
const fix = `console.log("BG3 done canvas:", canvasW, canvasH, "img:", img.width, img.height);`;

if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Removed scX/scY from log");
} else {
  console.log("Pattern not found");
}
