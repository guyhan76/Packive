const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

// Line 1239 (index 1239) has "              }" which closes the else block
// Line 1240 (index 1240) has "        }" which should close if(pasteData) but missing });  for import('fabric').then
// We need to add });  between them

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "}" && 
      i + 1 < lines.length && lines[i+1].trim() === "}" &&
      i + 2 < lines.length && lines[i+2].includes("// Ctrl+X = Cut") &&
      i > 0 && lines[i-1].trim() === "});") {
    // Insert });  after the "}" on line i to close import('fabric').then
    lines.splice(i + 1, 0, "            });");
    changes++;
    console.log("1. Added missing }); to close import('fabric').then block");
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No match. Context:");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("// Ctrl+X = Cut")) {
      for (let j = Math.max(0, i - 5); j < i + 2; j++) {
        console.log((j+1) + ": [" + lines[j] + "]");
      }
      break;
    }
  }
}
