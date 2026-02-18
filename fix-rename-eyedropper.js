const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

if (code.includes("\uD83E\uDE78 Eyedropper")) {
  code = code.replace("\uD83E\uDE78 Eyedropper", "\uD83E\uDE78 Pick Color");
  changes++;
  console.log("1. Renamed Eyedropper to Pick Color");
}

if (changes > 0) {
  fs.writeFileSync(file, code, "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made.");
}
