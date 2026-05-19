const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

// Find the duplicate block: after the new paste code's closing });
// there's leftover old code (canvas.add(o); ... });  });  })
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("(F.util as any).enlivenObjects([pasteData])") &&
      lines[i+1] && lines[i+1].includes("if (objs[0])")) {
    // Find the closing of the else block: });  }
    for (let j = i + 2; j < Math.min(i + 15, lines.length); j++) {
      if (lines[j].trim() === "}" && lines[j+1] && lines[j+1].trim().startsWith("canvas.add(o)")) {
        // Found the leftover block start
        var endDup = j + 1;
        for (let k = endDup; k < Math.min(endDup + 10, lines.length); k++) {
          if (lines[k].trim() === "}" && k + 1 < lines.length && lines[k+1].trim() === "// Ctrl+X = Cut") {
            // Remove from j+1 to k
            var removeCount = k - (j + 1);
            lines.splice(j + 1, removeCount);
            changes++;
            console.log("1. Removed " + removeCount + " leftover duplicate lines");
            break;
          }
        }
        break;
      }
    }
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  // Fallback: show context
  console.log("Pattern not found. Showing context:");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("enlivenObjects([pasteData])")) {
      for (let j = i - 2; j < Math.min(i + 20, lines.length); j++) {
        console.log((j+1) + ": " + lines[j]);
      }
      break;
    }
  }
}
