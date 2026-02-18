const fs=require("fs");
const lines=fs.readFileSync("src/app/editor/design/page.tsx","utf8").split("\n");
for(let i=532;i<542;i++){
  console.log((i+1)+": "+lines[i]);
}
