const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

// Find the paste block ending
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("});") && 
      i + 1 < lines.length && lines[i+1].trim() === "}" &&
      i + 2 < lines.length && lines[i+2].includes("// Ctrl+X = Cut") &&
      i > 0 && lines[i-1].includes("enlivenObjects")) {
    // Current structure:
    // 1238:                });        <- closes enlivenObjects.then
    // 1239:              }            <- closes else block  
    // But missing: 
    //            });                  <- closes import('fabric').then
    //          }                      <- closes if(pasteData)
    //        }                        <- closes if(Ctrl+V) block
    // Currently 1240: "        }" only has one }
    
    // Replace line i+1 with proper closings
    lines[i+1] = "            });\n          }\n        }";
    changes++;
    console.log("1. Fixed missing closings for paste block");
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  // Show exact context
  console.log("No match. Context around enlivenObjects:");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("enlivenObjects")) {
      for (let j = i - 1; j < Math.min(i + 6, lines.length); j++) {
        console.log((j+1) + ": >" + lines[j] + "<");
      }
      break;
    }
  }
}
