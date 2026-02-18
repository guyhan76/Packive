const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
console.log("=== pushHistory (1440-1455) ===");
for(let i=1439;i<1456;i++){
  console.log((i+1)+": "+lines[i]);
}
console.log("\n=== initial history save (1380-1395) ===");
for(let i=1379;i<1396;i++){
  console.log((i+1)+": "+lines[i]);
}
console.log("\n=== canvasW/H min/max (1250-1256) ===");
for(let i=1249;i<1258;i++){
  console.log((i+1)+": "+lines[i]);
}
