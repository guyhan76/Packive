const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");
let changes = 0;

if (code.includes('title="Eyedropper - sample a color point"')) {
  code = code.replace('title="Eyedropper - sample a color point"', 'title="Pick Color from screen"');
  changes++;
  console.log("1. Updated title attribute");
}

if (changes > 0) {
  fs.writeFileSync(file, code, "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made.");
}
