const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// FIX 1: pushHistory - exclude safe zone/guide objects before saving
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const pushHistory = useCallback")){
    lines[i+2] = '    const guides:any[]=[];const guideData:any[]=[];c.getObjects().forEach((o:any)=>{if(o._isSafeZone||o._isGuideLine||o._isGuideText||o._isSizeLabel||o._isBgPattern){guides.push(o);}});guides.forEach(g=>c.remove(g));';
    // Insert restore after json save
    const oldLine3 = lines[i+3]; // const arr = historyRef.current;
    lines.splice(i+3, 0, '    guides.forEach(g=>c.add(g)); c.renderAll();');
    console.log("FIX 1: pushHistory excludes guides at line "+(i+1));
    break;
  }
}

// FIX 2: Undo - re-add safe zone after loadFromJSON
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const undo = useCallback")&&lines[i].includes("loadFromJSON")){
    lines[i] = "  const undo = useCallback(() => { const c = fcRef.current; if (!c||historyIdxRef.current<=0) return; historyIdxRef.current--; loadingRef.current=true; c.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(()=>{ c.getObjects().forEach((o:any)=>{if(o.name==='__bgImage__'){o._isBgImage=true;o.set({selectable:false,evented:false})}}); c.renderAll(); loadingRef.current=false; addSafeZone(); refreshLayers(); setHistoryIdx(historyIdxRef.current); }); }, [refreshLayers, addSafeZone]);";
    console.log("FIX 2: Undo calls addSafeZone at line "+(i+1));
    break;
  }
}

// FIX 3: Redo - re-add safe zone after loadFromJSON
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const redo = useCallback")&&lines[i].includes("loadFromJSON")){
    lines[i] = "  const redo = useCallback(() => { const c = fcRef.current; if (!c||historyIdxRef.current>=historyRef.current.length-1) return; historyIdxRef.current++; loadingRef.current=true; c.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(()=>{ c.getObjects().forEach((o:any)=>{if(o.name==='__bgImage__'){o._isBgImage=true;o.set({selectable:false,evented:false})}}); c.renderAll(); loadingRef.current=false; addSafeZone(); refreshLayers(); setHistoryIdx(historyIdxRef.current); }); }, [refreshLayers, addSafeZone]);";
    console.log("FIX 3: Redo calls addSafeZone at line "+(i+1));
    break;
  }
}

// FIX 4: Also fix keyboard Ctrl+Z undo handler
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("e.code==='KeyZ'")&&lines[i].includes("!e.shiftKey")&&lines[i].includes("loadFromJSON")){
    lines[i] = "        if ((e.ctrlKey||e.metaKey) && e.code==='KeyZ' && !e.shiftKey) { e.preventDefault(); undo(); }";
    console.log("FIX 4: Ctrl+Z now calls undo() at line "+(i+1));
    break;
  }
}

// FIX 5: Also fix keyboard Ctrl+Shift+Z redo handler
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("e.code==='KeyZ'")&&lines[i].includes("e.shiftKey")&&lines[i].includes("loadFromJSON")){
    lines[i] = "        if ((e.ctrlKey||e.metaKey) && e.code==='KeyZ' && e.shiftKey) { e.preventDefault(); redo(); }";
    console.log("FIX 5: Ctrl+Shift+Z now calls redo() at line "+(i+1));
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
