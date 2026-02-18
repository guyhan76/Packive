import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const old = `img.left = 0;
                  img.top = 0;
                  img.selectable = false;
                  img.evented = false;
                  img.setCoords();`;

const fix = `img.left = 0;
                  img.top = 0;
                  img.originX = 'left';
                  img.originY = 'top';
                  img.selectable = false;
                  img.evented = false;
                  img.setCoords();`;

if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Added originX/originY = left/top to BG image");
} else {
  console.log("Pattern not found");
}
