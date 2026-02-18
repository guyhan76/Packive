const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find canvas wrapper area
for(let i=0;i<lines.length;i++){
  if(lines[i] && (lines[i].includes("canvasElRef") || lines[i].includes("CENTER AREA") || lines[i].includes("wrapperRef"))){
    console.log((i+1)+": "+lines[i].substring(0,150));
  }
}
console.log("\n=== Canvas render area (look for canvas element) ===");
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("<canvas")){
    for(let j=Math.max(0,i-5);j<Math.min(lines.length,i+5);j++){
      console.log((j+1)+": "+lines[j]);
    }
    break;
  }
}
