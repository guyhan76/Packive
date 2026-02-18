const fs=require("fs");
const code=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8");
console.log("showShapePanel:",code.includes("showShapePanel"));
console.log("showTextPanel:",code.includes("showTextPanel"));
console.log("fontWeight:",code.includes("fontWeight"));
console.log("star6 shape:",code.includes("star6"));
// Check current toolbar structure
const lines=code.split("\n");
for(let i=1595;i<1625;i++){
  if(lines[i]&&(lines[i].includes("Select")||lines[i].includes("icon:")||lines[i].includes("addShape")||lines[i].includes("addText")||lines[i].includes("Shapes"))){
    console.log((i+1)+": "+lines[i].substring(0,130));
  }
}
