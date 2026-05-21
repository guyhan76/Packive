import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// Fix 1: loadFromJSON should receive parsed object, and use longer loading guard
code = code.replace(
  `historyIdxRef.current--;
            loadingRef.current = true;
            canvas.loadFromJSON(historyRef.current[historyIdxRef.current]).then(() => {
              canvas.requestRenderAll();
              setTimeout(() => { loadingRef.current = false; }, 100);
            });`,
  `historyIdxRef.current--;
            loadingRef.current = true;
            const parsed = JSON.parse(historyRef.current[historyIdxRef.current]);
            canvas.loadFromJSON(parsed).then(() => {
              canvas.requestRenderAll();
              setTimeout(() => { loadingRef.current = false; }, 300);
            });`
);

// Fix 2: Same for Redo
code = code.replace(
  `historyIdxRef.current++;
            loadingRef.current = true;
            canvas.loadFromJSON(historyRef.current[historyIdxRef.current]).then(() => {
              canvas.requestRenderAll();
              setTimeout(() => { loadingRef.current = false; }, 100);
            });`,
  `historyIdxRef.current++;
            loadingRef.current = true;
            const parsed = JSON.parse(historyRef.current[historyIdxRef.current]);
            canvas.loadFromJSON(parsed).then(() => {
              canvas.requestRenderAll();
              setTimeout(() => { loadingRef.current = false; }, 300);
            });`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! loadFromJSON now receives parsed object + 300ms guard.');
