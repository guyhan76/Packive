const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
console.log("=== CANVAS SIZING (1230-1250) ===");
for(let i=1229;i<1250;i++){
  console.log((i+1)+": "+lines[i]);
}
console.log("\n=== addSafeZone REMOVE LOGIC (1148-1152) ===");
for(let i=1147;i<1155;i++){
  console.log((i+1)+": "+lines[i]);
}
console.log("\n=== ALL addSafeZone CALLS ===");
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("addSafeZone")) {
    console.log((i+1)+": "+lines[i].substring(0,150));
  }
}
console.log("\n=== UNDO/REDO (1450-1460) ===");
for(let i=1449;i<1460;i++){
  console.log((i+1)+": "+lines[i]);
}
