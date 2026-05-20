const lines=require("fs").readFileSync("src/app/editor/design/page.tsx","utf8").split("\n");for(let i=580;i<635;i++) console.log((i+1).toString().padStart(4,"0"), lines[i]);
