import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Replace lines 939-945 (index 938-944) with improved pushHistory
const newPush = [
  "      const pushHistory = () => {",
  "        if (loadingRef.current) return;",
  "        const json = JSON.stringify(canvas.toJSON());",
  "        if (json === historyRef.current[historyIdxRef.current]) return;",
  "        historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);",
  "        historyRef.current.push(json);",
  "        if (historyRef.current.length > 50) historyRef.current.shift();",
  "        historyIdxRef.current = historyRef.current.length - 1;",
  "        console.log('PUSH idx=', historyIdxRef.current);",
  "      };",
];

lines.splice(938, 7, ...newPush);

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! pushHistory replaced at lines 939-945.');
