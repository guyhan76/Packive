const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// Replace canvas sizing logic (lines 1234-1246)
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("const padW = cw - 120")){
    // Replace lines 1234-1246 with improved logic
    lines[i] = '      const padW = cw - 200;';
    lines[i+1] = '      const padH = ch - 160;';
    // After canvasH = Math.round line, add max constraints
    // Find the Math.max lines
    for(let j=i;j<i+15;j++){
      if(lines[j]&&lines[j].includes("Math.round(Math.max(canvasW")){
        lines[j] = '      canvasW = Math.round(Math.min(Math.max(canvasW, 200), padW * 0.85));';
        lines[j+1] = '      canvasH = Math.round(Math.min(Math.max(canvasH, 200), padH * 0.85));';
        console.log("FIX: Canvas max constraints added at line "+(j+1));
        break;
      }
    }
    console.log("FIX: Padding increased at line "+(i+1));
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
