const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
console.log("=== FIX1 area (1338-1345) ===");
for(let i=1337;i<1346;i++){
  console.log((i+1)+": "+lines[i]);
}
console.log("\n=== savedJSON path (1370-1388) ===");
for(let i=1369;i<1390;i++){
  console.log((i+1)+": "+lines[i]);
}
console.log("\n=== addSafeZone removal (1148-1158) ===");
for(let i=1147;i<1160;i++){
  console.log((i+1)+": "+lines[i]);
}
