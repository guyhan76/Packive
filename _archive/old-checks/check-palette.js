const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find color palette popup
for(let i=1700;i<1770;i++){
  if(lines[i] && (lines[i].includes("BACKGROUND") || lines[i].includes("OBJECT") || lines[i].includes("Pick Color") || lines[i].includes("Custom") || lines[i].includes("showColorPanel"))){
    console.log((i+1)+": "+lines[i].substring(0,150));
  }
}
console.log("\n=== Palette closing divs (1750-1770) ===");
for(let i=1748;i<1772;i++){
  console.log((i+1)+": "+lines[i]);
}
