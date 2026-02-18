const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let code=fs.readFileSync(file,"utf8");
code=code.replace(
  'LanguageSelector className="text-[10px] bg-white/5 text-black border-0 rounded px-1.5 py-0.5 outline-none cursor-pointer"',
  'LanguageSelector className="text-[10px] bg-white/10 text-white border border-white/20 rounded px-1.5 py-0.5 outline-none cursor-pointer"'
);
console.log("Fixed: white text on dark bg with subtle border");
fs.writeFileSync(file,code,"utf8");
