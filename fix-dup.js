const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
// Line 1779 (index 1778) is duplicate
if(lines[1778] && lines[1778].trim()==="</div>"){
  lines.splice(1778, 1);
  console.log("Removed duplicate </div> at line 1779");
}
// Line 1779 (now) should be )} - check for duplicate
if(lines[1778] && lines[1778].trim()===")}"){
  lines.splice(1778, 1);
  console.log("Removed duplicate )} at line 1779");
}
const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
