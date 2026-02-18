import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
let lines = code.split('\n');

// Insert opacity control after line 1806 (</div>) and before line 1807 (<hr>)
// Line 1806 = index 1805: "          </div>"
// Line 1807 = index 1806: "          <hr ..."
const opacityBlock = [
  '          <hr className="w-10 border-gray-200" />',
  '          <div className="flex flex-col items-center gap-1">',
  '            <span className="text-[9px] text-gray-400">Opacity</span>',
  '            <input',
  '              type="range"',
  '              min={0}',
  '              max={100}',
  '              value={opacity}',
  '              onChange={e => {',
  '                const v = +e.target.value;',
  '                setOpacity(v);',
  '                const c = fcRef.current; if (!c) return;',
  '                const obj = c.getActiveObject();',
  '                if (obj) {',
  "                  obj.set('opacity', v / 100);",
  '                  c.renderAll();',
  '                }',
  '              }}',
  '              className="w-16 h-1 accent-blue-500"',
  '            />',
  '            <span className="text-[8px] text-gray-500">{opacity}%</span>',
  '          </div>',
];

// Find the exact insertion point: "</div>" followed by "<hr" before "Font"
let insertIdx = -1;
for (let i = 1800; i < 1810; i++) {
  if (lines[i] && lines[i].trim() === '</div>' && lines[i+1] && lines[i+1].includes('<hr')) {
    if (lines[i+2] && lines[i+2].includes('Font')) {
      insertIdx = i + 1; // insert before the <hr> that precedes Font
      break;
    }
  }
}

if (insertIdx === -1) {
  console.log('ERROR: Could not find insertion point');
  process.exit(1);
}

// Replace the existing <hr> line and insert opacity + new <hr>
lines.splice(insertIdx, 1, ...opacityBlock);

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Opacity inserted before Font at index ' + insertIdx);
