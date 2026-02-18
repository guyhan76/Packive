import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

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

// Insert at index 1868 (before the hr line)
lines.splice(1868, 0, ...alignBlock);
console.log('Done! Position block inserted at line 1869.');

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
