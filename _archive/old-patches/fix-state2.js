const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
const lines=fs.readFileSync(file,"utf8").split("\n");
// Check if already exists
const code=lines.join("\n");
if(code.includes("const [showColorPanel")){
  console.log("showColorPanel state ALREADY EXISTS - checking location");
  for(let i=0;i<lines.length;i++){
    if(lines[i].includes("showColorPanel")&&lines[i].includes("useState")){
      console.log("Found at line "+(i+1)+": "+lines[i]);
    }
  }
} else {
  // Insert after line 1013 (brushSize)
  lines.splice(1013,0,
    '  const [showColorPanel, setShowColorPanel] = useState(false);',
    '  const [bgColor, setBgColor] = useState("#FFFFFF");'
  );
  console.log("States added after line 1013");
  fs.writeFileSync(file,lines.join("\n"),"utf8");
}
const fl=lines.join("\n").split("\n");
const ob=(lines.join("\n").match(/\{/g)||[]).length;
const cb=(lines.join("\n").match(/\}/g)||[]).length;
console.log("Lines:",fl.length,"| diff:",ob-cb);
