import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const old = `(img as any)._isBgImage = true;
                  // Remove existing bg image
                  c.getObjects().forEach((o: any) => { if (o._isBgImage) c.remove(o); });
                  c.insertAt(img, 0);
                  c.renderAll();
                  refreshLayers();`;

const fix = `(img as any)._isBgImage = true;
                  // Remove existing bg image
                  const existing = c.getObjects().filter((o: any) => o._isBgImage);
                  existing.forEach((o: any) => c.remove(o));
                  c.add(img);
                  // Move to bottom (index 0)
                  const objects = c.getObjects();
                  const idx = objects.indexOf(img);
                  if (idx > 0) {
                    c.moveObjectTo(img, 0);
                  }
                  c.renderAll();
                  refreshLayers();
                  console.log("BG IMG added, objects:", c.getObjects().length);`;

if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Fixed BG image insertion");
} else {
  console.log("Pattern not found");
}
