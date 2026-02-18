import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// Find the Group button onClick block and replace it
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("title=\"Group\"") && lines[i-1] && lines[i-1].includes("refreshLayers")) {
    // Found end of group block. Find start (onClick={() => {)
    let start = i;
    for (let j = i; j >= 0; j--) {
      if (lines[j].includes('<button onClick={() => {') && lines[j+1] && lines[j+1].includes('const c = fcRef.current')) {
        // Check if this is the Group button (not Ungroup)
        let isGroup = false;
        for (let k = j; k <= i; k++) {
          if (lines[k].includes('toGroup') || lines[k].includes('activeselection')) { isGroup = true; break; }
        }
        if (isGroup) { start = j; break; }
      }
    }
    
    const newGroupBtn = [
      '            <button onClick={async () => {',
      '              const c = fcRef.current; if (!c) return;',
      '              const sel = c.getActiveObject();',
      "              if (sel && sel.type === 'activeselection') {",
      '                const { Group } = await import("fabric");',
      '                const objects = (sel as any)._objects.slice();',
      '                c.discardActiveObject();',
      '                objects.forEach((o:any) => c.remove(o));',
      '                const group = new Group(objects, { selectable: true });',
      '                c.add(group);',
      '                c.setActiveObject(group);',
      '                c.renderAll();',
      '                refreshLayers();',
      '              }',
      '            }} title="Group" className="w-8 h-8 flex items-center justify-center text-[10px] border border-gray-200 rounded hover:bg-gray-100 font-bold">G</button>',
    ];
    
    lines.splice(start, i - start + 1, ...newGroupBtn);
    done++;
    console.log('1. Replaced Group button with Fabric v7 Group constructor');
    break;
  }
}

// Find the Ungroup button and replace it
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("title=\"Ungroup\"") && lines[i-1] && lines[i-1].includes("refreshLayers")) {
    let start = i;
    for (let j = i; j >= 0; j--) {
      if (lines[j].includes('<button onClick={() => {') && lines[j+1] && lines[j+1].includes('const c = fcRef.current')) {
        let isUngroup = false;
        for (let k = j; k <= i; k++) {
          if (lines[k].includes('toActiveSelection') || (lines[k].includes("'group'") && !lines[k].includes('activeselection'))) { isUngroup = true; break; }
        }
        if (isUngroup) { start = j; break; }
      }
    }
    
    const newUngroupBtn = [
      '            <button onClick={() => {',
      '              const c = fcRef.current; if (!c) return;',
      '              const sel = c.getActiveObject();',
      "              if (sel && sel.type === 'group') {",
      '                const objects = (sel as any)._objects.slice();',
      '                c.remove(sel);',
      '                objects.forEach((o:any) => { c.add(o); });',
      '                c.renderAll();',
      '                refreshLayers();',
      '              }',
      '            }} title="Ungroup" className="w-8 h-8 flex items-center justify-center text-[10px] border border-gray-200 rounded hover:bg-gray-100 font-bold">UG</button>',
    ];
    
    lines.splice(start, i - start + 1, ...newUngroupBtn);
    done++;
    console.log('2. Replaced Ungroup button with Fabric v7 approach');
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
