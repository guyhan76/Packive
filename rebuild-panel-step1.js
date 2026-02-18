const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let lines = code.split('\n');
let changes = 0;

// 1. Add panelTab state after eraserSize state
let stateInserted = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('eraserSize') && lines[i].includes('useState')) {
    lines.splice(i + 1, 0, '  const [panelTab, setPanelTab] = useState<string>(\"add\");');
    stateInserted = true;
    changes++;
    console.log('1. Added panelTab state at line ' + (i + 2));
    break;
  }
}
if (!stateInserted) {
  // try after brushSize
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('brushSize') && lines[i].includes('useState')) {
      lines.splice(i + 1, 0, '  const [panelTab, setPanelTab] = useState<string>(\"add\");');
      changes++;
      console.log('1. Added panelTab state after brushSize at line ' + (i + 2));
      break;
    }
  }
}

// 2. Find aside start and end
let asideStart = -1;
let asideEnd = -1;
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  if (asideStart === -1 && lines[i].includes('<aside') && lines[i].includes('w-[200px]')) {
    asideStart = i;
  }
  if (asideStart !== -1 && asideEnd === -1) {
    depth += (lines[i].match(/<aside/g) || []).length;
    depth -= (lines[i].match(/<\/aside>/g) || []).length;
    if (depth <= 0) { asideEnd = i; break; }
  }
}

console.log('aside: lines ' + (asideStart+1) + ' to ' + (asideEnd+1));
console.log('Extracting all onClick handlers from aside...');

// Save full aside for reference
const asideBlock = lines.slice(asideStart, asideEnd + 1).join('\n');
fs.writeFileSync('aside-handlers.txt', asideBlock, 'utf8');
console.log('Saved ' + (asideEnd - asideStart + 1) + ' lines to aside-handlers.txt');

if (changes > 0) {
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('File updated with panelTab state.');
} else {
  console.log('No state changes needed.');
}
