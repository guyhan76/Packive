const fs=require("fs");
const code=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8");
const has1=code.includes("showColorPanel");
const has2=code.includes("bgColor");
const has3=code.includes("setShowColorPanel");
console.log("showColorPanel:",has1,"bgColor:",has2,"setShowColorPanel:",has3);
// Find drawMode or brushSize state
const lines=code.split("\n");
for(let i=700;i<850;i++){
  if(lines[i]&&(lines[i].includes("drawMode")||lines[i].includes("brushSize"))&&lines[i].includes("useState")){
    console.log((i+1)+": "+lines[i].substring(0,120));
  }
}
