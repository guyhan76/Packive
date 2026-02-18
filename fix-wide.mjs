import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// Widen left panel from 88px to 110px
code = code.replace('w-[88px]', 'w-[110px]');

// Widen color grids from 3 to 4 columns
code = code.replaceAll('grid grid-cols-3 gap-[3px]', 'grid grid-cols-4 gap-[3px]');

// Widen tool buttons
code = code.replaceAll('w-16', 'w-20');

// Widen select dropdowns
code = code.replaceAll('w-20', 'w-24');

// Widen hr lines
code = code.replaceAll('w-10 border-gray-200', 'w-20 border-gray-200');

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Left panel widened to 110px.');
