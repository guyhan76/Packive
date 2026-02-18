const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
for(let i=0;i<lines.length;i++){
  if(lines[i] && (lines[i].includes("handleSavePanel") && lines[i].includes("useCallback"))){
    for(let j=i;j<i+20;j++){
      console.log((j+1)+": "+lines[j]);
      if(lines[j] && lines[j].trim().startsWith("}, [")) break;
    }
    break;
  }
}
console.log("\n=== auto-save ===");
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("auto-save") && lines[i].includes("setInterval")){
    console.log((i+1)+": "+lines[i].substring(0,200));
  }
}
console.log("\n=== localStorage/packive ===");
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("localStorage") && lines[i].includes("packive")){
    console.log((i+1)+": "+lines[i].substring(0,200));
  }
}
