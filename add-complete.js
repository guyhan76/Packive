const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// Find line after PDF button (1822)
for(let i=1820;i<1826;i++){
  if(lines[i] && lines[i].includes("handleExport('pdf')")){
    lines.splice(i+1, 0,
      "          <div className=\"h-5 w-px bg-white/10\" />",
      "          <button onClick={()=>{handleSavePanel();onBack();}} className=\"px-3 py-1 text-[10px] bg-green-600 text-white rounded hover:bg-green-500 font-medium transition-colors\">✅ Complete</button>"
    );
    console.log("Complete button added after line", i+2);
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
