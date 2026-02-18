const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// Replace pushHistory entirely (lines 1432-1440)
let pushStart=-1, pushEnd=-1;
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const pushHistory = useCallback")){
    pushStart=i;
    for(let j=i;j<i+15;j++){
      if(lines[j]&&lines[j].includes("}, [])")){
        pushEnd=j;
        break;
      }
    }
    break;
  }
}
if(pushStart===-1){console.log("ERROR: pushHistory not found");process.exit(1);}
console.log("pushHistory: lines "+(pushStart+1)+"-"+(pushEnd+1));

const newPush = [
'  const pushHistory = useCallback(() => {',
'    const c = fcRef.current; if (!c) return;',
'    // Temporarily hide guides, save, restore',
'    const guides = c.getObjects().filter((o:any) => o._isSafeZone||o._isGuideLine||o._isGuideText||o._isSizeLabel||o._isBgPattern);',
'    guides.forEach((g:any) => g.set({opacity:0,visible:false}));',
'    const json = JSON.stringify(c.toJSON(["_isBgImage","selectable","evented","name"]));',
'    guides.forEach((g:any) => g.set({opacity:1,visible:true}));',
'    c.renderAll();',
'    const arr = historyRef.current;',
'    if (historyIdxRef.current < arr.length - 1) arr.splice(historyIdxRef.current + 1);',
'    arr.push(json); if (arr.length > 50) arr.shift();',
'    historyIdxRef.current = arr.length - 1; setHistoryIdx(historyIdxRef.current);',
'  }, []);'
];

lines.splice(pushStart, pushEnd-pushStart+1, ...newPush);
console.log("FIX 1: pushHistory replaced");

// FIX 2: Fix image loading - replace onFileChange
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const onFileChange = useCallback")){
    let endIdx=i;
    for(let j=i;j<i+10;j++){
      if(lines[j]&&lines[j].includes("}, [refreshLayers]")){
        endIdx=j;
        break;
      }
    }
    const newFileChange = [
'  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {',
'    const file=e.target.files?.[0]; if(!file) return; const c=fcRef.current; if(!c) return;',
'    const reader = new FileReader();',
'    reader.onload = async () => {',
'      const { FabricImage } = await import("fabric");',
'      const img = await FabricImage.fromURL(reader.result as string);',
'      const sc = Math.min(c.getWidth()*0.6/(img.width||1), c.getHeight()*0.6/(img.height||1), 1);',
'      img.set({ left: c.getWidth()/2, top: c.getHeight()/2, originX: "center", originY: "center", scaleX: sc, scaleY: sc });',
'      c.add(img); c.setActiveObject(img); c.renderAll(); refreshLayers(); pushHistory();',
'    };',
'    reader.readAsDataURL(file); e.target.value="";',
'  }, [refreshLayers, pushHistory]);'
    ];
    lines.splice(i, endIdx-i+1, ...newFileChange);
    console.log("FIX 2: onFileChange replaced at line "+(i+1));
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
