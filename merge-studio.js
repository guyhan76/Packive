const fs = require('fs');
const main = fs.readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
const u1 = fs.readFileSync('ui-part1.txt', 'utf8');
const u2 = fs.readFileSync('ui-part2.txt', 'utf8');
const u3 = fs.readFileSync('ui-part3.txt', 'utf8');
const u4 = fs.readFileSync('ui-part4.txt', 'utf8');

let lines = main.split('\n');
while (lines.length > 0 && lines[lines.length-1].trim() === '') lines.pop();
console.log('Main:', lines.length, 'lines | Last:', lines[lines.length-1].trim());

const merged = lines.join('\n') + '\n' + u1 + u2 + u3 + u4;
fs.writeFileSync('src/components/editor/panel-editor.tsx', merged, 'utf8');

const fl = merged.split('\n').length;
const ob = (merged.match(/\{/g) || []).length;
const cb = (merged.match(/\}/g) || []).length;
console.log('Total lines:', fl);
console.log('Braces: {', ob, '}', cb, 'diff:', ob - cb);
console.log(ob === cb ? 'PASS - braces balanced!' : 'FAIL - braces mismatch!');
