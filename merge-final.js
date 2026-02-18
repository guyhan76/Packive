const fs = require('fs');
const main = fs.readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
const p1 = fs.readFileSync('p1.txt', 'utf8');
const p2 = fs.readFileSync('p2.txt', 'utf8');
const p3 = fs.readFileSync('p3new.txt', 'utf8');
const p4 = fs.readFileSync('p4new.txt', 'utf8');

let lines = main.split('\n');
while (lines.length > 0 && lines[lines.length-1].trim() === '') lines.pop();
console.log('Main lines:', lines.length, '| Last:', lines[lines.length-1].trim());

const merged = lines.join('\n') + '\n' + p1 + p2 + p3 + p4;
fs.writeFileSync('src/components/editor/panel-editor.tsx', merged, 'utf8');

const fl = merged.split('\n').length;
const ob = (merged.match(/\{/g) || []).length;
const cb = (merged.match(/\}/g) || []).length;
console.log('Total lines:', fl);
console.log('Braces: {', ob, '}', cb, 'diff:', ob - cb);
console.log(ob === cb ? 'OK - braces balanced!' : 'WARNING - braces mismatch!');
