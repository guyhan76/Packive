const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");

// Fix the broken double-div
const broken = `<div style={{ 
              transform: \`scale(\${zoom / 100})\`,
              transformOrigin: "top left",
              transition: "transform 0.15s ease-out",
            }}> 100 ? \`\${((zoom / 100) - 1) * (canvasElRef.current?.height || 300)}px\` : undefined,
              marginRight: zoom > 100 ? \`\${((zoom / 100) - 1) * (canvasElRef.current?.width || 400)}px\` : undefined,
            }}>`;

const fixed = `<div style={{ 
              transform: \`scale(\${zoom / 100})\`,
              transformOrigin: "top left",
              transition: "transform 0.15s ease-out",
              marginBottom: zoom > 100 ? \`\${((zoom / 100) - 1) * (canvasElRef.current?.height || 300)}px\` : undefined,
              marginRight: zoom > 100 ? \`\${((zoom / 100) - 1) * (canvasElRef.current?.width || 400)}px\` : undefined,
            }}>`;

if (code.includes(broken)) {
  code = code.replace(broken, fixed);
  fs.writeFileSync(file, code, "utf8");
  console.log("[Fixed] Merged broken double-div into single correct div");
} else {
  console.log("[MISS] Broken pattern not found, showing context...");
  const idx = code.indexOf("transformOrigin: \"top left\"");
  if (idx > -1) {
    console.log(code.slice(idx - 50, idx + 300));
  }
}
