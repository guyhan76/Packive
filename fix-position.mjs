import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// Find the hr before Group/Ungroup buttons (after Style section closes)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<hr className="w-10 border-gray-200"') && 
      i + 2 < lines.length && lines[i + 2].includes('const sel = c.getActiveObject()')) {
    // This is the hr before Group buttons
    const alignBlock = [
      '          <hr className="w-28 border-gray-200" />',
      '          <div className="flex flex-col items-center gap-1">',
      '            <span className="text-[9px] text-gray-400">Position</span>',
      '            <div className="grid grid-cols-3 gap-0.5">',
      '              <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { o.set("left", 0); o.set("originX", "left"); c.renderAll(); } }} title="Align Left" className="w-6 h-6 text-[9px] border border-gray-200 rounded hover:bg-gray-100">⇤</button>',
      '              <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { o.set("left", c.getWidth() / 2); o.set("originX", "center"); c.renderAll(); } }} title="Center H" className="w-6 h-6 text-[9px] border border-gray-200 rounded hover:bg-gray-100">⇔</button>',
      '              <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { o.set("left", c.getWidth()); o.set("originX", "right"); c.renderAll(); } }} title="Align Right" className="w-6 h-6 text-[9px] border border-gray-200 rounded hover:bg-gray-100">⇥</button>',
      '              <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { o.set("top", 0); o.set("originY", "top"); c.renderAll(); } }} title="Align Top" className="w-6 h-6 text-[9px] border border-gray-200 rounded hover:bg-gray-100">⤒</button>',
      '              <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { o.set("top", c.getHeight() / 2); o.set("originY", "center"); c.renderAll(); } }} title="Center V" className="w-6 h-6 text-[9px] border border-gray-200 rounded hover:bg-gray-100">⇕</button>',
      '              <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { o.set("top", c.getHeight()); o.set("originY", "bottom"); c.renderAll(); } }} title="Align Bottom" className="w-6 h-6 text-[9px] border border-gray-200 rounded hover:bg-gray-100">⤓</button>',
      '            </div>',
      '          </div>',
    ];
    // Replace the hr line with alignBlock + original hr
    lines.splice(i, 1, ...alignBlock);
    done++;
    console.log('Inserted Position align buttons at line ' + (i + 1));
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
