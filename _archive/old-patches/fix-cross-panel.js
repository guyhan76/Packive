const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
let changes = 0;

// === FIX 1: Cross-panel copy/paste ===
// Replace Ctrl+C block: save as JSON with blob conversion instead of object reference
const copyStart = lines.findIndex(l => l.includes("e.code === 'KeyC'") && l.includes('ctrlKey'));
if (copyStart >= 0) {
  let copyEnd = copyStart, bc = 0;
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
    `${I}    // Store both object ref (same panel) and JSON (cross panel)`,
    `${I}    (window as any).__clipboardObjects = obj;`,
    `${I}    const doJsonClip = async () => {`,
    `${I}      const convertImgToDataUrl = async (o: any): Promise<string|null> => {`,
    `${I}        if (!o._element) return null;`,
    `${I}        const tmp = document.createElement('canvas');`,
    `${I}        tmp.width = o._element.naturalWidth || o._element.width || o.width;`,
    `${I}        tmp.height = o._element.naturalHeight || o._element.height || o.height;`,
    `${I}        const ctx = tmp.getContext('2d');`,
    `${I}        if (!ctx) return null;`,
    `${I}        ctx.drawImage(o._element, 0, 0, tmp.width, tmp.height);`,
    `${I}        return tmp.toDataURL('image/png');`,
    `${I}      };`,
    `${I}      if (obj.type === 'activeselection') {`,
    `${I}        const children = (obj as any)._objects || [];`,
    `${I}        const grpLeft = obj.left || 0, grpTop = obj.top || 0;`,
    `${I}        const items: any[] = [];`,
    `${I}        for (const child of children) {`,
    `${I}          const absLeft = grpLeft + (child.left || 0);`,
    `${I}          const absTop = grpTop + (child.top || 0);`,
    `${I}          if (child.type === 'image') {`,
    `${I}            const du = await convertImgToDataUrl(child);`,
    `${I}            items.push({ type:'image', src: du, left: absLeft, top: absTop, scaleX: child.scaleX||1, scaleY: child.scaleY||1, angle: child.angle||0 });`,
    `${I}          } else {`,
    `${I}            const j = child.toJSON(['src']); j.left = absLeft; j.top = absTop; items.push(j);`,
    `${I}          }`,
    `${I}        }`,
    `${I}        (window as any).__clipboardJSON = { type:'activeselection', items };`,
    `${I}      } else if (obj.type === 'image') {`,
    `${I}        const du = await convertImgToDataUrl(obj);`,
    `${I}        (window as any).__clipboardJSON = { type:'image', src: du, left: obj.left||0, top: obj.top||0, scaleX: obj.scaleX||1, scaleY: obj.scaleY||1, angle: obj.angle||0 };`,
    `${I}      } else {`,
    `${I}        (window as any).__clipboardJSON = obj.toJSON(['src']);`,
    `${I}      }`,
    `${I}    };`,
    `${I}    doJsonClip();`,
    `${I}  }`,
    `${I}}`,
  ];
  lines.splice(copyStart, copyEnd - copyStart + 1, ...newLines);
  changes++;
  console.log('[copy] Added JSON clipboard for cross-panel');
}

// Replace Ctrl+V block: try object ref first, fall back to JSON
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
    `${I}  canvas.getObjects().forEach((o: any) => { if (o._isGuideLine) canvas.remove(o); });`,
    `${I}  const { FabricImage, ActiveSelection } = await import('fabric');`,
    `${I}  const srcObj = (window as any).__clipboardObjects;`,
    `${I}  const jsonClip = (window as any).__clipboardJSON;`,
    `${I}  // Helper: clone single object from live ref`,
    `${I}  const cloneLive = async (o: any, ox: number, oy: number): Promise<any> => {`,
    `${I}    if (o.type === 'image' && o._element) {`,
    `${I}      const tmp = document.createElement('canvas');`,
    `${I}      tmp.width = o.getScaledWidth(); tmp.height = o.getScaledHeight();`,
    `${I}      const ctx = tmp.getContext('2d');`,
    `${I}      if (ctx) { ctx.drawImage(o._element, 0, 0, tmp.width, tmp.height); }`,
    `${I}      const img = await FabricImage.fromURL(tmp.toDataURL('image/png'));`,
    `${I}      img.set({ left: ox, top: oy, scaleX: 1, scaleY: 1, angle: o.angle||0 }); return img;`,
    `${I}    }`,
    `${I}    const cl = await o.clone(); cl.set({ left: ox, top: oy }); return cl;`,
    `${I}  };`,
    `${I}  // Helper: create object from JSON data`,
    `${I}  const createFromJSON = async (item: any, ox: number, oy: number): Promise<any> => {`,
    `${I}    if (item.type === 'image' && item.src) {`,
    `${I}      const img = await FabricImage.fromURL(item.src);`,
    `${I}      img.set({ left: ox, top: oy, scaleX: item.scaleX||1, scaleY: item.scaleY||1, angle: item.angle||0 }); return img;`,
    `${I}    }`,
    `${I}    const objs = await (fabric.util as any).enlivenObjects([item]);`,
    `${I}    if (objs[0]) { objs[0].set({ left: ox, top: oy }); return objs[0]; }`,
    `${I}    return null;`,
    `${I}  };`,
    `${I}  // Try live object ref first (same panel)`,
    `${I}  let pasted = false;`,
    `${I}  if (srcObj && srcObj.canvas === canvas) {`,
    `${I}    try {`,
    `${I}      if (srcObj.type === 'activeselection') {`,
    `${I}        const children = (srcObj as any)._objects || [];`,
    `${I}        const gl = srcObj.left||0, gt = srcObj.top||0;`,
    `${I}        const newObjs: any[] = [];`,
    `${I}        for (const child of children) {`,
    `${I}          const c = await cloneLive(child, gl+(child.left||0)+15, gt+(child.top||0)+15);`,
    `${I}          if (c) { canvas.add(c); newObjs.push(c); }`,
    `${I}        }`,
    `${I}        if (newObjs.length>1) { canvas.discardActiveObject(); canvas.setActiveObject(new ActiveSelection(newObjs,{canvas})); }`,
    `${I}        else if (newObjs.length===1) canvas.setActiveObject(newObjs[0]);`,
    `${I}      } else {`,
    `${I}        const c = await cloneLive(srcObj, (srcObj.left||0)+15, (srcObj.top||0)+15);`,
    `${I}        if (c) { canvas.add(c); canvas.setActiveObject(c); }`,
    `${I}      }`,
    `${I}      pasted = true;`,
    `${I}    } catch { pasted = false; }`,
    `${I}  }`,
    `${I}  // Fall back to JSON clipboard (cross panel)`,
    `${I}  if (!pasted && jsonClip) {`,
    `${I}    try {`,
    `${I}      const fabric = await import('fabric');`,
    `${I}      if (jsonClip.type === 'activeselection' && jsonClip.items) {`,
    `${I}        const newObjs: any[] = [];`,
    `${I}        for (const item of jsonClip.items) {`,
    `${I}          const o = await createFromJSON(item, (item.left||0)+15, (item.top||0)+15);`,
    `${I}          if (o) { canvas.add(o); newObjs.push(o); }`,
    `${I}        }`,
    `${I}        if (newObjs.length>1) { canvas.discardActiveObject(); canvas.setActiveObject(new ActiveSelection(newObjs,{canvas})); }`,
    `${I}        else if (newObjs.length===1) canvas.setActiveObject(newObjs[0]);`,
    `${I}      } else {`,
    `${I}        const o = await createFromJSON(jsonClip, (jsonClip.left||0)+15, (jsonClip.top||0)+15);`,
    `${I}        if (o) { canvas.add(o); canvas.setActiveObject(o); }`,
    `${I}      }`,
    `${I}    } catch {}`,
    `${I}  }`,
    `${I}  canvas.renderAll(); refreshLayers();`,
    `${I}}`,
  ];
  lines.splice(pasteStart, pasteEnd - pasteStart + 1, ...newLines);
  changes++;
  console.log('[paste] Added cross-panel JSON fallback');
}

// === FIX 2: Template background preserved on save/restore ===
// Add 'selectable','evented' to all toJSON calls that don't have them
const toJsonPattern = /\.toJSON\(\[([^\]]+)\]\)/g;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/\.toJSON\(\[([^\]]+)\]\)/);
  if (match && !match[1].includes("'selectable'")) {
    lines[i] = line.replace(match[0], match[0].replace('[', "['selectable','evented',"));
    changes++;
    console.log('[toJSON] Added selectable/evented at line ' + (i+1));
  }
}

// Also ensure loadFromJSON restores selectable/evented for bg images
// Find the line after loadFromJSON that re-locks objects
const restoreLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('loadFromJSON') && !lines[i].trim().startsWith('//')) {
    // Check if next few lines already have the re-lock logic
    let hasRelock = false;
    for (let j = i+1; j < Math.min(i+10, lines.length); j++) {
      if (lines[j].includes('_isBgImage') && lines[j].includes('selectable')) { hasRelock = true; break; }
    }
    if (!hasRelock) restoreLines.push(i);
  }
}
// We'll add re-lock after the main loadFromJSON .then() blocks
// This is handled by the existing code at line ~2266, so just ensure _isBgImage is included

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Total changes: ' + changes);
