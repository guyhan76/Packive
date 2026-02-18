import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const old = `const img = await FabricImage.fromURL(url);
                  const cw = c.getWidth();
                  const ch = c.getHeight();
                  const scX = cw / (img.width || 1);
                  const scY = ch / (img.height || 1);
                  img.set({
                    left: 0, top: 0,
                    scaleX: scX, scaleY: scY,
                    selectable: false, evented: false,
                  });`;

const fix = `const img = await FabricImage.fromURL(url);
                  const cw = c.getWidth();
                  const ch = c.getHeight();
                  const imgW = img.width || 1;
                  const imgH = img.height || 1;
                  // Cover entire canvas - use Math.max to ensure full coverage
                  const scale = Math.max(cw / imgW, ch / imgH);
                  img.set({
                    left: cw / 2, top: ch / 2,
                    originX: 'center', originY: 'center',
                    scaleX: scale, scaleY: scale,
                    selectable: false, evented: false,
                  });`;

if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Fixed BG image scaling - center + cover");
} else {
  console.log("Pattern not found");
}
