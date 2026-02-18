import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// Find BG Color section and add "Select BG" button before it
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('BG Color') && lines[i].includes('text-gray-400')) {
    const selectBgBtn = [
      '            <button onClick={() => {',
      '              const c = fcRef.current; if (!c) return;',
      '              const objs = c.getObjects();',
      '              // Find the first full-size Rect (template background)',
      '              const bg = objs.find((o: any) => o.type === "rect" && o.width >= c.getWidth() * 0.9 && o.height >= c.getHeight() * 0.9 && !o._isSafeZone);',
      '              if (bg) {',
      '                (bg as any).set({ selectable: true, evented: true });',
      '                c.setActiveObject(bg);',
      '                c.renderAll();',
      '              }',
      '            }} className="w-[120px] py-1 text-[10px] bg-gray-100 text-gray-600 border border-gray-200 rounded hover:bg-gray-200 font-medium mb-1" title="Select template background">',
      '              Select BG',
      '            </button>',
    ];
    lines.splice(i + 1, 0, ...selectBgBtn);
    done++;
    console.log('Added Select BG button');
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
