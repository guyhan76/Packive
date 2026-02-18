const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');

const bad = 'className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>';
const good = 'className={lex-1 py-2 text-center text-[10px] font-medium transition-colors }>';

if (code.includes(bad)) {
  code = code.replace(bad, good);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Fixed! Replaced broken className.');
} else {
  // Try with newline variants
  const variants = [
    'className={\nlex-1',
    'className={\r\nlex-1',
    'className={\\nlex-1'
  ];
  let found = false;
  for (const v of variants) {
    if (code.includes(v)) {
      console.log('Found variant: ' + JSON.stringify(v.substring(0,30)));
      found = true;
    }
  }
  if (!found) {
    // Show exact content at that position
    const idx = code.indexOf('lex-1 py-2 text-center');
    if (idx !== -1) {
      const before = code.substring(idx - 20, idx);
      console.log('Before lex-1: ' + JSON.stringify(before));
      const chunk = code.substring(idx - 20, idx + 80);
      console.log('Full chunk: ' + JSON.stringify(chunk));
    }
  }
}
