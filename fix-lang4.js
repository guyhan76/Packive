const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let code=fs.readFileSync(file,"utf8");
code=code.replace(
  'LanguageSelector className="text-[10px] bg-white/5 text-gray-300 border-0 rounded px-1.5 py-0.5 outline-none cursor-pointer"',
  'LanguageSelector className="text-[10px] bg-white/5 text-black border-0 rounded px-1.5 py-0.5 outline-none cursor-pointer"'
);
console.log("panel-editor: LanguageSelector text-gray-300 -> text-black");
fs.writeFileSync(file,code,"utf8");

// Also check i18n default wasn't reverted
const i18n=fs.readFileSync("src/components/i18n-context.tsx","utf8");
console.log("i18n has text-black:",i18n.includes("text-black"));
