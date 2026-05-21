import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let removed = 0;

// 1. Remove ToolButton "Bring ↑" line 1814
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton label="Bring') && lines[i].includes('bringFwd')) {
    lines.splice(i, 1);
    removed++;
    console.log('1. Removed Bring ↑ button at line ' + (i + 1));
    break;
  }
}

// 2. Remove ToolButton "Send ↓"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton label="Send') && lines[i].includes('sendBck')) {
    lines.splice(i, 1);
    removed++;
    console.log('2. Removed Send ↓ button at line ' + (i + 1));
    break;
  }
}

// 3. Remove bringFwd function (lines starting with const bringFwd)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const bringFwd = useCallback(')) {
    // Find the closing of this useCallback
    let end = i;
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('}, []);') || lines[j].includes('}, [])')) {
        end = j;
        break;
      }
    }
    const count = end - i + 1;
    lines.splice(i, count);
    removed++;
    console.log('3. Removed bringFwd function (' + count + ' lines)');
    break;
  }
}

// 4. Remove sendBck function
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const sendBck = useCallback(')) {
    let end = i;
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('}, []);') || lines[j].includes('}, [])')) {
        end = j;
        break;
      }
    }
    const count = end - i + 1;
    lines.splice(i, count);
    removed++;
    console.log('4. Removed sendBck function (' + count + ' lines)');
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Removed ' + removed + ' items.');
