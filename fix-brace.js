const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// FIX 1: Remove stray }); at line 1156
if(lines[1155] && lines[1155].trim() === "});") {
  lines.splice(1155, 1);
  console.log("FIX 1: Removed stray }); at line 1156");
}

// FIX 2: Replace savedJSON heuristic removal (1379-1383) with flag-based
for(let i=1375;i<1385;i++){
  if(lines[i] && lines[i].includes("canvas.getObjects().filter((o: any)") &&
     lines[i+1] && lines[i+1].includes("_isBgImage")){
    let endIdx = i;
    for(let j=i;j<i+6;j++){
      if(lines[j] && lines[j].includes(".forEach((o) => canvas.remove(o))")){
        endIdx = j; break;
      }
    }
    if(endIdx > i){
      lines.splice(i, endIdx - i + 1,
        "            canvas.getObjects().slice().forEach((o: any) => {",
        "              if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) canvas.remove(o);",
        "            });"
      );
      console.log("FIX 2: savedJSON guide cleanup at line", i+1);
    }
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
