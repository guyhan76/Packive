const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");

// Fix the broken applyZoom function
const broken = `    c.setZoom(scale);
    // Fabric v6: use property assignment instead of setWidth/setHeight
    const prevZoom = c.getZoom() || 1;
    const baseW = c.width / prevZoom;
    const baseH = c.height / prevZoom;
    c.setZoom(scale);
    c.setDimensions({ width: baseW * scale, height: baseH * scale });
    // (height set above via setDimensions)`;

const fixed = `    const prevScale = c.getZoom() || 1;
    const baseW = (c.width || 400) / prevScale;
    const baseH = (c.height || 300) / prevScale;
    c.setZoom(scale);
    c.width = baseW * scale;
    c.height = baseH * scale;
    c.renderAll();`;

if (code.includes(broken)) {
  code = code.replace(broken, fixed);
  fs.writeFileSync(file, code, "utf8");
  console.log("[Fixed] applyZoom: removed duplicate setZoom, use direct width/height assignment");
} else {
  console.log("[MISS] Trying alternate pattern...");
  // Try to find just the key parts
  const lines = code.split("\n");
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("// Fabric v6: use property assignment")) {
      // Replace lines i-1 through i+5
      console.log(`Found at line ${i+1}, replacing lines ${i} to ${i+5}`);
      lines[i-1] = "    const prevScale = c.getZoom() || 1;";
      lines[i]   = "    const baseW = (c.width || 400) / prevScale;";
      lines[i+1] = "    const baseH = (c.height || 300) / prevScale;";
      lines[i+2] = "    c.setZoom(scale);";
      lines[i+3] = "    c.width = baseW * scale;";
      lines[i+4] = "    c.height = baseH * scale;";
      lines[i+5] = "    c.renderAll();";
      found = true;
      break;
    }
  }
  if (found) {
    code = lines.join("\n");
    fs.writeFileSync(file, code, "utf8");
    console.log("[Fixed] applyZoom via line replacement");
  } else {
    console.log("[FAIL] Could not find applyZoom to fix");
  }
}
