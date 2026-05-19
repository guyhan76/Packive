const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
console.log("=== Around line 884 (ruler effect) ===");
for(let i=880;i<920;i++){
  console.log((i+1)+": "+lines[i]);
}
