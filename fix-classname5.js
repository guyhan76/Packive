const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Line 2248 (index 2247) has the broken className
// Line 2249 (index 2248) has the continuation
// Replace both lines with one correct line

console.log('Line 2248: ' + JSON.stringify(lines[2247]));
console.log('Line 2249: ' + JSON.stringify(lines[2248]));

// Replace line 2248 and remove line 2249
lines[2247] = '                className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>';
lines.splice(2248, 1); // remove the old continuation line

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Fixed! Replaced lines 2248-2249 with correct className.');
