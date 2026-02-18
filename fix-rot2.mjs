import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");

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
  '              <span className="text-[8px] text-gray-300">\u00B0</span>',
  '            </div>',
  '          </div>',
];

// Insert at line 1917 (index 1917), before the <hr>
lines.splice(1917, 0, ...rotBlock);
writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! Rotation input added at line 1917");
