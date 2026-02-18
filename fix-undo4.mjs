import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// Replace Undo block
code = code.replace(
  `if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {
          e.preventDefault();
          console.log('UNDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length);
          if (historyIdxRef.current > 0) {
            historyIdxRef.current--;
            loadingRef.current = true;
            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {
              canvas.renderAll(); loadingRef.current = false;
            });
          }
        }`,
  `if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {
          e.preventDefault();
          console.log('UNDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length);
          if (historyIdxRef.current > 0) {
            historyIdxRef.current--;
            loadingRef.current = true;
            canvas.loadFromJSON(historyRef.current[historyIdxRef.current]).then(() => {
              canvas.requestRenderAll();
              setTimeout(() => { loadingRef.current = false; }, 100);
            });
          }
        }`
);

// Replace Redo block similarly
code = code.replace(
  `if (historyIdxRef.current < historyRef.current.length - 1) {
            historyIdxRef.current++;
            loadingRef.current = true;
            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {
              canvas.renderAll(); loadingRef.current = false;
            });`,
  `if (historyIdxRef.current < historyRef.current.length - 1) {
            historyIdxRef.current++;
            loadingRef.current = true;
            canvas.loadFromJSON(historyRef.current[historyIdxRef.current]).then(() => {
              canvas.requestRenderAll();
              setTimeout(() => { loadingRef.current = false; }, 100);
            });`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Undo/Redo improved.');
