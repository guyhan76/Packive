const fs=require("fs");
const file="src/components/i18n-context.tsx";
let code=fs.readFileSync(file,"utf8");
const lines=code.split("\n");
console.log("Start:",lines.length);
// Find LanguageSelector select element
for(let i=0;i<lines.length;i++){
  if(lines[i]&&lines[i].includes("select")&&(lines[i].includes("locale")||lines[i].includes("language")||lines[i].includes("LanguageSelector"))){
    console.log((i+1)+": "+lines[i].substring(0,150));
  }
  if(lines[i]&&lines[i].includes("<option")&&(lines[i].includes("en")||lines[i].includes("ko")||lines[i].includes("ja"))){
    console.log((i+1)+": "+lines[i].substring(0,150));
  }
}
