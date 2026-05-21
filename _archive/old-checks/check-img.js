const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find onFileChange
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("onFileChange")){
    for(let j=i;j<Math.min(i+15,lines.length);j++){
      console.log((j+1)+": "+lines[j]);
    }
    break;
  }
}
