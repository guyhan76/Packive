import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// Line 1036 (index 1035) = "      window.addEventListener('keydown', keyHandler);"
// Need to add "};" before this line to close keyHandler
lines.splice(1035, 0, '      };');

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Added }; to close keyHandler before addEventListener.');
