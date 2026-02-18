const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Show addSafeZone removal logic (lines 1143-1155)
for(let i=1142;i<1160;i++){
  console.log((i+1)+": "+lines[i]);
}
console.log("---");
// Check if _isGuideLine objects exist
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("_isGuideLine")&&lines[i].includes("true")){
    console.log("GUIDE "+(i+1)+": "+lines[i].substring(0,130));
  }
}
