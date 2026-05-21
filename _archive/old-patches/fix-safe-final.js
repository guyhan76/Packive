const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let code=fs.readFileSync(file,"utf8");
console.log("Start:",code.split("\n").length);

// Replace addSafeZone removal logic with bulletproof version
const oldRemoval = `      // Remove existing safe zone objects
      canvas.getObjects().slice().forEach((o: any) => {
        if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) canvas.remove(o);
      });
      // Double-check removal (Fabric sometimes misses during iteration)
      canvas.getObjects().slice().forEach((o: any) => {
        if (o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern) canvas.remove(o);
      });`;

const newRemoval = `      // Remove ALL existing guide objects with while-loop to guarantee none remain
      let safety = 0;
      while (safety < 20) {
        const g = canvas.getObjects().find((o: any) => o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern);
        if (!g) break;
        canvas.remove(g);
        safety++;
      }`;

if(code.includes(oldRemoval)){
  code = code.replace(oldRemoval, newRemoval);
  console.log("FIX: addSafeZone removal replaced with while-loop");
} else {
  console.log("ERROR: could not find old removal block");
  // Try line-by-line
  const lines = code.split("\n");
  for(let i=0;i<lines.length;i++){
    if(lines[i].includes("// Remove existing safe zone objects")){
      console.log("Found at line", i+1, "- manual fix");
      // Find end of double removal
      let end = i+1;
      for(let j=i+1;j<i+10;j++){
        if(lines[j] && lines[j].includes("const cw = canvas.getWidth")){
          end = j; break;
        }
      }
      lines.splice(i, end-i,
        "      // Remove ALL existing guide objects",
        "      let safety = 0;",
        "      while (safety < 20) {",
        "        const g = canvas.getObjects().find((o: any) => o._isSafeZone || o._isGuideLine || o._isGuideText || o._isSizeLabel || o._isBgPattern);",
        "        if (!g) break;",
        "        canvas.remove(g);",
        "        safety++;",
        "      }"
      );
      code = lines.join("\n");
      console.log("FIX applied manually");
      break;
    }
  }
}

fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
