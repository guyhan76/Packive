import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

code = code.replace(
  "useState<'templates' | 'copy' | 'review'>('templates')",
  "useState<'templates' | 'copy' | 'review' | 'layers'>('templates')"
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Added layers to aiTab type.');
