const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find all addSafeZone calls
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("addSafeZone")){
    console.log((i+1)+": "+lines[i].substring(0,130));
  }
}
console.log("---");
// Show addSafeZone function
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const addSafeZone = useCallback")){
    for(let j=i;j<Math.min(i+30,lines.length);j++){
      console.log((j+1)+": "+lines[j]);
      if(lines[j].includes("}, [")){break;}
    }
    break;
  }
}
