const fs = require('fs');
const main = fs.readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
const p1 = fs.readFileSync('append-part1.txt', 'utf8');
const p2 = fs.readFileSync('append-part2.txt', 'utf8');
const p3 = fs.readFileSync('append-part3.txt', 'utf8');

// Remove trailing empty lines from main
let lines = main.split('\n');
while (lines.length > 0 && lines[lines.length-1].trim() === '') lines.pop();

// The last meaningful line should be line 1110: "              }"
// which is the incomplete forEach body
const lastLine = lines[lines.length - 1].trim();
console.log('Last line of main file:', lastLine);

const merged = lines.join('\n') + '\n' + p1 + p2 + p3;
fs.writeFileSync('src/components/editor/panel-editor.tsx', merged, 'utf8');

const finalLines = merged.split('\n').length;
console.log('Merged successfully! Total lines:', finalLines);
