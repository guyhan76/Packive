import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// 1. Find Delete ToolButton and insert Group/Ungroup before it
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton label="Delete"')) {
    const groupBtns = [
      '          <div className="flex gap-0.5">',
      '            <button onClick={() => {',
      '              const c = fcRef.current; if (!c) return;',
      "              const sel = c.getActiveObject();",
      "              if (sel && sel.type === 'activeselection') {",
      "                const group = (sel as any).toGroup();",
      '                c.setActiveObject(group);',
      '                c.renderAll();',
      '                refreshLayers();',
      '              }',
      '            }} title="Group" className="w-8 h-8 flex items-center justify-center text-[10px] border border-gray-200 rounded hover:bg-gray-100 font-bold">G</button>',
      '            <button onClick={() => {',
      '              const c = fcRef.current; if (!c) return;',
      "              const sel = c.getActiveObject();",
      "              if (sel && sel.type === 'group') {",
      "                (sel as any).toActiveSelection();",
      '                c.renderAll();',
      '                refreshLayers();',
      '              }',
      '            }} title="Ungroup" className="w-8 h-8 flex items-center justify-center text-[10px] border border-gray-200 rounded hover:bg-gray-100 font-bold">UG</button>',
      '          </div>',
      '          <hr className="w-28 border-gray-200" />',
    ];
    lines.splice(i, 0, ...groupBtns);
    done++;
    console.log('1. Group/Ungroup buttons inserted before Delete at line ' + (i + 1));
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
