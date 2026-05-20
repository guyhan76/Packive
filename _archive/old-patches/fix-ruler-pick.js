const fs=require("fs");
const file="src/components/editor/panel-editor.tsx";
let lines=fs.readFileSync(file,"utf8").split("\n");
console.log("Start:",lines.length);

// === FIX 1: Move Pick Color from between BG and Object to the very end of palette ===
// Remove lines 1755-1763 (Pick Color section between BG Custom and Object/Text)
let pickStart=-1, pickEnd=-1;
for(let i=1753;i<1770;i++){
  if(lines[i] && lines[i].includes("w-full h-px bg-white/10 my-1") && lines[i+1] && lines[i+1].includes("flex items-center gap-2")){
    pickStart = i;
    for(let j=i;j<i+12;j++){
      if(lines[j] && lines[j].includes("parseInt(color.slice")){
        pickEnd = j+1; break;
      }
    }
    break;
  }
}
if(pickStart>=0 && pickEnd>pickStart){
  lines.splice(pickStart, pickEnd-pickStart);
  console.log("FIX 1a: Removed Pick Color from middle, lines", pickStart+1, "-", pickEnd);
}

// Now find the end of the palette popup (the closing </div> before the right panel or after Object/Text section)
// Find the last </div> of showColorPanel
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("Object / Text")){
    // Find the Custom span after Object/Text
    for(let j=i;j<i+30;j++){
      if(lines[j] && lines[j].includes("Custom</span>") && j > i+5){
        // Insert Pick Color after this Custom line, before the closing </div>
        const pickJsx = [
          "            <div className=\"w-full h-px bg-white/10 my-2\" />",
          "            <div className=\"text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5\">Pick Color</div>",
          "            <div className=\"flex items-center gap-2\">",
          "              <button onClick={()=>{if(typeof EyeDropper!=='undefined'){const ed=new (EyeDropper as any)();ed.open().then((r:any)=>{setPickedColor(r.sRGBHex);setColor(r.sRGBHex);}).catch(()=>{});}else{alert('EyeDropper API not supported');}}} className=\"px-2 py-1 text-[9px] bg-white/10 hover:bg-white/20 text-gray-300 rounded transition-all flex items-center gap-1\"><span>💉</span><span>Pick from Screen</span></button>",
          "            </div>",
          "            {pickedColor && <div className=\"mt-1.5 flex items-center gap-2\">",
          "              <div className=\"w-6 h-6 rounded border border-white/20\" style={{background:pickedColor}} />",
          "              <div>",
          "                <div className=\"text-[10px] text-white font-mono\">{pickedColor}</div>",
          "                <div className=\"text-[8px] text-gray-500 font-mono\">R:{parseInt(pickedColor.slice(1,3),16)} G:{parseInt(pickedColor.slice(3,5),16)} B:{parseInt(pickedColor.slice(5,7),16)}</div>",
          "              </div>",
          "            </div>}",
          "            <div className=\"mt-1.5\">",
          "              <div className=\"text-[8px] text-gray-500 font-mono\">Current: R:{parseInt(color.slice(1,3),16)} G:{parseInt(color.slice(3,5),16)} B:{parseInt(color.slice(5,7),16)}</div>",
          "            </div>"
        ];
        lines.splice(j+1, 0, ...pickJsx);
        console.log("FIX 1b: Pick Color added at bottom of palette after line", j+1);
        break;
      }
    }
    break;
  }
}

// === FIX 2: Fix ruler to match actual mm dimensions ===
for(let i=0;i<lines.length;i++){
  if(lines[i] && lines[i].includes("// Ruler drawing effect")){
    let end=i;
    for(let j=i;j<i+50;j++){
      if(lines[j] && lines[j].includes("}, [showRuler, widthMM, heightMM]")){
        end=j; break;
      }
    }
    const newRuler = [
      "  // Ruler drawing effect (mm) - matches physical dimensions exactly",
      "  useEffect(() => {",
      "    if (!showRuler) return;",
      "    const cEl = canvasElRef.current;",
      "    if (!cEl) return;",
      "    const cw = cEl.width; const ch = cEl.height;",
      "    // Top ruler - shows 0 to widthMM",
      "    const tC = rulerCanvasTopRef.current;",
      "    if (tC) {",
      "      tC.width = cw; tC.height = 20; tC.style.width = cw+'px'; tC.style.height = '20px';",
      "      const ctx = tC.getContext('2d')!;",
      "      ctx.fillStyle = '#2a2a3d'; ctx.fillRect(0,0,cw,20);",
      "      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5;",
      "      for (let mm=0; mm<=widthMM; mm++) {",
      "        const x = (mm / widthMM) * cw;",
      "        const is10 = mm % 10 === 0; const is5 = mm % 5 === 0;",
      "        if (!is10 && !is5) continue;",
      "        ctx.beginPath(); ctx.moveTo(x, 20);",
      "        ctx.lineTo(x, is10 ? 2 : 10);",
      "        ctx.stroke();",
      "        if (is10) { ctx.fillStyle = '#eee'; ctx.font = '9px Arial'; ctx.textAlign = 'center'; ctx.fillText(mm+'', x, 12); }",
      "      }",
      "    }",
      "    // Left ruler - shows 0 to heightMM",
      "    const lC = rulerCanvasLeftRef.current;",
      "    if (lC) {",
      "      lC.width = 20; lC.height = ch; lC.style.width = '20px'; lC.style.height = ch+'px';",
      "      const ctx = lC.getContext('2d')!;",
      "      ctx.fillStyle = '#2a2a3d'; ctx.fillRect(0,0,20,ch);",
      "      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5;",
      "      for (let mm=0; mm<=heightMM; mm++) {",
      "        const y = (mm / heightMM) * ch;",
      "        const is10 = mm % 10 === 0; const is5 = mm % 5 === 0;",
      "        if (!is10 && !is5) continue;",
      "        ctx.beginPath(); ctx.moveTo(20, y);",
      "        ctx.lineTo(is10 ? 2 : 10, y);",
      "        ctx.stroke();",
      "        if (is10) { ctx.fillStyle = '#eee'; ctx.font = '9px Arial'; ctx.save(); ctx.translate(12, y+3); ctx.textAlign = 'center'; ctx.fillText(mm+'', 0, 0); ctx.restore(); }",
      "      }",
      "    }",
      "  }, [showRuler, widthMM, heightMM]);"
    ];
    lines.splice(i, end-i+1, ...newRuler);
    console.log("FIX 2: Ruler effect fixed at line", i+1);
    break;
  }
}

const code=lines.join("\n");
fs.writeFileSync(file,code,"utf8");
const ob=(code.match(/\{/g)||[]).length;
const cb=(code.match(/\}/g)||[]).length;
console.log("Done! Lines:",code.split("\n").length,"| diff:",ob-cb);
