const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// FIX 1: Replace heuristic guide removal at line 1340-1346 with clean flag-based removal
for(let i=1338;i<1350;i++){
  if(lines[i] && lines[i].includes("canvas.getObjects().filter((o: any)") && lines[i+1] && lines[i+1].includes("_isBgImage")){
    // Find the forEach line
    let endIdx = i;
    for(let j=i;j<i+10;j++){
      if(lines[j] && lines[j].includes(".forEach((o) => canvas.remove(o))")){
        endIdx = j; break;
      }
    }
    const newCode = [
      "              canvas.getObjects().slice().forEach((o: any) => {",
      "                if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) canvas.remove(o);",
      "              });"
    ];
    lines.splice(i, endIdx - i + 1, ...newCode);
    console.log("FIX 1: auto-save guide cleanup simplified at line", i+1);
    break;
  }
}

// FIX 2: Same for savedJSON path (line ~1378-1382)
for(let i=1370;i<1390;i++){
  if(lines[i] && lines[i].includes("canvas.getObjects().filter((o: any)") && 
     i+1 < lines.length && lines[i+1] && lines[i+1].includes("_isSafeZone")){
    let endIdx = i;
    for(let j=i;j<i+8;j++){
      if(lines[j] && lines[j].includes(".forEach((o) => canvas.remove(o))")){
        endIdx = j; break;
      }
    }
    if(endIdx > i){
      const newCode = [
        "            canvas.getObjects().slice().forEach((o: any) => {",
        "              if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) canvas.remove(o);",
        "            });"
      ];
      lines.splice(i, endIdx - i + 1, ...newCode);
      console.log("FIX 2: savedJSON guide cleanup simplified at line", i+1);
    }
    break;
  }
}

// FIX 3: Add a guard in addSafeZone to run removal TWICE to catch any stragglers
for(let i=1147;i<1155;i++){
  if(lines[i] && lines[i].includes("// Remove existing safe zone objects")){
    lines.splice(i+1, 2,
      "      canvas.getObjects().slice().forEach((o: any) => {",
      "        if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) canvas.remove(o);",
      "      });",
      "      // Double-check removal (Fabric sometimes misses during iteration)",
      "      canvas.getObjects().slice().forEach((o: any) => {",
      "        if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) canvas.remove(o);",
      "      });"
    );
    console.log("FIX 3: addSafeZone double-removal at line", i+1);
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
