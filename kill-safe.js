const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let code=fs.readFileSync(file,"utf8");
console.log("Start:",code.split("\n").length);

// 1. addSafeZone 함수를 빈 함수로 교체
const lines=code.split("\n");
for(let i=0;i<lines.length;i++){
  if(lines[i].includes("const addSafeZone = useCallback(()")) {
    let end=i+1;
    for(let j=i+1;j<lines.length;j++){
      if(lines[j].trim().startsWith("}, [")) { end=j; break; }
    }
    lines.splice(i, end-i+1,
      "    const addSafeZone = useCallback(() => {",
      "      // Disabled for MVP",
      "    }, [widthMM, heightMM, guideText]);"
    );
    console.log("addSafeZone disabled");
    break;
  }
}

code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
