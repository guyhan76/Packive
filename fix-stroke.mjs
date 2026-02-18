import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// Find the <hr> between Letter Spacing and Rotation
let insertIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('-200 — 1000')) {
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].trim().startsWith('<hr')) { insertIdx = j; break; }
    }
    break;
  }
}

if (insertIdx === -1) { console.log("ERROR: insertion point not found"); process.exit(1); }

const strokeBlock = [
  '          <div className="flex flex-col items-center gap-0.5">',
  '            <span className="text-[9px] text-gray-400">Stroke Color</span>',
  '            <input type="color" defaultValue="#000000"',
  '              onChange={e => {',
  '                const c = fcRef.current; if (!c) return;',
  '                const obj = c.getActiveObject() as any;',
  '                if (obj) { obj.set("stroke", e.target.value); obj.dirty = true; c.requestRenderAll(); }',
  '              }}',
  '              className="w-8 h-5 cursor-pointer border-0"',
  '            />',
  '          </div>',
  '          <div className="flex flex-col items-center gap-0.5">',
  '            <span className="text-[9px] text-gray-400">Stroke Width</span>',
  '            <input type="range" min={0} max={10} defaultValue={0} step={0.5}',
  '              onChange={e => {',
  '                const v = +e.target.value;',
  '                const c = fcRef.current; if (!c) return;',
  '                const obj = c.getActiveObject() as any;',
  '                if (obj) {',
  '                  obj.set("strokeWidth", v);',
  '                  obj.set("paintFirst", "stroke");',
  '                  obj.dirty = true;',
  '                  if (obj.setCoords) obj.setCoords();',
  '                  c.requestRenderAll();',
  '                }',
  '              }}',
  '              className="w-[100px] h-1 accent-blue-500"',
  '            />',
  '            <span className="text-[8px] text-gray-300">0 — 10</span>',
  '          </div>',
];

lines.splice(insertIdx, 0, ...strokeBlock);
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Stroke Color + Stroke Width added at line " + insertIdx);
