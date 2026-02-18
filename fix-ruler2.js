const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// === FIX 1: Replace ruler effect with mm-based, brighter colors ===
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("// Ruler drawing effect")){
    let end=i;
    for(let j=i;j<i+50;j++){
      if(lines[j] && lines[j].includes("}, [showRuler, widthMM, heightMM]")){
        end=j; break;
      }
    }
    const newRuler = [
      "  // Ruler drawing effect (mm)",
      "  useEffect(() => {",
      "    if (!showRuler) return;",
      "    const cEl = canvasElRef.current;",
      "    if (!cEl) return;",
      "    const cw = cEl.width; const ch = cEl.height;",
      "    const pxPerMmW = cw / widthMM; const pxPerMmH = ch / heightMM;",
      "    // Top ruler",
      "    const tC = rulerCanvasTopRef.current;",
      "    if (tC) {",
      "      tC.width = cw; tC.height = 20; tC.style.width = cw+'px'; tC.style.height = '20px';",
      "      const ctx = tC.getContext('2d')!;",
      "      ctx.fillStyle = '#2a2a3d'; ctx.fillRect(0,0,cw,20);",
      "      ctx.strokeStyle = '#aaa'; ctx.fillStyle = '#ccc'; ctx.font = '8px Arial';",
      "      ctx.textAlign = 'center';",
      "      for (let mm=0; mm<=widthMM; mm++) {",
      "        const x = Math.round(mm * pxPerMmW);",
      "        if(x > cw) break;",
      "        const is10 = mm % 10 === 0; const is5 = mm % 5 === 0;",
      "        ctx.beginPath(); ctx.moveTo(x, 20);",
      "        ctx.lineTo(x, is10 ? 4 : is5 ? 10 : 14);",
      "        ctx.stroke();",
      "        if (is10) ctx.fillText(mm+'', x, 10);",
      "      }",
      "    }",
      "    // Left ruler",
      "    const lC = rulerCanvasLeftRef.current;",
      "    if (lC) {",
      "      lC.width = 20; lC.height = ch; lC.style.width = '20px'; lC.style.height = ch+'px';",
      "      const ctx = lC.getContext('2d')!;",
      "      ctx.fillStyle = '#2a2a3d'; ctx.fillRect(0,0,20,ch);",
      "      ctx.strokeStyle = '#aaa'; ctx.fillStyle = '#ccc'; ctx.font = '8px Arial';",
      "      ctx.textAlign = 'right';",
      "      for (let mm=0; mm<=heightMM; mm++) {",
      "        const y = Math.round(mm * pxPerMmH);",
      "        if(y > ch) break;",
      "        const is10 = mm % 10 === 0; const is5 = mm % 5 === 0;",
      "        ctx.beginPath(); ctx.moveTo(20, y);",
      "        ctx.lineTo(is10 ? 4 : is5 ? 10 : 14, y);",
      "        ctx.stroke();",
      "        if (is10) { ctx.save(); ctx.translate(12, y+3); ctx.textAlign='center'; ctx.fillText(mm+'', 0, 0); ctx.restore(); }",
      "      }",
      "    }",
      "  }, [showRuler, widthMM, heightMM]);"
    ];
    lines.splice(i, end-i+1, ...newRuler);
    console.log("FIX 1: Ruler effect replaced at line", i+1);
    break;
  }
}

// === FIX 2: Update ruler JSX - change 24px to 20px ===
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("Corner square")){
    // Replace corner + top + left ruler lines
    let end=i;
    for(let j=i;j<i+8;j++){
      if(lines[j] && lines[j].includes("{/* Canvas */}")){
        end=j; break;
      }
    }
    const newJsx = [
      "            {/* Corner square */}",
      "            {showRuler && <div className=\"absolute -top-[20px] -left-[20px] w-[20px] h-[20px] bg-[#2a2a3d] border-r border-b border-[#555] z-10 flex items-center justify-center text-[7px] text-gray-400\">mm</div>}",
      "            {/* Top ruler */}",
      "            {showRuler && <canvas ref={rulerCanvasTopRef} className=\"absolute -top-[20px] left-0 h-[20px] border-b border-[#555]\" />}",
      "            {/* Left ruler */}",
      "            {showRuler && <canvas ref={rulerCanvasLeftRef} className=\"absolute top-0 -left-[20px] w-[20px] border-r border-[#555]\" />}",
      "            {/* Canvas */}"
    ];
    lines.splice(i, end-i, ...newJsx);
    console.log("FIX 2: Ruler JSX updated at line", i+1);
    break;
  }
}

// === FIX 3: Remove 💉 button from left panel, add to color palette ===
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("Pick Color") && lines[i].includes("EyeDropper")){
    // Remove this line and the pickedColor display line after it
    let removeCount = 1;
    if(lines[i+1] && lines[i+1].includes("pickedColor")) removeCount = 2;
    lines.splice(i, removeCount);
    console.log("FIX 3a: Removed Pick Color button from toolbar at line", i+1);
    break;
  }
}

// Add Pick Color + RGB display to color palette popup (after Object/Text Custom)
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("Custom</span>") && i > 1700){
    // This is the Object/Text custom label
    // Find the closing </div> of the palette popup
    let closeIdx = i;
    for(let j=i+1;j<i+10;j++){
      if(lines[j] && lines[j].trim()==="</div>"){
        closeIdx = j; break;
      }
    }
    const pickColorJsx = [
      "            <div className=\"w-full h-px bg-white/10 my-1\" />",
      "            <div className=\"flex items-center gap-2\">",
      "              <button onClick={()=>{if(typeof EyeDropper!=='undefined'){const ed=new (EyeDropper as any)();ed.open().then((r:any)=>{setPickedColor(r.sRGBHex);setColor(r.sRGBHex);}).catch(()=>{});}else{alert('EyeDropper API not supported');}}} className=\"px-2 py-1 text-[9px] bg-white/10 hover:bg-white/20 text-gray-300 rounded transition-all\">💉 Pick Color</button>",
      "              {pickedColor && <div className=\"w-5 h-5 rounded border border-white/20\" style={{background:pickedColor}} />}",
      "              {pickedColor && <span className=\"text-[9px] text-gray-400 font-mono\">{pickedColor}</span>}",
      "            </div>",
      "            <div className=\"flex items-center gap-1 mt-1\">",
      "              <span className=\"text-[8px] text-gray-500 font-mono\">R:{parseInt(color.slice(1,3),16)} G:{parseInt(color.slice(3,5),16)} B:{parseInt(color.slice(5,7),16)}</span>",
      "            </div>"
    ];
    lines.splice(closeIdx, 0, ...pickColorJsx);
    console.log("FIX 3b: Pick Color added to palette at line", closeIdx+1);
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
