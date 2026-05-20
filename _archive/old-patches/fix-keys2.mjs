import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
let lines = code.split('\n');

// Find the closing "}" of Ctrl+Z block, before "};" that closes keyHandler
// Line 967 (index 966) = "        }"
// Line 968 (index 967) = "      };"
const shortcuts = [
  '        // Ctrl+Y / Ctrl+Shift+Z = Redo',
  "        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {",
  '          e.preventDefault();',
  '          if (historyIdxRef.current < historyRef.current.length - 1) {',
  '            historyIdxRef.current++;',
  '            loadingRef.current = true;',
  '            canvas.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(() => {',
  '              canvas.renderAll(); loadingRef.current = false;',
  '            });',
  '          }',
  '        }',
  '        // Ctrl+C = Copy',
  "        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {",
  '          const obj = canvas.getActiveObject();',
  '          if (obj) {',
  '            obj.clone().then((cloned: any) => {',
  '              (window as any).__fabricClipboard = cloned;',
  '            });',
  '          }',
  '        }',
  '        // Ctrl+V = Paste',
  "        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {",
  '          e.preventDefault();',
  '          const clip = (window as any).__fabricClipboard;',
  '          if (clip) {',
  '            clip.clone().then((cloned: any) => {',
  '              cloned.set({ left: (cloned.left || 0) + 15, top: (cloned.top || 0) + 15 });',
  '              canvas.add(cloned);',
  '              canvas.setActiveObject(cloned);',
  '              canvas.renderAll();',
  '            });',
  '          }',
  '        }',
  '        // Ctrl+X = Cut',
  "        if ((e.ctrlKey || e.metaKey) && e.key === 'x') {",
  '          const obj = canvas.getActiveObject();',
  '          if (obj && obj.selectable !== false) {',
  '            obj.clone().then((cloned: any) => {',
  '              (window as any).__fabricClipboard = cloned;',
  '              canvas.remove(obj);',
  '              canvas.discardActiveObject();',
  '              canvas.renderAll();',
  '            });',
  '          }',
  '        }',
  '        // Ctrl+D = Duplicate',
  "        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {",
  '          e.preventDefault();',
  '          const obj = canvas.getActiveObject();',
  '          if (obj) {',
  '            obj.clone().then((cloned: any) => {',
  '              cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });',
  '              canvas.add(cloned);',
  '              canvas.setActiveObject(cloned);',
  '              canvas.renderAll();',
  '            });',
  '          }',
  '        }',
];

// Insert after line 967 (index 966) which is "        }" closing Ctrl+Z
lines.splice(967, 0, ...shortcuts);

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! All keyboard shortcuts inserted.');
