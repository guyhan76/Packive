const fs = require('fs');
const lines = fs.readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

let asideStart = -1;
let asideEnd = -1;
let depth = 0;

for (let i = 0; i < lines.length; i++) {
  if (asideStart === -1 && lines[i].includes('<aside') && lines[i].includes('w-[200px]')) {
    asideStart = i;
  }
  if (asideStart !== -1 && asideEnd === -1) {
    const opens = (lines[i].match(/<aside/g) || []).length;
    const closes = (lines[i].match(/<\/aside>/g) || []).length;
    depth += opens - closes;
    if (depth <= 0) {
      asideEnd = i;
      break;
    }
  }
}

console.log('aside start: line ' + (asideStart + 1));
console.log('aside end: line ' + (asideEnd + 1));
console.log('total lines: ' + (asideEnd - asideStart + 1));

// backup
const asideContent = lines.slice(asideStart, asideEnd + 1).join('\n');
fs.writeFileSync('aside-full-backup.txt', asideContent, 'utf8');
console.log('Backup saved to aside-full-backup.txt (' + asideContent.length + ' chars)');

// Find openSection state
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('openSection')) {
    console.log('openSection at line ' + (i+1) + ': ' + lines[i].trim().substring(0, 80));
    break;
  }
}
