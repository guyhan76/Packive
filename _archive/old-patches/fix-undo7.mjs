import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Lines 959-968 (index 958-967) = Undo block
// Replace these 10 lines entirely
const undoBlock = [
  "        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {",
  "          e.preventDefault();",
  "          if (historyIdxRef.current > 0) {",
  "            loadingRef.current = true;",
  "            historyIdxRef.current--;",
  "            console.log('UNDO to idx=', historyIdxRef.current);",
  "            canvas.clear();",
  "            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {",
  "              canvas.requestRenderAll();",
  "              setTimeout(() => { loadingRef.current = false; }, 500);",
  "            });",
  "          }",
  "        }",
];

lines.splice(958, 10, ...undoBlock);

// Also fix object:modified to check loadingRef
for (let i = 940; i < 955; i++) {
  if (lines[i] && lines[i].includes("canvas.on('object:modified', pushHistory)")) {
    lines[i] = "      canvas.on('object:modified', () => { if (!loadingRef.current) pushHistory(); });";
    console.log('Fixed object:modified at line ' + (i+1));
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Undo block replaced by line number.');
