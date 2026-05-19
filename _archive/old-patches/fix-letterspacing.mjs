import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

// Find the <hr> after Line Height (0.8 — 3.0 span)
let insertIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('0.8 — 3.0')) {
    // Find the next </div> then <hr>
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].trim().startsWith('<hr')) { insertIdx = j; break; }
    }
    break;
  }
}

if (insertIdx === -1) { console.log("ERROR: insertion point not found"); process.exit(1); }

const letterSpacing = [
  '          <div className="flex flex-col items-center gap-0.5">',
  '            <span className="text-[9px] text-gray-400">Letter Spacing</span>',
  '            <input',
  '              type="range"',
  '              min={-200}',
  '              max={1000}',
  '              defaultValue={0}',
  '              onChange={e => {',
  '                const v = +e.target.value;',
  '                const c = fcRef.current; if (!c) return;',
  '                const obj = c.getActiveObject() as any;',
  '                if (obj && ("charSpacing" in obj || obj.type === "i-text" || obj.type === "textbox")) {',
  '                  obj.set("charSpacing", v);',
  '                  obj.dirty = true;',
  '                  if (obj.initDimensions) obj.initDimensions();',
  '                  if (obj.setCoords) obj.setCoords();',
  '                  c.requestRenderAll();',
  '                }',
  '              }}',
  '              className="w-[100px] h-1 accent-blue-500"',
  '            />',
  '            <span className="text-[8px] text-gray-300">-200 — 1000</span>',
  '          </div>',
];

lines.splice(insertIdx, 0, ...letterSpacing);
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Letter Spacing added at line " + insertIdx);
