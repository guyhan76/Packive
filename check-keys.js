const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find keyboard handler with copy/paste
for(let i=0;i<lines.length;i++){
  if(lines[i]&&(lines[i].includes("keydown")||lines[i].includes("KeyDown"))&&lines[i].includes("handler")){
    console.log("HANDLER "+(i+1)+": "+lines[i].substring(0,130));
  }
  if(lines[i]&&lines[i].includes("clipboardRef")){
    console.log("CLIP "+(i+1)+": "+lines[i].substring(0,130));
  }
  if(lines[i]&&(lines[i].includes("ctrlKey")&&lines[i].includes("'c'"))||(lines[i]&&lines[i].includes("ctrlKey")&&lines[i].includes("'v'"))){
    console.log("KEY "+(i+1)+": "+lines[i].substring(0,150));
  }
}
