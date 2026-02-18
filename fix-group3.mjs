import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Lines 1791-1811 (index 1790-1810) contain the old Group/Ungroup buttons
// Replace index 1791 to 1810 with new code
const newCode = [
  '            <button onClick={async () => {',
  '              const c = fcRef.current; if (!c) return;',
  '              const sel = c.getActiveObject();',
  "              if (sel && sel.type === 'activeselection') {",
  '                const { Group } = await import("fabric");',
  '                const objects = [...(sel as any)._objects];',
  '                c.discardActiveObject();',
  '                objects.forEach((o:any) => c.remove(o));',
  '                const group = new Group(objects, { selectable: true });',
  '                c.add(group);',
  '                c.setActiveObject(group);',
  '                c.renderAll();',
  '                refreshLayers();',
  '              }',
  '            }} title="Group" className="w-8 h-8 flex items-center justify-center text-[10px] border border-gray-200 rounded hover:bg-gray-100 font-bold">G</button>',
  '            <button onClick={() => {',
  '              const c = fcRef.current; if (!c) return;',
  '              const sel = c.getActiveObject();',
  "              if (sel && sel.type === 'group') {",
  '                const objects = [...(sel as any)._objects];',
  '                c.remove(sel);',
  '                objects.forEach((o:any) => c.add(o));',
  '                c.renderAll();',
  '                refreshLayers();',
  '              }',
  '            }} title="Ungroup" className="w-8 h-8 flex items-center justify-center text-[10px] border border-gray-200 rounded hover:bg-gray-100 font-bold">UG</button>',
];

// Remove old lines 1792-1811 (index 1791-1810) and insert new
lines.splice(1791, 20, ...newCode);

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Group/Ungroup replaced with Fabric v7 approach.');
