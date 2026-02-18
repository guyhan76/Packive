import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// Find the Size section's closing </div> followed by <hr>
let insertIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('text-gray-400">Size</span>')) {
    // Find the next <hr> after Size section
    for (let j = i + 1; j < i + 25; j++) {
      if (lines[j].includes('<hr') && lines[j].includes('border-gray-200')) {
        insertIdx = j;
        break;
      }
    }
    break;
  }
}

if (insertIdx === -1) { console.log("ERROR: Could not find hr after Size"); process.exit(1); }

const lineHeightBlock = [
  '          <div className="flex flex-col items-center gap-0.5">',
  '            <span className="text-[9px] text-gray-400">Line Height</span>',
  '            <input',
  '              type="range"',
  '              min={80}',
  '              max={300}',
  '              defaultValue={120}',
  '              onChange={e => {',
  '                const v = +e.target.value / 100;',
  '                const c = fcRef.current; if (!c) return;',
  '                const obj = c.getActiveObject() as any;',
  '                if (obj && "lineHeight" in obj) {',
  '                  obj.set("lineHeight", v);',
  '                  c.renderAll();',
  '                }',
  '              }}',
  '              className="w-[100px] h-1 accent-blue-500"',
  '            />',
  '            <span className="text-[8px] text-gray-300">0.8 — 3.0</span>',
  '          </div>',
];

lines.splice(insertIdx, 0, ...lineHeightBlock);
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Line Height slider added before line " + (insertIdx + 1));
