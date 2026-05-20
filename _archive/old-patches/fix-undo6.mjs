import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

// Replace pushHistory guard to also check during the event itself
code = code.replace(
  `canvas.on('object:modified', pushHistory);
      canvas.on('object:added', () => { if (!loadingRef.current) pushHistory(); });
      canvas.on('object:removed', () => { if (!loadingRef.current) pushHistory(); });`,
  `canvas.on('object:modified', () => { if (!loadingRef.current) pushHistory(); });
      canvas.on('object:added', () => { if (!loadingRef.current) pushHistory(); });
      canvas.on('object:removed', () => { if (!loadingRef.current) pushHistory(); });`
);

// Replace Undo: set loadingRef BEFORE changing index
code = code.replace(
  `if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {
          e.preventDefault();
          console.log('UNDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length, 'json_len=', historyRef.current[historyIdxRef.current]?.length, 'prev_len=', historyRef.current[historyIdxRef.current + 1]?.length);
          if (historyIdxRef.current > 0) {
            historyIdxRef.current--;
            loadingRef.current = true;
            const parsed = JSON.parse(historyRef.current[historyIdxRef.current]);
            canvas.loadFromJSON(parsed).then(() => {
              canvas.requestRenderAll();
              setTimeout(() => { loadingRef.current = false; }, 300);
            });
          }
        }`,
  `if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {
          e.preventDefault();
          if (historyIdxRef.current > 0) {
            loadingRef.current = true;
            historyIdxRef.current--;
            console.log('UNDO to idx=', historyIdxRef.current);
            const state = JSON.parse(historyRef.current[historyIdxRef.current]);
            canvas.clear();
            canvas.loadFromJSON(state).then(() => {
              canvas.requestRenderAll();
              setTimeout(() => { loadingRef.current = false; }, 500);
            });
          }
        }`
);

// Replace Redo similarly
code = code.replace(
  `console.log('REDO: idx=', historyIdxRef.current, 'len=', historyRef.current.length);
          if (historyIdxRef.current < historyRef.current.length - 1) {
            historyIdxRef.current++;
            loadingRef.current = true;
            const parsed = JSON.parse(historyRef.current[historyIdxRef.current]);
            canvas.loadFromJSON(parsed).then(() => {
              canvas.requestRenderAll();
              setTimeout(() => { loadingRef.current = false; }, 300);
            });
          }`,
  `if (historyIdxRef.current < historyRef.current.length - 1) {
            loadingRef.current = true;
            historyIdxRef.current++;
            console.log('REDO to idx=', historyIdxRef.current);
            const state = JSON.parse(historyRef.current[historyIdxRef.current]);
            canvas.clear();
            canvas.loadFromJSON(state).then(() => {
              canvas.requestRenderAll();
              setTimeout(() => { loadingRef.current = false; }, 500);
            });
          }`
);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Undo/Redo fully fixed with canvas.clear() + 500ms guard.');
