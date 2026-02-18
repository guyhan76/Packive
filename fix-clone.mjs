import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// Find ToolButton label="Delete"
let delIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton label="Delete"')) {
    delIdx = i;
    break;
  }
}

if (delIdx === -1) { console.log("ERROR: Delete button not found"); process.exit(1); }

const cloneBtn = [
  '          <ToolButton label="Clone" icon="📋" onClick={async () => {',
  '            const c = fcRef.current; if (!c) return;',
  '            const obj = c.getActiveObject();',
  '            if (!obj) return;',
  '            const cloned = await obj.clone();',
  '            cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });',
  '            c.add(cloned);',
  '            c.setActiveObject(cloned);',
  '            c.renderAll();',
  '            refreshLayers();',
  '          }} />',
];

lines.splice(delIdx, 0, ...cloneBtn);
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Clone button added before Delete at line " + (delIdx + 1));
