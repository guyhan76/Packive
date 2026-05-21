import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

code = code.replace(
  "console.log('UNDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length);",
  "console.log('UNDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length, 'json_len=', historyRef.current[historyIdxRef.current]?.length, 'prev_len=', historyRef.current[historyIdxRef.current + 1]?.length);"
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Enhanced debug.');
