const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
console.log("=== object:added handler ===");
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("object:added")){
    console.log((i+1)+": "+lines[i].substring(0,200));
  }
}
console.log("\n=== restore logic (1330-1385) ===");
for(let i=1329;i<1395;i++){
  console.log((i+1)+": "+lines[i]);
}
