const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// Replace lines 1457-1477 (Ctrl+C) - index 1456-1476
const copyStart = lines.findIndex(l => l.includes("e.code === 'KeyC'") && l.includes('ctrlKey'));
if (copyStart >= 0) {
  // Find the closing of this block
  let copyEnd = copyStart;
  let braceCount = 0;
  for (let i = copyStart; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }
    if (braceCount === 0 && i > copyStart) { copyEnd = i; break; }
  }
  
  const indent = '        ';
  const newCopy = [
    `${indent}if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {`,
    `${indent}  e.preventDefault();`,
    `${indent}  const obj = canvas.getActiveObject();`,
    `${indent}  if (obj) {`,
    `${indent}    const doClipboard = async () => {`,
    `${indent}      let jsonData = obj.toJSON(['src']);`,
    `${indent}      const convertBlobs = async (d: any): Promise<any> => {`,
    `${indent}        if (d.type === 'image' && d.src && d.src.startsWith('blob:')) {`,
    `${indent}          try {`,
    `${indent}            const resp = await fetch(d.src);`,
    `${indent}            const b = await resp.blob();`,
    `${indent}            const dataUrl: string = await new Promise(res => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(b); });`,
    `${indent}            return { ...d, src: dataUrl };`,
    `${indent}          } catch { return d; }`,
    `${indent}        }`,
    `${indent}        if ((d.type === 'activeselection' || d.type === 'group') && d.objects) {`,
    `${indent}          const converted = await Promise.all(d.objects.map((o: any) => convertBlobs(o)));`,
    `${indent}          return { ...d, objects: converted };`,
    `${indent}        }`,
    `${indent}        return d;`,
    `${indent}      };`,
    `${indent}      jsonData = await convertBlobs(jsonData);`,
    `${indent}      (window as any).__clipboardJSON = jsonData;`,
    `${indent}      try { localStorage.setItem('__packive_clipboard', JSON.stringify(jsonData)); } catch {}`,
    `${indent}    };`,
    `${indent}    doClipboard();`,
    `${indent}  }`,
    `${indent}}`,
  ];
  lines.splice(copyStart, copyEnd - copyStart + 1, ...newCopy);
  changes++;
  console.log('[copy] Fixed Ctrl+C for activeselection (lines ' + (copyStart+1) + '-' + (copyEnd+1) + ')');
}

// Find Ctrl+V block again (line positions may have shifted)
const pasteStart = lines.findIndex(l => l.includes("e.code === 'KeyV'") && l.includes('ctrlKey'));
if (pasteStart >= 0) {
  let pasteEnd = pasteStart;
  let braceCount = 0;
  for (let i = pasteStart; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }
    if (braceCount === 0 && i > pasteStart) { pasteEnd = i; break; }
  }

  const indent = '        ';
  const newPaste = [
    `${indent}if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV') {`,
    `${indent}  e.preventDefault();`,
    `${indent}  const jsonData = (window as any).__clipboardJSON || null;`,
    `${indent}  const lsData = (() => { try { const s = localStorage.getItem('__packive_clipboard'); return s ? JSON.parse(s) : null; } catch { return null; } })();`,
    `${indent}  const pasteData = jsonData || lsData;`,
    `${indent}  if (pasteData) {`,
    `${indent}    import('fabric').then(async (F) => {`,
    `${indent}      const doPaste = async (data: any, ox = 15, oy = 15) => {`,
    `${indent}        if (data.type === 'activeselection' && data.objects) {`,
    `${indent}          const newObjs: any[] = [];`,
    `${indent}          for (const child of data.objects) {`,
    `${indent}            if (child.type === 'image' && child.src) {`,
    `${indent}              try { const img = await F.FabricImage.fromURL(child.src); img.set({ left:(child.left||0)+ox, top:(child.top||0)+oy, scaleX:child.scaleX||1, scaleY:child.scaleY||1, angle:child.angle||0 }); canvas.add(img); newObjs.push(img); } catch {}`,
    `${indent}            } else {`,
    `${indent}              try { const objs = await (F.util as any).enlivenObjects([child]); if(objs[0]){objs[0].set({left:(objs[0].left||0)+ox,top:(objs[0].top||0)+oy});canvas.add(objs[0]);newObjs.push(objs[0]);} } catch {}`,
    `${indent}            }`,
    `${indent}          }`,
    `${indent}          if (newObjs.length > 1) { canvas.discardActiveObject(); const sel = new F.ActiveSelection(newObjs, { canvas }); canvas.setActiveObject(sel); }`,
    `${indent}          else if (newObjs.length === 1) { canvas.setActiveObject(newObjs[0]); }`,
    `${indent}        } else if (data.type === 'image' && data.src) {`,
    `${indent}          try { const img = await F.FabricImage.fromURL(data.src); img.set({ left:(data.left||0)+ox, top:(data.top||0)+oy, scaleX:data.scaleX||1, scaleY:data.scaleY||1, angle:data.angle||0 }); canvas.add(img); canvas.setActiveObject(img); } catch {}`,
    `${indent}        } else {`,
    `${indent}          try { const objs = await (F.util as any).enlivenObjects([data]); if(objs[0]){objs[0].set({left:(objs[0].left||0)+ox,top:(objs[0].top||0)+oy});canvas.add(objs[0]);canvas.setActiveObject(objs[0]);} } catch {}`,
    `${indent}        }`,
    `${indent}        canvas.renderAll(); refreshLayers();`,
    `${indent}      };`,
    `${indent}      doPaste(pasteData);`,
    `${indent}    });`,
    `${indent}  }`,
    `${indent}}`,
  ];
  lines.splice(pasteStart, pasteEnd - pasteStart + 1, ...newPaste);
  changes++;
  console.log('[paste] Fixed Ctrl+V for activeselection (lines ' + (pasteStart+1) + '-' + (pasteEnd+1) + ')');
}

// Find Ctrl+X block
const cutStart = lines.findIndex(l => l.includes("e.code === 'KeyX'") && l.includes('ctrlKey'));
if (cutStart >= 0) {
  let cutEnd = cutStart;
  let braceCount = 0;
  for (let i = cutStart; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') braceCount++;
      if (ch === '}') braceCount--;
    }
    if (braceCount === 0 && i > cutStart) { cutEnd = i; break; }
  }

  const indent = '        ';
  const newCut = [
    `${indent}if ((e.ctrlKey || e.metaKey) && e.code === 'KeyX') {`,
    `${indent}  e.preventDefault();`,
    `${indent}  const obj = canvas.getActiveObject();`,
    `${indent}  if (obj) {`,
    `${indent}    const doCut = async () => {`,
    `${indent}      let jsonData = obj.toJSON(['src']);`,
    `${indent}      const convertBlobs = async (d: any): Promise<any> => {`,
    `${indent}        if (d.type === 'image' && d.src && d.src.startsWith('blob:')) {`,
    `${indent}          try { const resp = await fetch(d.src); const b = await resp.blob(); const dataUrl: string = await new Promise(res => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(b); }); return { ...d, src: dataUrl }; } catch { return d; }`,
    `${indent}        }`,
    `${indent}        if ((d.type === 'activeselection' || d.type === 'group') && d.objects) {`,
    `${indent}          const converted = await Promise.all(d.objects.map((o: any) => convertBlobs(o)));`,
    `${indent}          return { ...d, objects: converted };`,
    `${indent}        }`,
    `${indent}        return d;`,
    `${indent}      };`,
    `${indent}      jsonData = await convertBlobs(jsonData);`,
    `${indent}      (window as any).__clipboardJSON = jsonData;`,
    `${indent}      try { localStorage.setItem('__packive_clipboard', JSON.stringify(jsonData)); } catch {}`,
    `${indent}      if (obj.type === 'activeselection') {`,
    `${indent}        const objs = (obj as any)._objects ? [...(obj as any)._objects] : [];`,
    `${indent}        canvas.discardActiveObject(); objs.forEach((o: any) => canvas.remove(o));`,
    `${indent}      } else { canvas.remove(obj); canvas.discardActiveObject(); }`,
    `${indent}      canvas.renderAll(); refreshLayers();`,
    `${indent}    };`,
    `${indent}    doCut();`,
    `${indent}  }`,
    `${indent}}`,
  ];
  lines.splice(cutStart, cutEnd - cutStart + 1, ...newCut);
  changes++;
  console.log('[cut] Fixed Ctrl+X for activeselection (lines ' + (cutStart+1) + '-' + (cutEnd+1) + ')');
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
