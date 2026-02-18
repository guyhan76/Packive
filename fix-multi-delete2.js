const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// 1. Fix Delete/Backspace (8-space indent)
const oldDel1 = `        if (e.key === 'Delete' || e.key === 'Backspace') {
          const obj = canvas.getActiveObject();
          if (obj && obj.selectable !== false) {
            canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll();
          }
        }`;

const newDel1 = `        if (e.key === 'Delete' || e.key === 'Backspace') {
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

if (code.includes(oldDel1)) {
  code = code.replace(oldDel1, newDel1);
  changes++;
  console.log('[delete] Fixed Delete/Backspace for activeselection');
}

// 2. Fix del callback (2-space indent)
const oldDel2 = `  const del = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    const obj = c.getActiveObject();
    if (obj && obj.selectable !== false) { c.remove(obj); c.discardActiveObject(); c.renderAll(); }
  }, []);`;

const newDel2 = `  const del = useCallback(() => {
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

if (code.includes(oldDel2)) {
  code = code.replace(oldDel2, newDel2);
  changes++;
  console.log('[del] Fixed del callback for activeselection');
}

fs.writeFileSync(file, code, 'utf8');
console.log('Total changes: ' + changes);
