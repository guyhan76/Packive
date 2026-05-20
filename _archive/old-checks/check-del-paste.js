const fs=require("fs");
const lines=fs.readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");
// Find del callback
for(let i=0;i<lines.length;i++){
  if(lines[i]&&(lines[i].includes("const del ")||lines[i].includes("const del="))){
    for(let j=i;j<Math.min(i+10,lines.length);j++){
      console.log("DEL "+(j+1)+": "+lines[j]);
    }
    break;
  }
}
// Find paste/copy logic
for(let i=0;i<lines.length;i++){
  if(lines[i]&&(lines[i].includes("Paste")||lines[i].includes("paste")||lines[i].includes("clipboard"))&&lines[i].includes("case")){
    for(let j=Math.max(0,i-1);j<Math.min(i+15,lines.length);j++){
      console.log("PASTE "+(j+1)+": "+lines[j]);
    }
    break;
  }
}
// Find copy
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("clipboardRef")){
    console.log("CLIP "+(i+1)+": "+lines[i].substring(0,130));
  }
}
