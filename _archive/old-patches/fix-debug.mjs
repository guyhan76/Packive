import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");

const old = `fcRef.current = canvas;`;
const fix = `fcRef.current = canvas;\n      (window as any).__fcDebug = canvas;`;

if (code.includes(fix)) {
  console.log("Already patched");
} else if (code.includes(old)) {
  code = code.replace(old, fix);
  writeFileSync(f, code, "utf8");
  console.log("Done! Added window.__fcDebug");
} else {
  console.log("Pattern not found");
}
