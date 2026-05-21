const fs=require("fs");
const code=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8");
const lines=code.split("\n");
// Find getTemplates
for(let i=0;i<lines.length;i++){
  if(lines[i].includes("getTemplates")){
    console.log((i+1)+": "+lines[i].substring(0,120));
  }
}
// Count template IDs
const idMatches=[...code.matchAll(/id:\s*["']([^"']+)["']/g)];
console.log("\nAll IDs with id: pattern (",idMatches.length,"):");
idMatches.forEach(m=>console.log("  - "+m[1]));
