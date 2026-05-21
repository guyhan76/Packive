const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
for(let i=0;i<lines.length;i++){
  if(lines[i]&&(lines[i].includes("Copy")||lines[i].includes("copy")||lines[i].includes("Paste")||lines[i].includes("paste")||lines[i].includes("Ctrl")||lines[i].includes("ctrl"))){
    console.log((i+1)+": "+lines[i].substring(0,150));
  }
}
