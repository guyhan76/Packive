const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let lines = fs.readFileSync(file, "utf8").split("\n");
let changes = 0;

for (let i = 0; i < lines.length; i++) {
  // Find the Ctrl+V paste line with __clipboard
  if (lines[i].includes("const cl = (window as any).__clipboard;") && 
      i > 0 && lines[i-1].includes("e.preventDefault()")) {
    // Replace this line and the next line (if/cl.clone)
    let endLine = i;
    for (let j = i; j < Math.min(i + 3, lines.length); j++) {
      if (lines[j].includes("canvas.renderAll()")) {
        endLine = j;
        break;
      }
    }
    var indent = "          ";
    var newLines = [
      indent + "const jsonData = (window as any).__clipboardJSON || null;",
      indent + "const lsData = (() => { try { const s = localStorage.getItem('__packive_clipboard'); return s ? JSON.parse(s) : null; } catch { return null; } })();",
      indent + "const pasteData = jsonData || lsData;",
      indent + "if (pasteData) {",
      indent + "  import('fabric').then(F => {",
      indent + "    (F.util).enlivenObjects([pasteData]).then((objs) => {",
      indent + "      if (objs[0]) {",
      indent + "        const o = objs[0];",
      indent + "        o.set({ left: (o.left||0)+15, top: (o.top||0)+15 });",
      indent + "        canvas.add(o);",
      indent + "        canvas.setActiveObject(o);",
      indent + "        canvas.renderAll();",
      indent + "        refreshLayers();",
      indent + "      }",
      indent + "    });",
      indent + "  });",
      indent + "}",
    ];
    lines.splice(i, endLine - i + 1, ...newLines);
    changes++;
    console.log("1. Replaced Ctrl+V handler with JSON-based paste");
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Done! " + changes + " changes applied.");
} else {
  console.log("No changes made. Showing nearby lines for debug:");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Ctrl+V")) {
      console.log("Line " + (i+1) + ": " + lines[i]);
      for (let j = i+1; j < Math.min(i+5, lines.length); j++) {
        console.log("Line " + (j+1) + ": " + lines[j]);
      }
    }
  }
}
