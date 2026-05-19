const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("(F.util as any).enlivenObjects([pasteData])") &&
      lines[i+1] && lines[i+1].includes("if (objs[0])") &&
      lines[i+2] && lines[i+2].trim() === "});") {
    // lines[i+2] = });  (closes enlivenObjects.then)
    // lines[i+3] should close else block: }
    // Then we need: });  (closes import.then)
    //               }    (closes if pasteData)
    //             }       (closes if Ctrl+V block)
    if (lines[i+3] && lines[i+3].trim() === "}" && 
        lines[i+4] && lines[i+4].includes("// Ctrl+X")) {
      // Missing two closing lines: });  and }
      lines.splice(i + 4, 0, "            });", "          }");
      changes++;
      console.log("1. Added missing closing }); and } for paste block");
      break;
    }
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No match. Showing context:");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("enlivenObjects([pasteData])")) {
      for (let j = i; j < Math.min(i + 8, lines.length); j++) {
        console.log((j+1) + ": [" + lines[j] + "]");
      }
      break;
    }
  }
}
