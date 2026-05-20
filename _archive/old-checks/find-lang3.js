const fs=require("fs");
// Check design page header
const code=fs.readFileSync("src/app/editor/design/page.tsx","utf8");
const lines=code.split("\n");
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("LanguageSelector")){
    console.log("design page "+(i+1)+": "+lines[i].substring(0,150));
    // Show surrounding lines
    for(let j=Math.max(0,i-2);j<Math.min(lines.length,i+3);j++){
      console.log("  "+(j+1)+": "+lines[j].substring(0,150));
    }
  }
}
// Check panel-editor
const code2=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8");
const lines2=code2.split("\n");
for(let i=0;i<lines2.length;i++){
  if(lines2[i]&&lines2[i].includes("LanguageSelector")){
    console.log("panel-editor "+(i+1)+": "+lines2[i].substring(0,150));
    for(let j=Math.max(0,i-1);j<Math.min(lines2.length,i+2);j++){
      console.log("  "+(j+1)+": "+lines2[j].substring(0,150));
    }
  }
}
