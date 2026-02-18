const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className={') && lines[i].includes('lex-1 py-2 text-center text-[10px]')) {
    const indent = '                ';
    lines[i] = indent + 'className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>';
    changes++;
    console.log('1. Fixed className at line ' + (i+1));
    break;
  }
}

if (changes === 0) {
  // Try: the line literally contains a newline character embedded
  let code = fs.readFileSync(file, 'utf8');
  const bad = 'className={\nlex-1 py-2 text-center text-[10px] font-medium transition-colors }>';
  const good = 'className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>';
  if (code.includes(bad)) {
    code = code.replace(bad, good);
    fs.writeFileSync(file, code, 'utf8');
    changes++;
    console.log('1. Fixed via raw string replace');
  }
}

if (changes === 0) {
  // Last resort: replace any line containing 'lex-1 py-2 text-center'
  let code = fs.readFileSync(file, 'utf8');
  const regex = /className=\{[\s\r\n]*lex-1 py-2 text-center text-\[10px\] font-medium transition-colors \}>/;
  if (regex.test(code)) {
    code = code.replace(regex, 'className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>');
    fs.writeFileSync(file, code, 'utf8');
    changes++;
    console.log('1. Fixed via regex replace');
  }
}

if (changes > 0) {
  console.log('Done!');
} else {
  console.log('Still no match. Showing raw bytes around line 2248:');
  let code = fs.readFileSync(file, 'utf8');
  let idx = code.indexOf('lex-1 py-2 text-center');
  if (idx !== -1) {
    let start = Math.max(0, idx - 30);
    let chunk = code.substring(start, idx + 60);
    let hex = '';
    for (let j = 0; j < chunk.length; j++) {
      hex += chunk.charCodeAt(j).toString(16).padStart(2, '0') + ' ';
    }
    console.log('Context: ' + JSON.stringify(chunk));
    console.log('Hex: ' + hex);
  }
}
