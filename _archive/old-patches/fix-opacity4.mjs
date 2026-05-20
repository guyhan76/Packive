import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
let lines = code.split('\n');

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
  '          <hr className="w-10 border-gray-200" />',
];

// Replace line 1805 (index 1804) which is the <hr> before Font
lines.splice(1804, 1, ...opacityBlock);

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Opacity control inserted at line 1805.');
