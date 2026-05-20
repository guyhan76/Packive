const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Search all useState in range 700-900
for(let i=700;i<900;i++){
  if(lines[i]&&lines[i].includes("useState")){
    console.log((i+1)+": "+lines[i].substring(0,120));
  }
}
