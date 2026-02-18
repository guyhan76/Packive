const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');

// The problem: \f (form feed 0x0C) between { and lex-1
// So the actual string is: className={\x0Clex-1 py-2 text-center text-[10px] font-medium transition-colors }>
const bad = 'className={\x0Clex-1 py-2 text-center text-[10px] font-medium transition-colors }>';
const good = 'className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>';

if (code.includes(bad)) {
  code = code.replace(bad, good);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Fixed! Replaced \\x0C broken className with proper template literal.');
} else {
  console.log('Pattern not found.');
}
