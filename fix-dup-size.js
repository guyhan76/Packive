const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// FIX 1: Initial history should exclude guides (line 1380)
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("historyRef.current = [JSON.stringify")){
    lines[i] = "      // Save initial history excluding guides";
    lines.splice(i+1,0,
      "      const initGuides = canvas.getObjects().filter((o:any) => o._isSafeZone||o._isGuideLine||o._isGuideText||o._isSizeLabel||o._isBgPattern);",
      "      initGuides.forEach((g:any) => g.set({visible:false}));",
      "      historyRef.current = [JSON.stringify(canvas.toJSON(['_isBgImage','selectable','evented','name']))];",
      "      initGuides.forEach((g:any) => g.set({visible:true}));",
      "      canvas.renderAll();"
    );
    console.log("FIX 1: Initial history excludes guides at line "+(i+1));
    break;
  }
}

// FIX 2: Undo - loadFromJSON already removes everything, addSafeZone adds fresh ones. 
// But we need to make sure loadFromJSON doesn't contain old guides.
// The pushHistory already excludes them (via visible:false trick).
// So after loadFromJSON, guides are gone and addSafeZone adds fresh = correct.
// Problem: if initial history saved WITH guides, loading it restores them + addSafeZone = double.
// FIX 1 above solves this.

// FIX 3: Canvas sizing - use percentage-based max instead of fixed padding
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const padW = cw - 200")){
    // Replace entire sizing block
    lines[i] = '      const padW = cw * 0.75;';
    lines[i+1] = '      const padH = (ch - 50) * 0.80;';
    console.log("FIX 3: Canvas padding now percentage-based at line "+(i+1));
    break;
  }
}

// FIX 4: Remove the 0.85 max constraint that was too restrictive
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("Math.min(Math.max(canvasW, 200), padW * 0.85)")){
    lines[i] = '      canvasW = Math.round(Math.max(Math.min(canvasW, padW), 200));';
    lines[i+1] = '      canvasH = Math.round(Math.max(Math.min(canvasH, padH), 150));';
    console.log("FIX 4: Canvas constraints simplified at line "+(i+1));
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
