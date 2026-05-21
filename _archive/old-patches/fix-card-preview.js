const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let code=fs.readFileSync(file,"utf8");
const lines=code.split("\n");
console.log("Start:",lines.length);

// Fix line 1720: replace the gradient div with one that uses tpl.preview as background
const old = lines[1719]; // 0-indexed
console.log("OLD 1720:",old.substring(0,150));

lines[1719] = '                    <div className="aspect-[3/4] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200" style={{background: tpl.preview || \'#333\'}}></div>';

console.log("NEW 1720:",lines[1719].substring(0,150));

code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const finalLines=code.split("\n");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",finalLines.length,"| diff:",ob-cb);
