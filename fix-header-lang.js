const fs = require('fs');
const f = 'src/components/layout/header.tsx';
let s = fs.readFileSync(f, 'utf8');
const lines = s.split(/\r?\n/);
const sep = s.includes('\r\n') ? '\r\n' : '\n';

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<div className="flex items-center gap-3">')) {
    // Add LanguageSelector after this div opens, before Button
    lines.splice(i + 1, 0, '          <LanguageSelector />');
    console.log('[header] Added LanguageSelector at line ' + (i + 2));
    break;
  }
}

fs.writeFileSync(f, lines.join(sep), 'utf8');
console.log('Done');
