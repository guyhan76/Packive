const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// FIX 1: handleSavePanel should use pushHistory's approach - remove guides before saving
for(let i=1449;i<1458;i++){
  if(lines[i] && lines[i].includes("const handleSavePanel = useCallback")){
    let end=i;
    for(let j=i;j<i+10;j++){
      if(lines[j] && lines[j].trim().startsWith("}, [")){
        end=j; break;
      }
    }
    const newSave = [
      "  const handleSavePanel = useCallback(() => {",
      "    const c = fcRef.current; if (!c) return;",
      "    // Remove guides before saving",
      "    const guides: any[] = [];",
      "    c.getObjects().slice().forEach((o: any) => {",
      "      if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) {",
      "        guides.push(o); c.remove(o);",
      "      }",
      "    });",
      "    const json = JSON.stringify(c.toJSON(['_isBgImage','selectable','evented','name']));",
      "    const thumb = c.toDataURL({format:'png',multiplier:0.3});",
      "    // Re-add guides",
      "    guides.forEach(g => c.add(g)); c.renderAll();",
      "    onSave(panelId, json, thumb);",
      "  }, [panelId, onSave]);"
    ];
    lines.splice(i, end-i+1, ...newSave);
    console.log("FIX 1: handleSavePanel rewritten at line", i+1);
    break;
  }
}

// FIX 2: Clear Canvas - ensure save happens after canvas is truly cleared
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("Clear Canvas") && lines[i-1] && lines[i-1].includes("c.backgroundColor")){
    lines[i-1] = '              <button onClick={() => { const c=fcRef.current; if(!c) return; c.getObjects().slice().forEach(o=>c.remove(o)); c.backgroundColor="#FFFFFF"; c.renderAll(); setTimeout(()=>{pushHistory();handleSavePanel();},50); }} className="col-span-2 py-2 mb-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">';
    console.log("FIX 2: Clear Canvas with delayed save at line", i);
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
