import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Make keyHandler async
if (code.includes("keyHandler = (e: KeyboardEvent) => {")) {
  code = code.replace(
    "keyHandler = (e: KeyboardEvent) => {",
    "keyHandler = async (e: KeyboardEvent) => {"
  );
  changes++;
  console.log("1. Made keyHandler async");
}

writeFileSync(f, code, "utf8");
console.log("Done! Changes: " + changes);
