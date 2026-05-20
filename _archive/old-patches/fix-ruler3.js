const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// === FIX 1: Replace ruler useEffect - trigger after canvas is ready ===
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("// Ruler drawing effect")){
    let end=i;
    for(let j=i;j<i+50;j++){
      if(lines[j] && lines[j].includes("}, [showRuler, widthMM, heightMM]")){
        end=j; break;
      }
    }
    // Replace with a function + effect that uses canvas actual size
    const newRuler = [
      "  // Draw rulers matching canvas pixel size to physical mm",
      "  const drawRulers = useCallback(() => {",
      "    if (!showRuler) return;",
      "    const fc = fcRef.current;",
      "    if (!fc) return;",
      "    const cw = fc.getWidth(); const ch = fc.getHeight();",
      "    const tC = rulerCanvasTopRef.current;",
      "    if (tC) {",
      "      tC.width = cw; tC.height = 20; tC.style.width = cw+'px'; tC.style.height='20px';",
      "      const ctx = tC.getContext('2d')!;",
      "      ctx.fillStyle='#2a2a3d'; ctx.fillRect(0,0,cw,20);",
      "      for (let mm=0; mm<=widthMM; mm++) {",
      "        const x = (mm/widthMM)*cw;",
      "        const is10=mm%10===0; const is5=mm%5===0;",
      "        if(!is10 && !is5) continue;",
      "        ctx.strokeStyle='#ddd'; ctx.lineWidth=0.5;",
      "        ctx.beginPath(); ctx.moveTo(x,20); ctx.lineTo(x, is10?2:10); ctx.stroke();",
      "        if(is10){ctx.fillStyle='#eee';ctx.font='9px Arial';ctx.textAlign='center';ctx.fillText(mm+'',x,12);}",
      "      }",
      "    }",
      "    const lC = rulerCanvasLeftRef.current;",
      "    if (lC) {",
      "      lC.width=20; lC.height=ch; lC.style.width='20px'; lC.style.height=ch+'px';",
      "      const ctx = lC.getContext('2d')!;",
      "      ctx.fillStyle='#2a2a3d'; ctx.fillRect(0,0,20,ch);",
      "      for (let mm=0; mm<=heightMM; mm++) {",
      "        const y = (mm/heightMM)*ch;",
      "        const is10=mm%10===0; const is5=mm%5===0;",
      "        if(!is10 && !is5) continue;",
      "        ctx.strokeStyle='#ddd'; ctx.lineWidth=0.5;",
      "        ctx.beginPath(); ctx.moveTo(20,y); ctx.lineTo(is10?2:10,y); ctx.stroke();",
      "        if(is10){ctx.fillStyle='#eee';ctx.font='9px Arial';ctx.save();ctx.translate(12,y+3);ctx.textAlign='center';ctx.fillText(mm+'',0,0);ctx.restore();}",
      "      }",
      "    }",
      "  }, [showRuler, widthMM, heightMM]);",
      "",
      "  useEffect(() => { drawRulers(); }, [drawRulers]);"
    ];
    lines.splice(i, end-i+1, ...newRuler);
    console.log("FIX 1: Ruler rewritten at line", i+1);
    break;
  }
}

// === FIX 2: Call drawRulers after canvas init ===
// Find where canvas is fully initialized (after addSafeZone or historyRef)
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("loadingRef.current = false") && lines[i-1] && lines[i-1].includes("historyIdxRef")){
    lines.splice(i+1, 0, "      setTimeout(() => { if(typeof drawRulers==='function') drawRulers(); }, 100);");
    console.log("FIX 2: drawRulers called after canvas init at line", i+2);
    break;
  }
}

// === FIX 3: Simplify Pick Color section ===
// Find current Pick Color section at bottom of palette
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("Pick Color") && lines[i].includes("text-[9px] font-bold")){
    let end=i;
    for(let j=i;j<i+20;j++){
      if(lines[j] && lines[j].includes("Current: R:")){
        end=j+1; break;
      }
    }
    const simplePick = [
      "            <div className=\"text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5\">Pick Color</div>",
      "            <button onClick={()=>{if(typeof EyeDropper!=='undefined'){new (EyeDropper as any)().open().then((r:any)=>{setPickedColor(r.sRGBHex);setColor(r.sRGBHex);}).catch(()=>{});}}} className=\"w-full px-2 py-1.5 text-[10px] bg-white/10 hover:bg-white/20 text-gray-300 rounded transition-all text-center\">💉 Pick from Screen</button>",
      "            {pickedColor && <div className=\"mt-1.5 flex items-center gap-2\"><div className=\"w-6 h-6 rounded border border-white/20\" style={{background:pickedColor}}/><span className=\"text-[10px] text-white font-mono\">{pickedColor}</span></div>}"
    ];
    lines.splice(i, end-i, ...simplePick);
    console.log("FIX 3: Pick Color simplified at line", i+1);
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
