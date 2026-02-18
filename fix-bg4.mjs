import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

code = code.replace(
  "['#FFFFFF','#000000','#F3F4F6','#FEF3C7','#DBEAFE','#D1FAE5','#FCE7F3','#EDE9FE','#FEE2E2','#FFEDD5']",
  "['#FFFFFF','#000000','#F3F4F6','#FEF3C7','#DBEAFE','#D1FAE5','#FCE7F3','#EDE9FE','#FEE2E2','#FFEDD5','#E0E7FF','#F0FDF4']"
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! BG palette now 12 colors.');
