import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');

const oldKeyHandler = `if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          if (historyIdxRef.current > 0) {
            historyIdxRef.current--;
            loadingRef.current = true;
            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {
              canvas.renderAll(); loadingRef.current = false;
            });
          }
        }`;

const newKeyHandler = `if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          if (historyIdxRef.current > 0) {
            historyIdxRef.current--;
            loadingRef.current = true;
            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {
              canvas.renderAll(); loadingRef.current = false;
            });
          }
        }
        // Ctrl+Y / Ctrl+Shift+Z = Redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
          e.preventDefault();
          if (historyIdxRef.current < historyRef.current.length - 1) {
            historyIdxRef.current++;
            loadingRef.current = true;
            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {
              canvas.renderAll(); loadingRef.current = false;
            });
          }
        }
        // Ctrl+C = Copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          const obj = canvas.getActiveObject();
          if (obj) {
            obj.clone().then((cloned: any) => {
              (window as any).__fabricClipboard = cloned;
            });
          }
        }
        // Ctrl+V = Paste
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
          e.preventDefault();
          const clip = (window as any).__fabricClipboard;
          if (clip) {
            clip.clone().then((cloned: any) => {
              cloned.set({ left: (cloned.left || 0) + 15, top: (cloned.top || 0) + 15 });
              canvas.add(cloned);
              canvas.setActiveObject(cloned);
              canvas.renderAll();
            });
          }
        }
        // Ctrl+D = Duplicate
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault();
          const obj = canvas.getActiveObject();
          if (obj) {
            obj.clone().then((cloned: any) => {
              cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
              canvas.add(cloned);
              canvas.setActiveObject(cloned);
              canvas.renderAll();
            });
          }
        }`;

code = code.replace(oldKeyHandler, newKeyHandler);

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Keyboard shortcuts added: Ctrl+Y, Ctrl+C, Ctrl+V, Ctrl+D');
