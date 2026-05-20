const fs=require("fs");
const file="src/components/i18n-context.tsx";
let code=fs.readFileSync(file,"utf8");
// Add style to option elements to ensure black text on white bg
code=code.replace(
  '<option key={l} value={l}>{localeNames[l]}</option>',
  '<option key={l} value={l} style={{color:"#000",background:"#fff"}}>{localeNames[l]}</option>'
);
console.log("Fixed: option color black on white background");
fs.writeFileSync(file,code,"utf8");
