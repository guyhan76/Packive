const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
for(let i=1405;i<1420;i++){
  console.log((i+1)+": "+lines[i]);
}
