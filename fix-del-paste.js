const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// FIX 1: Replace Delete handler (line 1411) with improved version
for(let i=1400;i<1420;i++){
  if(lines[i]&&lines[i].includes("e.key==='Delete'")&&lines[i].includes("e.key==='Backspace'")){
    lines[i]="        if (e.key==='Delete' || e.key==='Backspace') { const obj = canvas.getActiveObject(); if (obj && obj.selectable !== false) { if (obj.type==='activeSelection'||obj.type==='activeselection') { const objs = (obj as any).getObjects ? (obj as any).getObjects() : ((obj as any)._objects||[]); const toRemove = objs.filter((o:any) => o.selectable !== false); canvas.discardActiveObject(); toRemove.forEach((o:any) => canvas.remove(o)); } else { canvas.remove(obj); canvas.discardActiveObject(); } canvas.renderAll(); refreshLayers(); pushHistory(); } }";
    console.log("FIX 1: Delete handler updated at line "+(i+1));
    break;
  }
}

// FIX 2: Replace Copy handler to fix multi-select coordinates
for(let i=1400;i<1420;i++){
  if(lines[i]&&lines[i].includes("e.code==='KeyC'")&&lines[i].includes("clipboardObjects")){
    lines[i]="        if ((e.ctrlKey||e.metaKey) && e.code==='KeyC') { e.preventDefault(); const obj = canvas.getActiveObject(); if (!obj) return; (window as any).__clipboardObjects = obj; if (obj.type==='activeSelection'||obj.type==='activeselection') { const ch = (obj as any).getObjects ? (obj as any).getObjects() : ((obj as any)._objects||[]); const items:any[] = []; const m = obj.calcTransformMatrix(); for (const o of ch) { const j = o.toJSON(['_isBgImage','selectable','evented','name']); const p = require('fabric').util.transformPoint({x:o.left||0,y:o.top||0},m); j._absLeft = p.x; j._absTop = p.y; j._origType = o.type; if ((o.type==='image'||o instanceof (require('fabric').FabricImage)) && o._element) { try { const t=document.createElement('canvas'); t.width=o._element.naturalWidth||o._element.width||200; t.height=o._element.naturalHeight||o._element.height||200; t.getContext('2d')?.drawImage(o._element,0,0); j._dataUrl=t.toDataURL('image/png'); } catch{} } items.push(j); } (window as any).__clipboardJSON = {type:'multi',items,cx:obj.left||canvas.getWidth()/2,cy:obj.top||canvas.getHeight()/2}; } else { const j = obj.toJSON(['_isBgImage','selectable','evented','name']); j._absLeft = obj.left; j._absTop = obj.top; j._origType = obj.type; if ((obj.type==='image'||obj instanceof (require('fabric').FabricImage)) && (obj as any)._element) { try { const t=document.createElement('canvas'); t.width=(obj as any)._element.naturalWidth||(obj as any)._element.width||200; t.height=(obj as any)._element.naturalHeight||(obj as any)._element.height||200; t.getContext('2d')?.drawImage((obj as any)._element,0,0); j._dataUrl=t.toDataURL('image/png'); } catch{} } (window as any).__clipboardJSON = {type:'single',items:[j]}; } }";
    console.log("FIX 2: Copy handler updated at line "+(i+1));
    break;
  }
}

// FIX 3: Replace Paste handler to fix position
for(let i=1400;i<1420;i++){
  if(lines[i]&&lines[i].includes("e.code==='KeyV'")&&lines[i].includes("clipboardObjects")){
    lines[i]="        if ((e.ctrlKey||e.metaKey) && e.code==='KeyV') { e.preventDefault(); const cj = (window as any).__clipboardJSON; if (!cj || !cj.items) return; (async () => { const { FabricImage, ActiveSelection, util } = await import('fabric'); const cl:any[] = []; const offset = 15; for (const item of cj.items) { let newObj:any = null; if (item._dataUrl) { try { newObj = await FabricImage.fromURL(item._dataUrl); newObj.set({left:(item._absLeft||50)+offset,top:(item._absTop||50)+offset,scaleX:item.scaleX||1,scaleY:item.scaleY||1,angle:item.angle||0}); } catch{} } else { try { const arr = await util.enlivenObjects([item]); if (arr[0]) { newObj = arr[0]; newObj.set({left:(item._absLeft||item.left||50)+offset,top:(item._absTop||item.top||50)+offset}); } } catch{} } if (newObj) { canvas.add(newObj); cl.push(newObj); } } if (cl.length>1) { const s = new ActiveSelection(cl,{canvas}); canvas.setActiveObject(s); } else if (cl.length===1) { canvas.setActiveObject(cl[0]); } canvas.renderAll(); refreshLayers(); pushHistory(); })(); }";
    console.log("FIX 3: Paste handler updated at line "+(i+1));
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
