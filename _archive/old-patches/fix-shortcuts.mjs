import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');
let done = 0;

// Find the closing } of Ctrl+Z block, then }; of keyHandler
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("e.key === 'z'") && lines[i].includes('e.ctrlKey')) {
    // Find the closing } of this if block
    let braceCount = 0;
    let closeIdx = -1;
    for (let j = i; j < i + 15; j++) {
      const opens = (lines[j].match(/{/g) || []).length;
      const closes = (lines[j].match(/}/g) || []).length;
      braceCount += opens - closes;
      if (braceCount === 0 && j > i) { closeIdx = j; break; }
    }
    if (closeIdx > -1) {
      // Find the }; that closes keyHandler
      let handlerClose = -1;
      for (let j = closeIdx + 1; j < closeIdx + 5; j++) {
        if (lines[j].trim() === '};') { handlerClose = j; break; }
      }
      if (handlerClose > -1) {
        const shortcuts = [
          '        // Ctrl+Y / Ctrl+Shift+Z = Redo',
          "        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyY' || (e.shiftKey && e.code === 'KeyZ'))) {",
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
          "        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {",
          '          e.preventDefault();',
          '          const obj = canvas.getActiveObject();',
          '          if (obj) { obj.clone().then((cl: any) => { (window as any).__clipboard = cl; }); }',
          '        }',
          '        // Ctrl+V = Paste',
          "        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV') {",
          '          e.preventDefault();',
          '          const cl = (window as any).__clipboard;',
          '          if (cl) { cl.clone().then((pasted: any) => { pasted.set({ left: (pasted.left||0)+15, top: (pasted.top||0)+15 }); canvas.add(pasted); canvas.setActiveObject(pasted); canvas.renderAll(); }); }',
          '        }',
          '        // Ctrl+X = Cut',
          "        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyX') {",
          '          e.preventDefault();',
          '          const obj = canvas.getActiveObject();',
          '          if (obj) { obj.clone().then((cl: any) => { (window as any).__clipboard = cl; }); canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll(); }',
          '        }',
          '        // Ctrl+D = Duplicate',
          "        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyD') {",
          '          e.preventDefault();',
          '          const obj = canvas.getActiveObject();',
          '          if (obj) { obj.clone().then((cl: any) => { cl.set({ left: (cl.left||0)+20, top: (cl.top||0)+20 }); canvas.add(cl); canvas.setActiveObject(cl); canvas.renderAll(); }); }',
          '        }',
        ];
        lines.splice(closeIdx + 1, 0, ...shortcuts);
        done++;
        console.log('Inserted shortcuts after line ' + (closeIdx + 1));
      }
    }
    break;
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', lines.join('\n'), 'utf8');
console.log('Done! Changes: ' + done);
