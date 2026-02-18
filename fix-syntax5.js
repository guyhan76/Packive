const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "});" && 
      i + 1 < lines.length && lines[i+1].trim() === "}" &&
      i + 2 < lines.length && lines[i+2].includes("// Ctrl+X = Cut") &&
      i > 0 && lines[i-1].trim() === "}") {
    // 1239: }           <- closes else
    // 1240: });         <- closes import.then
    // 1241: }           <- closes if(pasteData)
    // 1242: // Ctrl+X   <- but missing } to close if(Ctrl+V)
    lines.splice(i + 2, 0, "        }");
    changes++;
    console.log("1. Added missing } to close Ctrl+V block");
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No match. Showing:");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("// Ctrl+X")) {
      for (let j = Math.max(0,i-4); j < i+2; j++) {
        console.log((j+1) + ": >" + lines[j] + "<");
      }
      break;
    }
  }
}
