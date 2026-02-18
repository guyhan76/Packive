import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// The problem: missing "}" before Redo block
// Fix: add the closing "}" for Ctrl+Z block
code = code.replace(
  `          }
        // Ctrl+Y / Ctrl+Shift+Z = Redo`,
  `          }
        }
        // Ctrl+Y / Ctrl+Shift+Z = Redo`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Fixed missing closing brace.');
