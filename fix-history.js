const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// FIX 1: object:added - remove pushHistory, keep refreshLayers only
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("object:added")&&lines[i].includes("pushHistory")){
    lines[i] = "      canvas.on('object:added', (opt: any) => { if (opt.target?._isGuideLine || opt.target?._isSafeZone || opt.target?._isGuideText || opt.target?._isSizeLabel || opt.target?._isBgPattern) return; if (!loadingRef.current) { refreshLayers(); } });";
    console.log("FIX 1: object:added - removed pushHistory at line "+(i+1));
    break;
  }
}

// FIX 2: object:removed - remove pushHistory, keep refreshLayers only
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("object:removed")&&lines[i].includes("pushHistory")){
    lines[i] = "      canvas.on('object:removed', () => { if (!loadingRef.current) { refreshLayers(); } });";
    console.log("FIX 2: object:removed - removed pushHistory at line "+(i+1));
    break;
  }
}

// FIX 3: Ensure addText calls pushHistory
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const addText = useCallback")){
    for(let j=i;j<i+5;j++){
      if(lines[j]&&lines[j].includes("c.add(t)")&&!lines[j].includes("pushHistory")){
        lines[j] = lines[j].replace("c.add(t); c.setActiveObject(t); c.renderAll(); refreshLayers();", "c.add(t); c.setActiveObject(t); c.renderAll(); refreshLayers(); pushHistory();");
        console.log("FIX 3: addText now calls pushHistory at line "+(j+1));
        break;
      }
    }
    break;
  }
}

// FIX 4: Ensure addShape calls pushHistory
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("if (s) { c.add(s)")&&!lines[i].includes("pushHistory")){
    lines[i] = lines[i].replace(
      "if (s) { c.add(s); c.setActiveObject(s); c.renderAll(); refreshLayers(); }",
      "if (s) { c.add(s); c.setActiveObject(s); c.renderAll(); refreshLayers(); pushHistory(); }"
    );
    console.log("FIX 4: addShape now calls pushHistory at line "+(i+1));
    break;
  }
}

// FIX 5: Delete handler - ensure pushHistory is called
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("e.key==='Delete'")&&lines[i].includes("e.key==='Backspace'")){
    if(!lines[i].includes("pushHistory")){
      lines[i] = lines[i].replace("canvas.renderAll(); refreshLayers(); }", "canvas.renderAll(); refreshLayers(); pushHistory(); }");
      console.log("FIX 5: Delete now calls pushHistory at line "+(i+1));
    }
    break;
  }
}

// FIX 6: Remove duplicate pushHistory from onFileChange (already has it from object:added before, now explicit)
// Already has pushHistory - good

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
