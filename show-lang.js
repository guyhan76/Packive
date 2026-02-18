const fs=require("fs");
const lines=fs.readFileSync("src/components/i18n-context.tsx","utf8").split("\n");
for(let i=64;i<80;i++){
  console.log((i+1)+": "+lines[i]);
}
