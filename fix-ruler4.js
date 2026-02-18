const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("// Draw rulers matching canvas")){
    let end=i;
    for(let j=i;j<i+50;j++){
      if(lines[j] && lines[j].includes("useEffect(() => { drawRulers()")){
        end=j; break;
      }
    }
    const newRuler = [
      "  // Draw rulers matching canvas pixel size to physical mm",
      "  const drawRulers = useCallback(() => {",
      "    if (!showRuler) return;",
      "    const fc = fcRef.current;",
      "    if (!fc) return;",
      "    const cw = fc.getWidth(); const ch = fc.getHeight();",
      "    // Top ruler",
      "    const tC = rulerCanvasTopRef.current;",
      "    if (tC) {",
      "      tC.width = cw; tC.height = 20; tC.style.width = cw+'px'; tC.style.height='20px';",
      "      const ctx = tC.getContext('2d')!;",
      "      ctx.fillStyle='#2a2a3d'; ctx.fillRect(0,0,cw,20);",
      "      const pxPerMm = cw / widthMM;",
      "      for (let mm=0; mm<=widthMM; mm++) {",
      "        const x = (mm/widthMM)*cw;",
      "        const is10=mm%10===0; const is5=mm%5===0;",
      "        const h = is10 ? 2 : is5 ? 8 : 13;",
      "        ctx.strokeStyle = is10 ? '#eee' : is5 ? '#bbb' : '#777';",
      "        ctx.lineWidth = is10 ? 1 : 0.5;",
      "        if (pxPerMm < 2 && !is5) continue;",
      "        ctx.beginPath(); ctx.moveTo(x,20); ctx.lineTo(x,h); ctx.stroke();",
      "        if(is10){ctx.fillStyle='#eee';ctx.font='9px Arial';ctx.textAlign='center';ctx.fillText(mm+'',x,12);}",
      "      }",
      "    }",
      "    // Left ruler",
      "    const lC = rulerCanvasLeftRef.current;",
      "    if (lC) {",
      "      lC.width=20; lC.height=ch; lC.style.width='20px'; lC.style.height=ch+'px';",
      "      const ctx = lC.getContext('2d')!;",
      "      ctx.fillStyle='#2a2a3d'; ctx.fillRect(0,0,20,ch);",
      "      const pxPerMm = ch / heightMM;",
      "      for (let mm=0; mm<=heightMM; mm++) {",
      "        const y = (mm/heightMM)*ch;",
      "        const is10=mm%10===0; const is5=mm%5===0;",
      "        const w = is10 ? 2 : is5 ? 8 : 13;",
      "        ctx.strokeStyle = is10 ? '#eee' : is5 ? '#bbb' : '#777';",
      "        ctx.lineWidth = is10 ? 1 : 0.5;",
      "        if (pxPerMm < 2 && !is5) continue;",
      "        ctx.beginPath(); ctx.moveTo(20,y); ctx.lineTo(w,y); ctx.stroke();",
      "        if(is10){ctx.fillStyle='#eee';ctx.font='9px Arial';ctx.save();ctx.translate(12,y+3);ctx.textAlign='center';ctx.fillText(mm+'',0,0);ctx.restore();}",
      "      }",
      "    }",
      "  }, [showRuler, widthMM, heightMM]);",
      "",
      "  useEffect(() => { drawRulers(); }, [drawRulers]);"
    ];
    lines.splice(i, end-i+1, ...newRuler);
    console.log("Ruler updated with 1mm/5mm/10mm ticks at line", i+1);
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
