const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
console.log("=== addSafeZone FULL (1143-1200) ===");
for(let i=1142;i<1200;i++){
  console.log((i+1)+": "+lines[i]);
  if(i>1148 && lines[i] && lines[i].trim().startsWith("}, [")) break;
}
