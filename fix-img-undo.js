const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let code=fs.readFileSync(file,"utf8");
console.log("Start:",code.split("\n").length);

// FIX 1: Image center position
code=code.replace(
  "img.set({left:50,top:50,scaleX:sc,scaleY:sc})",
  "img.set({left:c.getWidth()/2,top:c.getHeight()/2,originX:'center',originY:'center',scaleX:sc,scaleY:sc})"
);
console.log("FIX 1: Image now centered on canvas");

// FIX 2: pushHistory should exclude safe zone / guide objects
// Find pushHistory definition
const lines=code.split("\n");
let pushIdx=-1;
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const pushHistory")&&lines[i].includes("useCallback")){
    pushIdx=i;
    console.log("pushHistory at line "+(i+1)+": "+lines[i].substring(0,120));
    break;
  }
}

// Also find Undo handler to add safe zone restore
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("KeyZ")&&lines[i].includes("!e.shiftKey")&&lines[i].includes("loadFromJSON")){
    console.log("Undo at line "+(i+1));
    // Show current undo code structure
    console.log("UNDO: "+lines[i].substring(0,200));
    break;
  }
}

fs.writeFileSync(file,code,"utf8");
console.log("FIX 1 applied. Lines:",code.split("\n").length);
