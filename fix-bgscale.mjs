import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const old = `const img = await FabricImage.fromURL(url);
                  const canvasW = c.width;
                  const canvasH = c.height;
                  const scX = canvasW / (img.width || 1);
                  const scY = canvasH / (img.height || 1);
                  img.set({
                    left: 0, top: 0,
                    scaleX: scX, scaleY: scY,
                    selectable: false, evented: false,
                  });`;

const fix = `const img = await FabricImage.fromURL(url);
                  const canvasW = c.getWidth();
                  const canvasH = c.getHeight();
                  // Use natural dimensions from the HTML element
                  const natW = (img as any)._element?.naturalWidth || img.width || 1;
                  const natH = (img as any)._element?.naturalHeight || img.height || 1;
                  const scX = canvasW / natW;
                  const scY = canvasH / natH;
                  console.log("BG4 natW:", natW, "natH:", natH, "canvasW:", canvasW, "canvasH:", canvasH, "scX:", scX, "scY:", scY);
                  img.scaleX = scX;
                  img.scaleY = scY;
                  img.left = 0;
                  img.top = 0;
                  img.selectable = false;
                  img.evented = false;
                  img.setCoords();`;

if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Fixed BG image scaling with direct property assignment");
} else {
  console.log("Pattern not found - trying line search...");
  const lines = code.split("\n");
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("const img = await FabricImage.fromURL(url);") && 
        i + 1 < lines.length && lines[i+1].includes("const canvasW = c.width")) {
      // Found the block, replace lines i through i+7
      const replacement = [
        lines[i], // keep fromURL line
        "                  const canvasW = c.getWidth();",
        "                  const canvasH = c.getHeight();",
        "                  const natW = (img as any)._element?.naturalWidth || img.width || 1;",
        "                  const natH = (img as any)._element?.naturalHeight || img.height || 1;",
        "                  const scX = canvasW / natW;",
        "                  const scY = canvasH / natH;",
        '                  console.log("BG4 natW:", natW, "natH:", natH, "canvasW:", canvasW, "canvasH:", canvasH, "scX:", scX, "scY:", scY);',
        "                  img.scaleX = scX;",
        "                  img.scaleY = scY;",
        "                  img.left = 0;",
        "                  img.top = 0;",
        "                  img.selectable = false;",
        "                  img.evented = false;",
        "                  img.setCoords();",
      ];
      // Find the end of the old set() block (line with "});")
      let endIdx = i + 1;
      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        if (lines[j].includes("selectable: false, evented: false")) {
          endIdx = j + 1; // include the closing });
          if (lines[j+1] && lines[j+1].trim().startsWith("});")) endIdx = j + 2;
          break;
        }
      }
      lines.splice(i, endIdx - i, ...replacement);
      found = true;
      break;
    }
  }
  if (found) {
    writeFileSync(f, lines.join("\n"), "utf8");
    console.log("Done! Fixed via line-based approach");
  } else {
    console.log("ERROR: Could not find BG image block");
  }
}
