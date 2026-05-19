const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find the paste block (Ctrl+V with clone-based paste)
const pasteStart = lines.findIndex(l => l.includes("e.code === 'KeyV'") && l.includes('ctrlKey') && !l.includes('ClipboardEvent'));
if (pasteStart >= 0) {
  let pasteEnd = pasteStart;
  let bc = 0;
  for (let i = pasteStart; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch==='{') bc++; if (ch==='}') bc--; }
    if (bc === 0 && i > pasteStart) { pasteEnd = i; break; }
  }
  const I = '        ';
  const newLines = [
    `${I}if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV') {`,
    `${I}  e.preventDefault();`,
    `${I}  const srcObj = (window as any).__clipboardObjects;`,
    `${I}  if (srcObj && canvas) {`,
    `${I}    // Clear any lingering guide lines`,
    `${I}    canvas.getObjects().forEach((o: any) => { if (o._isGuideLine) canvas.remove(o); });`,
    `${I}    const { FabricImage, ActiveSelection } = await import('fabric');`,
    `${I}    const cloneOne = async (o: any, ox: number, oy: number): Promise<any> => {`,
    `${I}      if (o.type === 'image') {`,
    `${I}        const tmpC = document.createElement('canvas');`,
    `${I}        tmpC.width = o.getScaledWidth(); tmpC.height = o.getScaledHeight();`,
    `${I}        const ctx = tmpC.getContext('2d');`,
    `${I}        if (ctx && o._element) {`,
    `${I}          ctx.drawImage(o._element, 0, 0, tmpC.width, tmpC.height);`,
    `${I}          const url = tmpC.toDataURL('image/png');`,
    `${I}          const img = await FabricImage.fromURL(url);`,
    `${I}          img.set({ left: ox, top: oy, scaleX: 1, scaleY: 1, angle: o.angle||0 });`,
    `${I}          return img;`,
    `${I}        }`,
    `${I}        return null;`,
    `${I}      } else {`,
    `${I}        const cl = await o.clone();`,
    `${I}        cl.set({ left: ox, top: oy });`,
    `${I}        return cl;`,
    `${I}      }`,
    `${I}    };`,
    `${I}    if (srcObj.type === 'activeselection') {`,
    `${I}      const children = (srcObj as any)._objects || [];`,
    `${I}      const grpLeft = srcObj.left || 0;`,
    `${I}      const grpTop = srcObj.top || 0;`,
    `${I}      const newObjs: any[] = [];`,
    `${I}      for (const child of children) {`,
    `${I}        // Convert relative coords to absolute: group center + child offset + paste offset`,
    `${I}        const absLeft = grpLeft + (child.left || 0) + 15;`,
    `${I}        const absTop = grpTop + (child.top || 0) + 15;`,
    `${I}        const cloned = await cloneOne(child, absLeft, absTop);`,
    `${I}        if (cloned) { canvas.add(cloned); newObjs.push(cloned); }`,
    `${I}      }`,
    `${I}      if (newObjs.length > 1) {`,
    `${I}        canvas.discardActiveObject();`,
    `${I}        const sel = new ActiveSelection(newObjs, { canvas });`,
    `${I}        canvas.setActiveObject(sel);`,
    `${I}      } else if (newObjs.length === 1) { canvas.setActiveObject(newObjs[0]); }`,
    `${I}    } else {`,
    `${I}      const cloned = await cloneOne(srcObj, (srcObj.left||0)+15, (srcObj.top||0)+15);`,
    `${I}      if (cloned) { canvas.add(cloned); canvas.setActiveObject(cloned); }`,
    `${I}    }`,
    `${I}    canvas.renderAll(); refreshLayers();`,
    `${I}  }`,
    `${I}}`,
  ];
  lines.splice(pasteStart, pasteEnd - pasteStart + 1, ...newLines);
  changes++;
  console.log('[paste] Fixed position + guide line cleanup');
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
