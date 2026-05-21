import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// Find Undo block and replace with fixed version
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("e.key === 'z'") && lines[i].includes('e.ctrlKey')) {
    // Find closing } of undo block
    let end = -1;
    let depth = 0;
    for (let j = i; j < i + 12; j++) {
      depth += (lines[j].match(/{/g) || []).length;
      depth -= (lines[j].match(/}/g) || []).length;
      if (depth === 0 && j > i) { end = j; break; }
    }
    if (end > -1) {
      const newUndo = [
        "        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {",
        '          e.preventDefault();',
        '          if (historyIdxRef.current > 0) {',
        '            historyIdxRef.current--;',
        '            loadingRef.current = true;',
        '            canvas.clear();',
        '            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {',
        '              canvas.requestRenderAll();',
        '              setTimeout(() => { loadingRef.current = false; }, 500);',
        '            });',
        '          }',
        '        }',
      ];
      lines.splice(i, end - i + 1, ...newUndo);
      done++;
      console.log('1. Fixed Undo block');
    }
    break;
  }
}

// Find Redo block and fix
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Ctrl+Y') && lines[i].includes('Redo')) {
    // Next line is the if statement
    let start = i + 1;
    let end = -1;
    let depth = 0;
    for (let j = start; j < start + 12; j++) {
      depth += (lines[j].match(/{/g) || []).length;
      depth -= (lines[j].match(/}/g) || []).length;
      if (depth === 0 && j > start) { end = j; break; }
    }
    if (end > -1) {
      const newRedo = [
        "        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyY' || (e.shiftKey && e.code === 'KeyZ'))) {",
        '          e.preventDefault();',
        '          if (historyIdxRef.current < historyRef.current.length - 1) {',
        '            historyIdxRef.current++;',
        '            loadingRef.current = true;',
        '            canvas.clear();',
        '            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {',
        '              canvas.requestRenderAll();',
        '              setTimeout(() => { loadingRef.current = false; }, 500);',
        '            });',
        '          }',
        '        }',
      ];
      lines.splice(start, end - start + 1, ...newRedo);
      done++;
      console.log('2. Fixed Redo block');
    }
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
