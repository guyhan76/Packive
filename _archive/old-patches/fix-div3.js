const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
// Line 1767 (index 1766) is extra </div>
if(lines[1766] && lines[1766].trim()==="</div>"){
  lines.splice(1766, 1);
  console.log("Removed extra </div> at line 1767");
}
const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
