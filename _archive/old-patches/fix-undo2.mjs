import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// Replace key === 'z' with code === 'KeyZ' for Undo
code = code.replace(
  `if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          console.log('UNDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length);
          if (historyIdxRef.current > 0) {`,
  `if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {
          e.preventDefault();
          console.log('UNDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length);
          if (historyIdxRef.current > 0) {`
);

// Replace Redo condition with e.code
code = code.replace(
  `if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
          e.preventDefault();
          console.log('REDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length);`,
  `if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyY' || (e.shiftKey && e.code === 'KeyZ'))) {
          e.preventDefault();
          console.log('REDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length);`
);

// Also fix Copy, Paste, Cut, Duplicate to use e.code
code = code.replace("(e.ctrlKey || e.metaKey) && e.key === 'c'", "(e.ctrlKey || e.metaKey) && e.code === 'KeyC'");
code = code.replace("(e.ctrlKey || e.metaKey) && e.key === 'v'", "(e.ctrlKey || e.metaKey) && e.code === 'KeyV'");
code = code.replace("(e.ctrlKey || e.metaKey) && e.key === 'x'", "(e.ctrlKey || e.metaKey) && e.code === 'KeyX'");
code = code.replace("(e.ctrlKey || e.metaKey) && e.key === 'd'", "(e.ctrlKey || e.metaKey) && e.code === 'KeyD'");

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! All shortcuts switched to e.code.');
