import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

// Fix: icon="📏" is shown PLUS the label also shows "📏 ON" / "📏 Measure"
// Change label to text only, keep single icon
const old1 = 'ToolButton label={measureMode ? "📏 ON" : "📏 Measure"} icon="📏"';
const fix1 = 'ToolButton label={measureMode ? "ON" : "Measure"} icon="📏"';

if (code.includes(old1)) {
  code = code.replace(old1, fix1);
  writeFileSync(f, code, "utf8");
  console.log("Done! Fixed measure button - removed duplicate icon from label");
} else {
  console.log("Pattern not found");
}
