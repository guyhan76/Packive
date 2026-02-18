import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

code = code.replace(/\s*console\.log\("PUSH idx=",.*?\);/g, '');
code = code.replace(/\s*console\.log\('PUSH idx=',.*?\);/g, '');
code = code.replace(/\s*console\.log\('UNDO to idx=',.*?\);/g, '');
code = code.replace(/\s*console\.log\('REDO to idx=',.*?\);/g, '');

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Debug logs removed.');
