const fs = require('fs');
const main = fs.readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
const p1 = fs.readFileSync('p1.txt', 'utf8');
const p2 = fs.readFileSync('p2.txt', 'utf8');
const p3 = fs.readFileSync('p3.txt', 'utf8');
const p4 = fs.readFileSync('p4.txt', 'utf8');

let lines = main.split('\n');
while (lines.length > 0 && lines[lines.length-1].trim() === '') lines.pop();
console.log('Main ends at line:', lines.length, '|', lines[lines.length-1].trim());

const merged = lines.join('\n') + '\n' + p1 + p2 + p3 + p4;
fs.writeFileSync('src/components/editor/panel-editor.tsx', merged, 'utf8');

const finalLines = merged.split('\n').length;
console.log('Merged! Total lines:', finalLines);

// Brace check
const openB = (merged.match(/\{/g) || []).length;
const closeB = (merged.match(/\}/g) || []).length;
console.log('Braces: { ' + openB + ' } ' + closeB + ' diff: ' + (openB - closeB));
