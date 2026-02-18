const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
for(let i=0;i<lines.length;i++){
  if(lines[i]&&(lines[i].includes("padW")||lines[i].includes("padH"))&&lines[i].includes("ch")){
    console.log((i+1)+": "+lines[i]);
  }
}
// Find canvas sizing logic
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("canvasW")&&lines[i].includes("canvasH")&&lines[i].includes("ratio")){
    for(let j=Math.max(0,i-5);j<Math.min(i+10,lines.length);j++){
      console.log((j+1)+": "+lines[j]);
    }
    break;
  }
}
