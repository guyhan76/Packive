const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
for(let i=1430;i<1445;i++){
  console.log((i+1)+": "+lines[i]);
}
