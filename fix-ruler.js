const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// Step 1: Remove misplaced ruler effect from ToolButton (lines 884-935 approximately)
for(let i=883;i<890;i++){
  if(lines[i] && lines[i].includes("// Ruler drawing effect")){
    // Find the end of the useEffect
    let end = i;
    for(let j=i;j<i+60;j++){
      if(lines[j] && lines[j].trim()==="}, [showRuler, widthMM, heightMM]);"){
        end = j+1; break;
      }
    }
    const removed = lines.splice(i, end - i + 1);
    console.log("Removed misplaced ruler effect:", removed.length, "lines from line", i+1);
    break;
  }
}

// Step 2: Find the actual return statement inside PanelEditor component
let insertIdx = -1;
for(let i=lines.length-1;i>=0;i--){
  if(lines[i] && lines[i].trim().startsWith("return (") && lines[i+1] && lines[i+1].includes("wrapperRef")){
    insertIdx = i;
    break;
  }
}
// Fallback: find <div ref={wrapperRef}
if(insertIdx === -1){
  for(let i=0;i<lines.length;i++){
    if(lines[i] && lines[i].includes("<div ref={wrapperRef}")){
      // Go back to find the return
      for(let j=i;j>i-5;j--){
        if(lines[j] && lines[j].includes("return")){
          insertIdx = j; break;
        }
      }
      break;
    }
  }
}

if(insertIdx > 0){
  const rulerEffect = [
    "",
    "  // Ruler drawing effect",
    "  useEffect(() => {",
    "    if (!showRuler) return;",
    "    const cEl = canvasElRef.current;",
    "    if (!cEl) return;",
    "    const cw = cEl.width; const ch = cEl.height;",
    "    const pxPerMmW = cw / widthMM; const pxPerMmH = ch / heightMM;",
    "    const tC = rulerCanvasTopRef.current;",
    "    if (tC) {",
    "      tC.width = cw; tC.height = 24;",
    "      const ctx = tC.getContext('2d')!;",
    "      ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,cw,24);",
    "      ctx.strokeStyle = '#666'; ctx.fillStyle = '#999'; ctx.font = '9px Arial';",
    "      ctx.textAlign = 'center';",
    "      for (let mm=0; mm<=widthMM; mm++) {",
    "        const x = mm * pxPerMmW;",
    "        const isCm = mm % 10 === 0; const is5 = mm % 5 === 0;",
    "        ctx.beginPath(); ctx.moveTo(x, 24);",
    "        ctx.lineTo(x, isCm ? 6 : is5 ? 12 : 17);",
    "        ctx.stroke();",
    "        if (isCm && mm > 0) ctx.fillText((mm/10)+'', x, 10);",
    "      }",
    "    }",
    "    const lC = rulerCanvasLeftRef.current;",
    "    if (lC) {",
    "      lC.width = 24; lC.height = ch;",
    "      const ctx = lC.getContext('2d')!;",
    "      ctx.fillStyle = '#1a1a2e'; ctx.fillRect(0,0,24,ch);",
    "      ctx.strokeStyle = '#666'; ctx.fillStyle = '#999'; ctx.font = '9px Arial';",
    "      ctx.textAlign = 'right';",
    "      for (let mm=0; mm<=heightMM; mm++) {",
    "        const y = mm * pxPerMmH;",
    "        const isCm = mm % 10 === 0; const is5 = mm % 5 === 0;",
    "        ctx.beginPath(); ctx.moveTo(24, y);",
    "        ctx.lineTo(isCm ? 6 : is5 ? 12 : 17, y);",
    "        ctx.stroke();",
    "        if (isCm && mm > 0) { ctx.save(); ctx.translate(10, y+2); ctx.fillText((mm/10)+'', 0, 0); ctx.restore(); }",
    "      }",
    "    }",
    "  }, [showRuler, widthMM, heightMM]);",
    ""
  ];
  lines.splice(insertIdx, 0, ...rulerEffect);
  console.log("Ruler effect inserted at line", insertIdx+1);
} else {
  console.log("ERROR: could not find return statement");
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
