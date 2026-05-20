const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Show undo/redo callbacks
for(let i=0;i<lines.length;i++){
  if(lines[i]&&(lines[i].includes("const undo = useCallback")||lines[i].includes("const redo = useCallback"))){
    console.log((i+1)+": "+lines[i].substring(0,250));
  }
}
// Show keyboard undo/redo
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("KeyZ")){
    console.log("KEY "+(i+1)+": "+lines[i].substring(0,150));
  }
}
// Show header undo/redo buttons
for(let i=0;i<lines.length;i++){
  if(lines[i]&&(lines[i].includes("onClick={undo}")||lines[i].includes("onClick={redo}"))){
    console.log("BTN "+(i+1)+": "+lines[i].substring(0,150));
  }
}
// Check how many times pushHistory is called for one action
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("pushHistory")&&!lines[i].includes("const pushHistory")&&!lines[i].includes("historyRef")&&!lines[i].includes("historyIdx")){
    console.log("CALL "+(i+1)+": "+lines[i].substring(0,130));
  }
}
