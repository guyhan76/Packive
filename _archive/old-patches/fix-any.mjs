import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
code = code.replace(
  'objs.find((o) => o.type === "rect"',
  'objs.find((o: any) => o.type === "rect"'
);
writeFileSync(f, code, "utf8");
console.log("Done! Fixed implicit any on line 1812");
