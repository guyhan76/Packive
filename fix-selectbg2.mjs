import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// Find the <hr> between BG Opacity and Opacity
let insertIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('text-gray-400">BG Opacity</span>')) {
    // Find the next <hr> after BG Opacity section
    for (let j = i + 1; j < i + 20; j++) {
      if (lines[j].includes('<hr') && lines[j].includes('border-gray-200')) {
        insertIdx = j;
        break;
      }
    }
    break;
  }
}

if (insertIdx === -1) { console.log("ERROR: Could not find <hr> after BG Opacity"); process.exit(1); }

const selectBgBlock = [
  '          <button onClick={() => {',
  '              const c = fcRef.current; if (!c) return;',
  '              const objs = c.getObjects();',
  '              const bg = objs.find((o) => o.type === "rect" && o.width >= c.getWidth() * 0.9 && o.height >= c.getHeight() * 0.9 && !(o as any)._isSafeZone);',
  '              if (bg) {',
  '                (bg as any).set({ selectable: true, evented: true });',
  '                c.setActiveObject(bg);',
  '                c.renderAll();',
  '              }',
  '            }} className="w-[120px] py-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 font-medium" title="Select template background">',
  '              Select BG',
  '            </button>',
];

lines.splice(insertIdx, 0, ...selectBgBlock);
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Select BG button inserted at line " + (insertIdx + 1));
