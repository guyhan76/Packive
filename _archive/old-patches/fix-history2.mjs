import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

const oldTabs = `{ key: 'layers', label: '📐 Layers' },
            ].map(tab =>`;
const newTabs = `{ key: 'layers', label: '📐 Layers' },
              { key: 'history', label: '⏱ History' },
            ].map(tab =>`;

if (code.includes(oldTabs)) {
  code = code.replace(oldTabs, newTabs);
  changes++;
  console.log("1. Added History tab button");
} else {
  // Try alternate spacing
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("key: 'layers'") && lines[i].includes("label: '📐 Layers'")) {
      // Insert history tab after this line
      const indent = lines[i].match(/^(\s*)/)?.[1] || '';
      lines.splice(i + 1, 0, indent + "{ key: 'history', label: '⏱ History' },");
      code = lines.join('\n');
      changes++;
      console.log("1. Added History tab button (line-based at line " + (i+1) + ")");
      break;
    }
  }
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
