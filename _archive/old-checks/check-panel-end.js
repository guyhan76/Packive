const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Show lines 1615-1640 to see exact structure after draw controls
for(let i=1614;i<1640;i++){
  console.log((i+1)+": "+lines[i]);
}
