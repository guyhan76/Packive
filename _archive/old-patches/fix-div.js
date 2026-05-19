const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
// Line 1836 (index 1835) is the extra </div>
if(lines[1835] && lines[1835].trim()==="</div>"){
  lines.splice(1835, 1);
  console.log("Removed extra </div> at line 1836");
}
const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
