const fs = require("fs");
const file = "src/components/editor/panel-editor.tsx";
let code = fs.readFileSync(file, "utf8");

const dupBlock = '          <ToolButton label=\"Path Text\" icon=\"\u301C\" onClick={async () => {\n            const c = fcRef.current; if (!c) return;\n            const text = prompt(' + "'Enter text for path:', 'Hello Path Text') || 'Hello Path Text';" + '\n            const pathType = prompt(' + "'Path type:\\\\n1 = Wave\\\\n2 = Arc (top)\\\\n3 = Arc (bottom)\\\\n4 = S-Curve\\\\n5 = Custom SVG path', '1') || '1';";

// Use line-based approach instead
const lines = code.split("\n");
let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (i >= 2228 && i <= 2230 && lines[i].includes('ToolButton label=\"Path Text\"') && lines[i].includes("'Enter text")) {
    startLine = i;
    break;
  }
}

if (startLine === -1) {
  // Search more broadly for second occurrence
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('ToolButton label=\"Path Text\"')) {
      count++;
      if (count === 2) {
        startLine = i;
        break;
      }
    }
  }
}

if (startLine >= 0) {
  // Find the closing }} /> for this button
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i].trim() === '}} />') {
      endLine = i;
      break;
    }
  }
  if (endLine >= 0) {
    lines.splice(startLine, endLine - startLine + 1);
    fs.writeFileSync(file, lines.join("\n"), "utf8");
    console.log("Removed duplicate Path Text button (lines " + (startLine+1) + " to " + (endLine+1) + ")");
    console.log("Done! 1 change applied.");
  } else {
    console.log("ERROR: Could not find closing tag");
  }
} else {
  console.log("ERROR: Second Path Text button not found");
}
