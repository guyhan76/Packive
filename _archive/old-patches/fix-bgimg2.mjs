import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

// Fix: move _isBgImage out of set() call
const old = `img.set({
                    left: 0, top: 0,
                    scaleX: scX, scaleY: scY,
                    selectable: false, evented: false,
                    (img as any)._isBgImage = true,
                  });`;

const fix = `img.set({
                    left: 0, top: 0,
                    scaleX: scX, scaleY: scY,
                    selectable: false, evented: false,
                  });
                  (img as any)._isBgImage = true;`;

if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Fixed _isBgImage assignment");
} else {
  console.log("Pattern not found - checking current state");
}
