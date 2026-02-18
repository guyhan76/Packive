const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find exact toolbar block boundaries
for(let i=1598;i<1620;i++){
  console.log((i+1)+": "+lines[i]);
}
