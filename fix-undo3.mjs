import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Line 959 (index 958) = "if ((e.ctrlKey || e.metaKey) && e.key === 'z') {"
lines[958] = "        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {";

// Insert console.log after preventDefault (index 959)
lines.splice(960, 0, "          console.log('UNDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length);");

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Line 959 fixed to e.code + debug log added.');
