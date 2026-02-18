const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// 1. Fix Delete/Backspace key handler (line ~1423-1428)
const oldDelete = `if (e.key === 'Delete' || e.key === 'Backspace') {
          const obj = canvas.getActiveObject();
          if (obj && obj.selectable !== false) {
            canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll();
          }
        }`;

const newDelete = `if (e.key === 'Delete' || e.key === 'Backspace') {
          const obj = canvas.getActiveObject();
          if (obj && obj.selectable !== false) {
            if (obj.type === 'activeselection') {
              const objs = (obj as any)._objects ? [...(obj as any)._objects] : [];
              canvas.discardActiveObject();
              objs.forEach((o: any) => { if (o.selectable !== false) canvas.remove(o); });
            } else {
              canvas.remove(obj); canvas.discardActiveObject();
            }
            canvas.renderAll(); refreshLayers();
          }
        }`;

if (code.includes(oldDelete)) {
  code = code.replace(oldDelete, newDelete);
  changes++;
  console.log('[delete] Fixed Delete/Backspace for activeselection');
}

// 2. Fix del callback (line ~2236-2240)
const oldDel = `const del = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    const obj = c.getActiveObject();
    if (obj && obj.selectable !== false) { c.remove(obj); c.discardActiveObject(); c.renderAll(); }
  }, []);`;

const newDel = `const del = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    const obj = c.getActiveObject();
    if (obj && obj.selectable !== false) {
      if (obj.type === 'activeselection') {
        const objs = (obj as any)._objects ? [...(obj as any)._objects] : [];
        c.discardActiveObject();
        objs.forEach((o: any) => { if (o.selectable !== false) c.remove(o); });
      } else {
        c.remove(obj); c.discardActiveObject();
      }
      c.renderAll(); refreshLayers();
    }
  }, []);`;

if (code.includes(oldDel)) {
  code = code.replace(oldDel, newDel);
  changes++;
  console.log('[del] Fixed del callback for activeselection');
}

// 3. Fix context menu delete (line ~3924)
const oldCtx = `c.remove(ctxMenu.target); c.discardActiveObject(); c.renderAll(); refreshLayers();`;

const newCtx = `if (ctxMenu.target.type === 'activeselection') {
                      const objs = (ctxMenu.target as any)._objects ? [...(ctxMenu.target as any)._objects] : [];
                      c.discardActiveObject();
                      objs.forEach((o: any) => { if (o.selectable !== false) c.remove(o); });
                    } else {
                      c.remove(ctxMenu.target); c.discardActiveObject();
                    }
                    c.renderAll(); refreshLayers();`;

if (code.includes(oldCtx)) {
  code = code.replace(oldCtx, newCtx);
  changes++;
  console.log('[ctx] Fixed context menu delete for activeselection');
}

fs.writeFileSync(file, code, 'utf8');
console.log('Total changes: ' + changes);
