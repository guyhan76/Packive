import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

code = code.replace(
  `<span className="text-[9px] text-gray-400">BG</span>`,
  `<span className="text-[9px] text-gray-400">BG Color</span>`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! BG -> BG Color');
