const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find "Object / Text" label to locate where Background section ends
for(let i=1630;i<1700;i++){
  if(lines[i]&&(lines[i].includes("Object / Text")||lines[i].includes("Background")||lines[i].includes("Custom"))){
    console.log((i+1)+": "+lines[i].substring(0,150));
  }
}
