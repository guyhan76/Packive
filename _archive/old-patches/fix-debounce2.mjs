import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Find pushHistory function (starts at "const pushHistory")
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const pushHistory = () => {')) {
    start = i;
    for (let j = i + 1; j < i + 15; j++) {
      if (lines[j].trim() === '};') { end = j; break; }
    }
    break;
  }
}

if (start > -1 && end > -1) {
  const newPush = [
    '      let pushTimer: any = null;',
    '      const pushHistory = () => {',
    '        if (loadingRef.current) return;',
    '        if (pushTimer) clearTimeout(pushTimer);',
    '        pushTimer = setTimeout(() => {',
    '          const json = JSON.stringify(canvas.toJSON());',
    '          if (json === historyRef.current[historyIdxRef.current]) return;',
    '          historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);',
    '          historyRef.current.push(json);',
    '          if (historyRef.current.length > 50) historyRef.current.shift();',
    '          historyIdxRef.current = historyRef.current.length - 1;',
    '        }, 400);',
    '      };',
  ];
  lines.splice(start, end - start + 1, ...newPush);
  console.log('Replaced pushHistory at lines ' + (start+1) + '-' + (end+1) + ' with debounced version');
} else {
  console.log('pushHistory not found! start=' + start + ' end=' + end);
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done!');
