import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// Find Line Height section, then find the next <hr> after it
let insertIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('text-gray-400">Line Height</span>')) {
    for (let j = i + 1; j < i + 20; j++) {
      if (lines[j].includes('<hr') && lines[j].includes('border-gray-200')) {
        insertIdx = j;
        break;
      }
    }
    break;
  }
}

if (insertIdx === -1) { console.log("ERROR: Could not find hr after Line Height"); process.exit(1); }

const rotBlock = [
  '          <div className="flex flex-col items-center gap-0.5">',
  '            <span className="text-[9px] text-gray-400">Rotation</span>',
  '            <div className="flex items-center gap-1">',
  '              <input',
  '                type="number"',
  '                min={-360}',
  '                max={360}',
  '                defaultValue={0}',
  '                onChange={e => {',
  '                  const v = +e.target.value;',
  '                  const c = fcRef.current; if (!c) return;',
  '                  const obj = c.getActiveObject();',
  '                  if (obj) {',
  '                    obj.set("angle", v);',
  '                    obj.setCoords();',
  '                    c.requestRenderAll();',
  '                  }',
  '                }}',
  '                className="w-12 text-xs border rounded px-1 py-0.5 text-center"',
  '              />',
  '              <span className="text-[8px] text-gray-300">°</span>',
  '            </div>',
  '          </div>',
];

lines.splice(insertIdx, 0, ...rotBlock);
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Rotation input added before line " + (insertIdx + 1));
