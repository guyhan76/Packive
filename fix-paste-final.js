const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Find Ctrl+V block
const pasteStart = lines.findIndex(l => l.includes("e.code === 'KeyV'") && l.includes('ctrlKey') && !l.includes('ClipboardEvent'));
if (pasteStart >= 0) {
  let pasteEnd = pasteStart, bc = 0;
  for (let i = pasteStart; i < lines.length; i++) {
    for (const ch of lines[i]) { if (ch==='{') bc++; if (ch==='}') bc--; }
    if (bc === 0 && i > pasteStart) { pasteEnd = i; break; }
  }
  const I = '        ';
  const newLines = [
    `${I}if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV') {`,
    `${I}  e.preventDefault();`,
    `${I}  // Clear guide lines`,
    `${I}  canvas.getObjects().forEach((o: any) => { if (o._isGuideLine) canvas.remove(o); });`,
    `${I}  const F = await import('fabric');`,
    `${I}  const jsonClip = (window as any).__clipboardJSON;`,
    `${I}  if (!jsonClip) return;`,
    `${I}  const makeObj = async (item: any, ox: number, oy: number): Promise<any> => {`,
    `${I}    if (item.type === 'image' && item.src) {`,
    `${I}      try {`,
    `${I}        const img = await F.FabricImage.fromURL(item.src);`,
    `${I}        img.set({ left: ox, top: oy, scaleX: item.scaleX||1, scaleY: item.scaleY||1, angle: item.angle||0 });`,
    `${I}        return img;`,
    `${I}      } catch { return null; }`,
    `${I}    }`,
    `${I}    try {`,
    `${I}      const objs = await (F.util as any).enlivenObjects([item]);`,
    `${I}      if (objs[0]) { objs[0].set({ left: ox, top: oy }); return objs[0]; }`,
    `${I}    } catch {}`,
    `${I}    return null;`,
    `${I}  };`,
    `${I}  if (jsonClip.type === 'activeselection' && jsonClip.items) {`,
    `${I}    const newObjs: any[] = [];`,
    `${I}    for (const item of jsonClip.items) {`,
    `${I}      const o = await makeObj(item, (item.left||0)+15, (item.top||0)+15);`,
    `${I}      if (o) { canvas.add(o); newObjs.push(o); }`,
    `${I}    }`,
    `${I}    if (newObjs.length > 1) {`,
    `${I}      canvas.discardActiveObject();`,
    `${I}      canvas.setActiveObject(new F.ActiveSelection(newObjs, { canvas }));`,
    `${I}    } else if (newObjs.length === 1) { canvas.setActiveObject(newObjs[0]); }`,
    `${I}  } else {`,
    `${I}    const o = await makeObj(jsonClip, (jsonClip.left||0)+15, (jsonClip.top||0)+15);`,
    `${I}    if (o) { canvas.add(o); canvas.setActiveObject(o); }`,
    `${I}  }`,
    `${I}  canvas.renderAll(); refreshLayers();`,
    `${I}}`,
  ];
  lines.splice(pasteStart, pasteEnd - pasteStart + 1, ...newLines);
  changes++;
  console.log('[paste] Simplified to JSON-only approach');
}

// Also fix Ctrl+X to save JSON clipboard too
const cutStart = lines.findIndex(l => l.includes("e.code === 'KeyX'") && l.includes('ctrlKey'));
if (cutStart >= 0) {
  let cutEnd = cutStart, bc = 0;
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
    `${I}    // Save to JSON clipboard (reuse copy logic)`,
    `${I}    const convertImg = async (o: any): Promise<string|null> => {`,
    `${I}      if (!o._element) return null;`,
    `${I}      const tmp = document.createElement('canvas');`,
    `${I}      tmp.width = o._element.naturalWidth || o._element.width || o.width;`,
    `${I}      tmp.height = o._element.naturalHeight || o._element.height || o.height;`,
    `${I}      const ctx = tmp.getContext('2d'); if (!ctx) return null;`,
    `${I}      ctx.drawImage(o._element, 0, 0, tmp.width, tmp.height);`,
    `${I}      return tmp.toDataURL('image/png');`,
    `${I}    };`,
    `${I}    if (obj.type === 'activeselection') {`,
    `${I}      const children = (obj as any)._objects || [];`,
    `${I}      const gl = obj.left||0, gt = obj.top||0;`,
    `${I}      const items: any[] = [];`,
    `${I}      for (const child of children) {`,
    `${I}        const al = gl+(child.left||0), at = gt+(child.top||0);`,
    `${I}        if (child.type === 'image') {`,
    `${I}          const du = await convertImg(child);`,
    `${I}          items.push({type:'image',src:du,left:al,top:at,scaleX:child.scaleX||1,scaleY:child.scaleY||1,angle:child.angle||0});`,
    `${I}        } else {`,
    `${I}          const j = child.toJSON(['src']); j.left=al; j.top=at; items.push(j);`,
    `${I}        }`,
    `${I}      }`,
    `${I}      (window as any).__clipboardJSON = {type:'activeselection',items};`,
    `${I}      canvas.discardActiveObject();`,
    `${I}      children.forEach((o: any) => canvas.remove(o));`,
    `${I}    } else {`,
    `${I}      if (obj.type === 'image') {`,
    `${I}        const du = await convertImg(obj);`,
    `${I}        (window as any).__clipboardJSON = {type:'image',src:du,left:obj.left||0,top:obj.top||0,scaleX:obj.scaleX||1,scaleY:obj.scaleY||1,angle:obj.angle||0};`,
    `${I}      } else {`,
    `${I}        (window as any).__clipboardJSON = obj.toJSON(['src']);`,
    `${I}      }`,
    `${I}      canvas.remove(obj); canvas.discardActiveObject();`,
    `${I}    }`,
    `${I}    canvas.renderAll(); refreshLayers();`,
    `${I}  }`,
    `${I}}`,
  ];
  lines.splice(cutStart, cutEnd - cutStart + 1, ...newLines);
  changes++;
  console.log('[cut] Added JSON clipboard to cut');
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
