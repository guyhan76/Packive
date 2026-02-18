const lines=require("fs").readFileSync("src/components/layout/header.tsx","utf8").split("\n");for(let i=15;i<lines.length;i++) console.log((i+1).toString().padStart(4,"0"), lines[i]);
