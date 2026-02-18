const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Show lines 1340-1380 (initialization area where addSafeZone is called)
for(let i=1340;i<1385;i++){
  console.log((i+1)+": "+lines[i]);
}
