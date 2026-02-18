const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// FIX 1: addSafeZone removal should also include _isGuideLine
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("if (o._isSafeZone || o._isGuideText || o._isSizeLabel) canvas.remove(o)")){
    lines[i] = "        if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) canvas.remove(o);";
    console.log("FIX 1: addSafeZone now removes ALL guide types at line "+(i+1));
    break;
  }
}

// FIX 2: Undo handler - remove all guides before addSafeZone
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const undo = useCallback")&&lines[i].includes("addSafeZone")){
    lines[i] = "  const undo = useCallback(() => { const c = fcRef.current; if (!c||historyIdxRef.current<=0) return; historyIdxRef.current--; loadingRef.current=true; c.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(()=>{ c.getObjects().forEach((o:any)=>{if(o.name==='__bgImage__'){o._isBgImage=true;o.set({selectable:false,evented:false})}}); c.getObjects().slice().forEach((o:any)=>{if(o._isSafeZone||o._isGuideLine||o._isGuideText||o._isSizeLabel||o._isBgPattern)c.remove(o);}); c.renderAll(); loadingRef.current=false; addSafeZone(); refreshLayers(); setHistoryIdx(historyIdxRef.current); }); }, [refreshLayers, addSafeZone]);";
    console.log("FIX 2: Undo cleans guides before addSafeZone at line "+(i+1));
    break;
  }
}

// FIX 3: Redo handler - same cleanup
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const redo = useCallback")&&lines[i].includes("addSafeZone")){
    lines[i] = "  const redo = useCallback(() => { const c = fcRef.current; if (!c||historyIdxRef.current>=historyRef.current.length-1) return; historyIdxRef.current++; loadingRef.current=true; c.loadFromJSON(JSON.parse(historyRef.current[historyIdxRef.current])).then(()=>{ c.getObjects().forEach((o:any)=>{if(o.name==='__bgImage__'){o._isBgImage=true;o.set({selectable:false,evented:false})}}); c.getObjects().slice().forEach((o:any)=>{if(o._isSafeZone||o._isGuideLine||o._isGuideText||o._isSizeLabel||o._isBgPattern)c.remove(o);}); c.renderAll(); loadingRef.current=false; addSafeZone(); refreshLayers(); setHistoryIdx(historyIdxRef.current); }); }, [refreshLayers, addSafeZone]);";
    console.log("FIX 3: Redo cleans guides before addSafeZone at line "+(i+1));
    break;
  }
}

// FIX 4: Canvas sizing - use max dimension constraint for wide/narrow panels
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const padW = cw * 0.75")){
    // Replace entire sizing block (lines i to i+11)
    const newSizing = [
      '      // Canvas sizing: fit within available space with generous margins',
      '      const availW = cw - 160;',
      '      const availH = ch - 100;',
      '      const ratio = widthMM / heightMM;',
      '      let canvasW: number, canvasH: number;',
      '      if (ratio >= 1) {',
      '        // Wide panel (e.g. Top Lid 120x60): limit width to 65% of available',
      '        canvasW = Math.min(availW * 0.65, availH * ratio);',
      '        canvasH = canvasW / ratio;',
      '        if (canvasH > availH * 0.7) { canvasH = availH * 0.7; canvasW = canvasH * ratio; }',
      '      } else {',
      '        // Tall panel (e.g. Front 120x160): limit height to 85% of available',
      '        canvasH = Math.min(availH * 0.85, availW / ratio);',
      '        canvasW = canvasH * ratio;',
      '        if (canvasW > availW * 0.7) { canvasW = availW * 0.7; canvasH = canvasW / ratio; }',
      '      }',
      '      canvasW = Math.round(Math.max(canvasW, 150));',
      '      canvasH = Math.round(Math.max(canvasH, 100));'
    ];
    // Find the end of old sizing block (canvasH = Math.round line)
    let endIdx=i;
    for(let j=i;j<i+15;j++){
      if(lines[j]&&lines[j].includes("canvasH = Math.round")){
        endIdx=j;
        break;
      }
    }
    lines.splice(i, endIdx-i+1, ...newSizing);
    console.log("FIX 4: Canvas sizing replaced at lines "+(i+1)+"-"+(endIdx+1));
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
