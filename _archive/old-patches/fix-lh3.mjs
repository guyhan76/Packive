import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const old = `if (obj && ("lineHeight" in obj || obj.type === "i-text" || obj.type === "textbox")) {
                  obj.set("lineHeight", v);
                  obj.dirty = true;
                  obj.initDimensions();
                  c.requestRenderAll();
                }`;

const fix = `{
                  console.log("LH DEBUG type:", obj?.type, "hasLH:", "lineHeight" in (obj||{}), "val:", v, "obj:", obj);
                  if (obj) {
                    obj.lineHeight = v;
                    obj.dirty = true;
                    if (obj.initDimensions) obj.initDimensions();
                    if (obj.setCoords) obj.setCoords();
                    c.requestRenderAll();
                    console.log("LH AFTER:", obj.lineHeight);
                  }
                }`;

if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Added lineHeight debug");
} else {
  console.log("Pattern not found");
}
