const fs = require('fs');
const lines = fs.readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
// aside starts at line 2237 (index 2236), ends at line 3384 (index 3383)
const asideLines = lines.slice(2236, 3384);
fs.writeFileSync('aside-backup.txt', asideLines.join('\n'), 'utf8');
console.log('Extracted ' + asideLines.length + ' lines of aside content');
console.log('First line: ' + asideLines[0].substring(0, 80));
console.log('Last line: ' + asideLines[asideLines.length-1].substring(0, 80));
