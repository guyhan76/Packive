const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Show COMPLETE addSafeZone function
for(let i=1142;i<1210;i++){
  console.log((i+1)+": "+lines[i]);
  if(i>1145&&lines[i]&&lines[i].includes("}, [")){break;}
}
