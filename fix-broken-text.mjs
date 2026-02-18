import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

const fixes = [
  { from: 'Beaut챕', to: 'Beauté' },
  { from: 'Ros챕', to: 'Rosé' },
  { from: 'Ch창teau', to: 'Château' },
  { from: '-18째C', to: '-18°C' },
];

let count = 0;
for (const f of fixes) {
  if (code.includes(f.from)) {
    code = code.replace(f.from, f.to);
    count++;
    console.log('Fixed: "' + f.from + '" -> "' + f.to + '"');
  } else {
    console.log('NOT FOUND: "' + f.from + '"');
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Fixed ' + count + ' / ' + fixes.length + ' broken texts.');
