const fs=require("fs");
const lines=fs.readFileSync("src/components/i18n-context.tsx","utf8").split("\n");
for(let i=0;i<lines.length;i++){
  if(lines[i]&&(lines[i].includes("select")||lines[i].includes("option")||lines[i].includes("LanguageSelector"))){
    console.log((i+1)+": "+lines[i].substring(0,150));
  }
}
