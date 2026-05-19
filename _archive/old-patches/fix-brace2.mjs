import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

const broken = `if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          if (historyIdxRef.current > 0) {
            historyIdxRef.current--;
            loadingRef.current = true;
            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {
              canvas.renderAll(); loadingRef.current = false;
            });
          }
        // Ctrl+Y / Ctrl+Shift+Z = Redo`;

const fixed = `if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          if (historyIdxRef.current > 0) {
            historyIdxRef.current--;
            loadingRef.current = true;
            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {
              canvas.renderAll(); loadingRef.current = false;
            });
          }
        }
        // Ctrl+Y / Ctrl+Shift+Z = Redo`;

code = code.replace(broken, fixed);

// Also fix the extra closing brace at the end (there are two }} before };)
code = code.replace(
  `        }
        }
      };
      window.addEventListener('keydown', keyHandler);`,
  `        }
      };
      window.addEventListener('keydown', keyHandler);`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Key handler braces fixed.');
