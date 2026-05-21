import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// Find the BG Image upload block
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("BG4 natW:")) { startIdx = i - 10; }
  if (startIdx > 0 && lines[i].includes("_isBgImage = true")) { endIdx = i; break; }
}

if (startIdx < 0 || endIdx < 0) {
  // Alternative: find by fromURL + _isBgImage pattern
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("const img = await FabricImage.fromURL(url)") && 
        lines[i].includes("BG") === false) {
      // Check if _isBgImage is nearby
      for (let j = i; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].includes("_isBgImage = true")) {
          startIdx = i;
          endIdx = j;
          break;
        }
      }
      if (endIdx > 0) break;
    }
  }
}

if (startIdx < 0) {
  console.log("ERROR: Could not find BG image block");
  process.exit(1);
}

// Find the actual fromURL line
let fromUrlLine = startIdx;
for (let i = startIdx; i <= endIdx; i++) {
  if (lines[i].includes("FabricImage.fromURL(url)")) { fromUrlLine = i; break; }
}

const replacement = [
  "                  // Resize image via offscreen canvas to match canvas size exactly",
  "                  const canvasW = c.getWidth();",
  "                  const canvasH = c.getHeight();",
  "                  const htmlImg = new Image();",
  "                  htmlImg.src = url;",
  "                  await new Promise<void>((res, rej) => { htmlImg.onload = () => res(); htmlImg.onerror = rej; });",
  "                  // Draw resized image to offscreen canvas",
  "                  const offscreen = document.createElement('canvas');",
  "                  offscreen.width = canvasW;",
  "                  offscreen.height = canvasH;",
  "                  const ctx2 = offscreen.getContext('2d')!;",
  "                  ctx2.drawImage(htmlImg, 0, 0, canvasW, canvasH);",
  "                  const resizedUrl = offscreen.toDataURL('image/png');",
  "                  const img = await FabricImage.fromURL(resizedUrl);",
  "                  img.left = 0;",
  "                  img.top = 0;",
  "                  img.selectable = false;",
  "                  img.evented = false;",
  "                  img.setCoords();",
  "                  (img as any)._isBgImage = true;",
];

lines.splice(fromUrlLine, endIdx - fromUrlLine + 1, ...replacement);
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Replaced BG image block with offscreen-canvas resize approach (lines " + fromUrlLine + "-" + endIdx + ")");
