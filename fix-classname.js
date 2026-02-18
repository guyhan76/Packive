const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Fix broken className template literal
const broken = 'className={\nlex-1 py-2 text-center text-[10px] font-medium transition-colors ';
if (code.includes(broken)) {
  console.log('Found broken className (newline variant)');
}

// Try different patterns
const patterns = [
  { find: 'className={\nlex-1 py-2 text-center text-[10px]', desc: 'newline break' },
  { find: 'className={\r\nlex-1 py-2 text-center text-[10px]', desc: 'crlf break' },
];

for (const p of patterns) {
  if (code.includes(p.find)) {
    console.log('Found: ' + p.desc);
  }
}

// More robust: find the line with just className={ and fix it
let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === 'className={' && i + 1 < lines.length && lines[i+1].includes('lex-1 py-2 text-center')) {
    // Merge and fix
    const indent = lines[i].match(/^(\s*)/)[1];
    lines[i] = indent + 'className={\\lex-1 py-2 text-center text-[10px] font-medium transition-colors \\\\}>';
    lines.splice(i + 1, 1); // remove the broken next line
    changes++;
    console.log('1. Fixed className template literal at line ' + (i+1));
    break;
  }
}

if (changes > 0) {
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log('Done! ' + changes + ' changes.');
} else {
  // Debug: show surrounding lines
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('className') && lines[i].includes('transition-colors')) {
      console.log('Line ' + (i+1) + ': [' + lines[i].substring(0,100) + ']');
    }
    if (lines[i].includes('lex-1 py-2')) {
      console.log('Line ' + (i+1) + ': [' + lines[i].substring(0,100) + ']');
    }
  }
  console.log('No changes made.');
}
