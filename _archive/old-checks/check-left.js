const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find left panel area - toolbar buttons and property panels
for(let i=0;i<lines.length;i++){
  const l=lines[i];
  if(l.includes("bg-[#1e1e2e]")||l.includes("toolbar")||l.includes("addText")||l.includes("addShape")||l.includes("toggleDraw")||l.includes("brushSize")||l.includes("color")||l.includes("fSize")||l.includes("selectedFont")||l.includes("backgroundColor")){
    if(i>1450&&i<1700) console.log((i+1)+": "+l.substring(0,160));
  }
}
