import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

code = code.replace(
  `console.log("BG DEBUG canvas:", cw, ch, "img:", img.width, img.height);\n`,
  ""
);

writeFileSync(f, code, "utf8");
console.log("Done! Debug removed");
