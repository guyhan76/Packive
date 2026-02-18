const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find top bar area
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("Top Bar")){
    for(let j=i;j<i+30;j++){
      console.log((j+1)+": "+lines[j]);
    }
    break;
  }
}
