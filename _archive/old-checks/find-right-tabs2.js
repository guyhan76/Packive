const lines=require("fs").readFileSync("src/components/editor/panel-editor.tsx","utf8").split("\n");for(let i=1528;i<1540;i++) console.log((i+1).toString().padStart(4,"0"),lines[i]);
