const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
const lines=fs.readFileSync(file,"utf8").split("\n");
// Find drawMode or brushSize useState
for(let i=700;i<850;i++){
  if(lines[i]&&lines[i].includes("useState")&&(lines[i].includes("drawMode")||lines[i].includes("brushSize"))){
    console.log((i+1)+": "+lines[i].substring(0,120));
    // Insert after this line
    lines.splice(i+1,0,
      '  const [showColorPanel, setShowColorPanel] = useState(false);',
      '  const [bgColor, setBgColor] = useState("#FFFFFF");'
    );
    console.log("States added after line "+(i+1));
    break;
  }
}
const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Lines:",lines.length,"| diff:",ob-cb);
