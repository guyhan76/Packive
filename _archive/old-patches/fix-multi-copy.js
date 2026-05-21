const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let code = fs.readFileSync(file, 'utf8');
let changes = 0;

// Fix Ctrl+C: handle activeselection with blob image conversion
const oldCopy = `        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {
          e.preventDefault();
          const obj = canvas.getActiveObject();
          if (obj) {
            const doClipboard = async () => {
              let jsonData = obj.toJSON(['src']);
              // Convert blob URLs to data URLs for images
              if (jsonData.type === 'image' && jsonData.src && jsonData.src.startsWith('blob:')) {
                try {
                  const resp = await fetch(jsonData.src);
                  const blob = await resp.blob();
                  const dataUrl = await new Promise(resolve => { const r = new FileReader(); r.onloadend = () => resolve(r.result); r.readAsDataURL(blob); });
                  jsonData = { ...jsonData, src: dataUrl };
                } catch {}
              }
              (window as any).__clipboardJSON = jsonData;
              try { localStorage.setItem('__packive_clipboard', JSON.stringify(jsonData)); } catch {}
            };
            doClipboard();
          }
        }`;

const newCopy = `        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC') {
          e.preventDefault();
          const obj = canvas.getActiveObject();
          if (obj) {
            const doClipboard = async () => {
              let jsonData = obj.toJSON(['src']);
              // Convert blob URLs to data URLs for all images (single & multi-select)
              const convertBlobsInObject = async (d: any): Promise<any> => {
                if (d.type === 'image' && d.src && d.src.startsWith('blob:')) {
                  try {
                    const resp = await fetch(d.src);
                    const blob = await resp.blob();
                    const dataUrl: string = await new Promise(resolve => { const r = new FileReader(); r.onloadend = () => resolve(r.result as string); r.readAsDataURL(blob); });
                    return { ...d, src: dataUrl };
                  } catch { return d; }
                }
                if (d.type === 'activeselection' && d.objects) {
                  const converted = await Promise.all(d.objects.map((o: any) => convertBlobsInObject(o)));
                  return { ...d, objects: converted };
                }
                if (d.type === 'group' && d.objects) {
                  const converted = await Promise.all(d.objects.map((o: any) => convertBlobsInObject(o)));
                  return { ...d, objects: converted };
                }
                return d;
              };
              jsonData = await convertBlobsInObject(jsonData);
              (window as any).__clipboardJSON = jsonData;
              try { localStorage.setItem('__packive_clipboard', JSON.stringify(jsonData)); } catch {}
            };
            doClipboard();
          }
        }`;

if (code.includes(oldCopy)) {
  code = code.replace(oldCopy, newCopy);
  changes++;
  console.log('[copy] Fixed Ctrl+C for activeselection blob images');
}

// Fix Ctrl+V: handle activeselection paste
const oldPaste = `          if (pasteData) {
            import('fabric').then(F => {
              if (pasteData.type === 'image' && pasteData.src) {
                F.FabricImage.fromURL(pasteData.src).then((img: any) => {
                  img.set({ left: (pasteData.left||0)+15, top: (pasteData.top||0)+15, scaleX: pasteData.scaleX||1, scaleY: pasteData.scaleY||1, angle: pasteData.angle||0 });
                  canvas.add(img); canvas.setActiveObject(img); canvas.renderAll(); refreshLayers();
                }).catch(() => {});
              } else {
                (F.util as any).enlivenObjects([pasteData]).then((objs: any[]) => {
                  if (objs[0]) { const o = objs[0]; o.set({ left: (o.left||0)+15, top: (o.top||0)+15 }); canvas.add(o); canvas.setActiveObject(o); canvas.renderAll(); refreshLayers(); }
                });
              }
            });`;

const newPaste = `          if (pasteData) {
            import('fabric').then(async (F) => {
              const pasteObjects = async (data: any, offsetX = 15, offsetY = 15) => {
                if (data.type === 'activeselection' && data.objects) {
                  const newObjs: any[] = [];
                  for (const child of data.objects) {
                    if (child.type === 'image' && child.src) {
                      try {
                        const img = await F.FabricImage.fromURL(child.src);
                        img.set({ left: (child.left||0)+offsetX, top: (child.top||0)+offsetY, scaleX: child.scaleX||1, scaleY: child.scaleY||1, angle: child.angle||0 });
                        canvas.add(img);
                        newObjs.push(img);
                      } catch {}
                    } else {
                      try {
                        const objs = await (F.util as any).enlivenObjects([child]);
                        if (objs[0]) { objs[0].set({ left: (objs[0].left||0)+offsetX, top: (objs[0].top||0)+offsetY }); canvas.add(objs[0]); newObjs.push(objs[0]); }
                      } catch {}
                    }
                  }
                  if (newObjs.length > 1) {
                    canvas.discardActiveObject();
                    const sel = new F.ActiveSelection(newObjs, { canvas });
                    canvas.setActiveObject(sel);
                  } else if (newObjs.length === 1) {
                    canvas.setActiveObject(newObjs[0]);
                  }
                } else if (data.type === 'image' && data.src) {
                  try {
                    const img = await F.FabricImage.fromURL(data.src);
                    img.set({ left: (data.left||0)+offsetX, top: (data.top||0)+offsetY, scaleX: data.scaleX||1, scaleY: data.scaleY||1, angle: data.angle||0 });
                    canvas.add(img); canvas.setActiveObject(img);
                  } catch {}
                } else {
                  try {
                    const objs = await (F.util as any).enlivenObjects([data]);
                    if (objs[0]) { objs[0].set({ left: (objs[0].left||0)+offsetX, top: (objs[0].top||0)+offsetY }); canvas.add(objs[0]); canvas.setActiveObject(objs[0]); }
                  } catch {}
                }
                canvas.renderAll();
                refreshLayers();
              };
              pasteObjects(pasteData);
            });`;

if (code.includes(oldPaste)) {
  code = code.replace(oldPaste, newPaste);
  changes++;
  console.log('[paste] Fixed Ctrl+V for activeselection with images');
}

// Also fix Ctrl+X for activeselection blob conversion
const oldCut = `          const obj = canvas.getActiveObject();
          if (obj) { const jsonData = obj.toJSON(['src']); (window as any).__clipboardJSON = jsonData; try { localStorage.setItem('__packive_clipboard', JSON.stringify(jsonData)); } catch {} canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll(); refreshLayers(); }`;

const newCut = `          const obj = canvas.getActiveObject();
          if (obj) {
            const doClipboardCut = async () => {
              let jsonData = obj.toJSON(['src']);
              const convertBlobsInObject = async (d: any): Promise<any> => {
                if (d.type === 'image' && d.src && d.src.startsWith('blob:')) {
                  try {
                    const resp = await fetch(d.src);
                    const blob = await resp.blob();
                    const dataUrl: string = await new Promise(resolve => { const r = new FileReader(); r.onloadend = () => resolve(r.result as string); r.readAsDataURL(blob); });
                    return { ...d, src: dataUrl };
                  } catch { return d; }
                }
                if ((d.type === 'activeselection' || d.type === 'group') && d.objects) {
                  const converted = await Promise.all(d.objects.map((o: any) => convertBlobsInObject(o)));
                  return { ...d, objects: converted };
                }
                return d;
              };
              jsonData = await convertBlobsInObject(jsonData);
              (window as any).__clipboardJSON = jsonData;
              try { localStorage.setItem('__packive_clipboard', JSON.stringify(jsonData)); } catch {}
              if (obj.type === 'activeselection') {
                const objs = (obj as any)._objects ? [...(obj as any)._objects] : [];
                canvas.discardActiveObject();
                objs.forEach((o: any) => canvas.remove(o));
              } else {
                canvas.remove(obj);
                canvas.discardActiveObject();
              }
              canvas.renderAll();
              refreshLayers();
            };
            doClipboardCut();
          }`;

if (code.includes(oldCut)) {
  code = code.replace(oldCut, newCut);
  changes++;
  console.log('[cut] Fixed Ctrl+X for activeselection');
}

fs.writeFileSync(file, code, 'utf8');
console.log('Total changes: ' + changes);
