const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Show pushHistory full code
for(let i=1430;i<1445;i++){
  console.log((i+1)+": "+lines[i]);
}
// Show addSafeZone
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("addSafeZone")){
    console.log("SAFE "+(i+1)+": "+lines[i].substring(0,130));
  }
}
