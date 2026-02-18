import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

// Replace the lineHeight onChange handler
const old = `if (obj && "lineHeight" in obj) {
                  obj.set("lineHeight", v);
                  c.renderAll();
                }`;

const fix = `if (obj && ("lineHeight" in obj || obj.type === "i-text" || obj.type === "textbox")) {
                  obj.set("lineHeight", v);
                  obj.dirty = true;
                  obj.initDimensions();
                  c.requestRenderAll();
                }`;

if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Fixed lineHeight handler");
} else {
  console.log("Pattern not found");
}
