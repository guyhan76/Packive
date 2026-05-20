import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton label="Delete"')) {
    const clearBlock = [
      '          <button onClick={() => {',
      '            const c = fcRef.current; if (!c) return;',
      '            if (!confirm("Clear canvas? This cannot be undone.")) return;',
      '            const objs = c.getObjects().filter((o:any) => o.selectable !== false || (o as any)._isBgRect);',
      '            objs.forEach((o:any) => { if (!(o as any)._isSafeZone) c.remove(o); });',
      "            c.set('backgroundColor', '#FFFFFF');",
      '            c.renderAll();',
      '            refreshLayers();',
      '          }} className="w-[120px] py-1 text-[10px] bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 font-medium" title="Clear Canvas">',
      '            Clear Canvas',
      '          </button>',
    ];
    lines.splice(i + 1, 0, ...clearBlock);
    done++;
    console.log('Added Clear Canvas button after line ' + (i + 1));
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
