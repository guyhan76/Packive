import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const old = `const img = await FabricImage.fromURL(url);
                  const scX = c.width / (img.width || 1);
                  const scY = c.height / (img.height || 1);`;

const fix = `const img = await FabricImage.fromURL(url);
                  const cw = c.getWidth();
                  const ch = c.getHeight();
                  console.log("BG DEBUG canvas:", cw, ch, "img:", img.width, img.height);
                  const scX = cw / (img.width || 1);
                  const scY = ch / (img.height || 1);`;

if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Added debug");
} else {
  console.log("Pattern not found");
}
