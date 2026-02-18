import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// Replace lines 1825-1843 (index 1825-1843)
const newBlock = [
  '                  const img = await FabricImage.fromURL(url);',
  '                  const canvasW = c.width;',
  '                  const canvasH = c.height;',
  '                  const scX = canvasW / (img.width || 1);',
  '                  const scY = canvasH / (img.height || 1);',
  '                  img.set({',
  '                    left: 0, top: 0,',
  '                    scaleX: scX, scaleY: scY,',
  '                    selectable: false, evented: false,',
  '                  });',
  '                  (img as any)._isBgImage = true;',
  '                  const existing = c.getObjects().filter((o: any) => o._isBgImage && o !== img);',
  '                  existing.forEach((o: any) => c.remove(o));',
  '                  c.add(img);',
  '                  c.sendObjectToBack(img);',
  '                  c.requestRenderAll();',
  '                  refreshLayers();',
  '                  console.log("BG3 done canvas:", canvasW, canvasH, "img:", img.width, img.height, "scale:", scX, scY);',
];

// Find the exact block: line with "const img = await FabricImage.fromURL(url);" inside BG Image section
let startIdx = -1;
let endIdx = -1;
for (let i = 1820; i < 1850; i++) {
  if (lines[i] && lines[i].includes("const img = await FabricImage.fromURL(url)")) {
    startIdx = i;
    break;
  }
}

if (startIdx === -1) { console.log("ERROR: start not found"); process.exit(1); }

// Find "refreshLayers();" after startIdx
for (let i = startIdx; i < startIdx + 25; i++) {
  if (lines[i] && lines[i].trim() === "refreshLayers();") {
    endIdx = i;
    break;
  }
}

if (endIdx === -1) { console.log("ERROR: end not found"); process.exit(1); }

console.log("Replacing lines " + (startIdx+1) + " to " + (endIdx+1));
lines.splice(startIdx, endIdx - startIdx + 1, ...newBlock);
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! BG image code replaced");
