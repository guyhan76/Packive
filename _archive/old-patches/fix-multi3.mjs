import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// 1. Fix Opacity - cast obj properly
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('obj.set("opacity"')) {
    lines[i] = lines[i].replace('obj.set("opacity"', '(obj as any).set("opacity"');
    done++;
    console.log('1. Opacity cast fixed at line ' + (i+1));
    break;
  }
}

// 2. Find Group button start and Ungroup button end
let gStart = -1, ugEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('title="Group"') && lines[i].includes('>G</button>')) {
    // Go back to find start of Group button
    for (let j = i; j >= i - 15; j--) {
      if (lines[j].trim().startsWith('<button onClick={async')) {
        gStart = j;
        break;
      }
    }
    // Find Ungroup end
    for (let j = i + 1; j < i + 20; j++) {
      if (lines[j] && lines[j].includes('title="Ungroup"') && lines[j].includes('>UG</button>')) {
        ugEnd = j;
        break;
      }
    }
    break;
  }
}

if (gStart > -1 && ugEnd > -1) {
  const gLines = lines.slice(gStart, ugEnd + 1);
  const newBlock = [
    '          <div className="flex flex-col items-center gap-1">',
    '            <span className="text-[9px] text-gray-400">Group</span>',
    '            <div className="flex gap-0.5">',
    ...gLines,
    '            </div>',
    '          </div>',
  ];
  lines.splice(gStart, ugEnd - gStart + 1, ...newBlock);
  done++;
  console.log('2. Group/UG wrapped with label at lines ' + (gStart+1) + '-' + (ugEnd+1));
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
