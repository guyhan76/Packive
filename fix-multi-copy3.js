const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find Ctrl+C block
const copyStart = lines.findIndex(l => l.includes("e.code === 'KeyC'") && l.includes('ctrlKey'));
if (copyStart >= 0) {
  let copyEnd = copyStart;
  let bc = 0;
  for (let i = copyStart; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch==='{') bc++; if (ch==='}') bc--; }
    if (bc === 0 && i > copyStart) { copyEnd = i; break; }
  }
  const I = '        ';
  const newLines = [
    `${I}if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {`,
    `${I}  e.preventDefault();`,
    `${I}  const obj = canvas.getActiveObject();`,
    `${I}  if (obj) {`,
    `${I}    // Store fabric objects directly for clone-based paste`,
    `${I}    (window as any).__clipboardObjects = obj;`,
    `${I}  }`,
    `${I}}`,
  ];
  lines.splice(copyStart, copyEnd - copyStart + 1, ...newLines);
  changes++;
  console.log('[copy] Replaced with object-reference copy');
}

// Find Ctrl+V block
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
    `${I}    const { FabricImage, ActiveSelection } = await import('fabric');`,
    `${I}    const cloneOne = async (o: any): Promise<any> => {`,
    `${I}      if (o.type === 'image') {`,
    `${I}        const tmpC = document.createElement('canvas');`,
    `${I}        tmpC.width = o.getScaledWidth(); tmpC.height = o.getScaledHeight();`,
    `${I}        const ctx = tmpC.getContext('2d');`,
    `${I}        if (ctx && o._element) {`,
    `${I}          ctx.drawImage(o._element, 0, 0, tmpC.width, tmpC.height);`,
    `${I}          const url = tmpC.toDataURL('image/png');`,
    `${I}          const img = await FabricImage.fromURL(url);`,
    `${I}          img.set({ left: (o.left||0)+15, top: (o.top||0)+15, scaleX: 1, scaleY: 1, angle: o.angle||0 });`,
    `${I}          return img;`,
    `${I}        }`,
    `${I}        return null;`,
    `${I}      } else {`,
    `${I}        const cl = await o.clone();`,
    `${I}        cl.set({ left: (cl.left||0)+15, top: (cl.top||0)+15 });`,
    `${I}        return cl;`,
    `${I}      }`,
    `${I}    };`,
    `${I}    if (srcObj.type === 'activeselection') {`,
    `${I}      const children = (srcObj as any)._objects || [];`,
    `${I}      const newObjs: any[] = [];`,
    `${I}      for (const child of children) {`,
    `${I}        const cloned = await cloneOne(child);`,
    `${I}        if (cloned) { canvas.add(cloned); newObjs.push(cloned); }`,
    `${I}      }`,
    `${I}      if (newObjs.length > 1) {`,
    `${I}        canvas.discardActiveObject();`,
    `${I}        const sel = new ActiveSelection(newObjs, { canvas });`,
    `${I}        canvas.setActiveObject(sel);`,
    `${I}      } else if (newObjs.length === 1) { canvas.setActiveObject(newObjs[0]); }`,
    `${I}    } else {`,
    `${I}      const cloned = await cloneOne(srcObj);`,
    `${I}      if (cloned) { canvas.add(cloned); canvas.setActiveObject(cloned); }`,
    `${I}    }`,
    `${I}    canvas.renderAll(); refreshLayers();`,
    `${I}  }`,
    `${I}}`,
  ];
  lines.splice(pasteStart, pasteEnd - pasteStart + 1, ...newLines);
  changes++;
  console.log('[paste] Replaced with clone-based paste');
}

// Find Ctrl+X block
const cutStart = lines.findIndex(l => l.includes("e.code === 'KeyX'") && l.includes('ctrlKey'));
if (cutStart >= 0) {
  let cutEnd = cutStart;
  let bc = 0;
  for (let i = cutStart; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch==='{') bc++; if (ch==='}') bc--; }
    if (bc === 0 && i > cutStart) { cutEnd = i; break; }
  }
  const I = '        ';
  const newLines = [
    `${I}if ((e.ctrlKey || e.metaKey) && e.code === 'KeyX') {`,
    `${I}  e.preventDefault();`,
    `${I}  const obj = canvas.getActiveObject();`,
    `${I}  if (obj) {`,
    `${I}    (window as any).__clipboardObjects = obj;`,
    `${I}    if (obj.type === 'activeselection') {`,
    `${I}      const objs = (obj as any)._objects ? [...(obj as any)._objects] : [];`,
    `${I}      canvas.discardActiveObject(); objs.forEach((o: any) => canvas.remove(o));`,
    `${I}    } else { canvas.remove(obj); canvas.discardActiveObject(); }`,
    `${I}    canvas.renderAll(); refreshLayers();`,
    `${I}  }`,
    `${I}}`,
  ];
  lines.splice(cutStart, cutEnd - cutStart + 1, ...newLines);
  changes++;
  console.log('[cut] Replaced with object-reference cut');
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
